/**
 * Image optimization utilities for responsive image loading
 * Handles compression, format conversion, and responsive sizing
 */

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  progressive?: boolean;
  blur?: number;
}

export interface ResponsiveImageSizes {
  mobile: number;
  tablet: number;
  desktop: number;
  large: number;
}

/**
 * Default responsive breakpoints for image sizes
 */
export const DEFAULT_RESPONSIVE_SIZES: ResponsiveImageSizes = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  large: 1920
};

/**
 * Generate srcSet string for responsive images
 */
export function generateSrcSet(
  baseSrc: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1920],
  options: ImageOptimizationOptions = {}
): string {
  const { quality = 75, format = 'auto' } = options;
  
  // Extract base URL and extension
  const lastDotIndex = baseSrc.lastIndexOf('.');
  const baseUrl = baseSrc.substring(0, lastDotIndex);
  const originalExtension = baseSrc.substring(lastDotIndex + 1);
  
  // Determine optimal format
  const targetFormat = format === 'auto' ? getOptimalFormat(originalExtension) : format;
  const extension = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
  
  return sizes
    .map(size => {
      const optimizedUrl = buildOptimizedUrl(baseUrl, extension, {
        ...options,
        width: size,
        quality,
        format: targetFormat
      });
      return `${optimizedUrl} ${size}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizesAttribute(
  breakpoints?: Partial<ResponsiveImageSizes>,
  customSizes?: string
): string {
  if (customSizes) return customSizes;
  
  const sizes = { ...DEFAULT_RESPONSIVE_SIZES, ...breakpoints };
  
  return [
    `(max-width: ${sizes.mobile}px) 100vw`,
    `(max-width: ${sizes.tablet}px) 50vw`,
    `(max-width: ${sizes.desktop}px) 33vw`,
    '25vw'
  ].join(', ');
}

/**
 * Get optimal image format based on browser support and original format
 */
export function getOptimalFormat(originalFormat: string): 'webp' | 'jpeg' | 'png' {
  // Check WebP support
  if (supportsWebP()) {
    return 'webp';
  }
  
  // Fallback to original format or JPEG
  switch (originalFormat.toLowerCase()) {
    case 'png':
      return 'png';
    case 'jpg':
    case 'jpeg':
      return 'jpeg';
    default:
      return 'jpeg';
  }
}

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Build optimized image URL with parameters
 */
export function buildOptimizedUrl(
  baseUrl: string,
  extension: string,
  options: ImageOptimizationOptions
): string {
  const { width, height, quality = 75, format } = options;
  
  // For now, return a simple URL structure
  // In a real implementation, this would integrate with an image CDN like Cloudinary, ImageKit, etc.
  let url = `${baseUrl}`;
  
  if (width) {
    url += `_${width}w`;
  }
  
  if (height) {
    url += `_${height}h`;
  }
  
  if (quality !== 75) {
    url += `_q${quality}`;
  }
  
  if (format && format !== 'auto') {
    url += `.${format === 'jpeg' ? 'jpg' : format}`;
  } else {
    url += `.${extension}`;
  }
  
  return url;
}

/**
 * Compress image file for upload
 */
export function compressImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { quality = 0.8, width, height, format = 'jpeg' } = options;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate dimensions
      let { width: imgWidth, height: imgHeight } = img;
      
      if (width || height) {
        const aspectRatio = imgWidth / imgHeight;
        
        if (width && height) {
          imgWidth = width;
          imgHeight = height;
        } else if (width) {
          imgWidth = width;
          imgHeight = width / aspectRatio;
        } else if (height) {
          imgHeight = height;
          imgWidth = height * aspectRatio;
        }
      }
      
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, imgWidth, imgHeight);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        `image/${format}`,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Create a blurred placeholder for progressive loading
 */
export function createBlurredPlaceholder(
  src: string,
  blurAmount: number = 10
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Create small canvas for blur effect
      canvas.width = 40;
      canvas.height = 40;
      
      if (ctx) {
        // Draw small version
        ctx.drawImage(img, 0, 0, 40, 40);
        
        // Apply blur filter
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(canvas, 0, 0);
        
        resolve(canvas.toDataURL('image/jpeg', 0.1));
      } else {
        reject(new Error('Failed to create canvas context'));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image for placeholder'));
    img.src = src;
  });
}

/**
 * Detect if device is on a slow connection
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return false;
  }
  
  const connection = (navigator as any).connection;
  
  // Consider 2G or slow-2g as slow connections
  return connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
}

/**
 * Get recommended image quality based on connection speed
 */
export function getRecommendedQuality(): number {
  if (isSlowConnection()) {
    return 60; // Lower quality for slow connections
  }
  
  return 75; // Standard quality
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, priority: boolean = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = priority ? 'preload' : 'prefetch';
    link.as = 'image';
    link.href = src;
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    
    document.head.appendChild(link);
  });
}

/**
 * Lazy load images with Intersection Observer
 */
export function createLazyLoader(
  threshold: number = 0.1,
  rootMargin: string = '50px'
) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
        }
      });
    },
    {
      threshold,
      rootMargin
    }
  );
}