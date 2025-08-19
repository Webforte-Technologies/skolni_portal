import React from 'react';
import { useResponsive } from '../../hooks/useViewport';
import { LoadingSkeleton } from '../performance/LoadingSkeleton';

interface MobileChatInterfaceProps {
  className?: string;
}

const MobileChatInterface: React.FC<MobileChatInterfaceProps> = ({ className = '' }) => {
  const { isMobile } = useResponsive();

  if (!isMobile) {
    return <LoadingSkeleton variant="chat" />;
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Mobilní Chat</h2>
          <p className="text-sm text-gray-600">Optimalizováno pro dotykové ovládání</p>
        </div>
        
        {/* Mobile chat messages would go here */}
        <div className="space-y-3">
          <div className="bg-blue-100 p-3 rounded-lg max-w-xs ml-auto">
            <p className="text-sm">Ukázková zpráva uživatele</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
            <p className="text-sm">Ukázková odpověď AI asistenta</p>
          </div>
        </div>
      </div>
      
      {/* Mobile input area */}
      <div className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Napište zprávu..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            Odeslat
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileChatInterface;