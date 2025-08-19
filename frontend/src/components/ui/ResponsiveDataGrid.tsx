import React, { ReactNode } from 'react';
import { useResponsive } from '../../contexts/ResponsiveContext';

export interface DataGridItem {
  id: string;
  [key: string]: any;
}

export interface DataGridColumn {
  key: string;
  label: string;
  render?: (value: any, item: DataGridItem) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  mobileHidden?: boolean;
  mobileOrder?: number; // Order in mobile view
}

export interface ResponsiveDataGridProps {
  data: DataGridItem[];
  columns: DataGridColumn[];
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  onItemClick?: (item: DataGridItem) => void;
  // Layout options
  mobileLayout?: 'cards' | 'list' | 'grid';
  tabletLayout?: 'table' | 'cards' | 'grid';
  desktopLayout?: 'table' | 'grid';
  // Grid specific options
  gridColumns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  // Card options
  cardCompact?: boolean;
  showCardBorders?: boolean;
}

export const ResponsiveDataGrid: React.FC<ResponsiveDataGridProps> = ({
  data,
  columns,
  className = '',
  emptyMessage = 'Žádná data k zobrazení',
  loading = false,
  onItemClick,
  mobileLayout = 'cards',
  tabletLayout = 'table',
  desktopLayout = 'table',
  gridColumns = { mobile: 1, tablet: 2, desktop: 3 },
  cardCompact = false,
  showCardBorders = true,
}) => {
  const { state } = useResponsive();
  const { isMobile, isTablet } = state;

  // Determine current layout
  const currentLayout = isMobile ? mobileLayout : isTablet ? tabletLayout : desktopLayout;

  // Sort columns for mobile view
  const sortedColumns = [...columns].sort((a, b) => {
    const orderA = a.mobileOrder ?? 999;
    const orderB = b.mobileOrder ?? 999;
    return orderA - orderB;
  });

  // Filter visible columns for current layout
  const visibleColumns = currentLayout === 'cards' && isMobile
    ? sortedColumns.filter(col => !col.mobileHidden)
    : columns;

  // Render cell content
  const renderCellContent = (item: DataGridItem, column: DataGridColumn) => {
    const value = item[column.key];
    return column.render ? column.render(value, item) : value;
  };

  // Loading state
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        {currentLayout === 'cards' ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-neutral-700 rounded-lg h-24"></div>
            ))}
          </div>
        ) : currentLayout === 'grid' ? (
          <div className={`grid gap-4 ${
            isMobile ? `grid-cols-${gridColumns.mobile}` :
            isTablet ? `grid-cols-${gridColumns.tablet}` :
            `grid-cols-${gridColumns.desktop}`
          }`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-neutral-700 rounded-lg h-32"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="bg-gray-200 dark:bg-neutral-700 rounded h-10"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-neutral-800 rounded h-8"></div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-neutral-400 ${className}`}>
        <div className="text-4xl mb-2">📊</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Cards layout
  if (currentLayout === 'cards') {
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((item) => (
          <div
            key={item.id}
            className={`
              ${showCardBorders ? 'border border-gray-200 dark:border-neutral-700' : ''}
              bg-white dark:bg-neutral-800 rounded-lg
              ${cardCompact ? 'p-3' : 'p-4'}
              ${onItemClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors' : ''}
              shadow-sm
            `}
            onClick={() => onItemClick?.(item)}
          >
            <div className="space-y-2">
              {visibleColumns.map((column) => {
                const content = renderCellContent(item, column);
                
                return (
                  <div key={column.key} className="flex justify-between items-start">
                    <span className={`
                      text-sm font-medium text-gray-600 dark:text-neutral-400
                      ${cardCompact ? 'text-xs' : ''}
                    `}>
                      {column.label}:
                    </span>
                    <span className={`
                      text-sm text-gray-900 dark:text-neutral-100 text-right flex-1 ml-2
                      ${cardCompact ? 'text-xs' : ''}
                      ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                    `}>
                      {content}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Grid layout
  if (currentLayout === 'grid') {
    return (
      <div className={`
        grid gap-4 ${className}
        ${isMobile ? `grid-cols-${gridColumns.mobile}` :
          isTablet ? `grid-cols-${gridColumns.tablet}` :
          `grid-cols-${gridColumns.desktop}`}
      `}>
        {data.map((item) => (
          <div
            key={item.id}
            className={`
              ${showCardBorders ? 'border border-gray-200 dark:border-neutral-700' : ''}
              bg-white dark:bg-neutral-800 rounded-lg p-4
              ${onItemClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors' : ''}
              shadow-sm
            `}
            onClick={() => onItemClick?.(item)}
          >
            {/* Primary content - first column */}
            <div className="mb-2">
              <div className="font-medium text-gray-900 dark:text-neutral-100">
                {renderCellContent(item, visibleColumns[0])}
              </div>
            </div>
            
            {/* Secondary content - remaining columns */}
            <div className="space-y-1">
              {visibleColumns.slice(1).map((column) => (
                <div key={column.key} className="text-sm text-gray-600 dark:text-neutral-400">
                  <span className="font-medium">{column.label}:</span>{' '}
                  {renderCellContent(item, column)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Table layout
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
        <thead className="bg-gray-50 dark:bg-neutral-800">
          <tr>
            {visibleColumns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-6 py-3 text-xs font-medium text-gray-500 dark:text-neutral-400 
                  uppercase tracking-wider
                  ${isMobile ? 'px-3 py-2' : ''}
                  ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                `}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-700">
          {data.map((item) => (
            <tr
              key={item.id}
              className={`
                ${onItemClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors' : ''}
              `}
              onClick={() => onItemClick?.(item)}
            >
              {visibleColumns.map((column) => (
                <td
                  key={column.key}
                  className={`
                    px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-neutral-100
                    ${isMobile ? 'px-3 py-2 text-xs' : ''}
                    ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                  `}
                >
                  {renderCellContent(item, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};