import { ReactNode } from 'react';
import { useResponsive } from '../../contexts/ResponsiveContext';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  width?: string;
  mobileHidden?: boolean; // Hide column on mobile
  mobileLabel?: string; // Custom label for mobile card view
  mobileOrder?: number; // Order in mobile view
}

export interface ResponsiveTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (item: T, index: number) => void;
  keyExtractor?: (item: T, index: number) => string;
  // Mobile-specific props
  mobileCardView?: boolean; // Force card view on mobile
  mobileStackedView?: boolean; // Use stacked layout instead of horizontal scroll
  mobileCompactMode?: boolean; // Compact mobile display
}

export const ResponsiveTable = <T extends Record<string, any>>({
  data,
  columns,
  className = '',
  emptyMessage = 'Žádná data k zobrazení',
  loading = false,
  onRowClick,
  keyExtractor,
  mobileCardView = true,
  mobileStackedView = true,
  mobileCompactMode = false,
}: ResponsiveTableProps<T>) => {
  const { state } = useResponsive();
  const { isMobile, isTablet } = state;

  // Determine display mode
  const shouldUseCardView = isMobile && mobileCardView && mobileStackedView;
  const shouldUseHorizontalScroll = (isMobile || isTablet) && !shouldUseCardView;

  // Filter columns for mobile if needed
  const visibleColumns = shouldUseCardView 
    ? columns.filter(col => !col.mobileHidden)
    : columns;

  // Render cell content
  const renderCellContent = (item: T, column: TableColumn<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    return item[column.accessor] as ReactNode;
  };

  // Loading state
  if (loading) {
    return (
      <div className="animate-pulse">
        {shouldUseCardView ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-neutral-700 rounded-lg h-24"></div>
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
      <div className="text-center py-8 text-gray-500 dark:text-neutral-400">
        <div className="text-4xl mb-2">📊</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Mobile card view
  if (shouldUseCardView) {
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : index.toString();
          return (
            <div
              key={key}
              className={`
                bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700
                ${mobileCompactMode ? 'p-3' : 'p-4'}
                ${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors' : ''}
                shadow-sm
              `}
              onClick={() => onRowClick?.(item, index)}
            >
              <div className="space-y-2">
                {visibleColumns.map((column) => {
                  const content = renderCellContent(item, column);
                  const label = column.mobileLabel || column.header;
                  
                  return (
                    <div key={column.key} className="flex justify-between items-start">
                      <span className={`
                        text-sm font-medium text-gray-600 dark:text-neutral-400
                        ${mobileCompactMode ? 'text-xs' : ''}
                      `}>
                        {label}:
                      </span>
                      <span className={`
                        text-sm text-gray-900 dark:text-neutral-100 text-right flex-1 ml-2
                        ${mobileCompactMode ? 'text-xs' : ''}
                        ${column.className || ''}
                      `}>
                        {content}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Table view (desktop or horizontal scroll on mobile/tablet)
  return (
    <div className={`${shouldUseHorizontalScroll ? 'overflow-x-auto' : ''} ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
        <thead className="bg-gray-50 dark:bg-neutral-800">
          <tr>
            {visibleColumns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 
                  uppercase tracking-wider
                  ${isMobile ? 'px-3 py-2 text-xs' : ''}
                  ${column.headerClassName || ''}
                `}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-700">
          {data.map((item, index) => {
            const key = keyExtractor ? keyExtractor(item, index) : index.toString();
            return (
              <tr
                key={key}
                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors' : ''}
                `}
                onClick={() => onRowClick?.(item, index)}
              >
                {visibleColumns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-neutral-100
                      ${isMobile ? 'px-3 py-2 text-xs' : ''}
                      ${column.className || ''}
                    `}
                  >
                    {renderCellContent(item, column)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};