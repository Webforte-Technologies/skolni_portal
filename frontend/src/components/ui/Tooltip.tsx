import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  showOnHover?: boolean;
  persistent?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 500,
  className,
  showOnHover = true,
  persistent = false,
  size = 'md'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPersistent, setIsPersistent] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (showOnHover) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (!persistent || !isPersistent) {
      setIsVisible(false);
    }
  };

  const togglePersistent = () => {
    setIsPersistent(!isPersistent);
    if (!isPersistent) {
      setIsVisible(true);
    }
  };

  const closeTooltip = () => {
    setIsVisible(false);
    setIsPersistent(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg';
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-xs';
      case 'md':
        return 'max-w-sm';
      case 'lg':
        return 'max-w-md';
      default:
        return 'max-w-sm';
    }
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';
    
    switch (position) {
      case 'top':
        return `${baseClasses} top-full left-1/2 -translate-x-1/2 -mt-1`;
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 -translate-x-1/2 -mb-1`;
      case 'left':
        return `${baseClasses} left-full top-1/2 -translate-y-1/2 -ml-1`;
      case 'right':
        return `${baseClasses} right-full top-1/2 -translate-y-1/2 -mr-1`;
      default:
        return `${baseClasses} top-full left-1/2 -translate-x-1/2 -mt-1`;
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {(isVisible || isPersistent) && (
        <div
          ref={tooltipRef}
          className={cn(
            getPositionClasses(),
            getSizeClasses(),
            'animate-in fade-in-0 zoom-in-95 duration-200',
            className
          )}
          role="tooltip"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {typeof content === 'string' ? (
                <p className="leading-relaxed">{content}</p>
              ) : (
                content
              )}
            </div>
            
            {persistent && (
              <button
                onClick={closeTooltip}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-white transition-colors"
                aria-label="Zavřít nápovědu"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className={getArrowClasses()}></div>
        </div>
      )}
      
      {persistent && (
        <button
          onClick={togglePersistent}
          className="absolute -top-1 -right-1 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors z-10"
          aria-label="Zobrazit nápovědu"
        >
          <HelpCircle className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default Tooltip;
