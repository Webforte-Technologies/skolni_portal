import React, { useState, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../contexts/ResponsiveContext';
import Card, { CardProps } from './Card';

export interface InteractiveCardProps extends Omit<CardProps, 'variant'> {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  pressAnimation?: boolean;
  hoverElevation?: boolean;
  focusRing?: boolean;
  ariaLabel?: string;
}

/**
 * Enhanced Card component with touch-friendly interactions:
 * - Touch press animations
 * - Long press support
 * - Proper focus management
 * - Accessibility enhancements
 * - Responsive hover states
 */
const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  onPress,
  onLongPress,
  disabled = false,
  loading = false,
  pressAnimation = true,
  hoverElevation = true,
  focusRing = true,
  ariaLabel,
  className,
  ...cardProps
}) => {
  const { viewport, state } = useResponsive();
  const { isMobile } = state;
  const isTouchDevice = viewport.touchDevice;
  const [isPressed, setIsPressed] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Handle press start (mouse down / touch start)
  const handlePressStart = useCallback((_event: React.MouseEvent | React.TouchEvent) => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    
    // Set up long press timer if handler is provided
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
        setIsPressed(false);
      }, 500); // 500ms for long press
      
      setLongPressTimer(timer);
    }
  }, [disabled, loading, onLongPress]);

  // Handle press end (mouse up / touch end)
  const handlePressEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    setIsPressed(false);
    
    // Trigger press if not disabled/loading and no long press occurred
    if (!disabled && !loading && onPress) {
      onPress();
    }
  }, [disabled, loading, onPress, longPressTimer]);

  // Handle press cancel (mouse leave / touch cancel)
  const handlePressCancel = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsPressed(false);
  }, [longPressTimer]);

  // Handle keyboard interaction
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled || loading) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onPress) {
        onPress();
      }
    }
  }, [disabled, loading, onPress]);

  // Interactive classes
  const interactiveClasses = cn(
    // Base interactive styles
    (onPress || onLongPress) && [
      'cursor-pointer',
      'transition-all duration-200 ease-in-out',
      
      // Focus styles
      focusRing && [
        'focus:outline-none',
        'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'dark:focus:ring-offset-neutral-900'
      ],
      
      // Hover styles (only on non-touch devices)
      !isTouchDevice && hoverElevation && [
        'hover:shadow-lg hover:-translate-y-0.5',
        'hover:border-neutral-300 dark:hover:border-neutral-700'
      ],
      
      // Press animation
      pressAnimation && isPressed && [
        'scale-[0.98] shadow-sm',
        isMobile && 'scale-[0.96]' // Slightly more pronounced on mobile
      ],
      
      // Touch-specific optimizations
      isTouchDevice && [
        'touch-manipulation',
        'select-none',
        // Minimum touch target size (44px)
        'min-h-[44px]'
      ]
    ],
    
    // Disabled state
    disabled && [
      'opacity-50 cursor-not-allowed',
      'pointer-events-none'
    ],
    
    // Loading state
    loading && [
      'opacity-75 cursor-wait'
    ],
    
    className
  );

  // Event handlers for touch and mouse
  const eventHandlers = (onPress || onLongPress) ? {
    onMouseDown: handlePressStart,
    onMouseUp: handlePressEnd,
    onMouseLeave: handlePressCancel,
    onTouchStart: handlePressStart,
    onTouchEnd: handlePressEnd,
    onTouchCancel: handlePressCancel,
    onKeyDown: handleKeyDown,
    tabIndex: disabled ? -1 : 0,
    role: 'button',
    'aria-label': ariaLabel,
    'aria-disabled': disabled,
    'aria-busy': loading
  } : {};

  return (
    <Card
      className={interactiveClasses}
      touchActions={true}
      variant="interactive"
      {...eventHandlers}
      {...cardProps}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-neutral-900/50 rounded-card">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {children}
    </Card>
  );
};

export default InteractiveCard;