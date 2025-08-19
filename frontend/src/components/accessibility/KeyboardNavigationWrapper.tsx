import React, { useState, useCallback, Children, cloneElement, isValidElement } from 'react';
import { useKeyboardNavigation, useRovingTabIndex } from '../../hooks/useKeyboardNavigation';
import { useAccessibilityContext } from './AccessibilityProvider';

interface KeyboardNavigationWrapperProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical' | 'both';
  circular?: boolean;
  onActivate?: (index: number) => void;
  onEscape?: () => void;
  className?: string;
  role?: string;
  ariaLabel?: string;
}

export const KeyboardNavigationWrapper: React.FC<KeyboardNavigationWrapperProps> = ({
  children,
  orientation = 'vertical',
  circular = false,
  onActivate,
  onEscape,
  className = '',
  role = 'listbox',
  ariaLabel,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { isMobile, getResponsiveAriaLabel } = useAccessibilityContext();
  
  const childrenArray = Children.toArray(children).filter(isValidElement);
  const itemRefs = React.useRef<HTMLElement[]>([]);

  const handleNext = useCallback(() => {
    setActiveIndex(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= childrenArray.length) {
        return circular ? 0 : prev;
      }
      return nextIndex;
    });
  }, [childrenArray.length, circular]);

  const handlePrevious = useCallback(() => {
    setActiveIndex(prev => {
      const prevIndex = prev - 1;
      if (prevIndex < 0) {
        return circular ? childrenArray.length - 1 : prev;
      }
      return prevIndex;
    });
  }, [childrenArray.length, circular]);

  const handleFirst = useCallback(() => {
    setActiveIndex(0);
  }, []);

  const handleLast = useCallback(() => {
    setActiveIndex(childrenArray.length - 1);
  }, [childrenArray.length]);

  const handleActivate = useCallback(() => {
    onActivate?.(activeIndex);
  }, [activeIndex, onActivate]);

  const { containerRef, getNavigationInstructions } = useKeyboardNavigation(
    {
      orientation,
      circular,
      enableArrowKeys: true,
      enableHomeEnd: !isMobile,
      enableEnterSpace: true,
      enableEscape: !!onEscape,
    },
    {
      onNext: handleNext,
      onPrevious: handlePrevious,
      onFirst: handleFirst,
      onLast: handleLast,
      onActivate: handleActivate,
      onEscape,
    }
  );

  useRovingTabIndex(itemRefs.current, activeIndex);

  const responsiveAriaLabel = getResponsiveAriaLabel(
    ariaLabel || 'Seznam položek',
    ariaLabel || 'Seznam položek pro tablet',
    ariaLabel || 'Seznam položek pro desktop'
  );

  const enhancedChildren = childrenArray.map((child, index) => {
    if (!isValidElement(child)) return child;

    const childProps = child.props as any;
    
    return cloneElement(child, {
      ...childProps,
      ref: (el: HTMLElement) => {
        itemRefs.current[index] = el;
        if (typeof (child as any).ref === 'function') {
          (child as any).ref(el);
        } else if ((child as any).ref) {
          ((child as any).ref as React.MutableRefObject<HTMLElement>).current = el;
        }
      },
      'aria-selected': index === activeIndex,
      'aria-posinset': index + 1,
      'aria-setsize': childrenArray.length,
      tabIndex: index === activeIndex ? 0 : -1,
      onFocus: () => {
        setActiveIndex(index);
        childProps.onFocus?.(index);
      },
      onClick: () => {
        setActiveIndex(index);
        onActivate?.(index);
        childProps.onClick?.();
      },
      className: `${childProps.className || ''} ${
        index === activeIndex ? 'bg-blue-50 ring-2 ring-blue-500' : ''
      }`.trim(),
    });
  });

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={`focus:outline-none ${className}`}
      role={role}
      aria-label={responsiveAriaLabel}
      aria-orientation={orientation !== 'both' ? orientation : undefined}
      aria-activedescendant={`item-${activeIndex}`}
      title={isMobile ? undefined : getNavigationInstructions()}
    >
      {enhancedChildren}
      {isMobile && (
        <div className="sr-only" aria-live="polite">
          {`Položka ${activeIndex + 1} z ${childrenArray.length}. ${getNavigationInstructions()}`}
        </div>
      )}
    </div>
  );
};

interface NavigableItemProps {
  children: React.ReactNode;
  onActivate?: () => void;
  className?: string;
  disabled?: boolean;
}

export const NavigableItem: React.FC<NavigableItemProps> = ({
  children,
  onActivate,
  className = '',
  disabled = false,
}) => {
  const { isMobile } = useAccessibilityContext();

  const handleClick = () => {
    if (!disabled) {
      onActivate?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      onActivate?.();
    }
  };

  const baseClasses = `
    block w-full text-left px-4 py-2 rounded-md transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${isMobile ? 'min-h-[44px] touch-manipulation' : 'min-h-[32px]'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
  `;

  return (
    <div
      className={`${baseClasses} ${className}`}
      role="option"
      tabIndex={-1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
};