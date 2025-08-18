import React from 'react';
import { useResponsive } from '../../hooks/useViewport';

interface FileExportProps {
  className?: string;
}

const FileExport: React.FC<FileExportProps> = ({ className = '' }) => {
  const { isDesktop } = useResponsive();

  if (!isDesktop) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <p>Export souborů je dostupný pouze na počítači</p>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900">Export souborů</h3>
      <div className="grid grid-cols-2 gap-4">
        <button className="p-4 border rounded-lg hover:bg-gray-50">
          <div className="text-center">
            <div className="text-2xl mb-2">📄</div>
            <p className="font-medium">PDF Export</p>
            <p className="text-sm text-gray-600">Exportovat jako PDF</p>
          </div>
        </button>
        <button className="p-4 border rounded-lg hover:bg-gray-50">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <p className="font-medium">Excel Export</p>
            <p className="text-sm text-gray-600">Exportovat jako Excel</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default FileExport;