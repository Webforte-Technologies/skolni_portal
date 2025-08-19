import React from 'react';
import { useResponsive } from '../../hooks/useViewport';

interface DocumentTemplatesProps {
  className?: string;
}

const DocumentTemplates: React.FC<DocumentTemplatesProps> = ({ className = '' }) => {
  const { isDesktop } = useResponsive();

  if (!isDesktop) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <p>Šablony dokumentů jsou dostupné pouze na počítači</p>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900">Šablony dokumentů</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="text-center">
            <div className="text-2xl mb-2">📝</div>
            <p className="font-medium">Test</p>
            <p className="text-sm text-gray-600">Šablona testu</p>
          </div>
        </div>
        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="text-center">
            <div className="text-2xl mb-2">📋</div>
            <p className="font-medium">Pracovní list</p>
            <p className="text-sm text-gray-600">Šablona pracovního listu</p>
          </div>
        </div>
        <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <p className="font-medium">Prezentace</p>
            <p className="text-sm text-gray-600">Šablona prezentace</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentTemplates;