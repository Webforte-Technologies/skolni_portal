import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';

interface ResponsiveMathProps {
  children: React.ReactNode;
  className?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
  maxZoom?: number;
  minZoom?: number;
}

interface TouchState {
  startDistance: number;
  startScale: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
}

const ResponsiveMath: React.FC<ResponsiveMathProps> = ({
  children,
  className,
  enableZoom = true,
  enablePan = true,
  maxZoom = 3,
  minZoom = 0.5,
}) => {
  const { isMobile, isTablet, touchDevice } = useResponsive();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [touchState, setTouchState] = useState<TouchState | null>(null);

  // Reset transform when switching between mobile/desktop
  useEffect(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  }, [isMobile, isTablet]);

  // Calculate distance between two touch points
  const getTouchDistance = useCallback((touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  // Get center point of two touches
  const getTouchCenter = useCallback((touches: React.TouchList) => {
    if (touches.length < 2) return { x: 0, y: 0 };
    const touch1 = touches[0];
    const touch2 = touches[1];
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }, []);

  // Handle touch start for zoom and pan
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableZoom && !enablePan) return;
    
    e.preventDefault();
    
    if (e.touches.length === 2 && enableZoom) {
      // Two finger pinch for zoom
      const distance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches);
      
      setTouchState({
        startDistance: distance,
        startScale: scale,
        startX: center.x,
        startY: center.y,
        lastX: center.x,
        lastY: center.y,
      });
    } else if (e.touches.length === 1 && enablePan && scale > 1) {
      // Single finger pan when zoomed
      const touch = e.touches[0];
      setIsDragging(true);
      setTouchState({
        startDistance: 0,
        startScale: scale,
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: translateX,
        lastY: translateY,
      });
    }
  }, [enableZoom, enablePan, scale, translateX, translateY, getTouchDistance, getTouchCenter]);

  // Handle touch move for zoom and pan
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState) return;
    
    e.preventDefault();
    
    if (e.touches.length === 2 && enableZoom) {
      // Pinch zoom
      const distance = getTouchDistance(e.touches);
      const scaleChange = distance / touchState.startDistance;
      const newScale = Math.max(minZoom, Math.min(maxZoom, touchState.startScale * scaleChange));
      setScale(newScale);
    } else if (e.touches.length === 1 && enablePan && isDragging) {
      // Pan
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchState.startX;
      const deltaY = touch.clientY - touchState.startY;
      
      setTranslateX(touchState.lastX + deltaX);
      setTranslateY(touchState.lastY + deltaY);
    }
  }, [touchState, enableZoom, enablePan, isDragging, minZoom, maxZoom, getTouchDistance]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    setTouchState(null);
    setIsDragging(false);
  }, []);

  // Handle mouse wheel zoom (desktop)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!enableZoom || !e.ctrlKey) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(minZoom, Math.min(maxZoom, scale * delta));
    setScale(newScale);
  }, [enableZoom, scale, minZoom, maxZoom]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    const newScale = Math.min(maxZoom, scale * 1.2);
    setScale(newScale);
  }, [scale, maxZoom]);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(minZoom, scale * 0.8);
    setScale(newScale);
  }, [scale, minZoom]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  }, []);

  // Check if content overflows horizontally
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current && containerRef.current) {
        const contentWidth = contentRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        setHasHorizontalOverflow(contentWidth > containerWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [children]);

  const showZoomControls = (isMobile || isTablet) && enableZoom && (scale !== 1 || hasHorizontalOverflow);

  return (
    <div className={cn('relative', className)}>
      {/* Zoom controls for mobile/tablet */}
      {showZoomControls && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Button
            onClick={zoomOut}
            variant="secondary"
            size="icon"
            className="w-8 h-8 min-h-[44px] min-w-[44px] bg-white/90 backdrop-blur-sm shadow-lg"
            disabled={scale <= minZoom}
            title="Zmenšit"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            onClick={zoomIn}
            variant="secondary"
            size="icon"
            className="w-8 h-8 min-h-[44px] min-w-[44px] bg-white/90 backdrop-blur-sm shadow-lg"
            disabled={scale >= maxZoom}
            title="Zvětšit"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          {(scale !== 1 || translateX !== 0 || translateY !== 0) && (
            <Button
              onClick={resetZoom}
              variant="secondary"
              size="icon"
              className="w-8 h-8 min-h-[44px] min-w-[44px] bg-white/90 backdrop-blur-sm shadow-lg"
              title="Resetovat"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Math content container */}
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-auto',
          // Enable smooth scrolling on touch devices
          touchDevice && 'scroll-smooth',
          // Custom scrollbar styling for mobile
          isMobile && 'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{
          // Prevent text selection during touch interactions
          userSelect: isDragging ? 'none' : 'auto',
          // Enable hardware acceleration
          willChange: 'transform',
        }}
      >
        <div
          ref={contentRef}
          className={cn(
            'math-content transition-transform duration-200 ease-out',
            // Ensure minimum touch target size on mobile
            isMobile && 'min-h-[44px]'
          )}
          style={{
            transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>

      {/* Instructions for desktop users */}
      {!touchDevice && enableZoom && hasHorizontalOverflow && (
        <div className="text-xs text-gray-500 mt-2 text-center">
          Držte Ctrl a použijte kolečko myši pro přiblížení
        </div>
      )}
    </div>
  );
};

export default ResponsiveMath;