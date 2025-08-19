import React, { useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import ResponsiveOverlay from './ResponsiveOverlay';
import MobileModal from './MobileModal';

const ResponsiveModalTest: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Responsive Modal Test</h2>
      
      <div className="flex gap-4">
        <Button onClick={() => setModalOpen(true)}>
          Test Modal
        </Button>
        
        <Button onClick={() => setOverlayOpen(true)}>
          Test Overlay
        </Button>
        
        <Button onClick={() => setMobileModalOpen(true)}>
          Test Mobile Modal
        </Button>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Test Modal"
        swipeToDismiss={true}
        fullScreenOnMobile={true}
      >
        <p>This is a test modal with responsive features.</p>
      </Modal>

      <ResponsiveOverlay
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        position="bottom"
        swipeToDismiss={true}
      >
        <div className="p-4">
          <h3 className="font-semibold mb-2">Test Overlay</h3>
          <p>This is a test overlay component.</p>
        </div>
      </ResponsiveOverlay>

      <MobileModal
        isOpen={mobileModalOpen}
        onClose={() => setMobileModalOpen(false)}
        title="Test Mobile Modal"
        variant="sheet"
        position="bottom"
      >
        <p>This is a test mobile modal component.</p>
      </MobileModal>
    </div>
  );
};

export default ResponsiveModalTest;