import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useResponsive } from '../../hooks/useViewport';
import Button from './Button';
import Card from './Card';
import { cn } from '../../utils/cn';

const ResponsiveToastShowcase: React.FC = () => {
  const { showToast, clearAllToasts } = useToast();
  const responsive = useResponsive();
  const { isMobile, isTablet } = responsive;

  const showSuccessToast = () => {
    showToast({
      type: 'success',
      message: 'Úspěšně jste vytvořili nový matematický příklad pro své studenty!',
      duration: 4000,
    });
  };

  const showErrorToast = () => {
    showToast({
      type: 'error',
      message: 'Nepodařilo se uložit dokument. Zkontrolujte prosím připojení k internetu a zkuste to znovu.',
      duration: 6000,
    });
  };

  const showWarningToast = () => {
    showToast({
      type: 'warning',
      message: 'Váš zůstatek kreditů je nízký. Zbývá vám pouze 5 kreditů.',
      actionLabel: 'Dobít kredity',
      onAction: () => {
        showToast({
          type: 'info',
          message: 'Přesměrování na stránku nákupu kreditů...',
        });
      },
    });
  };

  const showInfoToast = () => {
    showToast({
      type: 'info',
      message: 'Nová funkce: Nyní můžete exportovat příklady do PDF formátu!',
      duration: 5000,
    });
  };

  const showLongMessageToast = () => {
    showToast({
      type: 'info',
      message: 'Toto je velmi dlouhá zpráva, která demonstruje, jak se toast notifikace chovají na různých velikostech obrazovky. Na mobilních zařízeních bude zkrácena, zatímco na desktopu se zobrazí celá.',
      duration: 7000,
    });
  };

  const showMultipleToasts = () => {
    showToast({
      type: 'success',
      message: 'První oznámení',
    });
    
    setTimeout(() => {
      showToast({
        type: 'warning',
        message: 'Druhé oznámení',
      });
    }, 500);
    
    setTimeout(() => {
      showToast({
        type: 'error',
        message: 'Třetí oznámení',
      });
    }, 1000);
    
    setTimeout(() => {
      showToast({
        type: 'info',
        message: 'Čtvrté oznámení',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card title="Responsive Toast Notifications">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              onClick={showSuccessToast}
              variant="primary"
              size={isMobile ? 'sm' : 'md'}
              fullWidth={isMobile}
            >
              Úspěch
            </Button>
            
            <Button
              onClick={showErrorToast}
              variant="danger"
              size={isMobile ? 'sm' : 'md'}
              fullWidth={isMobile}
            >
              Chyba
            </Button>
            
            <Button
              onClick={showWarningToast}
              variant="secondary"
              size={isMobile ? 'sm' : 'md'}
              fullWidth={isMobile}
            >
              Varování
            </Button>
            
            <Button
              onClick={showInfoToast}
              variant="secondary"
              size={isMobile ? 'sm' : 'md'}
              fullWidth={isMobile}
            >
              Informace
            </Button>
            
            <Button
              onClick={showLongMessageToast}
              variant="secondary"
              size={isMobile ? 'sm' : 'md'}
              fullWidth={isMobile}
            >
              Dlouhá zpráva
            </Button>
            
            <Button
              onClick={showMultipleToasts}
              variant="secondary"
              size={isMobile ? 'sm' : 'md'}
              fullWidth={isMobile}
            >
              Více oznámení
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <Button
              onClick={clearAllToasts}
              variant="danger"
              size={isMobile ? 'sm' : 'md'}
              fullWidth={isMobile}
            >
              Vymazat všechna oznámení
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Responsive Behavior Info">
        <div className="space-y-3 text-sm">
          <div className={cn(
            'p-3 rounded-md',
            isMobile ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
          )}>
            <div className="font-medium mb-2">Aktuální viewport:</div>
            <div className="space-y-1 text-xs">
              <div>Šířka: {responsive.width}px</div>
              <div>Výška: {responsive.height}px</div>
              <div>Breakpoint: {responsive.breakpoint}</div>
              <div>Orientace: {responsive.orientation}</div>
              <div>Touch zařízení: {responsive.touchDevice ? 'Ano' : 'Ne'}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium">Responsive funkce:</div>
            <ul className="space-y-1 text-xs ml-4">
              <li>• {isMobile ? 'Mobilní' : isTablet ? 'Tablet' : 'Desktop'} layout</li>
              <li>• Zkrácené zprávy na malých obrazovkách</li>
              <li>• Touch-friendly dismiss tlačítka</li>
              <li>• Swipe gestures pro zavření (mobil)</li>
              <li>• Adaptivní pozicování a animace</li>
              <li>• Omezený počet současných toastů</li>
              <li>• Kratší doba zobrazení na mobilu</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResponsiveToastShowcase;