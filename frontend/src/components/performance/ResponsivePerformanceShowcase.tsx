import React, { useState } from 'react';
import { useResponsive } from '../../hooks/useViewport';
import LazyComponentWrapper, { withLazyLoading } from './LazyComponentWrapper';
import { ResponsiveComponentLoader, ConditionalLoad, useDeviceFeatures } from './ResponsiveCodeSplitting';
import { AdaptiveLoading, ProgressiveLoading, LazyImage, useAdaptiveLoading } from './AdaptiveLoadingStates';
import { LoadingSkeleton } from './LoadingSkeleton';

// Example component for lazy loading demonstration
const HeavyComponent: React.FC = () => {
  const [data, setData] = useState<string[]>([]);
  
  React.useEffect(() => {
    // Simulate heavy data loading
    setTimeout(() => {
      setData(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);
    }, 2000);
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium mb-3">Těžká komponenta</h3>
      {data.length === 0 ? (
        <LoadingSkeleton variant="list" count={3} />
      ) : (
        <ul className="space-y-2">
          {data.map((item, index) => (
            <li key={index} className="p-2 bg-gray-50 rounded">{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Lazy-wrapped version of the heavy component
const LazyHeavyComponent = withLazyLoading(HeavyComponent, {
  priority: 'low',
  mobileOnly: true,
});

export const ResponsivePerformanceShowcase: React.FC = () => {
  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();
  const features = useDeviceFeatures();
  const { isLoading, startLoading, stopLoading } = useAdaptiveLoading();

  const [showLazyDemo, setShowLazyDemo] = useState(false);
  const [showProgressiveDemo, setShowProgressiveDemo] = useState(false);

  const handleLoadingDemo = () => {
    startLoading();
    setTimeout(() => {
      stopLoading();
    }, 3000);
  };

  const progressiveStages = [
    {
      name: 'header',
      component: () => (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium">Fáze 1: Hlavička</h3>
          <p className="text-sm text-gray-600">Načteno jako první</p>
        </div>
      ),
      priority: 1,
    },
    {
      name: 'content',
      component: () => (
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium">Fáze 2: Obsah</h3>
          <p className="text-sm text-gray-600">Načteno jako druhé</p>
        </div>
      ),
      priority: 2,
    },
    {
      name: 'sidebar',
      component: () => (
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-medium">Fáze 3: Postranní panel</h3>
          <p className="text-sm text-gray-600">Načteno jako třetí</p>
        </div>
      ),
      priority: 3,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ukázka výkonnostních optimalizací
        </h1>
        <p className="text-gray-600">
          Demonstrace responzivních výkonnostních funkcí pro {breakpoint} zařízení
        </p>
      </div>

      {/* Device Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Informace o zařízení</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl mb-2 ${isMobile ? 'text-green-600' : 'text-gray-400'}`}>
              📱
            </div>
            <p className="font-medium">Mobil</p>
            <p className="text-sm text-gray-600">{isMobile ? 'Aktivní' : 'Neaktivní'}</p>
          </div>
          <div className="text-center">
            <div className={`text-2xl mb-2 ${isTablet ? 'text-green-600' : 'text-gray-400'}`}>
              📟
            </div>
            <p className="font-medium">Tablet</p>
            <p className="text-sm text-gray-600">{isTablet ? 'Aktivní' : 'Neaktivní'}</p>
          </div>
          <div className="text-center">
            <div className={`text-2xl mb-2 ${isDesktop ? 'text-green-600' : 'text-gray-400'}`}>
              🖥️
            </div>
            <p className="font-medium">Desktop</p>
            <p className="text-sm text-gray-600">{isDesktop ? 'Aktivní' : 'Neaktivní'}</p>
          </div>
        </div>
      </div>

      {/* Device Features */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Dostupné funkce</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(features).map(([feature, available]) => (
            <div key={feature} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${available ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lazy Loading Demo */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Lazy Loading</h2>
        <p className="text-gray-600 mb-4">
          Komponenty se načítají pouze když jsou potřeba (zejména na mobilních zařízeních)
        </p>
        
        <button
          onClick={() => setShowLazyDemo(!showLazyDemo)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showLazyDemo ? 'Skrýt' : 'Zobrazit'} lazy komponentu
        </button>

        {showLazyDemo && (
          <LazyComponentWrapper priority="low" mobileOnly>
            <LazyHeavyComponent />
          </LazyComponentWrapper>
        )}
      </div>

      {/* Responsive Code Splitting Demo */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Responzivní rozdělení kódu</h2>
        <p className="text-gray-600 mb-4">
          Různé komponenty se načítají podle typu zařízení
        </p>

        <div className="space-y-4">
          <ResponsiveComponentLoader component="Dashboard" />
          
          <ConditionalLoad
            condition={({ isDesktop }) => isDesktop}
            component={() => import('../ui/FileExport')}
            fallback={() => (
              <div className="p-4 text-center text-gray-500 border rounded">
                Export souborů není dostupný na tomto zařízení
              </div>
            )}
          />
        </div>
      </div>

      {/* Adaptive Loading States Demo */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Adaptivní načítací stavy</h2>
        <p className="text-gray-600 mb-4">
          Načítací stavy se přizpůsobují typu zařízení
        </p>

        <button
          onClick={handleLoadingDemo}
          className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={isLoading}
        >
          Spustit demo načítání
        </button>

        <AdaptiveLoading
          isLoading={isLoading}
          loadingVariant="dashboard"
          showProgressBar
          className="min-h-[200px]"
        >
          <div className="p-4 bg-green-50 rounded">
            <h3 className="font-medium">Obsah načten!</h3>
            <p className="text-sm text-gray-600">Toto se zobrazí po dokončení načítání</p>
          </div>
        </AdaptiveLoading>
      </div>

      {/* Progressive Loading Demo */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Postupné načítání</h2>
        <p className="text-gray-600 mb-4">
          Komponenty se načítají postupně podle priority
        </p>

        <button
          onClick={() => setShowProgressiveDemo(!showProgressiveDemo)}
          className="mb-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          {showProgressiveDemo ? 'Resetovat' : 'Spustit'} postupné načítání
        </button>

        {showProgressiveDemo && (
          <ProgressiveLoading stages={progressiveStages} className="space-y-4" />
        )}
      </div>

      {/* Lazy Image Demo */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Lazy načítání obrázků</h2>
        <p className="text-gray-600 mb-4">
          Obrázky se načítají pouze když jsou viditelné
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LazyImage
            src="https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Lazy+Image+1"
            alt="Lazy loaded image 1"
            className="w-full h-48 rounded-lg"
          />
          <LazyImage
            src="https://via.placeholder.com/300x200/059669/FFFFFF?text=Lazy+Image+2"
            alt="Lazy loaded image 2"
            className="w-full h-48 rounded-lg"
          />
        </div>
      </div>

      {/* Loading Skeleton Variants */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Varianty načítacích skeletů</h2>
        <p className="text-gray-600 mb-4">
          Různé typy skeletů pro různé komponenty
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Karta</h3>
            <LoadingSkeleton variant="card" />
          </div>
          <div>
            <h3 className="font-medium mb-2">Seznam</h3>
            <LoadingSkeleton variant="list" count={3} />
          </div>
          <div>
            <h3 className="font-medium mb-2">Formulář</h3>
            <LoadingSkeleton variant="form" />
          </div>
          <div>
            <h3 className="font-medium mb-2">Chat</h3>
            <LoadingSkeleton variant="chat" />
          </div>
        </div>
      </div>
    </div>
  );
};