# Analytics System - EduAI-Asistent Backend

This document describes the dynamic analytics system implemented for the admin dashboard, providing real-time insights into platform performance, user behavior, and business metrics.

## Overview

The analytics system consists of several components:

1. **Enhanced Metrics Middleware** - Collects performance and system metrics
2. **Analytics Service** - Provides comprehensive analytics data
3. **Real-Time Service** - Handles Server-Sent Events (SSE) for live updates
4. **Analytics Routes** - RESTful API endpoints for accessing analytics data
5. **Database Tables** - Stores analytics cache, events, and system alerts

## Features

### Real-Time Metrics
- **Dashboard Overview** - Total users, schools, revenue, and system health
- **User Analytics** - Growth trends, role distribution, activity patterns
- **Credit Analytics** - Usage patterns, revenue tracking, balance monitoring
- **Content Analytics** - Chat sessions, messages, generated files
- **System Performance** - Uptime, memory usage, database connections
- **Revenue Analytics** - Growth rates, plan distribution, projections

### Real-Time Updates
- **Server-Sent Events (SSE)** - Live data streaming
- **WebSocket Fallback** - Bi-directional communication support
- **Automatic Reconnection** - Handles connection interruptions
- **Configurable Subscriptions** - Subscribe to specific metrics

### Data Export
- **JSON Format** - Structured data export
- **CSV Format** - Spreadsheet-compatible export
- **Filtered Exports** - Time-range and metric-specific exports

## API Endpoints

### Core Analytics Endpoints

#### `GET /api/admin/analytics/dashboard`
Returns comprehensive dashboard metrics including overview, trends, and alerts.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_users": 150,
      "total_schools": 25,
      "total_revenue": 50000,
      "system_health": "healthy"
    },
    "trends": {
      "user_growth": 15,
      "revenue_growth": 2500,
      "content_growth": 45
    },
    "alerts": {
      "critical": 0,
      "unacknowledged": 2,
      "recent": [...]
    }
  }
}
```

#### `GET /api/admin/analytics/users/real-time`
Returns real-time user statistics with optional time range filtering.

**Query Parameters:**
- `timeRange` (optional): JSON string with start/end dates

#### `GET /api/admin/analytics/credits/real-time`
Returns credit usage and revenue metrics.

#### `GET /api/admin/analytics/content/real-time`
Returns content creation and engagement metrics.

#### `GET /api/admin/analytics/system/performance`
Returns system performance and health metrics.

#### `GET /api/admin/analytics/revenue/real-time`
Returns revenue analytics and projections.

#### `GET /api/admin/analytics/alerts`
Returns active system alerts.

### Real-Time Streaming

#### `GET /api/admin/analytics/stream`
Establishes Server-Sent Events connection for real-time updates.

**Query Parameters:**
- `metrics` (optional): Comma-separated list of metrics to subscribe to

**Example:**
```javascript
const eventSource = new EventSource('/api/admin/analytics/stream?metrics=dashboard,users,alerts');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received update:', data);
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
};
```

### Subscription Management

#### `POST /api/admin/analytics/subscribe`
Subscribe to specific metrics updates.

**Request Body:**
```json
{
  "metrics": ["dashboard", "users", "alerts"]
}
```

#### `POST /api/admin/analytics/unsubscribe`
Unsubscribe from specific metrics updates.

### Data Export

#### `GET /api/admin/analytics/export`
Export analytics data in various formats.

**Query Parameters:**
- `type`: Data type to export (users, credits, content, revenue, system, all)
- `format`: Export format (json, csv)
- `timeRange`: Time range for filtered export

**Example:**
```
GET /api/admin/analytics/export?type=users&format=csv&timeRange=2024-01-01_2024-12-31
```

## Database Schema

### Analytics Cache Table
```sql
CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_key VARCHAR(255) NOT NULL,
  metric_value JSONB NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(metric_key)
);
```

### Analytics Events Table
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
```

### System Alerts Table
```sql
CREATE TABLE system_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  metric_value NUMERIC,
  threshold_value NUMERIC,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  metadata JSONB
);
```

## Configuration

### Environment Variables
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

## Usage Examples

### Frontend Integration

#### Basic Metrics Display
```typescript
import { useEffect, useState } from 'react';

function DashboardMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setMetrics(data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading metrics...</div>;
  
  return (
    <div>
      <h2>Dashboard Overview</h2>
      <p>Total Users: {metrics.overview.total_users}</p>
      <p>Total Schools: {metrics.overview.total_schools}</p>
      <p>System Health: {metrics.overview.system_health}</p>
    </div>
  );
}
```

#### Real-Time Updates
```typescript
import { useEffect, useState } from 'react';

function RealTimeMetrics() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/admin/analytics/stream?metrics=dashboard,alerts&token=${encodeURIComponent(token)}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'metrics_update') {
        setMetrics(data.data);
      }
    };

    return () => eventSource.close();
  }, []);

  return (
    <div>
      <h2>Real-Time Metrics</h2>
      {metrics && (
        <div>
          <p>Active Users: {metrics.business.active_users_24h}</p>
          <p>Critical Alerts: {metrics.alerts.critical_alerts}</p>
        </div>
      )}
    </div>
  );
}
```

### Backend Integration

#### Custom Metrics Collection
```typescript
import { AnalyticsService } from '../services/AnalyticsService';

// Collect custom metrics
async function collectCustomMetrics() {
  try {
    const userMetrics = await AnalyticsService.getUserMetrics();
    const creditMetrics = await AnalyticsService.getCreditMetrics();
    
    // Process and store custom analytics
    console.log('User growth:', userMetrics.growth.monthly);
    console.log('Revenue:', creditMetrics.revenue.monthly);
  } catch (error) {
    console.error('Failed to collect metrics:', error);
  }
}
```

#### System Alert Creation
```typescript
import pool from '../database/connection';

async function createSystemAlert(type: string, severity: string, message: string) {
  try {
    await pool.query(`
      INSERT INTO system_alerts (alert_type, severity, message)
      VALUES ($1, $2, $3)
    `, [type, severity, message]);
  } catch (error) {
    console.error('Failed to create alert:', error);
  }
}

// Example usage
await createSystemAlert(
  'performance',
  'high',
  'Response time exceeded 2 seconds'
);
```

## Testing

### Run Analytics Tests
```bash
# Run all analytics tests
npm test -- analytics.test.ts

# Run specific test file
npm test -- --testNamePattern="should return dashboard metrics"
```

### Database Migration
```bash
# Run analytics tables migration
npm run db:migrate:analytics

# Check database schema
npm run db:check-schema
```

## Performance Considerations

### Database Optimization
- Analytics queries use optimized indexes
- Materialized views for complex aggregations
- Connection pooling for analytics endpoints
- Query result caching with TTL

### Real-Time Updates
- SSE connections are limited per user
- Automatic cleanup of inactive connections
- Heartbeat mechanism to maintain connections
- Fallback to polling for unsupported clients

### Caching Strategy
- Pre-computed metrics stored in cache
- Configurable cache expiration
- Cache invalidation on data updates
- Redis integration for distributed caching

## Security

### Authentication
- All analytics endpoints require platform admin role
- JWT token validation on every request
- Audit logging for all analytics access

### Data Privacy
- User data is aggregated and anonymized
- No personally identifiable information in metrics
- Access control based on user roles and permissions

## Monitoring and Maintenance

### Health Checks
- Database connection monitoring
- Real-time service status
- Connection count monitoring
- Error rate tracking

### Logging
- All analytics operations are logged
- Error tracking and alerting
- Performance metrics collection
- Audit trail for compliance

## Troubleshooting

### Common Issues

#### SSE Connection Fails
- Check CORS configuration
- Verify authentication token
- Check server logs for errors
- Ensure client supports EventSource

#### Metrics Not Updating
- Verify real-time service is initialized
- Check database connectivity
- Review subscription configuration
- Monitor connection statistics

#### High Memory Usage
- Check analytics cache size
- Monitor connection cleanup
- Review query performance
- Consider reducing update frequency

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=analytics:*
NODE_ENV=development
```

## Future Enhancements

### Planned Features
- **Advanced Alerting** - Machine learning-based anomaly detection
- **Custom Dashboards** - User-configurable metric displays
- **Data Retention Policies** - Automated data archival
- **API Rate Limiting** - Per-endpoint rate limiting
- **Metrics Aggregation** - Hourly/daily/monthly summaries

### Integration Opportunities
- **External Monitoring** - Prometheus, Grafana integration
- **Notification Systems** - Email, Slack, webhook alerts
- **Data Warehousing** - BigQuery, Snowflake integration
- **Business Intelligence** - Tableau, Power BI connectors

## Support

For questions or issues with the analytics system:

1. Check the application logs for error details
2. Review the database schema and migrations
3. Test individual endpoints for functionality
4. Verify authentication and authorization
5. Check real-time service initialization

## Contributing

When adding new analytics features:

1. Follow the existing code structure and patterns
2. Add comprehensive tests for new functionality
3. Update this documentation
4. Consider performance implications
5. Ensure proper error handling and logging
