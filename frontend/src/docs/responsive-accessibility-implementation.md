# Responsive Accessibility Implementation

This document describes the implementation of responsive accessibility enhancements for the EduAI-Asistent application.

## Overview

The responsive accessibility implementation provides comprehensive accessibility features that adapt to different device types and screen sizes, ensuring an inclusive experience across all platforms.

## Components Implemented

### 1. Enhanced AccessibilityContext (`contexts/AccessibilityContext.tsx`)

Extended the existing accessibility context with responsive features:

- **Device Detection**: Integrates with viewport detection to provide device-specific accessibility features
- **Screen Reader Support**: Automatic detection and responsive announcements
- **Keyboard Navigation Tracking**: Real-time detection of keyboard vs mouse usage
- **Preference Detection**: Automatic detection of user accessibility preferences (reduced motion, high contrast)
- **Responsive ARIA Labels**: Device-specific ARIA label generation
- **Keyboard Shortcuts**: Device-appropriate keyboard shortcut descriptions

### 2. Accessibility Hooks (`hooks/useAccessibility.ts`)

Core accessibility hooks providing:

- **useAccessibility**: Main hook for accessibility state and utilities
- **useFocusManagement**: Focus trap and restoration for modals and overlays
- **useScreenReader**: Screen reader detection and announcement utilities

### 3. Keyboard Navigation Hooks (`hooks/useKeyboardNavigation.ts`)

Comprehensive keyboard navigation support:

- **useKeyboardNavigation**: Configurable keyboard navigation with device-specific options
- **useRovingTabIndex**: Roving tabindex pattern for complex widgets
- **useSkipLinks**: Skip link management for improved navigation

### 4. Accessibility Provider (`components/accessibility/AccessibilityProvider.tsx`)

Centralized accessibility provider that:

- Manages global accessibility state
- Provides skip links automatically
- Announces page changes for screen readers
- Integrates all accessibility features

### 5. Focus Management (`components/accessibility/FocusManager.tsx`)

Focus management components:

- **FocusManager**: Container for focus trapping and restoration
- **Focusable**: Wrapper for making elements focusable with proper styling

### 6. Responsive ARIA Live (`components/accessibility/ResponsiveAriaLive.tsx`)

Live region components for screen reader announcements:

- **ResponsiveAriaLive**: Device-aware live announcements
- **StatusAnnouncer**: Global status announcement container

### 7. Keyboard Navigation Wrapper (`components/accessibility/KeyboardNavigationWrapper.tsx`)

Advanced keyboard navigation components:

- **KeyboardNavigationWrapper**: Container for keyboard-navigable lists
- **NavigableItem**: Individual navigable items with proper ARIA attributes

### 8. Accessible Form Components

Enhanced form components with accessibility features:

- **AccessibleButton**: Responsive button with proper touch targets and ARIA labels
- **AccessibleInput**: Form input with comprehensive accessibility features

### 9. Skip Links (`components/accessibility/SkipLinks.tsx`)

Skip navigation links that:

- Provide quick navigation to main content areas
- Adapt sizing for different devices
- Include proper focus management

### 10. Accessibility Showcase (`components/accessibility/AccessibilityShowcase.tsx`)

Comprehensive demonstration component showing all accessibility features in action.

## Key Features

### Device-Specific Adaptations

#### Mobile Devices
- Larger touch targets (minimum 44px)
- Simplified keyboard shortcuts (swipe, double-tap)
- Touch-optimized focus indicators
- Reduced complexity in ARIA descriptions
- Gesture-based navigation instructions

#### Tablet Devices
- Medium-sized touch targets (minimum 40px)
- Hybrid keyboard/touch navigation
- Adaptive ARIA labels
- Optimized for both portrait and landscape orientations

#### Desktop Devices
- Standard touch targets (minimum 32px)
- Full keyboard navigation support
- Comprehensive keyboard shortcuts
- Detailed ARIA descriptions and help text

### Accessibility Features

#### Focus Management
- Automatic focus trapping in modals and overlays
- Focus restoration when closing dialogs
- Visible focus indicators that adapt to input method
- Roving tabindex for complex widgets

#### Screen Reader Support
- Automatic screen reader detection
- Device-appropriate announcements
- Live regions for dynamic content updates
- Proper heading hierarchy and semantic markup

#### Keyboard Navigation
- Arrow key navigation for lists and menus
- Home/End keys for quick navigation (desktop only)
- Enter/Space for activation
- Escape for closing dialogs
- Tab navigation with proper focus order

#### Responsive ARIA Labels
- Device-specific label text
- Context-aware descriptions
- Position information (desktop only)
- Action descriptions adapted to input method

## Integration

### App-Level Integration

The accessibility features are integrated at the app level:

```tsx
// App.tsx includes:
- AccessibilityProvider wrapping the entire app
- SkipLinks component for navigation
- Proper semantic structure with IDs
```

### Component Integration

Individual components can use accessibility features:

```tsx
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { AccessibleButton } from '@/components/accessibility/AccessibleButton';
import { FocusManager } from '@/components/accessibility/FocusManager';
```

### Page-Level Integration

Pages include proper semantic structure:

```tsx
// Main content areas have proper IDs for skip links
<main id="main-content">
<header id="navigation">
```

## Testing

### Automated Testing
- Screen reader compatibility testing
- Keyboard navigation testing
- Focus management testing
- ARIA attribute validation

### Manual Testing
- Cross-device accessibility testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation testing
- Touch device accessibility testing

## Browser Support

The accessibility features support:
- Modern browsers with ARIA support
- Screen readers (NVDA, JAWS, VoiceOver, TalkBack)
- Keyboard navigation
- Touch devices with accessibility features
- High contrast mode
- Reduced motion preferences

## Performance Considerations

- Lazy loading of accessibility components
- Efficient event listener management
- Debounced resize and input handlers
- Minimal DOM manipulation for announcements
- Optimized focus management

## Future Enhancements

Potential future improvements:
- Voice control support
- Eye tracking integration
- Advanced gesture recognition
- AI-powered accessibility suggestions
- Personalized accessibility profiles

## Compliance

This implementation helps achieve:
- WCAG 2.1 AA compliance
- Section 508 compliance
- EN 301 549 compliance
- Platform-specific accessibility guidelines (iOS, Android, Windows)

## Usage Examples

### Basic Accessibility Hook
```tsx
const { isMobile, announce, getResponsiveAriaLabel } = useAccessibility();
```

### Focus Management
```tsx
<FocusManager trapFocus restoreFocus autoFocus>
  <Modal>...</Modal>
</FocusManager>
```

### Keyboard Navigation
```tsx
<KeyboardNavigationWrapper onActivate={handleSelect}>
  {items.map(item => <NavigableItem key={item.id}>{item.name}</NavigableItem>)}
</KeyboardNavigationWrapper>
```

### Accessible Button
```tsx
<AccessibleButton
  responsiveAriaLabel={{
    mobile: "Stisknout na mobilu",
    desktop: "Kliknout na desktopu"
  }}
  onClick={handleClick}
>
  Akce
</AccessibleButton>
```