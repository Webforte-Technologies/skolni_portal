import React, { useState } from 'react';
import { Camera, Image, Zap, Smartphone, Monitor, Tablet } from 'lucide-react';

import { useResponsive } from '../../hooks/useViewport';
import ResponsiveImage from './ResponsiveImage';
import AdaptiveImageContainer from './AdaptiveImageContainer';
import ResponsiveImageGallery from './ResponsiveImageGallery';
import Button from './Button';
import Card from './Card';

const ResponsiveImageShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'basic' | 'adaptive' | 'gallery' | 'optimization'>('basic');
  const { isMobile, isTablet, breakpoint } = useResponsive();

  // Sample images for demonstration
  const sampleImages = [
    {
      src: 'https://picsum.photos/800/600?random=1',
      alt: 'Ukázkový obrázek 1',
      caption: 'Matematické vzorce a grafy',
      thumbnail: 'https://picsum.photos/200/200?random=1'
    },
    {
      src: 'https://picsum.photos/800/600?random=2',
      alt: 'Ukázkový obrázek 2',
      caption: 'Geometrické útvary',
      thumbnail: 'https://picsum.photos/200/200?random=2'
    },
    {
      src: 'https://picsum.photos/800/600?random=3',
      alt: 'Ukázkový obrázek 3',
      caption: 'Statistické grafy',
      thumbnail: 'https://picsum.photos/200/200?random=3'
    },
    {
      src: 'https://picsum.photos/800/600?random=4',
      alt: 'Ukázkový obrázek 4',
      caption: 'Algebraické rovnice',
      thumbnail: 'https://picsum.photos/200/200?random=4'
    }
  ];

  const getCurrentDevice = () => {
    if (isMobile) return { icon: Smartphone, name: 'Mobil', size: breakpoint };
    if (isTablet) return { icon: Tablet, name: 'Tablet', size: breakpoint };
    return { icon: Monitor, name: 'Desktop', size: breakpoint };
  };

  const device = getCurrentDevice();
  const DeviceIcon = device.icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Responzivní optimalizace obrázků
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Demonstrace pokročilých funkcí pro responzivní načítání obrázků s optimalizací pro různé zařízení a rychlosti připojení.
        </p>
        
        {/* Current device indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-full">
          <DeviceIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {device.name} ({device.size})
          </span>
        </div>
      </div>

      {/* Demo selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { key: 'basic', label: 'Základní responzivní obrázky', icon: Image },
          { key: 'adaptive', label: 'Adaptivní kontejnery', icon: Monitor },
          { key: 'gallery', label: 'Galerie obrázků', icon: Camera },
          { key: 'optimization', label: 'Optimalizace výkonu', icon: Zap }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeDemo === key ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveDemo(key as any)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{key}</span>
          </Button>
        ))}
      </div>

      {/* Demo content */}
      <div className="space-y-6">
        {activeDemo === 'basic' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Image className="w-5 h-5" />
                Základní responzivní obrázky
              </h2>
              
              <div className="space-y-4">
                <p className="text-neutral-600 dark:text-neutral-400">
                  ResponsiveImage komponenta automaticky generuje srcSet a sizes atributy pro optimální načítání na různých zařízeních.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Standardní načítání</h3>
                    <ResponsiveImage
                      src="https://picsum.photos/600/400?random=10"
                      alt="Standardní obrázek"
                      aspectRatio="4:3"
                      className="rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Progresivní načítání</h3>
                    <ResponsiveImage
                      src="https://picsum.photos/600/400?random=11"
                      alt="Progresivní obrázek"
                      aspectRatio="4:3"
                      className="rounded-lg"
                      progressive={true}
                      placeholder="blur"
                    />
                  </div>
                </div>
                
                <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Funkce:</h4>
                  <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                    <li>• Automatické generování srcSet pro různé velikosti</li>
                    <li>• Adaptivní kvalita podle rychlosti připojení</li>
                    <li>• Progresivní načítání s rozmazaným placeholderem</li>
                    <li>• Optimalizace pro mobilní zařízení</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeDemo === 'adaptive' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Adaptivní kontejnery obrázků
              </h2>
              
              <div className="space-y-6">
                <p className="text-neutral-600 dark:text-neutral-400">
                  AdaptiveImageContainer poskytuje pokročilé funkce jako zoom, různé poměry stran a interaktivní prvky.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Různé poměry stran</h3>
                    <div className="space-y-4">
                      {[
                        { ratio: 'square', label: 'Čtverec (1:1)' },
                        { ratio: '16:9', label: 'Širokoúhlý (16:9)' },
                        { ratio: '4:3', label: 'Klasický (4:3)' }
                      ].map(({ ratio, label }) => (
                        <div key={ratio}>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{label}</p>
                          <AdaptiveImageContainer
                            src={`https://picsum.photos/600/400?random=${ratio}`}
                            alt={`Obrázek ${label}`}
                            aspectRatio={ratio as any}
                            className="rounded-lg"
                            interactive={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Interaktivní funkce</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Zoom při kliknutí</p>
                        <AdaptiveImageContainer
                          src="https://picsum.photos/600/400?random=20"
                          alt="Zoomovatelný obrázek"
                          aspectRatio="16:9"
                          className="rounded-lg"
                          zoomable={true}
                          caption="Klikněte pro zoom"
                          showCaption={true}
                        />
                      </div>
                      
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">S překryvem</p>
                        <AdaptiveImageContainer
                          src="https://picsum.photos/600/400?random=21"
                          alt="Obrázek s překryvem"
                          aspectRatio="4:3"
                          className="rounded-lg"
                          overlay={
                            <div className="bg-black/50 text-white p-4 rounded text-center">
                              <h4 className="font-semibold">Překryv obsahu</h4>
                              <p className="text-sm">Dodatečné informace</p>
                            </div>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeDemo === 'gallery' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Responzivní galerie obrázků
              </h2>
              
              <div className="space-y-6">
                <p className="text-neutral-600 dark:text-neutral-400">
                  ResponsiveImageGallery podporuje různé layouty a automaticky se přizpůsobuje velikosti obrazovky.
                </p>
                
                <div>
                  <h3 className="font-medium mb-4">Mřížkový layout</h3>
                  <ResponsiveImageGallery
                    images={sampleImages}
                    layout="grid"
                    aspectRatio="4:3"
                    columns={{ mobile: 1, tablet: 2, desktop: 3 }}
                    showCaptions={true}
                    allowZoom={true}
                  />
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Karuselový layout</h3>
                  <ResponsiveImageGallery
                    images={sampleImages}
                    layout="carousel"
                    aspectRatio="16:9"
                    showThumbnails={true}
                    showControls={true}
                    showCaptions={true}
                    allowZoom={true}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeDemo === 'optimization' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Optimalizace výkonu
              </h2>
              
              <div className="space-y-6">
                <p className="text-neutral-600 dark:text-neutral-400">
                  Pokročilé optimalizace pro různé typy připojení a zařízení.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Adaptivní kvalita</h3>
                    <div className="space-y-2">
                      <ResponsiveImage
                        src="https://picsum.photos/400/300?random=30"
                        alt="Vysoká kvalita"
                        aspectRatio="4:3"
                        className="rounded-lg"
                        quality={90}
                      />
                      <p className="text-xs text-neutral-500">Vysoká kvalita (90%)</p>
                    </div>
                    
                    <div className="space-y-2">
                      <ResponsiveImage
                        src="https://picsum.photos/400/300?random=31"
                        alt="Střední kvalita"
                        aspectRatio="4:3"
                        className="rounded-lg"
                        quality={60}
                      />
                      <p className="text-xs text-neutral-500">Střední kvalita (60%)</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Lazy loading</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className="space-y-2">
                          <ResponsiveImage
                            src={`https://picsum.photos/400/200?random=${40 + i}`}
                            alt={`Lazy obrázek ${i + 1}`}
                            aspectRatio="16:9"
                            className="rounded-lg"
                            loading="lazy"
                          />
                          <p className="text-xs text-neutral-500">Lazy loading obrázek {i + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Optimalizační funkce:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                    <ul className="space-y-1">
                      <li>• Detekce rychlosti připojení</li>
                      <li>• Automatická komprese pro mobily</li>
                      <li>• WebP podpora s fallbackem</li>
                      <li>• Progresivní JPEG</li>
                    </ul>
                    <ul className="space-y-1">
                      <li>• Lazy loading s Intersection Observer</li>
                      <li>• Preloading kritických obrázků</li>
                      <li>• Adaptivní velikosti podle zařízení</li>
                      <li>• Optimalizace pro high-DPI displeje</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Technical info */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
        <h3 className="font-semibold mb-3 text-primary-900 dark:text-primary-100">
          Technické informace
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-primary-800 dark:text-primary-200 mb-1">Aktuální zařízení</h4>
            <p className="text-primary-700 dark:text-primary-300">{device.name} ({device.size})</p>
          </div>
          <div>
            <h4 className="font-medium text-primary-800 dark:text-primary-200 mb-1">Podporované formáty</h4>
            <p className="text-primary-700 dark:text-primary-300">WebP, JPEG, PNG</p>
          </div>
          <div>
            <h4 className="font-medium text-primary-800 dark:text-primary-200 mb-1">Optimalizace</h4>
            <p className="text-primary-700 dark:text-primary-300">Adaptivní kvalita, Lazy loading</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResponsiveImageShowcase;