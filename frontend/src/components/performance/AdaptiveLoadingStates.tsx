import React, { useState, useEffect } from 'react';
import { useResponsive } from '../../hooks/useViewport';
import { LoadingSkeleton } from './LoadingSkeleton';

interface AdaptiveLoadingProps {
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  loadingVariant?: 'card' | 'list' | 'text' | 'avatar' | 'button' | 'form' | 'chat' | 'dashboard' | 'table';
  minLoadingTime?: number;
  showProgressBar?: boolean;
  className?: string;
}

export const AdaptiveLoading: React.FC<AdaptiveLoadingProps> = ({
  isLoading,
  error,
  children,
  loadingVariant = 'card',
  minLoadingTime = 300,
  showProgressBar = false,
  className = '',
}) => {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [progress, setProgress] = useState(0);
  const { isMobile } = useResponsive();
  
  // Use isMobile for responsive behavior
  const minLoadingTimeAdjusted = isMobile ? Math.max(minLoadingTime, 200) : minLoadingTime;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isLoading) {
      setShowLoading(true);
      
      if (showProgressBar) {
        // Simulate progress for better UX
        progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) return prev;
            return prev + Math.random() * 10;
          });
        }, 200);
      }
    } else {
      // Ensure minimum loading time for better perceived performance
      timeoutId = setTimeout(() => {
        setShowLoading(false);
        setProgress(100);
      }, minLoadingTimeAdjusted);
    }

    return () => {
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
    };
  }, [isLoading, minLoadingTimeAdjusted, showProgressBar]);

  if (error) {
    return (
      <div className={`p-4 text-red-600 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 mb-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="font-medium">Chyba při načítání</h3>
        </div>
        <p className="text-sm text-red-500 mb-3">
          {error.message || 'Došlo k neočekávané chybě'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
        >
          Zkusit znovu
        </button>
      </div>
    );
  }

  if (showLoading) {
    return (
      <div className={className}>
        {showProgressBar && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Načítání...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        <LoadingSkeleton variant={loadingVariant} />
      </div>
    );
  }

  return <>{children}</>;
};

interface ProgressiveLoadingProps {
  stages: {
    name: string;
    component: React.ComponentType<any>;
    props?: Record<string, any>;
    priority: number;
  }[];
  className?: string;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  stages,
  className = '',
}) => {
  const [loadedStages, setLoadedStages] = useState<Set<number>>(new Set());
  const [currentStage, setCurrentStage] = useState(0);
  const { isMobile } = useResponsive();

  // Sort stages by priority
  const sortedStages = [...stages].sort((a, b) => a.priority - b.priority);

  useEffect(() => {
    const loadNextStage = () => {
      if (currentStage < sortedStages.length) {
        setLoadedStages(prev => new Set([...prev, currentStage]));
        
        // Load next stage after a delay (shorter on mobile for faster perceived performance)
        const delay = isMobile ? 100 : 200;
        setTimeout(() => {
          setCurrentStage(prev => prev + 1);
        }, delay);
      }
    };

    loadNextStage();
  }, [currentStage, sortedStages.length, isMobile]);

  return (
    <div className={className}>
      {sortedStages.map((stage, index) => {
        const isLoaded = loadedStages.has(index);
        const Component = stage.component;

        return (
          <div key={stage.name} className={isLoaded ? 'block' : 'hidden'}>
            {isLoaded ? (
              <Component {...(stage.props || {})} />
            ) : (
              <LoadingSkeleton variant="card" />
            )}
          </div>
        );
      })}
    </div>
  );
};

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  className = '',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          {placeholder ? (
            <img src={placeholder} alt="" className="w-full h-full object-cover opacity-50" />
          ) : (
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Chyba načítání</p>
          </div>
        </div>
      )}

      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          {...props}
        />
      )}
    </div>
  );
};

// Hook for managing loading states
export const useAdaptiveLoading = (initialLoading = false) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setProgress(100);
  };

  const setLoadingError = (err: Error) => {
    setError(err);
    setIsLoading(false);
  };

  const updateProgress = (value: number) => {
    setProgress(Math.min(100, Math.max(0, value)));
  };

  return {
    isLoading,
    error,
    progress,
    startLoading,
    stopLoading,
    setLoadingError,
    updateProgress,
  };
};