import { useState, useEffect } from 'react';
import { ViewportState } from '../types';

const getViewportState = (): ViewportState => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  let breakpoint: 'mobile' | 'tablet' | 'desktop';
  if (width < 640) {
    breakpoint = 'mobile';
  } else if (width < 1024) {
    breakpoint = 'tablet';
  } else {
    breakpoint = 'desktop';
  }

  return {
    width,
    height,
    breakpoint,
    orientation: width > height ? 'landscape' : 'portrait',
    touchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  };
};

export const useViewport = () => {
  const [viewport, setViewport] = useState<ViewportState>(getViewportState);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events to improve performance
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setViewport(getViewportState());
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return viewport;
};

export const useResponsive = () => {
  const viewport = useViewport();
  
  return {
    ...viewport,
    isMobile: viewport.breakpoint === 'mobile',
    isTablet: viewport.breakpoint === 'tablet',
    isDesktop: viewport.breakpoint === 'desktop',
    isMobileOrTablet: viewport.breakpoint === 'mobile' || viewport.breakpoint === 'tablet',
  };
};