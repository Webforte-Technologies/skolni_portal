import React from 'react';
import { ViewportState } from '../types';

interface DeviceSpecificBundle {
  mobile: string[];
  tablet: string[];
  desktop: string[];
}

// Define which features should be loaded for each device type (for future use)
const DEVICE_BUNDLES: DeviceSpecificBundle = {
  mobile: [
    'core',
    'auth',
    'chat-mobile',
    'math-basic',
    'ui-mobile',
  ],
  tablet: [
    'core',
    'auth',
    'chat-enhanced',
    'math-enhanced',
    'ui-tablet',
    'dashboard-tablet',
  ],
  desktop: [
    'core',
    'auth',
    'chat-full',
    'math-full',
    'ui-desktop',
    'dashboard-full',
    'pdf-generation',
    'charts-full',
    'document-export',
  ],
};

// Priority levels for loading
export enum LoadPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

interface ComponentLoadConfig {
  priority: LoadPriority;
  deviceTypes: ('mobile' | 'tablet' | 'desktop')[];
  dependencies?: string[];
  fallback?: () => React.ComponentType;
}

// Component loading configurations
export const COMPONENT_LOAD_CONFIG: Record<string, ComponentLoadConfig> = {
  // Critical components (always load first)
  'auth': {
    priority: LoadPriority.CRITICAL,
    deviceTypes: ['mobile', 'tablet', 'desktop'],
  },
  'navigation': {
    priority: LoadPriority.CRITICAL,
    deviceTypes: ['mobile', 'tablet', 'desktop'],
  },
  'error-boundary': {
    priority: LoadPriority.CRITICAL,
    deviceTypes: ['mobile', 'tablet', 'desktop'],
  },

  // High priority components
  'chat-interface': {
    priority: LoadPriority.HIGH,
    deviceTypes: ['mobile', 'tablet', 'desktop'],
    dependencies: ['math-rendering'],
  },
  'dashboard': {
    priority: LoadPriority.HIGH,
    deviceTypes: ['tablet', 'desktop'],
  },
  'mobile-dashboard': {
    priority: LoadPriority.HIGH,
    deviceTypes: ['mobile'],
  },

  // Medium priority components
  'math-visualization': {
    priority: LoadPriority.MEDIUM,
    deviceTypes: ['tablet', 'desktop'],
    dependencies: ['charts'],
  },
  'file-export': {
    priority: LoadPriority.MEDIUM,
    deviceTypes: ['desktop'],
    dependencies: ['pdf-generation'],
  },

  // Low priority components (load on demand)
  'advanced-charts': {
    priority: LoadPriority.LOW,
    deviceTypes: ['desktop'],
    dependencies: ['charts-full'],
  },
  'document-templates': {
    priority: LoadPriority.LOW,
    deviceTypes: ['desktop'],
    dependencies: ['document-export'],
  },
};

export class DeviceSpecificLoader {
  private loadedBundles = new Set<string>();
  private loadingPromises = new Map<string, Promise<any>>();
  private viewport: ViewportState;

  constructor(viewport: ViewportState) {
    this.viewport = viewport;
  }

  updateViewport(viewport: ViewportState) {
    this.viewport = viewport;
  }

  async loadComponentsForDevice(): Promise<void> {
    const deviceType = this.viewport.breakpoint;
    
    // Reference device bundles for future use
    const deviceBundles = DEVICE_BUNDLES[deviceType];
    console.debug('Device bundles for', deviceType, ':', deviceBundles);

    // Load critical components first
    const criticalComponents = this.getComponentsByPriority(LoadPriority.CRITICAL, deviceType);
    await this.loadComponents(criticalComponents);

    // Load high priority components
    const highPriorityComponents = this.getComponentsByPriority(LoadPriority.HIGH, deviceType);
    await this.loadComponents(highPriorityComponents);

    // Load medium priority components in background
    const mediumPriorityComponents = this.getComponentsByPriority(LoadPriority.MEDIUM, deviceType);
    this.loadComponentsInBackground(mediumPriorityComponents);
  }

  private getComponentsByPriority(priority: LoadPriority, deviceType: string): string[] {
    return Object.entries(COMPONENT_LOAD_CONFIG)
      .filter(([_, config]) => 
        config.priority === priority && 
        config.deviceTypes.includes(deviceType as any)
      )
      .map(([name]) => name);
  }

  private async loadComponents(components: string[]): Promise<void> {
    const loadPromises = components.map(component => this.loadComponent(component));
    await Promise.all(loadPromises);
  }

  private loadComponentsInBackground(components: string[]): void {
    // Use requestIdleCallback for background loading
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        this.loadComponents(components);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.loadComponents(components);
      }, 100);
    }
  }

  async loadComponent(componentName: string): Promise<any> {
    if (this.loadedBundles.has(componentName)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(componentName)) {
      return this.loadingPromises.get(componentName);
    }

    const config = COMPONENT_LOAD_CONFIG[componentName];
    if (!config) {
      console.warn(`No configuration found for component: ${componentName}`);
      return Promise.resolve();
    }

    // Load dependencies first
    if (config.dependencies) {
      await Promise.all(
        config.dependencies.map(dep => this.loadComponent(dep))
      );
    }

    const loadPromise = this.dynamicImport(componentName);
    this.loadingPromises.set(componentName, loadPromise);

    try {
      await loadPromise;
      this.loadedBundles.add(componentName);
      this.loadingPromises.delete(componentName);
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      this.loadingPromises.delete(componentName);
      throw error;
    }

    return loadPromise;
  }

  private async dynamicImport(componentName: string): Promise<any> {
    // Map component names to actual import paths
    const importMap: Record<string, () => Promise<any>> = {
      'auth': () => import('../pages/auth/LoginPage'),
      'navigation': () => import('../components/layout/Header'),
      'error-boundary': () => import('../components/ui/Card'),
      'chat-interface': () => import('../pages/chat/ChatPage'),
      'dashboard': () => import('../pages/dashboard/DashboardPage'),
      'mobile-dashboard': () => import('../components/dashboard/MobileDashboard'),
      'math-visualization': () => import('../components/math/ResponsiveMath'),
      'file-export': () => import('../components/ui/FileExport'),
      'advanced-charts': () => import('../components/ui/ResponsiveChart'),
      'document-templates': () => import('../components/ui/DocumentTemplates'),
    };

    const importFunction = importMap[componentName];
    if (!importFunction) {
      console.warn(`No import function defined for component: ${componentName}`);
      return Promise.resolve();
    }

    return importFunction();
  }

  isComponentLoaded(componentName: string): boolean {
    return this.loadedBundles.has(componentName);
  }

  getLoadedComponents(): string[] {
    return Array.from(this.loadedBundles);
  }

  preloadForNextDevice(targetDevice: 'mobile' | 'tablet' | 'desktop'): void {
    const components = this.getComponentsByPriority(LoadPriority.HIGH, targetDevice);
    this.loadComponentsInBackground(components);
  }
}

// Hook for using device-specific loading
export const useDeviceSpecificLoader = (viewport: ViewportState) => {
  const [loader] = React.useState(() => new DeviceSpecificLoader(viewport));
  
  React.useEffect(() => {
    loader.updateViewport(viewport);
  }, [loader, viewport]);

  React.useEffect(() => {
    loader.loadComponentsForDevice();
  }, [loader, viewport.breakpoint]);

  return loader;
};