import React from 'react';
import { useResponsive } from '../../hooks/useViewport';
import { LoadingSkeleton } from '../performance/LoadingSkeleton';

interface TabletChatInterfaceProps {
  className?: string;
}

const TabletChatInterface: React.FC<TabletChatInterfaceProps> = ({ className = '' }) => {
  const { isTablet } = useResponsive();

  if (!isTablet) {
    return <LoadingSkeleton variant="chat" />;
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Tablet Chat</h2>
          <p className="text-gray-600">Rozšířené funkce pro tablety</p>
        </div>
        
        {/* Tablet chat messages with more space */}
        <div className="space-y-4">
          <div className="bg-blue-100 p-4 rounded-lg max-w-md ml-auto">
            <p>Ukázková zpráva uživatele s více prostorem</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg max-w-md">
            <p>Ukázková odpověď AI asistenta s rozšířenými funkcemi</p>
          </div>
        </div>
      </div>
      
      {/* Tablet input area with more features */}
      <div className="p-6 border-t bg-white">
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Napište zprávu..."
            className="flex-1 px-4 py-3 border rounded-lg"
          />
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            Odeslat
          </button>
          <button className="px-4 py-3 border rounded-lg text-gray-600">
            Přílohy
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabletChatInterface;