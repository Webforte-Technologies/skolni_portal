/**
 * Critical CSS utilities for mobile-first loading optimization
 * Implements critical CSS inlining and loading strategies
 */

export interface CriticalCssConfig {
  inlineThreshold: number;
  mobileFirst: boolean;
  preloadFonts: boolean;
  deferNonCritical: boolean;
}

export const defaultCriticalCssConfig: CriticalCssConfig = {
  inlineThreshold: 14000, // 14KB threshold for inlining
  mobileFirst: true,
  preloadFonts: true,
  deferNonCritical: true,
};

/**
 * Critical CSS content that should be inlined for mobile-first loading
 */
export const criticalCssContent = `
/* Critical mobile-first styles */
*,*::before,*::after{box-sizing:border-box}
html{line-height:1.15;-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif;background-color:#f8fafc;color:#111827;overflow-x:hidden}
.app-container{min-height:100vh;display:flex;flex-direction:column}
.main-content{flex:1;width:100%;max-width:100vw}
@media (max-width:640px){.mobile-nav-trigger{display:flex;align-items:center;justify-content:center;position:fixed;top:1rem;left:1rem;z-index:50;width:44px;height:44px;background:#ffffff;border:1px solid #e5e7eb;border-radius:0.5rem;box-shadow:0 1px 3px 0 rgba(0,0,0,0.1)}.desktop-only{display:none!important}.mobile-only{display:block!important}.container{padding-left:1rem;padding-right:1rem}body{overflow-x:hidden}button,input,textarea,select{min-height:44px}}
@media (min-width:641px){.mobile-only{display:none!important}.desktop-only{display:block!important}}
.loading-skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:loading 1.5s infinite}
@keyframes loading{0%{background-position:200% 0}100%{background-position:-200% 0}}
.form-field{width:100%;padding:0.75rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:1rem;line-height:1.5}
.form-field:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.1)}
.btn{display:inline-flex;align-items:center;justify-content:center;padding:0.75rem 1.5rem;font-size:1rem;font-weight:500;line-height:1.5;border-radius:0.375rem;border:none;cursor:pointer;transition:all 0.15s ease;min-height:44px}
.btn-primary{background-color:#3b82f6;color:#ffffff}
.btn-primary:hover{background-color:#2563eb}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
*:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}
`;

/**
 * Font preload links for critical font loading
 */
export const criticalFontPreloads = [
  {
    href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ5hjb2Bg-4.woff2',
    as: 'font',
    type: 'font/woff2',
    crossorigin: 'anonymous',
    weight: '400',
  },
  {
    href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ5hjb2Bg-4.woff2',
    as: 'font',
    type: 'font/woff2',
    crossorigin: 'anonymous',
    weight: '500',
  },
  {
    href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ5hjb2Bg-4.woff2',
    as: 'font',
    type: 'font/woff2',
    crossorigin: 'anonymous',
    weight: '600',
  },
];

/**
 * Injects critical CSS into the document head
 */
export function injectCriticalCss(): void {
  if (typeof document === 'undefined') return;

  const existingStyle = document.getElementById('critical-css');
  if (existingStyle) return;

  const style = document.createElement('style');
  style.id = 'critical-css';
  style.textContent = criticalCssContent;
  
  // Insert before any existing stylesheets
  const firstLink = document.querySelector('link[rel="stylesheet"]');
  if (firstLink) {
    document.head.insertBefore(style, firstLink);
  } else {
    document.head.appendChild(style);
  }
}

/**
 * Preloads critical fonts for faster rendering
 */
export function preloadCriticalFonts(): void {
  if (typeof document === 'undefined') return;

  criticalFontPreloads.forEach((font) => {
    const existingPreload = document.querySelector(
      `link[rel="preload"][href="${font.href}"]`
    );
    if (existingPreload) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font.href;
    link.as = font.as;
    link.type = font.type;
    link.crossOrigin = font.crossorigin;
    
    document.head.appendChild(link);
  });
}

/**
 * Loads non-critical CSS asynchronously
 */
export function loadNonCriticalCss(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      resolve();
      return;
    }

    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (existingLink) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
      resolve();
    };
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
    
    document.head.appendChild(link);
  });
}

/**
 * Detects if the user is on a mobile device for critical CSS optimization
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth <= 640 || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Optimizes CSS loading based on device type and connection
 */
export function optimizeCssLoading(config: Partial<CriticalCssConfig> = {}): void {
  const finalConfig = { ...defaultCriticalCssConfig, ...config };
  
  // Always inject critical CSS first
  injectCriticalCss();
  
  // Preload fonts if enabled
  if (finalConfig.preloadFonts) {
    preloadCriticalFonts();
  }
  
  // Load non-critical CSS based on device and connection
  if (finalConfig.deferNonCritical) {
    // Use requestIdleCallback if available, otherwise setTimeout
    const loadNonCritical = () => {
      loadNonCriticalCss('/src/styles/fonts.css');
      loadNonCriticalCss('/src/styles/adaptive-properties.css');
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadNonCritical);
    } else {
      setTimeout(loadNonCritical, 100);
    }
  }
}

/**
 * Font loading optimization utilities
 */
export class FontLoadingOptimizer {
  private loadedFonts = new Set<string>();
  private fontLoadPromises = new Map<string, Promise<void>>();

  /**
   * Loads a font with optimization strategies
   */
  async loadFont(fontFamily: string, options: {
    weight?: string;
    style?: string;
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
    timeout?: number;
  } = {}): Promise<void> {
    const fontKey = `${fontFamily}-${options.weight || '400'}-${options.style || 'normal'}`;
    
    if (this.loadedFonts.has(fontKey)) {
      return Promise.resolve();
    }

    if (this.fontLoadPromises.has(fontKey)) {
      return this.fontLoadPromises.get(fontKey)!;
    }

    const promise = this.loadFontInternal(fontFamily, options);
    this.fontLoadPromises.set(fontKey, promise);
    
    try {
      await promise;
      this.loadedFonts.add(fontKey);
    } catch (error) {
      this.fontLoadPromises.delete(fontKey);
      throw error;
    }
    
    return promise;
  }

  private async loadFontInternal(fontFamily: string, options: {
    weight?: string;
    style?: string;
    display?: string;
    timeout?: number;
  }): Promise<void> {
    if (typeof document === 'undefined' || !('fonts' in document)) {
      return Promise.resolve();
    }

    const fontFace = new FontFace(
      fontFamily,
      `url(/fonts/${fontFamily.toLowerCase()}.woff2) format('woff2')`,
      {
        weight: options.weight || '400',
        style: options.style || 'normal',
        display: (options.display as FontDisplay) || 'swap',
      }
    );

    try {
      const loadedFont = await Promise.race([
        fontFace.load(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Font load timeout')), options.timeout || 3000)
        ),
      ]);

      (document.fonts as any).add(loadedFont);
    } catch (error) {
      console.warn(`Failed to load font ${fontFamily}:`, error);
      // Gracefully degrade to system fonts
    }
  }

  /**
   * Preloads critical fonts for the application
   */
  async preloadCriticalFonts(): Promise<void> {
    const criticalFonts = [
      { family: 'Inter', weight: '400' },
      { family: 'Inter', weight: '500' },
      { family: 'Inter', weight: '600' },
    ];

    await Promise.allSettled(
      criticalFonts.map(font => 
        this.loadFont(font.family, { weight: font.weight, display: 'block' })
      )
    );
  }
}

/**
 * CSS optimization utilities for responsive design
 */
export class ResponsiveCssOptimizer {
  private mediaQueryLists = new Map<string, MediaQueryList>();
  private callbacks = new Map<string, Set<(matches: boolean) => void>>();

  constructor() {
    this.setupMediaQueries();
  }

  private setupMediaQueries(): void {
    const breakpoints = {
      mobile: '(max-width: 640px)',
      tablet: '(min-width: 641px) and (max-width: 1024px)',
      desktop: '(min-width: 1025px)',
      'prefers-reduced-motion': '(prefers-reduced-motion: reduce)',
      'prefers-dark': '(prefers-color-scheme: dark)',
      'high-contrast': '(prefers-contrast: high)',
    };

    Object.entries(breakpoints).forEach(([name, query]) => {
      if (typeof window !== 'undefined') {
        const mql = window.matchMedia(query);
        this.mediaQueryLists.set(name, mql);
        this.callbacks.set(name, new Set());
        
        mql.addEventListener('change', (e) => {
          const callbacks = this.callbacks.get(name);
          if (callbacks) {
            callbacks.forEach(callback => callback(e.matches));
          }
        });
      }
    });
  }

  /**
   * Subscribes to media query changes
   */
  subscribe(query: string, callback: (matches: boolean) => void): () => void {
    const callbacks = this.callbacks.get(query);
    if (callbacks) {
      callbacks.add(callback);
      
      // Call immediately with current state
      const mql = this.mediaQueryLists.get(query);
      if (mql) {
        callback(mql.matches);
      }
      
      return () => callbacks.delete(callback);
    }
    
    return () => {};
  }

  /**
   * Gets current breakpoint
   */
  getCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
    const mobile = this.mediaQueryLists.get('mobile');
    const tablet = this.mediaQueryLists.get('tablet');
    
    if (mobile?.matches) return 'mobile';
    if (tablet?.matches) return 'tablet';
    return 'desktop';
  }

  /**
   * Checks if user prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    const mql = this.mediaQueryLists.get('prefers-reduced-motion');
    return mql?.matches || false;
  }

  /**
   * Checks if user prefers dark mode
   */
  prefersDarkMode(): boolean {
    const mql = this.mediaQueryLists.get('prefers-dark');
    return mql?.matches || false;
  }
}

// Export singleton instances
export const fontOptimizer = new FontLoadingOptimizer();
export const cssOptimizer = new ResponsiveCssOptimizer();