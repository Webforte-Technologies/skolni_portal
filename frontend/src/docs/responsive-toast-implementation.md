# Responsive Toast Notifications Implementation

## Overview

This implementation provides fully responsive toast notifications that adapt to different screen sizes and device types, ensuring optimal user experience across mobile, tablet, and desktop devices.

## Key Features

### 1. Mobile-Optimized Positioning and Sizing

- **Mobile (< 640px)**: Positioned at top of screen to avoid keyboard interference
- **Tablet (640px - 1024px)**: Bottom-right positioning with increased spacing
- **Desktop (> 1024px)**: Traditional bottom-right positioning

### 2. Responsive Animation Timing

- **Mobile**: Faster animations (200ms) for better perceived performance
- **Tablet/Desktop**: Standard animations (300ms) for smooth transitions
- **Staggered animations**: Multiple toasts animate with delays (50ms mobile, 100ms desktop)

### 3. Touch-Friendly Dismiss Actions

- **Minimum touch targets**: 32px on mobile, 36px on tablet/desktop
- **Swipe gestures**: Left/right swipe to dismiss on touch devices
- **Active states**: Visual feedback for touch interactions
- **Accessible**: Proper ARIA labels and keyboard navigation

### 4. Adaptive Message Length and Truncation

- **Mobile**: Messages truncated to 60 characters
- **Tablet**: Messages truncated to 80 characters  
- **Desktop**: Full message display
- **Action labels**: Truncated to 10 characters on mobile

## Component Architecture

### Toast Component (`Toast.tsx`)

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Responsive Features:**
- Dynamic sizing based on viewport
- Touch gesture handling for swipe-to-dismiss
- Adaptive text truncation
- Responsive icon sizing
- Touch-optimized button sizing

### ToastContainer Component (`ToastContainer.tsx`)

**Responsive Positioning:**
- Mobile: `top-4 left-4 right-4` (full width at top)
- Tablet: `bottom-6 right-6 left-6 sm:left-auto sm:w-96` (bottom-right with constraints)
- Desktop: `bottom-4 right-4 w-96` (fixed bottom-right)

**Features:**
- Keyboard-aware positioning on mobile
- Staggered animation delays
- Pointer events management

### ToastContext (`ToastContext.tsx`)

**Responsive Behavior:**
- Dynamic duration adjustment (shorter on mobile)
- Maximum toast limits (2 mobile, 3 tablet, 4 desktop)
- Automatic cleanup when viewport changes
- Timeout management with cleanup

## Usage Examples

### Basic Toast

```typescript
const { showToast } = useToast();

showToast({
  type: 'success',
  message: 'Úspěšně uloženo!',
  duration: 4000
});
```

### Toast with Action

```typescript
showToast({
  type: 'warning',
  message: 'Nízký zůstatek kreditů',
  actionLabel: 'Dobít',
  onAction: () => navigateToCredits()
});
```

### Error Toast with Long Message

```typescript
showToast({
  type: 'error',
  message: 'Nepodařilo se uložit dokument. Zkontrolujte připojení a zkuste znovu.',
  duration: 6000
});
```

## Responsive Breakpoints

```css
/* Mobile First */
mobile: < 640px    /* Compact layout, top positioning */
tablet: 640-1024px /* Medium layout, bottom positioning */
desktop: > 1024px  /* Full layout, standard positioning */
```

## Touch Interactions

### Swipe to Dismiss (Mobile)
- **Left swipe**: Dismiss toast
- **Right swipe**: Dismiss toast
- **Threshold**: 50px minimum swipe distance
- **Feedback**: Immediate visual response

### Touch Targets
- **Minimum size**: 32px mobile, 36px tablet/desktop
- **Active states**: Visual feedback on touch
- **Accessibility**: Proper focus management

## Animation System

### Entry Animation
```css
/* Initial state */
opacity: 0
transform: translateY(-8px) scale(0.95)

/* Visible state */
opacity: 1
transform: translateY(0) scale(1)
transition: all 300ms ease-out
```

### Exit Animation
```css
/* Removing state */
opacity: 0
transform: translateY(8px) scale(0.95)
transition: all 200ms ease-in
```

### Responsive Timing
- **Mobile**: 200ms (faster for perceived performance)
- **Tablet**: 250ms (balanced)
- **Desktop**: 300ms (smooth)

## Accessibility Features

### ARIA Support
- `aria-label` on dismiss buttons
- Proper semantic markup
- Screen reader announcements

### Keyboard Navigation
- Tab navigation support
- Enter/Space key activation
- Escape key to dismiss

### Focus Management
- Logical focus order
- Visible focus indicators
- Focus trapping when needed

## Performance Optimizations

### Memory Management
- Automatic timeout cleanup
- Efficient re-renders with React.memo
- Debounced resize handling

### Animation Performance
- CSS transforms for smooth animations
- GPU acceleration with transform3d
- Reduced motion support

### Bundle Size
- Tree-shakeable exports
- Minimal dependencies
- Efficient icon usage

## Testing Considerations

### Responsive Testing
- Test across all breakpoints
- Verify touch interactions
- Check keyboard navigation
- Validate swipe gestures

### Accessibility Testing
- Screen reader compatibility
- Keyboard-only navigation
- High contrast mode support
- Reduced motion preferences

### Performance Testing
- Animation smoothness
- Memory leak prevention
- Timeout cleanup verification
- Multiple toast handling

## Integration with App

### Provider Setup
```typescript
// App.tsx
import { ToastProvider } from './contexts/ToastContext';
import { ResponsiveProvider } from './contexts/ResponsiveContext';

function App() {
  return (
    <ResponsiveProvider>
      <ToastProvider>
        {/* Your app content */}
      </ToastProvider>
    </ResponsiveProvider>
  );
}
```

### Hook Usage
```typescript
// In any component
import { useToast } from './contexts/ToastContext';

const MyComponent = () => {
  const { showToast, clearAllToasts } = useToast();
  
  const handleSuccess = () => {
    showToast({
      type: 'success',
      message: 'Operace byla úspěšná!'
    });
  };
  
  return (
    <button onClick={handleSuccess}>
      Provést akci
    </button>
  );
};
```

## Requirements Compliance

### Requirement 2.3 (Authentication Form Feedback)
- ✅ Clear success/error messages for authentication
- ✅ Responsive error messaging and validation feedback
- ✅ Mobile-optimized positioning and sizing

### Requirement 5.1 (Mobile-First Responsive Breakpoints)
- ✅ Mobile-first responsive breakpoints implementation
- ✅ Adaptive layouts for different screen sizes
- ✅ Touch-friendly interactions and sizing

## Future Enhancements

### Potential Improvements
- Sound notifications (with user preference)
- Rich content support (HTML/React components)
- Persistent toasts (manual dismiss only)
- Toast queuing with priority system
- Custom positioning options
- Theme customization support