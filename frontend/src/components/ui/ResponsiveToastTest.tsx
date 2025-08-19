import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useResponsive } from '../../hooks/useViewport';

const ResponsiveToastTest: React.FC = () => {
  const { showToast } = useToast();
  const responsive = useResponsive();

  const testBasicToasts = () => {
    showToast({
      type: 'success',
      message: 'Test úspěšného oznámení',
    });
  };

  const testLongMessage = () => {
    showToast({
      type: 'info',
      message: 'Toto je velmi dlouhá zpráva, která testuje zkracování textu na různých velikostech obrazovky a responsivní chování toast notifikací.',
      duration: 6000,
    });
  };

  const testWithAction = () => {
    showToast({
      type: 'warning',
      message: 'Varování s akcí',
      actionLabel: 'Opravit problém',
      onAction: () => {
        showToast({
          type: 'success',
          message: 'Akce byla provedena!',
        });
      },
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Toast Test</h2>
      
      <div className="text-sm text-gray-600">
        Viewport: {responsive.width}x{responsive.height} ({responsive.breakpoint})
      </div>
      
      <div className="space-y-2">
        <button
          onClick={testBasicToasts}
          className="block w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test základní toast
        </button>
        
        <button
          onClick={testLongMessage}
          className="block w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test dlouhá zpráva
        </button>
        
        <button
          onClick={testWithAction}
          className="block w-full sm:w-auto px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Test s akcí
        </button>
      </div>
    </div>
  );
};

export default ResponsiveToastTest;