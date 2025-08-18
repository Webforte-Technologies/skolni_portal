import React from 'react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';

interface ResponsiveFormProps {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  preventZoom?: boolean;
  singleColumnOnMobile?: boolean;
  // When true, the form will always render fields stacked vertically,
  // regardless of viewport size. Useful for simple auth forms.
  forceSingleColumn?: boolean;
}

const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  className,
  onSubmit,
  preventZoom = true,
  singleColumnOnMobile = true,
  forceSingleColumn = false,
}) => {
  const { isMobile, touchDevice } = useResponsive();

  // Add viewport meta tag to prevent zooming if needed
  React.useEffect(() => {
    if (!preventZoom) return;

    const existingViewport = document.querySelector('meta[name="viewport"]');
    const viewportContent = isMobile 
      ? 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      : 'width=device-width, initial-scale=1.0';

    if (existingViewport) {
      existingViewport.setAttribute('content', viewportContent);
    } else {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = viewportContent;
      document.head.appendChild(viewport);
    }

    return () => {
      // Reset viewport on cleanup
      if (existingViewport) {
        existingViewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, [preventZoom, isMobile]);

  const formClasses = cn(
    'w-full',
    // Mobile-first responsive spacing
    isMobile ? 'space-y-4' : 'space-y-3',
    // Touch device optimizations
    touchDevice && 'touch-manipulation',
    className
  );

  return (
    <form 
      onSubmit={onSubmit} 
      className={formClasses}
      noValidate // We handle validation ourselves
    >
      <div className={cn(
        // Force stacked layout on all sizes for simple forms
        forceSingleColumn
          ? 'flex flex-col space-y-4'
          : (
              singleColumnOnMobile && isMobile
                ? 'flex flex-col space-y-4'
                : 'grid gap-4'
            ),
        // Only apply multi-column grid when not forcing a single column and not on mobile
        !forceSingleColumn && !isMobile && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      )}>
        {children}
      </div>
    </form>
  );
};

export default ResponsiveForm;