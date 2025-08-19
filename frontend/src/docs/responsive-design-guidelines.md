# Responsive Design Guidelines for Component Development

## Overview

This document provides comprehensive guidelines for developing responsive components in the EduAI-Asistent application. These guidelines ensure consistent, accessible, and performant responsive behavior across all components.

## Core Principles

### 1. Mobile-First Approach
Always design and develop for mobile devices first, then enhance for larger screens.

```css
/* ✅ Correct: Mobile-first */
.component {
  padding: 1rem;
}

@media (min-width: 768px) {
  .component {
    padding: 2rem;
  }
}

/* ❌ Incorrect: Desktop-first */
.component {
  padding: 2rem;
}

@media (max-width: 767px) {
  .component {
    padding: 1rem;
  }
}
```

### 2. Touch-First Design
Design all interactive elements with touch interaction as the primary input method.

- **Minimum touch target size**: 44px × 44px
- **Comfortable spacing**: 8px minimum between touch targets
- **Visual feedback**: Clear hover and active states

### 3. Progressive Enhancement
Build core functionality that works on all devices, then enhance for capable devices.

## Breakpoint Strategy

### Standard Breakpoints
Use Tailwind's responsive breakpoints consistently:

```typescript
const breakpoints = {
  sm: '640px',   // Small tablets and large phones
  md: '768px',   // Tablets
  lg: '1024px',  // Small desktops
  xl: '1280px',  // Large desktops
  '2xl': '1536px' // Extra large screens
};
```

### Breakpoint Usage Guidelines

#### Mobile (< 640px)
- Single column layouts
- Full-width components
- Stacked navigation
- Simplified interactions

#### Tablet (640px - 1024px)
- Two-column layouts where appropriate
- Touch-optimized interactions
- Adaptive navigation
- Balanced content density

#### Desktop (> 1024px)
- Multi-column layouts
- Hover interactions
- Complex navigation
- Higher content density

## Component Development Guidelines

### 1. Responsive Component Structure

```typescript
interface ResponsiveComponentProps {
  children: React.ReactNode;
  className?: string;
  // Responsive behavior props
  mobileLayout?: 'stacked' | 'inline';
  tabletColumns?: number;
  desktopColumns?: number;
  // Touch optimization
  touchOptimized?: boolean;
  // Accessibility
  ariaLabel?: string;
}

const ResponsiveComponent: React.FC<ResponsiveComponentProps> = ({
  children,
  className = '',
  mobileLayout = 'stacked',
  tabletColumns = 2,
  desktopColumns = 3,
  touchOptimized = true,
  ariaLabel,
}) => {
  const { isMobile, isTablet } = useViewport();
  
  const baseClasses = 'w-full';
  const responsiveClasses = cn(
    baseClasses,
    {
      'flex flex-col space-y-4': mobileLayout === 'stacked' && isMobile,
      'grid gap-4': !isMobile,
      [`grid-cols-${tabletColumns}`]: isTablet,
      [`lg:grid-cols-${desktopColumns}`]: !isMobile && !isTablet,
      'touch-manipulation': touchOptimized,
    },
    className
  );

  return (
    <div className={responsiveClasses} aria-label={ariaLabel}>
      {children}
    </div>
  );
};
```

### 2. Responsive Styling Patterns

#### Layout Patterns
```css
/* Responsive Grid */
.responsive-grid {
  @apply grid gap-4;
  @apply grid-cols-1;
  @apply sm:grid-cols-2;
  @apply lg:grid-cols-3;
  @apply xl:grid-cols-4;
}

/* Responsive Flexbox */
.responsive-flex {
  @apply flex flex-col space-y-4;
  @apply md:flex-row md:space-y-0 md:space-x-4;
}

/* Responsive Container */
.responsive-container {
  @apply w-full px-4;
  @apply sm:px-6;
  @apply lg:px-8;
  @apply max-w-7xl mx-auto;
}
```

#### Typography Patterns
```css
/* Responsive Headings */
.heading-responsive {
  @apply text-2xl font-bold;
  @apply sm:text-3xl;
  @apply lg:text-4xl;
}

/* Responsive Body Text */
.text-responsive {
  @apply text-sm leading-relaxed;
  @apply sm:text-base;
  @apply lg:text-lg;
}
```

#### Spacing Patterns
```css
/* Responsive Padding */
.padding-responsive {
  @apply p-4;
  @apply sm:p-6;
  @apply lg:p-8;
}

/* Responsive Margins */
.margin-responsive {
  @apply mb-4;
  @apply sm:mb-6;
  @apply lg:mb-8;
}
```

### 3. Interactive Element Guidelines

#### Buttons
```typescript
const ResponsiveButton: React.FC<ButtonProps> = ({
  children,
  size = 'medium',
  variant = 'primary',
  touchOptimized = true,
  ...props
}) => {
  const sizeClasses = {
    small: 'px-3 py-2 text-sm min-h-[36px]',
    medium: 'px-4 py-2 text-base min-h-[44px]',
    large: 'px-6 py-3 text-lg min-h-[48px]',
  };

  const touchClasses = touchOptimized ? 'touch-manipulation active:scale-95' : '';

  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        sizeClasses[size],
        touchClasses,
        getVariantClasses(variant)
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

#### Form Elements
```typescript
const ResponsiveInput: React.FC<InputProps> = ({
  label,
  error,
  touchOptimized = true,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 sm:mb-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 border rounded-lg',
          'min-h-[44px]', // Touch-friendly height
          'text-base', // Prevent zoom on iOS
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          touchOptimized && 'touch-manipulation',
          error && 'border-red-500'
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

## Navigation Patterns

### Mobile Navigation
```typescript
const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 rounded-lg min-h-[44px] min-w-[44px]"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
      >
        <HamburgerIcon />
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <nav className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl">
            {/* Navigation content */}
          </nav>
        </div>
      )}
    </>
  );
};
```

### Responsive Navigation
```typescript
const ResponsiveNavigation: React.FC = () => {
  const { isMobile } = useViewport();

  if (isMobile) {
    return <MobileNavigation />;
  }

  return <DesktopNavigation />;
};
```

## Performance Guidelines

### 1. Lazy Loading
```typescript
const LazyComponent = lazy(() => import('./HeavyComponent'));

const ResponsiveWrapper: React.FC = () => {
  const { isMobile } = useViewport();

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {!isMobile && <LazyComponent />}
    </Suspense>
  );
};
```

### 2. Image Optimization
```typescript
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}) => {
  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      className="w-full h-auto object-cover"
      loading="lazy"
    />
  );
};
```

### 3. Conditional Rendering
```typescript
const ConditionalFeature: React.FC = () => {
  const { isMobile, isTablet } = useViewport();

  // Don't render heavy features on mobile
  if (isMobile) {
    return <SimplifiedView />;
  }

  // Render full feature on tablet and desktop
  return <FullFeatureView />;
};
```

## Testing Guidelines

### 1. Responsive Testing
```typescript
describe('ResponsiveComponent', () => {
  const viewports = [
    { width: 375, height: 667, name: 'Mobile' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 1280, height: 720, name: 'Desktop' },
  ];

  viewports.forEach(({ width, height, name }) => {
    test(`renders correctly on ${name}`, async () => {
      await page.setViewportSize({ width, height });
      await page.goto('/component-test');
      
      // Test responsive behavior
      const component = page.locator('[data-testid="responsive-component"]');
      await expect(component).toBeVisible();
      
      // Take screenshot for visual regression
      await expect(page).toHaveScreenshot(`${name.toLowerCase()}-view.png`);
    });
  });
});
```

### 2. Touch Testing
```typescript
test('handles touch interactions', async () => {
  await page.setViewportSize({ width: 375, height: 667 });
  
  const button = page.locator('[data-testid="touch-button"]');
  
  // Test touch events
  await button.tap();
  await expect(button).toHaveClass(/active/);
});
```

## Common Patterns and Solutions

### 1. Responsive Cards
```typescript
const ResponsiveCard: React.FC = ({ children }) => {
  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm border',
      'p-4 sm:p-6',
      'w-full',
      'hover:shadow-md transition-shadow duration-200'
    )}>
      {children}
    </div>
  );
};
```

### 2. Responsive Modals
```typescript
const ResponsiveModal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const { isMobile } = useViewport();

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      <div className={cn(
        'fixed inset-0 flex items-center justify-center',
        isMobile ? 'p-4' : 'p-8'
      )}>
        <Dialog.Panel className={cn(
          'bg-white rounded-lg shadow-xl',
          isMobile 
            ? 'w-full h-full max-h-screen overflow-y-auto' 
            : 'max-w-md w-full max-h-[80vh] overflow-y-auto'
        )}>
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
```

### 3. Responsive Tables
```typescript
const ResponsiveTable: React.FC<TableProps> = ({ data, columns }) => {
  const { isMobile } = useViewport();

  if (isMobile) {
    return <StackedCardView data={data} columns={columns} />;
  }

  return <TraditionalTable data={data} columns={columns} />;
};
```

## Best Practices Checklist

### Development
- [ ] Use mobile-first CSS approach
- [ ] Implement touch-friendly interactions (44px minimum)
- [ ] Test on real devices, not just browser dev tools
- [ ] Use semantic HTML for better accessibility
- [ ] Implement proper focus management
- [ ] Optimize images for different screen densities
- [ ] Use appropriate input types for mobile keyboards

### Performance
- [ ] Lazy load non-critical components
- [ ] Implement code splitting for device-specific features
- [ ] Optimize bundle sizes for mobile networks
- [ ] Use efficient CSS selectors
- [ ] Minimize layout shifts (CLS)
- [ ] Implement proper loading states

### Accessibility
- [ ] Maintain proper heading hierarchy
- [ ] Provide alternative text for images
- [ ] Ensure sufficient color contrast
- [ ] Support keyboard navigation
- [ ] Test with screen readers
- [ ] Implement proper ARIA labels

### Testing
- [ ] Test across multiple devices and browsers
- [ ] Verify touch interactions work correctly
- [ ] Check performance on slower devices
- [ ] Validate accessibility compliance
- [ ] Test with different network conditions
- [ ] Verify orientation changes work properly

## Common Pitfalls to Avoid

### 1. Fixed Pixel Values
```css
/* ❌ Avoid fixed pixels for responsive elements */
.component {
  width: 320px;
  height: 200px;
}

/* ✅ Use relative units */
.component {
  width: 100%;
  max-width: 20rem;
  aspect-ratio: 16/10;
}
```

### 2. Desktop-Only Features
```typescript
// ❌ Don't assume hover is available
.button:hover {
  background-color: blue;
}

// ✅ Use media queries for hover-capable devices
@media (hover: hover) {
  .button:hover {
    background-color: blue;
  }
}
```

### 3. Viewport Meta Tag Issues
```html
<!-- ❌ Don't disable zoom -->
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

<!-- ✅ Allow zoom for accessibility -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### 4. Touch Target Size
```css
/* ❌ Too small for touch */
.small-button {
  width: 24px;
  height: 24px;
}

/* ✅ Touch-friendly size */
.touch-button {
  min-width: 44px;
  min-height: 44px;
}
```

## Resources and Tools

### Development Tools
- **Chrome DevTools**: Device simulation and responsive testing
- **Firefox Responsive Design Mode**: Cross-browser testing
- **Playwright**: Automated responsive testing
- **Lighthouse**: Performance and accessibility auditing

### Testing Devices
- **Mobile**: iPhone SE, iPhone 12, Samsung Galaxy S21
- **Tablet**: iPad, iPad Pro, Samsung Galaxy Tab
- **Desktop**: Various screen sizes from 1280px to 1920px+

### Useful Libraries
- **Tailwind CSS**: Responsive utility classes
- **Headless UI**: Accessible component primitives
- **React Hook Form**: Form handling with responsive validation
- **Framer Motion**: Responsive animations

## Conclusion

Following these guidelines ensures that all components in the EduAI-Asistent application provide excellent user experiences across all devices. Remember to always test on real devices and prioritize accessibility and performance alongside responsive design.