import React, { useState, ReactNode } from 'react';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { ResponsiveTable, TableColumn } from './ResponsiveTable';
import { ResponsiveDataGrid, DataGridColumn, DataGridItem } from './ResponsiveDataGrid';
import { ResponsiveChart, ChartDataPoint } from './ResponsiveChart';

export type DisplayMode = 'table' | 'cards' | 'grid' | 'chart';

export interface ResponsiveDataDisplayProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  className?: string;
  title?: string;
  // Display options
  allowedModes?: DisplayMode[];
  defaultMode?: DisplayMode;
  // Chart options
  chartConfig?: {
    type: 'bar' | 'line' | 'pie' | 'doughnut';
    valueKey: keyof T;
    labelKey: keyof T;
    title?: string;
  };
  // Table options
  tableProps?: {
    emptyMessage?: string;
    loading?: boolean;
    onRowClick?: (item: T, index: number) => void;
    keyExtractor?: (item: T, index: number) => string;
  };
  // Grid options
  gridProps?: {
    mobileLayout?: 'cards' | 'list' | 'grid';
    tabletLayout?: 'table' | 'cards' | 'grid';
    desktopLayout?: 'table' | 'grid';
    gridColumns?: { mobile: number; tablet: number; desktop: number };
  };
  // Actions
  onModeChange?: (mode: DisplayMode) => void;
  actions?: React.ReactNode;
}

export const ResponsiveDataDisplay = <T extends Record<string, any>>({
  data,
  columns,
  className = '',
  title,
  allowedModes = ['table', 'cards', 'chart'],
  defaultMode = 'table',
  chartConfig,
  tableProps = {},
  gridProps = {},
  onModeChange,
  actions,
}: ResponsiveDataDisplayProps<T>) => {
  const { state } = useResponsive();
  const { isMobile, isTablet } = state;
  
  // Auto-select mode based on device if not explicitly set
  const getDefaultMode = (): DisplayMode => {
    if (isMobile && allowedModes.includes('cards')) return 'cards';
    if (isTablet && allowedModes.includes('table')) return 'table';
    return defaultMode;
  };

  const [currentMode, setCurrentMode] = useState<DisplayMode>(getDefaultMode());

  const handleModeChange = (mode: DisplayMode) => {
    setCurrentMode(mode);
    onModeChange?.(mode);
  };

  // Convert table columns to grid columns
  const gridColumns: DataGridColumn[] = columns.map(col => ({
    key: col.key,
    label: col.header,
    render: typeof col.accessor === 'function' ? 
      (_value, item) => (col.accessor as (item: T) => ReactNode)(item as unknown as T) : 
      (value) => value,
    align: 'left',
    mobileHidden: col.mobileHidden,
  }));

  // Convert data to grid format
  const gridData: DataGridItem[] = data.map((item, index) => ({
    id: tableProps.keyExtractor ? tableProps.keyExtractor(item, index) : index.toString(),
    ...item,
  }));

  // Convert data to chart format
  const chartData: ChartDataPoint[] = chartConfig ? data.map(item => ({
    label: String(item[chartConfig.labelKey]),
    value: Number(item[chartConfig.valueKey]) || 0,
  })) : [];

  // Mode selector buttons
  const ModeSelector = () => {
    if (allowedModes.length <= 1) return null;

    const modeIcons = {
      table: '📊',
      cards: '🗃️',
      grid: '⊞',
      chart: '📈',
    };

    const modeLabels = {
      table: 'Tabulka',
      cards: 'Karty',
      grid: 'Mřížka',
      chart: 'Graf',
    };

    return (
      <div className="flex flex-wrap gap-1 mb-4">
        {allowedModes.map(mode => (
          <button
            key={mode}
            onClick={() => handleModeChange(mode)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${isMobile ? 'px-2 py-1 text-xs' : ''}
              ${currentMode === mode
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }
            `}
          >
            <span className="mr-1">{modeIcons[mode]}</span>
            {!isMobile && modeLabels[mode]}
          </button>
        ))}
      </div>
    );
  };

  // Header with title and controls
  const Header = () => {
    if (!title && !actions && allowedModes.length <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {title && (
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
            {title}
          </h2>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <ModeSelector />
          {actions && (
            <div className="flex gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render current display mode
  const renderContent = () => {
    switch (currentMode) {
      case 'table':
        return (
          <ResponsiveTable
            data={data}
            columns={columns}
            {...tableProps}
          />
        );

      case 'cards':
      case 'grid':
        return (
          <ResponsiveDataGrid
            data={gridData}
            columns={gridColumns}
            onItemClick={tableProps.onRowClick ? (item) => {
              const index = data.findIndex(d => 
                tableProps.keyExtractor ? 
                tableProps.keyExtractor(d, data.indexOf(d)) === item.id :
                data.indexOf(d).toString() === item.id
              );
              if (index !== -1) {
                tableProps.onRowClick!(data[index], index);
              }
            } : undefined}
            loading={tableProps.loading}
            emptyMessage={tableProps.emptyMessage}
            {...gridProps}
            mobileLayout={currentMode === 'cards' ? 'cards' : gridProps.mobileLayout}
          />
        );

      case 'chart':
        if (!chartConfig) {
          return (
            <div className="text-center py-8 text-gray-500 dark:text-neutral-400">
              <div className="text-4xl mb-2">⚠️</div>
              <p>Konfigurace grafu není k dispozici</p>
            </div>
          );
        }
        return (
          <ResponsiveChart
            data={chartData}
            type={chartConfig.type}
            title={chartConfig.title}
            emptyMessage={tableProps.emptyMessage}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <Header />
      {renderContent()}
    </div>
  );
};