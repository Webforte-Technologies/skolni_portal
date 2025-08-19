import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Download, Share2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';
import { useImageGallery } from '../../hooks/useImageOptimization';
import AdaptiveImageContainer from './AdaptiveImageContainer';
import Button from './Button';

interface ResponsiveImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
    thumbnail?: string;
  }>;
  className?: string;
  aspectRatio?: 'square' | '16:9' | '4:3' | '3:2' | '21:9' | 'auto';
  layout?: 'grid' | 'carousel' | 'masonry';
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  showThumbnails?: boolean;
  showControls?: boolean;
  showCaptions?: boolean;
  allowZoom?: boolean;
  allowDownload?: boolean;
  allowShare?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onImageClick?: (index: number) => void;
  onImageLoad?: (index: number) => void;
  onImageError?: (index: number) => void;
}

const ResponsiveImageGallery: React.FC<ResponsiveImageGalleryProps> = ({
  images,
  className,
  aspectRatio = '4:3',
  layout = 'grid',
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  showThumbnails = true,
  showControls = true,
  showCaptions = true,
  allowZoom = true,
  allowDownload = false,
  allowShare = false,
  autoPlay = false,
  autoPlayInterval = 5000,
  onImageClick,
  onImageLoad,
  onImageError
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const { isMobile, isTablet } = useResponsive();
  
  const galleryOptimization = useImageGallery(
    images.map(img => img.src),
    {
      mobileOptimized: true,
      adaptiveQuality: true,
      lazyLoading: layout !== 'carousel'
    }
  );

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || !isFullscreen) return;

    const interval = setInterval(() => {
      galleryOptimization.goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isFullscreen, galleryOptimization]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          galleryOptimization.goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          galleryOptimization.goToNext();
          break;
        case 'Escape':
          e.preventDefault();
          setIsFullscreen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, galleryOptimization]);

  // Handle image click
  const handleImageClick = useCallback((index: number) => {
    setFullscreenIndex(index);
    galleryOptimization.goToIndex(index);
    setIsFullscreen(true);
    onImageClick?.(index);
  }, [galleryOptimization, onImageClick]);

  // Get responsive columns
  const getColumns = () => {
    if (isMobile) return columns.mobile;
    if (isTablet) return columns.tablet;
    return columns.desktop;
  };

  // Get grid classes
  const getGridClasses = () => {
    const cols = getColumns();
    const gridClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6'
    };
    return gridClasses[cols as keyof typeof gridClasses] || 'grid-cols-3';
  };

  // Download image
  const handleDownload = async (src: string, filename: string) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  // Share image
  const handleShare = async (src: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: src
        });
      } catch (error) {
        console.error('Failed to share image:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(src);
        // You could show a toast notification here
      } catch (error) {
        console.error('Failed to copy image URL:', error);
      }
    }
  };

  // Render grid layout
  const renderGrid = () => (
    <div className={cn('grid gap-4', getGridClasses())}>
      {images.map((image, index) => (
        <div key={index} className="group relative">
          <AdaptiveImageContainer
            src={image.thumbnail || image.src}
            alt={image.alt}
            aspectRatio={aspectRatio}
            className="cursor-pointer transition-transform duration-200 group-hover:scale-105"
            interactive={true}
            zoomable={false}
            progressive={true}
            onLoad={() => onImageLoad?.(index)}
            onError={() => onImageError?.(index)}
          />
          
          {/* Overlay on hover */}
          {allowZoom && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleImageClick(index)}
                className="bg-white/90 text-black hover:bg-white"
              >
                <ZoomIn className="w-4 h-4 mr-2" />
                Zobrazit
              </Button>
            </div>
          )}
          
          {/* Caption */}
          {showCaptions && image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white text-sm truncate">{image.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Render carousel layout
  const renderCarousel = () => (
    <div className="relative">
      <div className="overflow-hidden rounded-lg">
        <AdaptiveImageContainer
          src={images[galleryOptimization.currentIndex]?.src}
          alt={images[galleryOptimization.currentIndex]?.alt}
          aspectRatio={aspectRatio}
          className="w-full"
          progressive={true}
          priority={true}
          onLoad={() => onImageLoad?.(galleryOptimization.currentIndex)}
          onError={() => onImageError?.(galleryOptimization.currentIndex)}
        />
      </div>
      
      {/* Navigation controls */}
      {showControls && images.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
            onClick={galleryOptimization.goToPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
            onClick={galleryOptimization.goToNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}
      
      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                index === galleryOptimization.currentIndex
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/75'
              )}
              onClick={() => galleryOptimization.goToIndex(index)}
            />
          ))}
        </div>
      )}
      
      {/* Caption */}
      {showCaptions && images[galleryOptimization.currentIndex]?.caption && (
        <div className="mt-4 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            {images[galleryOptimization.currentIndex].caption}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={cn('w-full', className)}>
        {layout === 'carousel' ? renderCarousel() : renderGrid()}
        
        {/* Thumbnails for carousel */}
        {layout === 'carousel' && showThumbnails && images.length > 1 && (
          <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                className={cn(
                  'flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-colors',
                  index === galleryOptimization.currentIndex
                    ? 'border-primary-500'
                    : 'border-transparent hover:border-neutral-300'
                )}
                onClick={() => galleryOptimization.goToIndex(index)}
              >
                <AdaptiveImageContainer
                  src={image.thumbnail || image.src}
                  alt={image.alt}
                  aspectRatio="square"
                  className="w-full h-full"
                  loading="lazy"
                  progressive={false}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Main image */}
            <AdaptiveImageContainer
              src={images[fullscreenIndex]?.src}
              alt={images[fullscreenIndex]?.alt}
              className="max-w-full max-h-full"
              aspectRatio="auto"
              layout="intrinsic"
              objectFit="contain"
              priority={true}
              progressive={false}
            />
            
            {/* Controls */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {allowDownload && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => handleDownload(
                    images[fullscreenIndex].src,
                    `image-${fullscreenIndex + 1}.jpg`
                  )}
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
              
              {allowShare && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => handleShare(
                    images[fullscreenIndex].src,
                    images[fullscreenIndex].alt
                  )}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="secondary"
                size="icon"
                className="bg-white/10 hover:bg-white/20 text-white"
                onClick={() => setIsFullscreen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white"
                  onClick={galleryOptimization.goToPrevious}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white"
                  onClick={galleryOptimization.goToNext}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
            
            {/* Caption and info */}
            {(showCaptions || images.length > 1) && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                {showCaptions && images[fullscreenIndex]?.caption && (
                  <p className="text-white text-lg mb-2">
                    {images[fullscreenIndex].caption}
                  </p>
                )}
                
                {images.length > 1 && (
                  <p className="text-white/70 text-sm">
                    {fullscreenIndex + 1} z {images.length}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ResponsiveImageGallery;