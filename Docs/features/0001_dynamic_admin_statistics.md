# Feature Plan: Dynamic Statistics and Dynamic Data in Admin Dashboard

## 1. Feature Analysis

The user wants to implement **dynamic statistics and dynamic data** in the Admin dashboard for EduAI-Asistent. This involves enhancing the existing admin dashboard with real-time, interactive data visualization and analytics that automatically update and provide actionable insights for platform administrators.

**Core Purpose:** Transform the static admin dashboard into a dynamic, data-driven command center that provides real-time insights into platform performance, user behavior, and business metrics.

**Target Users:** Platform administrators who need to monitor system health, track business metrics, and make data-driven decisions.

**Key User Stories:**
- As a platform admin, I want to see real-time system performance metrics so I can proactively address issues
- As a platform admin, I want to view dynamic user growth charts so I can track platform adoption
- As a platform admin, I want to monitor credit usage patterns in real-time so I can optimize pricing
- As a platform admin, I want to see live content creation statistics so I can understand platform engagement
- As a platform admin, I want to receive real-time alerts when critical metrics exceed thresholds
- As a platform admin, I want to manage the data of users, schools etc, without going into the database - CRUD

## 2. Technical Specification

**Affected Stack:** Frontend (React components), Backend (API endpoints), Database (analytics queries), Real-time updates (WebSocket/SSE)

**API Endpoints:**
- `GET /admin/analytics/dashboard` - Real-time dashboard metrics
- `GET /admin/analytics/users/real-time` - Live user statistics
- `GET /admin/analytics/credits/real-time` - Live credit usage
- `GET /admin/analytics/content/real-time` - Live content metrics
- `GET /admin/analytics/system/performance` - Enhanced system metrics
- `GET /admin/analytics/revenue/real-time` - Live revenue data
- `GET /admin/analytics/alerts` - Real-time system alerts
- `GET /admin/analytics/export` - Data export with filters

**Database Schema Changes:**
- New `analytics_cache` table for storing pre-computed metrics
- New `analytics_events` table for tracking real-time events
- New `system_alerts` table for threshold-based alerts
- Enhanced indexes on existing tables for faster analytics queries

**Real-time Update Mechanisms:**
- Server-Sent Events (SSE) for real-time data streaming
- WebSocket fallback for bi-directional communication
- Polling fallback for environments without SSE/WebSocket support

## 3. Implementation Phases

### Phase 1: Data Layer & Backend Analytics Engine (3-4 days)
1. **Create analytics cache tables** for storing pre-computed metrics
2. **Implement enhanced metrics middleware** with real-time data collection
3. **Create new admin analytics endpoints** with optimized database queries
4. **Implement real-time data streaming** using SSE with WebSocket fallback
5. **Add database indexes** for analytics query performance

### Phase 2A: Frontend Dynamic Components (2-3 days)
1. **Enhance existing chart components** with real-time data binding
2. **Create new dynamic dashboard widgets** for real-time metrics
3. **Implement auto-refresh mechanisms** with configurable intervals
4. **Add loading states and error handling** for real-time updates

### Phase 2B: Real-time Infrastructure (2-3 days)
1. **Implement SSE endpoints** for real-time data streaming
2. **Create WebSocket fallback** for bi-directional communication
3. **Add connection management** with automatic reconnection
4. **Implement data buffering** to handle connection interruptions

### Phase 3: Advanced Analytics & Alerting (2-3 days)
1. **Create threshold-based alerting system** for critical metrics
2. **Implement trend analysis** with predictive insights
3. **Add data export functionality** with multiple formats
4. **Create customizable dashboard layouts** for different admin roles

## 4. Detailed Technical Implementation

### 4.1 Backend Analytics Engine

**New Analytics Service (`backend/src/services/AnalyticsService.ts`):**
```typescript
interface AnalyticsService {
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getUserMetrics(timeRange: TimeRange): Promise<UserMetrics>;
  getCreditMetrics(timeRange: TimeRange): Promise<CreditMetrics>;
  getContentMetrics(timeRange: TimeRange): Promise<ContentMetrics>;
  getSystemMetrics(): Promise<SystemMetrics>;
  getRevenueMetrics(timeRange: TimeRange): Promise<RevenueMetrics>;
  getRealTimeAlerts(): Promise<SystemAlert[]>;
}
```

**Enhanced Metrics Middleware (`backend/src/middleware/enhanced-metrics.ts`):**
```typescript
interface EnhancedMetrics {
  system: SystemMetrics;
  performance: PerformanceMetrics;
  business: BusinessMetrics;
  user: UserMetrics;
  content: ContentMetrics;
  alerts: AlertMetrics;
}
```

**Real-time Data Streaming (`backend/src/services/RealTimeService.ts`):**
```typescript
interface RealTimeService {
  subscribeToMetrics(userId: string, metrics: string[]): void;
  broadcastMetrics(metrics: MetricsUpdate): void;
  handleConnection(connection: Connection): void;
  handleDisconnection(connectionId: string): void;
}
```

### 4.2 Database Schema Enhancements

**Analytics Cache Table:**
```sql
CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_key VARCHAR(255) NOT NULL,
  metric_value JSONB NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(metric_key)
);

CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);
CREATE INDEX idx_analytics_cache_key ON analytics_cache(metric_key);
```

**Analytics Events Table:**
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES users(id),
  session_id UUID,
  metadata JSONB
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_occurred ON analytics_events(occurred_at DESC);
```

**System Alerts Table:**
```sql
CREATE TABLE system_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type VARCHAR(100) NOT NULL,
  severity 'low' | 'medium' | 'high' | 'critical' NOT NULL,
  message TEXT NOT NULL,
  metric_value NUMERIC,
  threshold_value NUMERIC,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  metadata JSONB
);

CREATE INDEX idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX idx_system_alerts_triggered ON system_alerts(triggered_at DESC);
```

### 4.3 Frontend Dynamic Components

**Enhanced Admin Dashboard (`frontend/src/pages/admin/AdminDashboardPage.tsx`):**
- Replace static data with real-time data hooks
- Add auto-refresh controls with configurable intervals
- Implement real-time alert notifications
- Add interactive chart controls for time ranges

**New Dynamic Widgets (`frontend/src/components/admin/DynamicWidgets/`):**
- `RealTimeMetricsWidget.tsx` - Live KPI display
- `TrendChartWidget.tsx` - Interactive trend visualization
- `AlertPanelWidget.tsx` - Real-time system alerts
- `PerformanceMonitorWidget.tsx` - System performance tracking

**Real-time Data Hooks (`frontend/src/hooks/useRealTimeData.ts`):**
```typescript
interface UseRealTimeDataOptions {
  endpoint: string;
  refreshInterval?: number;
  autoRefresh?: boolean;
  onDataUpdate?: (data: any) => void;
  onError?: (error: Error) => void;
}

function useRealTimeData<T>(options: UseRealTimeDataOptions): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  setAutoRefresh: (enabled: boolean) => void;
}
```

### 4.4 Real-time Infrastructure

**SSE Implementation (`backend/src/routes/admin/analytics.ts`):**
```typescript
router.get('/analytics/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const clientId = uuid();
  clients.set(clientId, res);

  req.on('close', () => {
    clients.delete(clientId);
  });

  // Send initial data
  res.write(`data: ${JSON.stringify(getInitialMetrics())}\n\n`);
});
```

**WebSocket Fallback (`backend/src/services/WebSocketService.ts`):**
```typescript
interface WebSocketService {
  handleConnection(ws: WebSocket, userId: string): void;
  broadcastToUser(userId: string, data: any): void;
  broadcastToAll(data: any): void;
  handleDisconnection(userId: string): void;
}
```

### 4.5 Performance Optimizations

**Database Query Optimization:**
- Implement materialized views for complex analytics queries
- Add database connection pooling for analytics endpoints
- Use Redis caching for frequently accessed metrics
- Implement query result caching with TTL

**Frontend Performance:**
- Implement virtual scrolling for large data tables
- Use React.memo and useMemo for expensive calculations
- Implement progressive loading for chart data
- Add data compression for real-time updates

## 5. Integration Points

**Existing Components to Enhance:**
- `AdminDashboardPage.tsx` - Add real-time data binding
- `AnalyticsPage.tsx` - Replace mock data with live data
- `ContentAnalyticsPage.tsx` - Add real-time content metrics
- `RevenuePage.tsx` - Add live revenue tracking
- `SystemHealthPage.tsx` - Add real-time system monitoring

**New Components to Create:**
- `RealTimeMetricsProvider.tsx` - Context for real-time data
- `DynamicChart.tsx` - Enhanced chart with real-time updates
- `AlertNotification.tsx` - Real-time alert display
- `MetricsDashboard.tsx` - Configurable metrics dashboard

**Backend Services to Extend:**
- `metrics.ts` middleware - Enhanced metrics collection
- `admin.ts` routes - New analytics endpoints
- Database connection - Analytics query optimization
- Real-time streaming - SSE and WebSocket implementation

## 6. Configuration & Environment Variables

**New Environment Variables:**
```bash
# Analytics Configuration
ANALYTICS_ENABLED=true
ANALYTICS_CACHE_TTL=300
ANALYTICS_REAL_TIME_ENABLED=true
ANALYTICS_SSE_ENABLED=true
ANALYTICS_WEBSOCKET_ENABLED=true

# Performance Tuning
ANALYTICS_QUERY_TIMEOUT=30000
ANALYTICS_MAX_CONCURRENT_QUERIES=10
ANALYTICS_CACHE_SIZE=1000

# Alerting Configuration
ANALYTICS_ALERTS_ENABLED=true
ANALYTICS_ALERT_THRESHOLDS={"response_time": 1000, "error_rate": 0.05}
ANALYTICS_ALERT_NOTIFICATION_EMAIL=admin@eduai-asistent.cz
```

## 7. Testing Strategy

**Unit Tests:**
- Analytics service methods
- Real-time data hooks
- Dynamic widget components
- Metrics calculation functions

**Integration Tests:**
- Real-time data streaming
- Database query performance
- API endpoint response times
- Data consistency across endpoints

**End-to-End Tests:**
- Real-time dashboard updates
- Alert system functionality
- Data export operations
- Cross-browser compatibility

## 8. Deployment Considerations

**Database Migration:**
- Create new analytics tables
- Add performance indexes
- Migrate existing data if needed
- Set up monitoring for new tables

**Performance Monitoring:**
- Monitor analytics query performance
- Track real-time connection counts
- Measure data update latency
- Monitor memory usage for caching

**Rollback Plan:**
- Feature flags for real-time features
- Fallback to static data if needed
- Database rollback scripts
- Component degradation strategies
