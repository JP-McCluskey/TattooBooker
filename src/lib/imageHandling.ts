import { supabase } from './supabase';

interface ImageLoadOptions {
  timeout?: number;
  maxRetries?: number;
  initialDelay?: number;
}

interface ImageCacheEntry {
  originalUrl: string;
  cachedUrl: string;
  timestamp: number;
}

const DEFAULT_OPTIONS: ImageLoadOptions = {
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  initialDelay: 1000, // 1 second
};

// In-memory cache for faster access
const memoryCache = new Map<string, ImageCacheEntry>();

// Cache expiration time (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

export class ImageLoadError extends Error {
  constructor(
    message: string,
    public readonly originalUrl: string,
    public readonly statusCode?: number,
    public readonly attempt?: number
  ) {
    super(message);
    this.name = 'ImageLoadError';
  }
}

export const loadImage = async (
  url: string,
  options: ImageLoadOptions = DEFAULT_OPTIONS
): Promise<string> => {
  // Check memory cache first
  const cachedEntry = memoryCache.get(url);
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_EXPIRATION) {
    return cachedEntry.cachedUrl;
  }

  // Check database cache
  const { data: dbCache } = await supabase
    .from('image_cache')
    .select('cached_url')
    .eq('original_url', url)
    .single();

  if (dbCache?.cached_url) {
    // Update memory cache
    memoryCache.set(url, {
      originalUrl: url,
      cachedUrl: dbCache.cached_url,
      timestamp: Date.now()
    });
    return dbCache.cached_url;
  }

  // Implement retry with exponential backoff
  for (let attempt = 1; attempt <= (options.maxRetries || DEFAULT_OPTIONS.maxRetries!); attempt++) {
    try {
      const imageUrl = await fetchWithTimeout(url, attempt, options);
      
      // Cache the successful result
      await cacheImage(url, imageUrl);
      
      return imageUrl;
    } catch (error) {
      if (attempt === options.maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = (options.initialDelay || DEFAULT_OPTIONS.initialDelay!) * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // If all retries fail, return fallback image
  return '/images/fallback.jpg';
};

const fetchWithTimeout = async (
  url: string,
  attempt: number,
  options: ImageLoadOptions
): Promise<string> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, options.timeout || DEFAULT_OPTIONS.timeout);

  try {
    // First try to load directly
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Referrer-Policy': 'no-referrer-when-downgrade'
      }
    });

    if (!response.ok) {
      throw new ImageLoadError(
        `Failed to load image (${response.status})`,
        url,
        response.status,
        attempt
      );
    }

    const blob = await response.blob();
    
    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const { data: upload, error: uploadError } = await supabase.storage
      .from('images')
      .upload(`cached/${fileName}`, blob);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(upload?.path || '');

    return publicUrl;

  } catch (error) {
    // Log the error
    await logImageError(error, url, attempt);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const cacheImage = async (originalUrl: string, cachedUrl: string) => {
  // Update memory cache
  memoryCache.set(originalUrl, {
    originalUrl,
    cachedUrl,
    timestamp: Date.now()
  });

  // Update database cache
  await supabase.from('image_cache').upsert({
    original_url: originalUrl,
    cached_url: cachedUrl,
    created_at: new Date().toISOString()
  });
};

const logImageError = async (error: any, url: string, attempt: number) => {
  await supabase.from('error_logs').insert({
    type: 'image_loading',
    url,
    error_message: error.message,
    status_code: error instanceof ImageLoadError ? error.statusCode : null,
    attempt,
    user_agent: navigator.userAgent,
    timestamp: new Date().toISOString()
  });
};