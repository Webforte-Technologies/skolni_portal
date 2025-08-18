import React, { useState } from 'react';
import { Settings, Info, Menu, Image, FileText, MessageSquare } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';
import ResponsiveOverlay from './ResponsiveOverlay';
import MobileModal from './MobileModal';
import { useResponsive } from '../../hooks/useViewport';

const ResponsiveModalShowcase: React.FC = () => {
  const { isMobile, isTablet, touchDevice } = useResponsive();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const closeModal = () => setActiveModal(null);

  const modalContent = (
    <div className="space-y-4">
      <p className="text-neutral-600 dark:text-neutral-400">
        Toto je ukázka responzivního modalu. Na mobilních zařízeních se zobrazuje na celou obrazovku 
        s možností zavření pomocí gesta swipe dolů.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <h4 className="font-medium mb-2">Mobilní funkce</h4>
          <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
            <li>• Celá obrazovka na mobilu</li>
            <li>• Swipe gesta pro zavření</li>
            <li>• Touch-friendly tlačítka</li>
            <li>• Optimalizované rozložení</li>
          </ul>
        </div>
        
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <h4 className="font-medium mb-2">Desktop funkce</h4>
          <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
            <li>• Centrované okno</li>
            <li>• Různé velikosti</li>
            <li>• Keyboard navigace</li>
            <li>• Backdrop kliknutí</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="primary" className="flex-1">
          Primární akce
        </Button>
        <Button variant="secondary" onClick={closeModal} className="flex-1">
          Zrušit
        </Button>
      </div>
    </div>
  );

  const longContent = (
    <div className="space-y-6">
      <p className="text-neutral-600 dark:text-neutral-400">
        Toto je dlouhý obsah pro testování scrollování v modalu.
      </p>
      
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <h4 className="font-medium mb-2">Sekce {i + 1}</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
            nostrud exercitation ullamco laboris.
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Responzivní modaly a overlay komponenty</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Testování různých typů modalů a overlay komponent s responzivním chováním.
        </p>
        
        <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Aktuální zařízení: {isMobile ? 'Mobil' : isTablet ? 'Tablet' : 'Desktop'} 
          {touchDevice && ' (Touch)'}
        </div>
      </div>

      {/* Standard Modal Tests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Standardní modaly</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="primary"
            onClick={() => setActiveModal('standard-small')}
            className="flex items-center gap-2"
          >
            <Info className="h-4 w-4" />
            Malý modal
          </Button>
          
          <Button
            variant="primary"
            onClick={() => setActiveModal('standard-medium')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Střední modal
          </Button>
          
          <Button
            variant="primary"
            onClick={() => setActiveModal('standard-large')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Velký modal
          </Button>
        </div>
      </div>

      {/* Mobile Modal Tests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Mobilní modaly</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="secondary"
            onClick={() => setActiveModal('mobile-modal')}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Mobilní modal
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => setActiveModal('mobile-sheet')}
            className="flex items-center gap-2"
          >
            <Menu className="h-4 w-4" />
            Bottom sheet
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => setActiveModal('mobile-drawer')}
            className="flex items-center gap-2"
          >
            <Image className="h-4 w-4" />
            Side drawer
          </Button>
        </div>
      </div>

      {/* Overlay Tests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Overlay komponenty</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => setActiveModal('overlay-center')}
          >
            Střed
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setActiveModal('overlay-bottom')}
          >
            Spodek
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setActiveModal('overlay-top')}
          >
            Vrchol
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setActiveModal('overlay-right')}
          >
            Pravá strana
          </Button>
        </div>
      </div>

      {/* Long Content Test */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Speciální testy</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => setActiveModal('long-content')}
          >
            Dlouhý obsah (scrollování)
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setActiveModal('no-swipe')}
          >
            Bez swipe gestur
          </Button>
        </div>
      </div>

      {/* Standard Modals */}
      <Modal
        isOpen={activeModal === 'standard-small'}
        onClose={closeModal}
        title="Malý modal"
        size="sm"
      >
        {modalContent}
      </Modal>

      <Modal
        isOpen={activeModal === 'standard-medium'}
        onClose={closeModal}
        title="Střední modal"
        size="md"
      >
        {modalContent}
      </Modal>

      <Modal
        isOpen={activeModal === 'standard-large'}
        onClose={closeModal}
        title="Velký modal"
        size="lg"
      >
        {modalContent}
      </Modal>

      {/* Mobile Modals */}
      <MobileModal
        isOpen={activeModal === 'mobile-modal'}
        onClose={closeModal}
        title="Mobilní modal"
        variant="modal"
      >
        {modalContent}
      </MobileModal>

      <MobileModal
        isOpen={activeModal === 'mobile-sheet'}
        onClose={closeModal}
        title="Bottom Sheet"
        variant="sheet"
        position="bottom"
      >
        {modalContent}
      </MobileModal>

      <MobileModal
        isOpen={activeModal === 'mobile-drawer'}
        onClose={closeModal}
        title="Side Drawer"
        variant="drawer"
        position="right"
      >
        {modalContent}
      </MobileModal>

      {/* Overlay Components */}
      <ResponsiveOverlay
        isOpen={activeModal === 'overlay-center'}
        onClose={closeModal}
        position="center"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Centrovaný overlay</h3>
          {modalContent}
        </div>
      </ResponsiveOverlay>

      <ResponsiveOverlay
        isOpen={activeModal === 'overlay-bottom'}
        onClose={closeModal}
        position="bottom"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Spodní overlay</h3>
          {modalContent}
        </div>
      </ResponsiveOverlay>

      <ResponsiveOverlay
        isOpen={activeModal === 'overlay-top'}
        onClose={closeModal}
        position="top"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Vrchní overlay</h3>
          {modalContent}
        </div>
      </ResponsiveOverlay>

      <ResponsiveOverlay
        isOpen={activeModal === 'overlay-right'}
        onClose={closeModal}
        position="right"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Pravý overlay</h3>
          {modalContent}
        </div>
      </ResponsiveOverlay>

      {/* Special Tests */}
      <Modal
        isOpen={activeModal === 'long-content'}
        onClose={closeModal}
        title="Dlouhý obsah"
        size="lg"
      >
        {longContent}
      </Modal>

      <Modal
        isOpen={activeModal === 'no-swipe'}
        onClose={closeModal}
        title="Bez swipe gestur"
        swipeToDismiss={false}
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Tento modal nemá povolené swipe gesta pro zavření. Můžete ho zavřít pouze 
            tlačítkem nebo klávesou Escape.
          </p>
          {modalContent}
        </div>
      </Modal>
    </div>
  );
};

export default ResponsiveModalShowcase;