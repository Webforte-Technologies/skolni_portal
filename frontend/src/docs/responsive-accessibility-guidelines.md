# Responsive Accessibility Guidelines and Best Practices

## Overview

This document provides comprehensive guidelines for ensuring accessibility compliance across all devices and screen sizes in the EduAI-Asistent application. Responsive accessibility ensures that users with disabilities can effectively use the application regardless of their device or assistive technology.

## Core Accessibility Principles

### 1. Perceivable
Information and user interface components must be presentable to users in ways they can perceive across all devices.

### 2. Operable
User interface components and navigation must be operable across different input methods and devices.

### 3. Understandable
Information and the operation of user interface must be understandable on all screen sizes.

### 4. Robust
Content must be robust enough to be interpreted reliably by a wide variety of user agents and assistive technologies.

## Device-Specific Accessibility Considerations

### Mobile Accessibility (< 640px)

#### Touch Target Requirements
```css
/* Minimum touch target size: 44px × 44px */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  /* Ensure adequate spacing between targets */
  margin: 4px;
}

/* For smaller visual elements, use padding to reach minimum size */
.small-icon-button {
  padding: 12px; /* Creates 44px total with 20px icon */
  min-width: 44px;
  min-height: 44px;
}
```

#### Mobile Screen Reader Optimization
```typescript
const MobileAccessibleButton: React.FC<ButtonProps> = ({
  children,
  ariaLabel,
  ariaDescribedBy,
  ...props
}) => {
  return (
    <button
      className="min-h-[44px] min-w-[44px] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {children}
    </button>
  );
};
```

#### Mobile Navigation Accessibility
```typescript
const AccessibleMobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Trap focus within mobile menu when open
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const focusableElements = menuRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => {
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isOpen]);

  return (
    <>
      <button
        className="md:hidden p-3 rounded-lg min-h-[44px] min-w-[44px]"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Zavřít navigační menu' : 'Otevřít navigační menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
      >
        <HamburgerIcon />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id="mobile-navigation"
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigační menu"
        >
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <nav className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl">
            <div className="p-4">
              <button
                className="mb-4 p-2 rounded-lg min-h-[44px] min-w-[44px]"
                onClick={() => setIsOpen(false)}
                aria-label="Zavřít menu"
              >
                <CloseIcon />
              </button>
              {/* Navigation items */}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
```

### Tablet Accessibility (640px - 1024px)

#### Hybrid Input Support
```typescript
const TabletAccessibleComponent: React.FC = () => {
  const [inputMethod, setInputMethod] = useState<'touch' | 'mouse'>('touch');

  useEffect(() => {
    const handleMouseMove = () => setInputMethod('mouse');
    const handleTouchStart = () => setInputMethod('touch');

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchstart', handleTouchStart);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  return (
    <div className={cn(
      'interactive-element',
      inputMethod === 'touch' ? 'touch-optimized' : 'mouse-optimized'
    )}>
      {/* Component content */}
    </div>
  );
};
```

#### Adaptive Focus Management
```css
/* Show focus indicators based on input method */
.focus-visible:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Touch-friendly focus indicators */
@media (pointer: coarse) {
  .focus-visible:focus {
    outline: 3px solid #3b82f6;
    outline-offset: 3px;
  }
}
```

### Desktop Accessibility (1024px+)

#### Keyboard Navigation
```typescript
const DesktopKeyboardNav: React.FC = () => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Arrow key navigation for grid layouts
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || 
        e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      // Implement grid navigation logic
      navigateGrid(e.key);
      e.preventDefault();
    }
    
    // Escape key to close modals/menus
    if (e.key === 'Escape') {
      closeActiveModal();
    }
  };

  return (
    <div
      className="grid grid-cols-3 gap-4"
      role="grid"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Grid items */}
    </div>
  );
};
```

## Responsive Form Accessibility

### Mobile-First Form Design
```typescript
const AccessibleResponsiveForm: React.FC = () => {
  return (
    <form className="space-y-4 sm:space-y-6">
      <div className="space-y-1">
        <label 
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          E-mailová adresa *
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-lg',
            'min-h-[44px]', // Touch-friendly height
            'text-base', // Prevent zoom on iOS
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'invalid:border-red-500 invalid:ring-red-500'
          )}
          aria-describedby="email-error email-help"
        />
        <div id="email-help" className="text-sm text-gray-600">
          Použijeme pro přihlášení a důležité oznámení
        </div>
        <div id="email-error" className="text-sm text-red-600" role="alert">
          {/* Error message will be inserted here */}
        </div>
      </div>

      <div className="space-y-1">
        <label 
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Heslo *
        </label>
        <div className="relative">
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            className={cn(
              'w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg',
              'min-h-[44px] text-base',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            )}
            aria-describedby="password-requirements"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 min-h-[44px] min-w-[44px]"
            aria-label="Zobrazit/skrýt heslo"
          >
            <EyeIcon />
          </button>
        </div>
        <div id="password-requirements" className="text-sm text-gray-600">
          Minimálně 8 znaků, obsahuje písmena a čísla
        </div>
      </div>

      <button
        type="submit"
        className={cn(
          'w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg',
          'min-h-[44px] font-medium',
          'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        Zaregistrovat se
      </button>
    </form>
  );
};
```

### Form Validation Accessibility
```typescript
const useAccessibleFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [announcements, setAnnouncements] = useState<string>('');

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
    // Validation logic
    if (!value.trim()) {
      newErrors[name] = 'Toto pole je povinné';
    } else {
      delete newErrors[name];
    }
    
    setErrors(newErrors);
    
    // Announce validation result to screen readers
    if (newErrors[name]) {
      setAnnouncements(`Chyba v poli ${name}: ${newErrors[name]}`);
    } else {
      setAnnouncements(`Pole ${name} je správně vyplněno`);
    }
  };

  return {
    errors,
    announcements,
    validateField,
  };
};
```

## Responsive Navigation Accessibility

### Hierarchical Navigation Structure
```typescript
const AccessibleResponsiveNavigation: React.FC = () => {
  const { isMobile } = useViewport();

  return (
    <nav role="navigation" aria-label="Hlavní navigace">
      {isMobile ? (
        <MobileNavigation />
      ) : (
        <DesktopNavigation />
      )}
    </nav>
  );
};

const MobileNavigation: React.FC = () => {
  return (
    <div className="md:hidden">
      {/* Mobile navigation with proper ARIA labels */}
      <ul role="menubar" className="space-y-2">
        <li role="none">
          <a
            href="/dashboard"
            role="menuitem"
            className="block px-4 py-3 text-gray-700 hover:bg-gray-100 min-h-[44px]"
          >
            Dashboard
          </a>
        </li>
        <li role="none">
          <button
            role="menuitem"
            aria-expanded="false"
            aria-haspopup="true"
            className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 min-h-[44px]"
          >
            AI Asistenti
          </button>
        </li>
      </ul>
    </div>
  );
};
```

### Skip Links for Mobile
```typescript
const SkipLinks: React.FC = () => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className={cn(
          'absolute top-4 left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        )}
      >
        Přejít na hlavní obsah
      </a>
      <a
        href="#navigation"
        className={cn(
          'absolute top-4 left-32 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        )}
      >
        Přejít na navigaci
      </a>
    </div>
  );
};
```

## Responsive Content Accessibility

### Adaptive Heading Structure
```typescript
const ResponsiveHeading: React.FC<{
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}> = ({ level, children, className }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const sizeClasses = {
    1: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    2: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
    3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
    4: 'text-base sm:text-lg lg:text-xl font-medium',
    5: 'text-sm sm:text-base lg:text-lg font-medium',
    6: 'text-xs sm:text-sm lg:text-base font-medium',
  };

  return (
    <Tag className={cn(sizeClasses[level], className)}>
      {children}
    </Tag>
  );
};
```

### Responsive Tables with Accessibility
```typescript
const AccessibleResponsiveTable: React.FC<{
  data: any[];
  columns: Column[];
}> = ({ data, columns }) => {
  const { isMobile } = useViewport();

  if (isMobile) {
    return (
      <div role="table" aria-label="Data table">
        {data.map((row, index) => (
          <div
            key={index}
            role="row"
            className="border rounded-lg p-4 mb-4 bg-white"
          >
            {columns.map((column) => (
              <div key={column.key} className="mb-2 last:mb-0">
                <div className="font-medium text-sm text-gray-600" role="rowheader">
                  {column.label}
                </div>
                <div className="text-base" role="cell">
                  {row[column.key]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" role="table">
        <thead>
          <tr role="row">
            {columns.map((column) => (
              <th
                key={column.key}
                role="columnheader"
                className="text-left p-3 border-b font-medium"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} role="row">
              {columns.map((column) => (
                <td
                  key={column.key}
                  role="cell"
                  className="p-3 border-b"
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## Screen Reader Optimization

### Live Regions for Dynamic Content
```typescript
const AccessibleLiveRegion: React.FC<{
  message: string;
  priority: 'polite' | 'assertive';
}> = ({ message, priority }) => {
  return (
    <div
      className="sr-only"
      aria-live={priority}
      aria-atomic="true"
      role="status"
    >
      {message}
    </div>
  );
};

// Usage in components
const ChatInterface: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState('');

  const sendMessage = async (message: string) => {
    setStatusMessage('Odesílám zprávu...');
    
    try {
      await api.sendMessage(message);
      setStatusMessage('Zpráva byla odeslána');
    } catch (error) {
      setStatusMessage('Chyba při odesílání zprávy');
    }
  };

  return (
    <div>
      <AccessibleLiveRegion message={statusMessage} priority="polite" />
      {/* Chat interface content */}
    </div>
  );
};
```

### Descriptive Link Text
```typescript
const AccessibleLink: React.FC<{
  href: string;
  children: React.ReactNode;
  description?: string;
}> = ({ href, children, description }) => {
  return (
    <a
      href={href}
      className={cn(
        'text-blue-600 hover:text-blue-800 underline',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'min-h-[44px] inline-flex items-center px-2 py-1'
      )}
      aria-describedby={description ? `${href}-description` : undefined}
    >
      {children}
      {description && (
        <span id={`${href}-description`} className="sr-only">
          {description}
        </span>
      )}
    </a>
  );
};

// Usage
<AccessibleLink 
  href="/chat/math" 
  description="Otevře matematického asistenta pro řešení úloh"
>
  Matematický asistent
</AccessibleLink>
```

## Color and Contrast Accessibility

### Responsive Color Contrast
```css
/* Ensure sufficient contrast across all themes */
:root {
  --text-primary: #1f2937; /* 4.5:1 contrast ratio */
  --text-secondary: #4b5563; /* 4.5:1 contrast ratio */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --accent-primary: #3b82f6;
  --accent-secondary: #1d4ed8;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --text-primary: #000000;
    --text-secondary: #000000;
    --bg-primary: #ffffff;
    --bg-secondary: #ffffff;
    --accent-primary: #0000ff;
    --accent-secondary: #000080;
  }
}

/* Ensure focus indicators are visible in all modes */
.focus-visible:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

@media (prefers-contrast: high) {
  .focus-visible:focus-visible {
    outline: 3px solid #000000;
    outline-offset: 2px;
  }
}
```

### Color-Independent Information
```typescript
const AccessibleStatus: React.FC<{
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
}> = ({ status, message }) => {
  const statusConfig = {
    success: {
      icon: CheckIcon,
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      ariaLabel: 'Úspěch',
    },
    error: {
      icon: XIcon,
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      ariaLabel: 'Chyba',
    },
    warning: {
      icon: ExclamationIcon,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      ariaLabel: 'Upozornění',
    },
    info: {
      icon: InfoIcon,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      ariaLabel: 'Informace',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start p-4 rounded-lg',
        config.bgColor
      )}
      role="alert"
      aria-label={config.ariaLabel}
    >
      <Icon 
        className={cn('w-5 h-5 mr-3 mt-0.5 flex-shrink-0', config.iconColor)}
        aria-hidden="true"
      />
      <div className={cn('text-sm', config.textColor)}>
        <span className="sr-only">{config.ariaLabel}: </span>
        {message}
      </div>
    </div>
  );
};
```

## Motion and Animation Accessibility

### Respecting Motion Preferences
```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Provide alternative feedback for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
    opacity: 0.6;
  }
  
  .loading-spinner::after {
    content: "Načítání...";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
```

### Accessible Animations
```typescript
const AccessibleAnimation: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <div
      className={cn(
        className,
        !prefersReducedMotion && 'transition-all duration-300 ease-in-out'
      )}
    >
      {children}
    </div>
  );
};
```

## Testing Accessibility Across Devices

### Automated Accessibility Testing
```typescript
// tests/accessibility/responsive-a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const viewports = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1280, height: 720, name: 'desktop' },
];

viewports.forEach(({ width, height, name }) => {
  test(`accessibility scan - ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

### Manual Testing Checklist

#### Screen Reader Testing
- [ ] **NVDA (Windows)**: Test navigation and content announcement
- [ ] **JAWS (Windows)**: Verify compatibility with popular screen reader
- [ ] **VoiceOver (macOS/iOS)**: Test on Apple devices
- [ ] **TalkBack (Android)**: Verify Android accessibility

#### Keyboard Navigation Testing
- [ ] **Tab Navigation**: Logical tab order on all screen sizes
- [ ] **Arrow Keys**: Grid and menu navigation works
- [ ] **Enter/Space**: Activates buttons and links
- [ ] **Escape**: Closes modals and menus
- [ ] **Home/End**: Navigation within components

#### Touch Accessibility Testing
- [ ] **Touch Targets**: Minimum 44px size maintained
- [ ] **Gesture Support**: Swipe gestures work with assistive tech
- [ ] **Voice Control**: Voice commands function properly
- [ ] **Switch Control**: External switch navigation works

## Accessibility Documentation Template

### Component Accessibility Documentation
```markdown
# Component Name Accessibility

## Overview
Brief description of the component and its accessibility features.

## Keyboard Support
| Key | Function |
|-----|----------|
| Tab | Moves focus to next focusable element |
| Shift + Tab | Moves focus to previous focusable element |
| Enter/Space | Activates the component |
| Escape | Closes component (if applicable) |

## Screen Reader Support
- Proper ARIA labels and descriptions
- Live region announcements for dynamic content
- Semantic HTML structure

## Touch Support
- Minimum 44px touch targets
- Touch-friendly spacing
- Gesture support where appropriate

## Testing Notes
- Tested with NVDA, JAWS, VoiceOver, and TalkBack
- Keyboard navigation verified across all breakpoints
- Color contrast meets WCAG AA standards
- Motion respects user preferences
```

## Conclusion

Responsive accessibility ensures that the EduAI-Asistent application is usable by all users, regardless of their abilities or the devices they use. By following these guidelines and regularly testing with assistive technologies, we can create an inclusive experience that meets or exceeds accessibility standards across all screen sizes and input methods.

Key principles to remember:
- Design for touch-first, keyboard-accessible interactions
- Maintain proper semantic structure across all layouts
- Ensure sufficient color contrast and alternative text
- Respect user preferences for motion and interaction
- Test regularly with real assistive technologies
- Document accessibility features for future maintenance