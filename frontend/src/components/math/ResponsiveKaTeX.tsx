import React, { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';
import ResponsiveMath from './ResponsiveMath';

interface ResponsiveKaTeXProps {
  math: string;
  displayMode?: boolean;
  className?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
}

const ResponsiveKaTeX: React.FC<ResponsiveKaTeXProps> = ({
  math,
  displayMode = false,
  className,
  enableZoom = true,
  enablePan = true,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const mathRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!mathRef.current) return;

    try {
      // Clear any previous content
      mathRef.current.innerHTML = '';
      
      // Note: Font size is handled via CSS classes instead of KaTeX options
      
      // KaTeX options with responsive settings
      const options: katex.KatexOptions = {
        displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        // Enable line breaks for long expressions on mobile
        fleqn: isMobile && displayMode,
        // Reduce spacing on mobile
        macros: isMobile ? {
          '\\,': '\\mkern2mu', // Reduce thin space
          '\\:': '\\mkern3mu', // Reduce medium space  
          '\\;': '\\mkern4mu', // Reduce thick space
        } : undefined,
      };

      katex.render(math, mathRef.current, options);
      setRenderError(null);
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      setRenderError(error instanceof Error ? error.message : 'Unknown rendering error');
      
      // Fallback to plain text
      if (mathRef.current) {
        mathRef.current.textContent = math;
      }
    }
  }, [math, displayMode, isMobile, isTablet]);

  if (renderError) {
    return (
      <div className={cn(
        'text-red-600 bg-red-50 border border-red-200 rounded p-2',
        isMobile ? 'text-xs' : 'text-sm',
        className
      )}>
        <div className="font-medium">Chyba při vykreslování matematiky:</div>
        <div className="text-xs mt-1">{renderError}</div>
        <div className="mt-2 font-mono text-xs bg-white p-1 rounded border">
          {math}
        </div>
      </div>
    );
  }

  const mathContent = (
    <div
      ref={mathRef}
      className={cn(
        'katex-container',
        // Responsive spacing and sizing
        displayMode && isMobile && 'text-center',
        displayMode && 'my-2',
        !displayMode && 'inline-block',
        className
      )}
    />
  );

  // Wrap display mode math in ResponsiveMath for zoom/pan on mobile
  if (displayMode && (isMobile || isTablet)) {
    return (
      <ResponsiveMath
        enableZoom={enableZoom}
        enablePan={enablePan}
        className="my-2"
      >
        {mathContent}
      </ResponsiveMath>
    );
  }

  return mathContent;
};

export default ResponsiveKaTeX;