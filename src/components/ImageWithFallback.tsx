import React, { useState, useEffect } from 'react';
import { loadImage } from '../lib/imageHandling';
import { Skeleton } from './ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  onError?: (error: Error) => void;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc = '/images/fallback.jpg',
  onError,
  className,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [imageSrc, setImageSrc] = useState<string>(src);

  useEffect(() => {
    let mounted = true;

    const loadAndCacheImage = async () => {
      try {
        setLoading(true);
        setError(null);

        const cachedSrc = await loadImage(src);
        
        if (mounted) {
          setImageSrc(cachedSrc);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error('Failed to load image');
          setError(error);
          setImageSrc(fallbackSrc);
          setLoading(false);
          onError?.(error);
        }
      }
    };

    loadAndCacheImage();

    return () => {
      mounted = false;
    };
  }, [src, fallbackSrc, onError]);

  if (loading) {
    return <Skeleton className={className} />;
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          {...props}
        />
        <div className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground rounded-full p-1">
          <AlertCircle className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      {...props}
    />
  );
};