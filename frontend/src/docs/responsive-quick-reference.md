# Responsive Design Quick Reference

## Breakpoints
```css
sm: 640px   /* Small tablets and large phones */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Large desktops */
2xl: 1536px /* Extra large screens */
```

## Essential Classes
```css
/* Responsive Container */
.container { @apply w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto; }

/* Responsive Grid */
.grid-responsive { @apply grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3; }

/* Touch Targets */
.touch-target { @apply min-h-[44px] min-w-[44px] p-3; }

/* Responsive Text */
.text-responsive { @apply text-sm sm:text-base lg:text-lg; }
```

## Component Patterns
```typescript
// Responsive Hook
const { isMobile, isTablet, isDesktop } = useViewport();

// Conditional Rendering
{isMobile ? <MobileComponent /> : <DesktopComponent />}

// Responsive Classes
className={cn('base-classes', {
  'mobile-classes': isMobile,
  'tablet-classes': isTablet,
  'desktop-classes': isDesktop,
})}
```

## Accessibility Checklist
- [ ] 44px minimum touch targets
- [ ] Proper ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast 4.5:1
- [ ] Focus indicators visible

## Testing Commands
```bash
npm run test:responsive     # Responsive tests
npm run test:a11y          # Accessibility tests
npm run test:visual        # Visual regression
npm run test:performance   # Performance tests
```

## Common Issues & Solutions

### Issue: Text too small on mobile
```css
/* ❌ Fixed size */
font-size: 14px;

/* ✅ Responsive size */
@apply text-sm sm:text-base lg:text-lg;
```

### Issue: Touch targets too small
```css
/* ❌ Too small */
.button { width: 32px; height: 32px; }

/* ✅ Touch-friendly */
.button { @apply min-h-[44px] min-w-[44px] p-3; }
```

### Issue: Horizontal scrolling on mobile
```css
/* ❌ Fixed width */
width: 800px;

/* ✅ Responsive width */
@apply w-full max-w-full;
```

### Issue: Poor keyboard navigation
```typescript
// ❌ Missing keyboard support
<div onClick={handleClick}>Button</div>

// ✅ Proper keyboard support
<button 
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  className="focus:outline-none focus:ring-2"
>
  Button
</button>
```

## Performance Tips
- Use `loading="lazy"` for images
- Implement code splitting for mobile
- Minimize layout shifts (CLS < 0.1)
- Optimize touch interactions
- Respect `prefers-reduced-motion`

## Documentation Links
- [Design Guidelines](./responsive-design-guidelines.md)
- [Testing Documentation](./device-testing-documentation.md)
- [Accessibility Guidelines](./responsive-accessibility-guidelines.md)
- [Full Documentation Index](./responsive-documentation-index.md)