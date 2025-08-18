import { useState, useEffect, useCallback, useMemo } from 'react';
import { useResponsive } from './useViewport';
import {
  generateSrcSet,
  generateSizesAttribute,
  getOptimalFormat,
  getRecommendedQuality,
  isSlowConnection,
  preloadImage,
  createLazyLoader,
  type ImageOptimizationOptions,
  type ResponsiveImageSizes
} from '../utils/imageOptimization';

interface UseImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  progressive?: boolean;
  mobileOptimized?: boolean;
  lazyLoading?: boolean;
  preloadCritical?: boolean;
  adaptiveQuality?: boolean;
  customSizes?: Partial<ResponsiveImageSizes>;
}

interface ImageOptimizationResult {
  srcSet: string;
  sizes: string;
  quality: number;
  format: string;
  loading: 'lazy' | 'eager';
  preloadImage: (src: string, priority?: boolean) => Promise<void>;
  optimizeForUpload: (file: File) => Promise<Blob>;
  isSlowConnection: boolean;
  lazyLoader: IntersectionObserver | null;
}

export function useImageOptimization(
  baseSrc: string,
  options: UseImageOptimizationOptions = {}
): ImageOptimizationResult {
  const {
    quality: initialQuality,
    format = 'auto',
    progressive = true,
    mobileOptimized = true,
    lazyLoading = true,
    preloadCritical = false,
    adaptiveQuality = true,
    customSizes = {}
  } = options;

  const { isMobile, isTablet } = useResponsive();
  const [lazyLoader, setLazyLoader] = useState<IntersectionObserver | null>(null);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow'>('fast');

  // Monitor connection speed
  useEffect(() => {
    const checkConnection = () => {
      setConnectionSpeed(isSlowConnection() ? 'slow' : 'fast');
    };

    checkConnection();
    
    // Listen for connection changes
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', checkConnection);
      
      return () => {
        connection.removeEventListener('change', checkConnection);
      };
    }
  }, []);

  // Initialize lazy loader
  useEffect(() => {
    if (lazyLoading && typeof window !== 'undefined') {
      const loader = createLazyLoader(0.1, '50px');
      setLazyLoader(loader);
      
      return () => {
        loader?.disconnect();
      };
    }
  }, [lazyLoading]);

  // Calculate optimal quality
  const quality = useMemo(() => {
    if (initialQuality) return initialQuality;
    
    if (adaptiveQuality) {
      const baseQuality = getRecommendedQuality();
      
      // Reduce quality further on mobile with slow connection
      if (isMobile && connectionSpeed === 'slow') {
        return Math.max(baseQuality - 15, 40);
      }
      
      // Slightly reduce quality on mobile
      if (isMobile) {
        return Math.max(baseQuality - 5, 60);
      }
      
      return baseQuality;
    }
    
    return 75;
  }, [initialQuality, adaptiveQuality, isMobile, connectionSpeed]);

  // Generate responsive image sizes
  const responsiveSizes = useMemo(() => {
    const defaultSizes = [320, 640, 768, 1024, 1280, 1920];
    
    if (mobileOptimized) {
      // Prioritize mobile sizes
      if (isMobile) {
        return [320, 640, 768];
      } else if (isTablet) {
        return [640, 768, 1024];
      }
    }
    
    return defaultSizes;
  }, [mobileOptimized, isMobile, isTablet]);

  // Generate srcSet
  const srcSet = useMemo(() => {
    if (!baseSrc) return '';
    
    return generateSrcSet(baseSrc, responsiveSizes, {
      quality,
      format,
      progressive
    });
  }, [baseSrc, responsiveSizes, quality, format, progressive]);

  // Generate sizes attribute
  const sizes = useMemo(() => {
    return generateSizesAttribute(customSizes);
  }, [customSizes]);

  // Determine optimal format
  const optimalFormat = useMemo(() => {
    return getOptimalFormat(baseSrc.split('.').pop() || 'jpg');
  }, [baseSrc]);

  // Determine loading strategy
  const loading = useMemo((): 'lazy' | 'eager' => {
    if (preloadCritical) return 'eager';
    if (!lazyLoading) return 'eager';
    return 'lazy';
  }, [preloadCritical, lazyLoading]);

  // Preload image function
  const preloadImageCallback = useCallback(async (src: string, priority: boolean = false) => {
    try {
      await preloadImage(src, priority);
    } catch (error) {
      console.warn('Failed to preload image:', src, error);
    }
  }, []);

  // Optimize image for upload
  const optimizeForUpload = useCallback(async (file: File): Promise<Blob> => {
    const { compressImage } = await import('../utils/imageOptimization');
    
    const compressionOptions: ImageOptimizationOptions = {
      quality: quality / 100, // Convert to 0-1 range for compression
      format: format === 'auto' ? 'jpeg' : format
    };
    
    // Additional mobile optimizations
    if (isMobile) {
      compressionOptions.width = 1024; // Max width for mobile uploads
      compressionOptions.quality = Math.min(compressionOptions.quality || 0.8, 0.7);
    }
    
    return compressImage(file, compressionOptions);
  }, [quality, format, isMobile]);

  return {
    srcSet,
    sizes,
    quality,
    format: optimalFormat,
    loading,
    preloadImage: preloadImageCallback,
    optimizeForUpload,
    isSlowConnection: connectionSpeed === 'slow',
    lazyLoader
  };
}

/**
 * Hook for managing image gallery optimization
 */
export function useImageGallery(images: string[], options: UseImageOptimizationOptions = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  
  const currentImage = images[currentIndex];
  const optimization = useImageOptimization(currentImage, options);
  
  // Preload adjacent images
  useEffect(() => {
    const preloadAdjacent = async () => {
      const toPreload = [
        images[currentIndex - 1],
        images[currentIndex + 1]
      ].filter(Boolean);
      
      for (const src of toPreload) {
        if (!preloadedImages.has(src)) {
          try {
            await optimization.preloadImage(src);
            setPreloadedImages(prev => new Set(prev).add(src));
          } catch (error) {
            console.warn('Failed to preload gallery image:', src);
          }
        }
      }
    };
    
    preloadAdjacent();
  }, [currentIndex, images, optimization, preloadedImages]);
  
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, [images.length]);
  
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);
  
  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  }, [images.length]);
  
  return {
    ...optimization,
    currentIndex,
    currentImage,
    goToNext,
    goToPrevious,
    goToIndex,
    totalImages: images.length,
    preloadedImages
  };
}