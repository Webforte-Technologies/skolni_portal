# Dynamic Widgets for Admin Dashboard

This directory contains the dynamic, real-time widgets that enhance the admin dashboard with live data updates and interactive features.

## Overview

The dynamic widgets provide real-time monitoring and analytics capabilities for the EduAI-Asistent platform administrators. They automatically refresh data, display trends, and provide actionable insights.

## Components

### 1. RealTimeMetricsWidget

A widget that displays real-time KPI metrics with trend indicators and auto-refresh capabilities.

**Features:**
- Real-time data updates with configurable intervals
- Trend indicators (up/down/stable) with visual feedback
- Multiple data formats (number, currency, percentage, duration)
- Interactive metric cards with click handlers
- Auto-refresh status indicator
- Error handling with retry functionality

**Usage:**
```tsx
<RealTimeMetricsWidget
  title="Real-time Metriky"
  endpoint="/admin/analytics/dashboard/real-time"
  refreshInterval={30000}
  showTrend={true}
  showLastUpdated={true}
  metrics={[
    {
      id: 'active-users',
      title: 'Aktivní uživatelé',
      value: {
        current: 284,
        previous: 265,
        change: 19,
        changePercent: 7.2,
        trend: 'up'
      },
      format: 'number',
      icon: <Users className="w-5 h-5" />,
      color: 'green'
    }
  ]}
  onMetricClick={(metricId) => console.log('Clicked:', metricId)}
/>
```

### 2. TrendChartWidget

An interactive chart widget that displays time-series data with real-time updates.

**Features:**
- Multiple chart types (line, bar)
- Configurable time ranges (1h, 6h, 24h, 7d, 30d)
- Real-time data updates
- Interactive controls for chart type and time range
- Data export to CSV
- Responsive design with mobile optimization

**Usage:**
```tsx
<TrendChartWidget
  title="Využití kreditů v čase"
  endpoint="/admin/analytics/credits/real-time"
  refreshInterval={30000}
  chartType="line"
  timeRange="7d"
  showControls={true}
  showDownload={true}
  height={{ mobile: 200, tablet: 250, desktop: 300 }}
  transformData={(rawData) => {
    // Transform raw API data to chart format
    return rawData.map(item => ({
      timestamp: item.date,
      value: item.creditCount,
      label: new Date(item.date).toLocaleDateString('cs-CZ')
    }));
  }}
/>
```

### 3. AlertPanelWidget

A comprehensive alert management widget that displays system alerts with filtering and action capabilities.

**Features:**
- Real-time alert monitoring
- Severity-based filtering (critical, high, medium, low)
- Alert acknowledgment and resolution
- Status indicators and badges
- Configurable alert limits
- Interactive alert management

**Usage:**
```tsx
<AlertPanelWidget
  title="Systémová upozornění"
  endpoint="/admin/analytics/alerts"
  refreshInterval={15000}
  maxAlerts={10}
  showFilters={true}
  showActions={true}
  onAlertClick={(alert) => console.log('Alert:', alert)}
  onAcknowledge={(alertId) => acknowledgeAlert(alertId)}
  onResolve={(alertId) => resolveAlert(alertId)}
/>
```

### 4. PerformanceMonitorWidget

A comprehensive system performance monitoring widget with real-time metrics and alerts.

**Features:**
- Real-time performance metrics (CPU, Memory, Disk, Network)
- Threshold-based alerting
- Performance trend visualization
- System status overview
- Configurable monitoring intervals
- Interactive metric cards

**Usage:**
```tsx
<PerformanceMonitorWidget
  title="Monitorování výkonnosti"
  endpoint="/admin/analytics/system/performance"
  refreshInterval={10000}
  showCharts={true}
  showThresholds={true}
  showTrends={true}
  onMetricClick={(metric) => showMetricDetails(metric)}
  onAlert={(message, severity) => showAlert(message, severity)}
/>
```

## Core Hook: useRealTimeData

All widgets use the `useRealTimeData` hook for consistent data management:

**Features:**
- Automatic data fetching with configurable intervals
- Error handling with retry logic
- Request cancellation on unmount
- Data transformation support
- Loading and error states
- Manual refresh capability

**Usage:**
```tsx
const { data, loading, error, refresh, isAutoRefreshing, lastUpdated } = useRealTimeData({
  endpoint: '/admin/analytics/dashboard',
  refreshInterval: 30000,
  autoRefresh: true,
  transformData: (rawData) => transformToWidgetFormat(rawData),
  onDataUpdate: (data) => console.log('Data updated:', data),
  onError: (error) => console.error('Data error:', error)
});
```

## Integration with Admin Dashboard

The dynamic widgets are integrated into the main admin dashboard (`AdminDashboardPage.tsx`) to provide:

1. **Real-time KPI metrics** with trend indicators
2. **Enhanced performance monitoring** with visual charts
3. **Live system alerts** with management capabilities
4. **Interactive trend charts** for user growth and credit usage

## Demo Page

A dedicated demo page (`DynamicWidgetsDemoPage.tsx`) showcases all widgets with sample data:

- **Route:** `/admin/dynamic-widgets-demo`
- **Navigation:** Admin → Analytics → Dynamic Widgets Demo
- **Purpose:** Testing, demonstration, and development reference

## API Endpoints

The widgets expect the following API endpoints to be implemented:

- `/admin/analytics/dashboard/real-time` - Real-time dashboard metrics
- `/admin/analytics/credits/real-time` - Credit usage trends
- `/admin/analytics/users/real-time` - User growth data
- `/admin/analytics/system/performance` - System performance metrics
- `/admin/analytics/alerts` - System alerts

## Styling and Design

All widgets follow the EduAI-Asistent design system:
- **Colors:** Primary blue (#4A90E2), success green, warning yellow, error red
- **Typography:** Inter font family
- **Layout:** Responsive grid system with mobile-first approach
- **Components:** Consistent with existing UI components

## Performance Considerations

- **Auto-refresh intervals** are configurable per widget
- **Request cancellation** prevents memory leaks
- **Data transformation** happens client-side for efficiency
- **Responsive charts** optimize rendering for different screen sizes
- **Error boundaries** prevent widget failures from affecting the dashboard

## Future Enhancements

- **WebSocket support** for true real-time updates
- **Data caching** to reduce API calls
- **Customizable dashboards** with drag-and-drop layout
- **Advanced filtering** and search capabilities
- **Export functionality** for all widget data
- **Alert notifications** via email/SMS
- **Performance benchmarking** and historical comparisons
