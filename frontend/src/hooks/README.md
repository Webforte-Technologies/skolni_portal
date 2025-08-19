# Responsive Utilities Documentation

This document describes the responsive utilities implemented for the EduAI-Asistent application.

## Overview

The responsive system provides:
- Device detection and breakpoint management
- Global responsive state management
- Touch-friendly interactions
- Viewport-aware component behavior

## Core Components

### 1. ResponsiveContext

Global context that manages responsive state across the application.

```tsx
import { useResponsive } from '../contexts/ResponsiveContext';

const MyComponent = () => {
  const { viewport, state, setMenuOpen } = useResponsive();
  
  return (
    <div>
      <p>Current breakpoint: {viewport.breakpoint}</p>
      <button onClick={() => setMenuOpen(!state.menuOpen)}>
        Toggle Menu
      </button>
    </div>
  );
};
```

### 2. useViewport Hook

Primary hook for viewport detection and breakpoint management.

```tsx
import { useViewport } from '../hooks/useViewport';

const MyComponent = () => {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    isTouchDevice,
    viewport 
  } = useViewport();
  
  return (
    <div className={cn(
      "grid gap-4",
      isMobile && "grid-cols-1",
      isTablet && "grid-cols-2",
      isDesktop && "grid-cols-3"
    )}>
      {/* Content */}
    </div>
  );
};
```

### 3. Viewport Utilities

Utility functions for responsive logic.

```tsx
import { 
  getBreakpoint, 
  matchesBreakpoint, 
  isAtOrBelow,
  detectTouchDevice 
} from '../utils/viewport';

// Get current breakpoint
const breakpoint = getBreakpoint(window.innerWidth);

// Check if matches specific breakpoint
const isMobile = matchesBreakpoint('mobile');

// Check if at or below tablet
const isSmallScreen = isAtOrBelow('tablet');

// Detect touch capability
const canTouch = detectTouchDevice();
```

## Breakpoint System

The system uses Tailwind CSS breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: ≥ 1024px

## Usage Patterns

### Conditional Rendering

```tsx
const MyComponent = () => {
  const { isMobile, isDesktop } = useViewport();
  
  return (
    <div>
      {isMobile && <MobileNavigation />}
      {isDesktop && <DesktopNavigation />}
    </div>
  );
};
```

### Responsive Styling

```tsx
const MyComponent = () => {
  const { isMobile, isTouchDevice } = useViewport();
  
  return (
    <button className={cn(
      "px-4 py-2",
      isMobile && "px-6 py-3", // Larger on mobile
      isTouchDevice && "min-h-[44px]" // Touch-friendly
    )}>
      Click me
    </button>
  );
};
```

### Layout Adaptation

```tsx
const MyComponent = () => {
  const { viewport } = useViewport();
  
  const getColumns = () => {
    switch (viewport.breakpoint) {
      case 'mobile': return 1;
      case 'tablet': return 2;
      case 'desktop': return 3;
      default: return 1;
    }
  };
  
  return (
    <div className={`grid grid-cols-${getColumns()} gap-4`}>
      {/* Content */}
    </div>
  );
};
```

### Touch Optimization

```tsx
const MyComponent = () => {
  const { isTouchDevice } = useViewport();
  
  return (
    <div className={cn(
      "interactive-element",
      isTouchDevice && [
        "min-h-[44px]", // Minimum touch target
        "touch-manipulation", // Optimize touch
        "select-none" // Prevent text selection
      ]
    )}>
      {/* Touch-friendly content */}
    </div>
  );
};
```

## Advanced Usage

### Custom Breakpoints

```tsx
const { viewport } = useViewport({
  config: {
    breakpoints: {
      mobile: 480,
      tablet: 768,
      desktop: 1200
    }
  }
});
```

### Debounced Resize Handling

```tsx
const { viewport } = useViewport({
  debounceDelay: 200 // Custom debounce delay
});
```

### Media Query Hook

```tsx
import { useMediaQuery } from '../hooks/useViewport';

const MyComponent = () => {
  const isLargeScreen = useMediaQuery('(min-width: 1200px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  return (
    <div className={cn(
      "transition-all",
      !prefersReducedMotion && "duration-300"
    )}>
      {isLargeScreen ? 'Large Screen' : 'Small Screen'}
    </div>
  );
};
```

## Performance Considerations

- Resize handlers are debounced (150ms default)
- Viewport state is memoized to prevent unnecessary re-renders
- Touch detection is cached on initial load
- Orientation changes are handled efficiently

## Accessibility

- Maintains proper focus management across devices
- Respects system preferences (reduced motion, etc.)
- Ensures minimum touch target sizes (44px)
- Provides keyboard navigation alternatives

## Testing

Use the ResponsiveTest component for debugging:

```tsx
import ResponsiveTest from '../components/ui/ResponsiveTest';

// Add to any page temporarily
<ResponsiveTest />
```

## Best Practices

1. **Mobile First**: Design for mobile, enhance for larger screens
2. **Touch Targets**: Ensure minimum 44px touch targets
3. **Performance**: Use debounced handlers for resize events
4. **Accessibility**: Maintain keyboard navigation on all devices
5. **Progressive Enhancement**: Provide fallbacks for older browsers