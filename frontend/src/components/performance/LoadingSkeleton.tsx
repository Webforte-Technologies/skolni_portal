import React from 'react';
import { useResponsive } from '../../hooks/useViewport';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = false,
  animate = true,
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const animationClasses = animate ? 'animate-pulse' : '';
  const roundedClasses = rounded ? 'rounded-full' : 'rounded';

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClasses} ${animationClasses} ${roundedClasses} ${className}`}
      style={style}
    />
  );
};

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'text' | 'avatar' | 'button' | 'form' | 'chat' | 'dashboard' | 'table';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  count = 1,
  className = '',
}) => {
  const { isMobile, isTablet } = useResponsive();

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`p-4 border rounded-lg space-y-3 ${className}`}>
            <Skeleton height={isMobile ? '1.5rem' : '2rem'} width="60%" />
            <Skeleton height="1rem" />
            <Skeleton height="1rem" width="80%" />
            <div className="flex space-x-2 mt-4">
              <Skeleton height={isMobile ? '2rem' : '2.5rem'} width={isMobile ? '4rem' : '5rem'} />
              <Skeleton height={isMobile ? '2rem' : '2.5rem'} width={isMobile ? '4rem' : '5rem'} />
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded">
                <Skeleton width={isMobile ? '2.5rem' : '3rem'} height={isMobile ? '2.5rem' : '3rem'} rounded />
                <div className="flex-1 space-y-2">
                  <Skeleton height="1rem" width="70%" />
                  <Skeleton height="0.75rem" width="50%" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <Skeleton key={index} height="1rem" width={`${Math.random() * 40 + 60}%`} />
            ))}
          </div>
        );

      case 'avatar':
        return (
          <div className={`flex items-center space-x-3 ${className}`}>
            <Skeleton width={isMobile ? '2.5rem' : '4rem'} height={isMobile ? '2.5rem' : '4rem'} rounded />
            <div className="space-y-2">
              <Skeleton height="1rem" width="8rem" />
              <Skeleton height="0.75rem" width="6rem" />
            </div>
          </div>
        );

      case 'button':
        return (
          <Skeleton 
            className={className}
            height={isMobile ? '2.5rem' : '3rem'} 
            width={isMobile ? '6rem' : '8rem'} 
          />
        );

      case 'form':
        return (
          <div className={`space-y-4 ${className}`}>
            <div className="space-y-2">
              <Skeleton height="1rem" width="4rem" />
              <Skeleton height={isMobile ? '2.5rem' : '3rem'} />
            </div>
            <div className="space-y-2">
              <Skeleton height="1rem" width="5rem" />
              <Skeleton height={isMobile ? '2.5rem' : '3rem'} />
            </div>
            <div className="space-y-2">
              <Skeleton height="1rem" width="6rem" />
              <Skeleton height={isMobile ? '6rem' : '8rem'} />
            </div>
            <Skeleton height={isMobile ? '2.5rem' : '3rem'} width={isMobile ? '100%' : '8rem'} />
          </div>
        );

      case 'chat':
        return (
          <div className={`space-y-4 ${className}`}>
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-xs lg:max-w-md">
                <Skeleton height="3rem" width="100%" />
              </div>
            </div>
            {/* AI message */}
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md space-y-2">
                <Skeleton height="2rem" width="100%" />
                <Skeleton height="2rem" width="80%" />
                <Skeleton height="1.5rem" width="60%" />
              </div>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <Skeleton height="2rem" width="12rem" />
              <Skeleton height="2rem" width="6rem" />
            </div>
            
            {/* Stats cards */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {Array.from({ length: isMobile ? 2 : isTablet ? 4 : 4 }).map((_, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <Skeleton height="1rem" width="60%" />
                  <Skeleton height="2rem" width="40%" />
                </div>
              ))}
            </div>
            
            {/* Main content */}
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div className="space-y-4">
                <Skeleton height="1.5rem" width="8rem" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="p-3 border rounded space-y-2">
                      <Skeleton height="1rem" width="70%" />
                      <Skeleton height="0.75rem" width="50%" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <Skeleton height="1.5rem" width="6rem" />
                <Skeleton height="12rem" />
              </div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className={`space-y-4 ${className}`}>
            {/* Table header */}
            <div className={`grid gap-4 p-3 border-b ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {Array.from({ length: isMobile ? 2 : 4 }).map((_, index) => (
                <Skeleton key={index} height="1rem" width="60%" />
              ))}
            </div>
            
            {/* Table rows */}
            {Array.from({ length: count || 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className={`grid gap-4 p-3 border-b ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
                {Array.from({ length: isMobile ? 2 : 4 }).map((_, colIndex) => (
                  <Skeleton key={colIndex} height="1rem" width={`${Math.random() * 30 + 50}%`} />
                ))}
              </div>
            ))}
          </div>
        );

      default:
        return <Skeleton className={className} />;
    }
  };

  return <>{renderSkeleton()}</>;
};

// Specialized skeleton components
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton variant="card" className={className} />
);

export const ListSkeleton: React.FC<{ count?: number; className?: string }> = ({ count, className }) => (
  <LoadingSkeleton variant="list" count={count} className={className} />
);

export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({ lines, className }) => (
  <LoadingSkeleton variant="text" count={lines} className={className} />
);

export const AvatarSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton variant="avatar" className={className} />
);

export const ButtonSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton variant="button" className={className} />
);

export const FormSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton variant="form" className={className} />
);

export const ChatSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton variant="chat" className={className} />
);

export const DashboardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton variant="dashboard" className={className} />
);

export const TableSkeleton: React.FC<{ rows?: number; className?: string }> = ({ rows, className }) => (
  <LoadingSkeleton variant="table" count={rows} className={className} />
);