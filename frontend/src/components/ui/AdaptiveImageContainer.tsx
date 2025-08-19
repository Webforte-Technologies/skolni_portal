import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';
import ResponsiveImage from './ResponsiveImage';

interface AdaptiveImageContainerProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | '16:9' | '4:3' | '3:2' | '21:9' | 'auto';
  mobileAspectRatio?: 'square' | '16:9' | '4:3' | '3:2' | '21:9' | 'auto';
  layout?: 'fixed' | 'responsive' | 'fill' | 'intrinsic';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  placeholder?: 'blur' | 'empty' | string;
  quality?: number;
  sizes?: string;
  srcSet?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  caption?: string;
  showCaption?: boolean;
  overlay?: React.ReactNode;
  interactive?: boolean;
  zoomable?: boolean;
  progressive?: boolean;
}

const AdaptiveImageContainer: React.FC<AdaptiveImageContainerProps> = ({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = 'auto',
  mobileAspectRatio,
  layout = 'responsive',
  objectFit = 'cover',
  priority = false,
  placeholder = 'blur',
  quality = 75,
  sizes,
  srcSet,
  loading = 'lazy',
  onLoad,
  onError,
  caption,
  showCaption = false,
  overlay,
  interactive = false,
  zoomable = false,
  progressive = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile, isTablet } = useResponsive();

  // Determine effective aspect ratio based on device
  const getEffectiveAspectRatio = () => {
    if (mobileAspectRatio && (isMobile || isTablet)) {
      return mobileAspectRatio;
    }
    
    // For auto aspect ratio, use natural dimensions if available
    if (aspectRatio === 'auto' && naturalDimensions) {
      const ratio = naturalDimensions.width / naturalDimensions.height;
      if (ratio > 1.7) return '16:9';
      if (ratio > 1.4) return '3:2';
      if (ratio > 1.2) return '4:3';
      if (ratio > 0.9) return 'square';
      return '4:3';
    }
    
    return aspectRatio;
  };

  // Get layout classes based on layout type
  const getLayoutClasses = () => {
    // const effectiveAspectRatio = getEffectiveAspectRatio();
    
    switch (layout) {
      case 'fixed':
        return 'w-auto h-auto';
      case 'fill':
        return 'absolute inset-0 w-full h-full';
      case 'intrinsic':
        return 'max-w-full h-auto';
      case 'responsive':
      default:
        return 'w-full h-full';
    }
  };

  // Get container classes
  const getContainerClasses = () => {
    const effectiveAspectRatio = getEffectiveAspectRatio();
    
    if (layout === 'fill') {
      return 'relative';
    }
    
    if (layout === 'intrinsic' || layout === 'fixed') {
      return 'inline-block';
    }
    
    // Responsive layout with aspect ratio
    const aspectRatioClasses = {
      'square': 'aspect-square',
      '16:9': 'aspect-video',
      '4:3': 'aspect-[4/3]',
      '3:2': 'aspect-[3/2]',
      '21:9': 'aspect-[21/9]',
      'auto': ''
    };
    
    return cn(
      'relative overflow-hidden',
      aspectRatioClasses[effectiveAspectRatio as keyof typeof aspectRatioClasses] || ''
    );
  };

  // Handle image load
  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
    
    // Get natural dimensions for auto aspect ratio
    if (aspectRatio === 'auto') {
      const img = new Image();
      img.onload = () => {
        setNaturalDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.src = src;
    }
  };

  // Handle zoom toggle
  const handleZoomToggle = () => {
    if (zoomable) {
      setIsZoomed(!isZoomed);
    }
  };

  // Handle keyboard navigation for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (zoomable && isZoomed && e.key === 'Escape') {
        setIsZoomed(false);
      }
    };

    if (isZoomed) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isZoomed, zoomable]);

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          getContainerClasses(),
          interactive && 'cursor-pointer',
          zoomable && 'cursor-zoom-in',
          containerClassName
        )}
        onClick={interactive ? handleZoomToggle : undefined}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleZoomToggle();
          }
        } : undefined}
        aria-label={interactive ? `Zobrazit obrázek ${alt} v plné velikosti` : undefined}
      >
        <ResponsiveImage
          src={src}
          alt={alt}
          className={cn(
            getLayoutClasses(),
            'transition-transform duration-200',
            interactive && 'hover:scale-105',
            className
          )}
          aspectRatio={layout === 'responsive' ? getEffectiveAspectRatio() : 'auto'}
          objectFit={objectFit}
          priority={priority}
          placeholder={placeholder}
          quality={quality}
          sizes={sizes}
          srcSet={srcSet}
          loading={loading}
          onLoad={handleImageLoad}
          onError={onError}
          progressive={progressive}
          mobileOptimized={true}
        />
        
        {/* Overlay content */}
        {overlay && (
          <div className="absolute inset-0 flex items-center justify-center">
            {overlay}
          </div>
        )}
        
        {/* Loading indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Zoom indicator */}
        {zoomable && isLoaded && (
          <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Caption */}
      {showCaption && caption && (
        <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 text-center">
          {caption}
        </div>
      )}
      
      {/* Zoom modal */}
      {zoomable && isZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-full max-h-full">
            <ResponsiveImage
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain cursor-zoom-out"
              aspectRatio="auto"
              objectFit="contain"
              priority={true}
              loading="eager"
              progressive={false}
            />
            
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(false);
              }}
              aria-label="Zavřít náhled"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Caption in modal */}
            {caption && (
              <div className="absolute bottom-4 left-4 right-4 text-white text-center bg-black/50 p-2 rounded">
                {caption}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdaptiveImageContainer;