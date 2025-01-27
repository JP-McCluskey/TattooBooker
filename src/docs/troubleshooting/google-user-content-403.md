# Google User Content 403 Error Troubleshooting Guide

## Error Context
This error occurs when trying to access images from Google's content delivery network (googleusercontent.com), specifically when loading business images in the Tattoo Booker application. The error indicates that access to the image resource has been denied.

Example URL pattern:
```
lh5.googleusercontent.com/p/AF1QipPsKBpJl5JrU1AkVToaK9Fujk5qeuL-R8QpnBED=w408-h544-k-no
```

## Common Causes

1. **Referrer Policy Issues**
   - Google's CDN may block requests without proper referrer information
   - Cross-origin resource sharing (CORS) restrictions
   - Missing or invalid referrer headers

2. **Authentication Problems**
   - Image requires authentication
   - Expired or invalid access tokens
   - Missing required cookies

3. **Access Permissions**
   - Image visibility settings changed
   - Content removed or moved
   - Temporary access restrictions

## Quick Solutions

1. **For End Users**
   - Clear browser cache and cookies
   - Try accessing in an incognito/private window
   - Ensure you're logged into your Google account
   - Check if the image is accessible directly in Google Maps

2. **For Developers**
   - Add proper referrer meta tag:
     ```html
     <meta name="referrer" content="no-referrer-when-downgrade">
     ```
   - Use a proxy service to fetch images
   - Implement image fallbacks
   - Store image copies in Supabase Storage

## Implementation Fix

Replace the problematic image loading with a more reliable solution:

```typescript
// Before (problematic)
const imageUrl = 'lh5.googleusercontent.com/...';

// After (reliable)
const getImageUrl = async (googleUrl: string) => {
  try {
    // 1. Try to load from our cache first
    const { data: cached } = await supabase
      .from('image_cache')
      .select('local_url')
      .eq('google_url', googleUrl)
      .single();

    if (cached?.local_url) {
      return cached.local_url;
    }

    // 2. If not cached, fetch and store
    const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(googleUrl)}`);
    if (!response.ok) throw new Error('Failed to fetch image');

    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

    // 3. Upload to Supabase Storage
    const { data: upload } = await supabase.storage
      .from('business-images')
      .upload(`${Date.now()}.jpg`, file);

    if (!upload?.path) throw new Error('Failed to upload image');

    // 4. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('business-images')
      .getPublicUrl(upload.path);

    // 5. Cache the mapping
    await supabase.from('image_cache').insert({
      google_url: googleUrl,
      local_url: publicUrl
    });

    return publicUrl;
  } catch (error) {
    console.error('Image processing error:', error);
    return '/images/fallback.jpg'; // Always have a fallback
  }
};
```

## Prevention Steps

1. **Image Storage**
   - Store business images in Supabase Storage
   - Implement proper caching mechanisms
   - Use CDN for better availability

2. **Error Handling**
   - Add fallback images
   - Implement retry logic
   - Log image loading failures

3. **User Experience**
   - Show loading states
   - Provide alternative image sources
   - Display helpful error messages

## Monitoring and Logging

Track image loading issues:

```typescript
const logImageError = async (error: Error, imageUrl: string) => {
  await supabase.from('error_logs').insert({
    error_type: 'image_loading',
    url: imageUrl,
    error_message: error.message,
    user_agent: navigator.userAgent,
    timestamp: new Date().toISOString()
  });
};
```

## Support Contact

If the issue persists:
1. Email: thetattoobooker@gmail.com
2. Include:
   - Screenshot of the error
   - Browser and device information
   - Steps to reproduce
   - Business listing URL