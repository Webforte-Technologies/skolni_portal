# Mobile Navigation Component

The `MobileNavigation` component provides a responsive navigation system for mobile devices, featuring a hamburger menu and slide-out drawer with smooth animations and touch-friendly interactions.

## Features

- **Hamburger Menu**: Animated hamburger icon that transforms when opened/closed
- **Slide-out Drawer**: Smooth slide animation from the left side
- **Touch-friendly**: All interactive elements meet the 44px minimum touch target size
- **Keyboard Navigation**: Full keyboard support with Escape key to close
- **Swipe Gestures**: Swipe left to close the menu on touch devices
- **Auto-close**: Menu closes automatically when navigating or switching to desktop
- **Accessibility**: Proper ARIA labels, focus management, and screen reader support

## Usage

The component is automatically integrated into the `Header` component and shows only on mobile devices (breakpoint: 'mobile').

```tsx
import MobileNavigation from './MobileNavigation';

<MobileNavigation
  isOpen={state.menuOpen}
  onToggle={handleMobileMenuToggle}
  onClose={handleMobileMenuClose}
  onShowPreferences={() => setShowPreferences(true)}
  onShowHelp={() => setShowHelp(true)}
  onShowShortcuts={() => setShowShortcuts(true)}
  onShowNotifications={() => setShowNotifications(true)}
  onLogout={handleLogoutClick}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls whether the menu drawer is open |
| `onToggle` | `() => void` | Called when hamburger button is clicked |
| `onClose` | `() => void` | Called when menu should be closed |
| `onShowPreferences` | `() => void` | Called when preferences menu item is clicked |
| `onShowHelp` | `() => void` | Called when help menu item is clicked |
| `onShowShortcuts` | `() => void` | Called when shortcuts menu item is clicked |
| `onShowNotifications` | `() => void` | Called when notifications menu item is clicked |
| `onLogout` | `() => void` | Called when logout button is clicked |

## Navigation Items

The mobile navigation includes the following sections:

### Main Navigation
- Dashboard
- Nástroje a cvičení (Tools)
- Vytvořit materiál (Create Material)
- Moje materiály (My Materials)

### Admin Links (conditional)
- Správa školy (School Admin) - for school_admin role
- Dev Admin - for platform_admin role

### Action Items
- Notifikace (Notifications)
- Klávesové zkratky (Keyboard Shortcuts)
- Nápověda (Help)
- Nastavení (Settings)

### Footer
- Odhlásit se (Logout)

## Responsive Behavior

The mobile navigation automatically:

1. **Shows on mobile devices** (viewport width < 640px)
2. **Hides on desktop/tablet** (viewport width >= 640px)
3. **Auto-closes when switching to desktop** viewport
4. **Closes when navigating** to a new page
5. **Prevents body scroll** when menu is open

## Accessibility Features

### ARIA Attributes
- `aria-expanded` on hamburger button
- `aria-controls` linking button to menu
- `aria-modal="true"` on drawer
- `aria-labelledby` for drawer title
- `aria-label` on all interactive elements

### Keyboard Support
- **Escape key**: Closes the menu
- **Tab navigation**: Proper focus order through menu items
- **Enter/Space**: Activates menu items

### Touch Support
- **44px minimum touch targets**: All interactive elements
- **Swipe gestures**: Swipe left to close menu
- **Touch feedback**: Visual feedback on touch interactions

## Animations

The component includes smooth CSS transitions:

- **Hamburger icon**: 300ms transform animation
- **Drawer slide**: 300ms translate animation with easing
- **Backdrop fade**: 300ms opacity transition

## Testing

The component includes comprehensive E2E tests covering:

- Mobile/desktop responsive behavior
- Menu open/close functionality
- Navigation item interactions
- Keyboard navigation
- Touch target sizing
- Accessibility compliance

Run tests with:
```bash
npm run test:e2e -- --grep "Mobile Navigation"
```

## Integration with Responsive Context

The component uses the `ResponsiveContext` to:

- **Detect viewport changes**: Automatically hide/show based on breakpoint
- **Manage menu state**: Sync with global responsive state
- **Handle orientation changes**: Adapt to device rotation

## Customization

### Styling
The component uses Tailwind CSS classes and can be customized by:

1. **Modifying colors**: Update the color classes in the component
2. **Adjusting animations**: Change transition duration/easing
3. **Updating spacing**: Modify padding and margin classes

### Menu Items
To add/remove navigation items, modify the `navigationItems` and `actionItems` arrays in the component.

### Touch Gestures
Swipe sensitivity can be adjusted by changing the `threshold` value in the touch event handlers.

## Browser Support

The component supports:
- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Touch devices**: iOS Safari, Android Chrome
- **Keyboard navigation**: All browsers with keyboard support
- **Screen readers**: NVDA, JAWS, VoiceOver

## Performance Considerations

- **Debounced resize handlers**: Prevents excessive re-renders
- **Conditional rendering**: Only renders when needed
- **Optimized animations**: Uses CSS transforms for smooth performance
- **Event cleanup**: Proper event listener cleanup on unmount