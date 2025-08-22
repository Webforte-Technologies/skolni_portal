# Real-Time Infrastructure Documentation

## Overview

This document describes the implementation of Phase 2B from the Dynamic Admin Statistics feature plan, which provides a robust real-time infrastructure for the EduAI-Asistent admin dashboard. The implementation includes Server-Sent Events (SSE), WebSocket fallback, connection management, and data buffering.

## Architecture

### Components

1. **RealTimeService** - Main service for SSE connections and real-time data management
2. **WebSocketService** - WebSocket server for bi-directional communication
3. **Connection Management** - Automatic connection cleanup and health monitoring
4. **Data Buffering** - Message buffering for connection interruptions
5. **Reconnection Handling** - Automatic reconnection with token-based recovery

### Technology Stack

- **SSE (Server-Sent Events)** - Primary real-time communication method
- **WebSocket** - Fallback for bi-directional communication
- **Express.js** - HTTP server and routing
- **TypeScript** - Type-safe implementation
- **UUID** - Unique connection and token generation

## API Endpoints

### SSE Endpoints

#### `GET /api/admin/analytics/stream`
Establishes a Server-Sent Events connection for real-time data streaming.

**Query Parameters:**
- `metrics` (optional): Comma-separated list of metrics to subscribe to

**Response Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Reconnect-Token: <uuid>
```

**Event Types:**
- `connection_established` - Initial connection confirmation
- `initial_metrics` - First data payload
- `metrics_update` - Periodic updates
- `system_alert` - System notifications
- `heartbeat` - Connection keep-alive

#### `GET /api/admin/analytics/reconnect`
Handles SSE reconnection attempts using stored tokens.

**Query Parameters:**
- `token` (required): Reconnection token from previous connection

### WebSocket Endpoints

#### `GET /api/admin/analytics/websocket-info`
Returns WebSocket connection information and configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "endpoint": "/api/admin/analytics/websocket",
    "protocols": ["ws", "wss"],
    "messageTypes": ["subscribe", "unsubscribe", "ping"],
    "features": [
      "Automatic reconnection",
      "Message buffering",
      "Priority-based message handling",
      "Connection health monitoring"
    ]
  }
}
```

### Connection Management Endpoints

#### `GET /api/admin/analytics/connection-stats`
Returns combined statistics for both SSE and WebSocket connections.

#### `GET /api/admin/analytics/websocket-stats`
Returns WebSocket-specific connection statistics.

#### `POST /api/admin/analytics/subscribe`
Subscribes a user to specific metrics updates.

**Request Body:**
```json
{
  "metrics": ["dashboard", "users", "credits"]
}
```

#### `POST /api/admin/analytics/unsubscribe`
Unsubscribes a user from specific metrics updates.

#### `POST /api/admin/analytics/test-connection`
Tests real-time connection health.

**Request Body:**
```json
{
  "connectionType": "sse" // or "websocket"
}
```

## Real-Time Service Features

### Connection Management

- **Automatic Cleanup**: Inactive connections are automatically removed after 30 minutes
- **Health Monitoring**: Ping/pong mechanism for connection health
- **User Tracking**: Connections are tracked per user for targeted messaging

### Data Buffering

- **Message Buffer**: Up to 100 messages per connection
- **Priority Handling**: High-priority messages replace low-priority ones when buffer is full
- **Automatic Flushing**: Buffered messages are sent when connection is restored

### Reconnection Support

- **Token-Based Recovery**: Each connection gets a unique reconnection token
- **Buffer Preservation**: Messages are preserved during reconnection
- **Automatic Transfer**: Old connection state is transferred to new connection

### Message Priorities

- **Critical**: System alerts and errors
- **High**: Connection confirmations and initial data
- **Normal**: Regular metrics updates
- **Low**: Non-essential updates (can be dropped if buffer is full)

## WebSocket Service Features

### Connection Handling

- **Path-Based Routing**: WebSocket server mounted at `/api/admin/analytics/websocket`
- **User Authentication**: User ID extracted from query parameters
- **Message Validation**: Incoming messages are validated and parsed

### Message Types

#### Subscribe
```json
{
  "type": "subscribe",
  "data": {
    "metrics": ["dashboard", "users"]
  }
}
```

#### Unsubscribe
```json
{
  "type": "unsubscribe",
  "data": {
    "metrics": ["dashboard"]
  }
}
```

#### Ping
```json
{
  "type": "ping"
}
```

### Health Monitoring

- **Ping/Pong**: Automatic ping every 30 seconds
- **Connection State**: Tracks WebSocket readyState
- **Error Handling**: Automatic cleanup on connection errors

## Configuration

### Environment Variables

```bash
# Real-time Configuration
REAL_TIME_ENABLED=true
REAL_TIME_UPDATE_INTERVAL=30000
REAL_TIME_HEARTBEAT_INTERVAL=30000
REAL_TIME_CLEANUP_INTERVAL=300000
REAL_TIME_BUFFER_FLUSH_INTERVAL=10000

# WebSocket Configuration
WEBSOCKET_ENABLED=true
WEBSOCKET_PATH=/api/admin/analytics/websocket
WEBSOCKET_PING_INTERVAL=30000

# Connection Limits
MAX_CONNECTIONS_PER_USER=5
MAX_BUFFER_SIZE=100
CONNECTION_TIMEOUT=1800000
```

### Service Initialization

```typescript
// Initialize real-time service
realTimeService.initialize();

// Initialize WebSocket service with HTTP server
webSocketService.initialize(server);
```

## Usage Examples

### Frontend SSE Connection

```typescript
const eventSource = new EventSource('/api/admin/analytics/stream?metrics=dashboard,users');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'connection_established':
      console.log('Connected with token:', data.data.reconnectToken);
      break;
    case 'metrics_update':
      updateDashboard(data.data);
      break;
    case 'system_alert':
      showAlert(data.data);
      break;
  }
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  // Implement reconnection logic
};
```

### Frontend WebSocket Connection

```typescript
const ws = new WebSocket('ws://localhost:3001/api/admin/analytics/websocket?userId=user123');

ws.onopen = () => {
  // Subscribe to metrics
  ws.send(JSON.stringify({
    type: 'subscribe',
    data: { metrics: ['dashboard', 'users'] }
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'connection_established':
      console.log('WebSocket connected:', message.data.connectionId);
      break;
    case 'metrics_update':
      updateDashboard(message.data);
      break;
    case 'subscribed':
      console.log('Subscribed to:', message.data.metrics);
      break;
  }
};
```

### Reconnection Logic

```typescript
let reconnectToken: string | null = null;

function connectSSE() {
  const eventSource = new EventSource('/api/admin/analytics/stream');
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'connection_established') {
      reconnectToken = data.data.reconnectToken;
    }
  };
  
  eventSource.onerror = () => {
    eventSource.close();
    
    // Attempt reconnection after delay
    setTimeout(() => {
      if (reconnectToken) {
        const reconnectEventSource = new EventSource(
          `/api/admin/analytics/reconnect?token=${reconnectToken}`
        );
        // Handle reconnection events...
      }
    }, 1000);
  };
}
```

## Testing

### Running Tests

```bash
# Run all real-time infrastructure tests
npm test -- real-time-infrastructure.test.ts

# Run specific test suite
npm test -- --testNamePattern="SSE Endpoints"
```

### Test Coverage

The test suite covers:
- SSE endpoint functionality
- WebSocket service operations
- Connection management
- Subscription handling
- Error scenarios
- Performance characteristics

## Monitoring and Debugging

### Connection Statistics

Monitor active connections and performance:

```bash
# Get connection stats
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/admin/analytics/connection-stats

# Get WebSocket stats
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/admin/analytics/websocket-stats
```

### Logging

The services provide comprehensive logging:
- Connection establishment/removal
- Message buffering and flushing
- Reconnection attempts
- Error conditions

### Performance Metrics

- Connection count per user
- Buffer utilization
- Message delivery latency
- Reconnection success rate

## Security Considerations

### Authentication

- All endpoints require valid JWT tokens
- User role verification (platform_admin required)
- Audit logging for all operations

### Rate Limiting

- Express rate limiting middleware applied
- Connection limits per user
- Message frequency controls

### Data Validation

- Input sanitization for all endpoints
- Message type validation
- User ID verification

## Troubleshooting

### Common Issues

1. **Connection Drops**: Check network stability and implement reconnection logic
2. **Buffer Overflow**: Monitor buffer usage and adjust limits
3. **Memory Leaks**: Ensure proper cleanup of inactive connections
4. **Performance Issues**: Monitor connection count and message frequency

### Debug Commands

```bash
# Test connection health
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"connectionType": "sse"}' \
  http://localhost:3001/api/admin/analytics/test-connection

# Check service status
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/health
```

## Future Enhancements

### Planned Features

1. **Redis Integration**: Distributed connection management
2. **Message Persistence**: Long-term message storage
3. **Advanced Filtering**: Complex metric subscription patterns
4. **Load Balancing**: Multiple server support
5. **Metrics Aggregation**: Real-time data processing

### Scalability Improvements

1. **Connection Pooling**: Efficient resource management
2. **Message Queuing**: Asynchronous message processing
3. **Horizontal Scaling**: Multi-instance deployment
4. **Caching Layer**: Performance optimization

## Conclusion

The real-time infrastructure provides a robust foundation for dynamic admin statistics with:

- **Reliability**: Automatic reconnection and data buffering
- **Performance**: Efficient connection management and message delivery
- **Scalability**: Support for multiple connection types and users
- **Maintainability**: Clean architecture and comprehensive testing

This implementation successfully addresses all requirements from Phase 2B of the Dynamic Admin Statistics feature plan.
