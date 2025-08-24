import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | '16:9' | '4:3' | '3:2' | '21:9' | 'auto';
  sizes?: string;
  srcSet?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  placeholder?: 'blur' | 'empty' | string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  progressive?: boolean;
  mobileOptimized?: boolean;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  aspectRatio = 'auto',
  sizes,
  srcSet,
  loading = 'lazy',
  priority = false,
  placeholder = 'blur',
  quality = 75,
  onLoad,
  onError,
  objectFit = 'cover',
  progressive = true,
  mobileOptimized = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const { isMobile, isTablet } = useResponsive();

  // Generate responsive srcSet if not provided
  const generateSrcSet = (baseSrc: string): string => {
    if (srcSet) return srcSet;
    
    const baseUrl = baseSrc.split('.').slice(0, -1).join('.');
    const extension = baseSrc.split('.').pop();
    
    // Generate different sizes for responsive loading
    const sizes = [320, 640, 768, 1024, 1280, 1920];
    return sizes
      .map(size => `${baseUrl}_${size}w.${extension} ${size}w`)
      .join(', ');
  };

  // Generate sizes attribute if not provided
  const generateSizes = (): string => {
    if (sizes) return sizes;
    
    // Default responsive sizes
    return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
  };

  // Get aspect ratio classes
  const getAspectRatioClass = (): string => {
    const ratios = {
      'square': 'aspect-square',
      '16:9': 'aspect-video',
      '4:3': 'aspect-[4/3]',
      '3:2': 'aspect-[3/2]',
      '21:9': 'aspect-[21/9]',
      'auto': ''
    };
    return ratios[aspectRatio] || '';
  };

  // Get object fit classes
  const getObjectFitClass = (): string => {
    const fits = {
      'cover': 'object-cover',
      'contain': 'object-contain',
      'fill': 'object-fill',
      'none': 'object-none',
      'scale-down': 'object-scale-down'
    };
    return fits[objectFit] || 'object-cover';
  };

  // Progressive loading implementation
  useEffect(() => {
    if (!progressive || !imgRef.current) return;

    // const img = imgRef.current;
    
    // Create a low-quality placeholder
    const createPlaceholder = () => {
      if (placeholder === 'blur') {
        // Create a blurred, low-quality version
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 10;
        canvas.height = 10;
        
        if (ctx) {
          // Create a simple gradient placeholder
          const gradient = ctx.createLinearGradient(0, 0, 10, 10);
          gradient.addColorStop(0, '#f3f4f6');
          gradient.addColorStop(1, '#e5e7eb');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 10, 10);
        }
        
        return canvas.toDataURL();
      }
      return placeholder === 'empty' ? '' : placeholder;
    };

    // Set initial placeholder
    if (!isLoaded && placeholder !== 'empty') {
      setCurrentSrc(createPlaceholder());
    }

    // Load the actual image
    const actualImg = new Image();
    actualImg.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };
    actualImg.onerror = () => {
      setIsError(true);
      onError?.();
    };

    // Start loading with mobile optimization
    if (mobileOptimized && (isMobile || isTablet)) {
      // For mobile, load a smaller version first
      const mobileSize = isMobile ? 640 : 768;
      const mobileSrc = src.includes('_') 
        ? src.replace(/_\d+w/, `_${mobileSize}w`)
        : src;
      actualImg.src = mobileSrc;
    } else {
      actualImg.src = src;
    }
    
    // Apply quality setting if supported
    if (quality && quality !== 75) {
      actualImg.style.imageRendering = quality > 85 ? 'high-quality' : 'auto';
    }

    return () => {
      actualImg.onload = null;
      actualImg.onerror = null;
    };
  }, [src, progressive, placeholder, isMobile, isTablet, mobileOptimized, isLoaded, onLoad, onError, quality]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // Error fallback
  if (isError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500',
          getAspectRatioClass(),
          className
        )}
      >
        <div className="text-center p-4">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-xs">Obrázek se nepodařilo načíst</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', getAspectRatioClass(), className)}>
      {/* Loading placeholder */}
      {!isLoaded && placeholder !== 'empty' && (
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={progressive ? currentSrc : src}
        srcSet={!progressive ? generateSrcSet(src) : undefined}
        sizes={!progressive ? generateSizes() : undefined}
        alt={alt}
        loading={priority ? 'eager' : loading}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          getObjectFitClass(),
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />
      
      {/* Progressive loading overlay */}
      {progressive && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default ResponsiveImage;