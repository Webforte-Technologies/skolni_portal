import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AnalyticsService } from './AnalyticsService';
import { webSocketService } from './WebSocketService';

export interface Connection {
  id: string;
  userId: string;
  response: Response;
  subscribedMetrics: string[];
  lastActivity: Date;
  isActive: boolean;
  reconnectToken?: string;
  buffer: MetricsUpdate[];
  maxBufferSize: number;
}

export interface MetricsUpdate {
  type: string;
  data: any;
  timestamp: string;
  messageId?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface ConnectionManager {
  connections: Map<string, Connection>;
  addConnection: (connection: Connection) => void;
  removeConnection: (connectionId: string) => void;
  getConnection: (connectionId: string) => Connection | undefined;
  getConnectionsByUser: (userId: string) => Connection[];
  broadcastToUser: (userId: string, data: MetricsUpdate) => void;
  broadcastToAll: (data: MetricsUpdate) => void;
  cleanupInactiveConnections: () => void;
  getConnectionStats: () => {
    totalConnections: number;
    activeConnections: number;
    connectionsByUser: Record<string, number>;
    totalBufferedMessages: number;
  };
}

class RealTimeConnectionManager implements ConnectionManager {
  public connections: Map<string, Connection> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private bufferFlushInterval: NodeJS.Timeout;

  constructor() {
    // Clean up inactive connections every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveConnections();
    }, 5 * 60 * 1000);

    // Flush buffered messages every 10 seconds
    this.bufferFlushInterval = setInterval(() => {
      this.flushBufferedMessages();
    }, 10 * 1000);
  }

  addConnection(connection: Connection): void {
    this.connections.set(connection.id, connection);
    
    // Send any buffered messages immediately
    this.flushConnectionBuffer(connection);
  }

  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.isActive = false;
      this.connections.delete(connectionId);
    }
  }

  getConnection(connectionId: string): Connection | undefined {
    return this.connections.get(connectionId);
  }

  getConnectionsByUser(userId: string): Connection[] {
    return Array.from(this.connections.values()).filter(
      conn => conn.userId === userId && conn.isActive
    );
  }

  broadcastToUser(userId: string, data: MetricsUpdate): void {
    const userConnections = this.getConnectionsByUser(userId);
    userConnections.forEach(connection => {
      this.sendToConnection(connection, data);
    });
  }

  broadcastToAll(data: MetricsUpdate): void {
    this.connections.forEach((connection) => {
      this.sendToConnection(connection, data);
    });
  }

  private sendToConnection(connection: Connection, data: MetricsUpdate): void {
    try {
      if (connection.isActive && connection.response.writableEnded === false) {
        // Try to send immediately
        connection.response.write(`data: ${JSON.stringify(data)}\n\n`);
        connection.lastActivity = new Date();
      } else {
        // Buffer the message if connection is not available
        this.bufferMessage(connection, data);
      }
    } catch (error) {
      console.error(`Failed to send data to connection ${connection.id}:`, error);
      // Buffer the message and mark connection for cleanup
      this.bufferMessage(connection, data);
      this.removeConnection(connection.id);
    }
  }

  private bufferMessage(connection: Connection, data: MetricsUpdate): void {
    // Add message to buffer if not full
    if (connection.buffer.length < connection.maxBufferSize) {
      connection.buffer.push(data);
    } else {
      // Remove oldest low-priority message if buffer is full
      const lowPriorityIndex = connection.buffer.findIndex(msg => msg.priority === 'low');
      if (lowPriorityIndex !== -1) {
        connection.buffer.splice(lowPriorityIndex, 1);
        connection.buffer.push(data);
      } else {
        // Buffer full, drop message
      }
    }
  }

  private flushConnectionBuffer(connection: Connection): void {
    if (connection.buffer.length === 0) return;

    try {
      if (connection.isActive && connection.response.writableEnded === false) {
        // Send all buffered messages
        connection.buffer.forEach(message => {
          connection.response.write(`data: ${JSON.stringify(message)}\n\n`);
        });
        
        connection.buffer = [];
        connection.lastActivity = new Date();
      }
    } catch (error) {
      console.error(`Failed to flush buffer for connection ${connection.id}:`, error);
      this.removeConnection(connection.id);
    }
  }

  private flushBufferedMessages(): void {
    this.connections.forEach((connection) => {
      if (connection.isActive && connection.buffer.length > 0) {
        this.flushConnectionBuffer(connection);
      }
    });
  }

  cleanupInactiveConnections(): void {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    this.connections.forEach((connection) => {
      const timeSinceLastActivity = now.getTime() - connection.lastActivity.getTime();
      
      if (timeSinceLastActivity > inactiveThreshold || !connection.isActive) {
        this.removeConnection(connection.id);
      }
    });
  }

  getConnectionStats(): {
    totalConnections: number;
    activeConnections: number;
    connectionsByUser: Record<string, number>;
    totalBufferedMessages: number;
  } {
    const connections = Array.from(this.connections.values());
    const activeConnections = connections.filter(conn => conn.isActive);
    
    const connectionsByUser: Record<string, number> = {};
    let totalBufferedMessages = 0;
    
    connections.forEach(conn => {
      connectionsByUser[conn.userId] = (connectionsByUser[conn.userId] || 0) + 1;
      totalBufferedMessages += conn.buffer.length;
    });

    return {
      totalConnections: connections.length,
      activeConnections: activeConnections.length,
      connectionsByUser,
      totalBufferedMessages
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.bufferFlushInterval) {
      clearInterval(this.bufferFlushInterval);
    }
    this.connections.clear();
  }
}

export class RealTimeService {
  private connectionManager: RealTimeConnectionManager;
  private metricsUpdateInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private reconnectTokens: Map<string, { userId: string; expiresAt: Date }> = new Map();

  constructor() {
    this.connectionManager = new RealTimeConnectionManager();
  }

  /**
   * Initialize the real-time service
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Start periodic metrics updates
    this.metricsUpdateInterval = setInterval(async () => {
      await this.broadcastMetricsUpdate();
    }, 30000); // Update every 30 seconds

    this.isInitialized = true;
  }

  /**
   * Handle new SSE connection
   */
  handleSSEConnection(req: Request, res: Response, userId: string, metrics: string[] = []): void {
    const connectionId = uuidv4();
    const reconnectToken = uuidv4();
    
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Reconnect-Token': reconnectToken
    });

    // Create connection object with buffer
    const connection: Connection = {
      id: connectionId,
      userId,
      response: res,
      subscribedMetrics: metrics,
      lastActivity: new Date(),
      isActive: true,
      reconnectToken,
      buffer: [],
      maxBufferSize: 100 // Buffer up to 100 messages
    };

    // Store reconnect token
    this.reconnectTokens.set(reconnectToken, {
      userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Add connection to manager
    this.connectionManager.addConnection(connection);

    // Send initial connection confirmation
    const initialData: MetricsUpdate = {
      type: 'connection_established',
      data: { 
        connectionId, 
        message: 'Real-time connection established',
        reconnectToken,
        userId
      },
      timestamp: new Date().toISOString(),
      priority: 'high'
    };
    
    res.write(`data: ${JSON.stringify(initialData)}\n\n`);

    // Send initial metrics data
    this.sendInitialMetrics(connection);

    // Handle connection close
    req.on('close', () => {
      this.connectionManager.removeConnection(connectionId);
      // Keep reconnect token for potential reconnection
    });

    // Handle connection error
    req.on('error', (error) => {
      console.error(`SSE connection error for ${connectionId}:`, error);
      this.connectionManager.removeConnection(connectionId);
    });

    // Keep connection alive with heartbeat
    const heartbeatInterval = setInterval(() => {
      if (connection.isActive && !res.writableEnded) {
        try {
          res.write(`: heartbeat\n\n`);
        } catch (error) {
          clearInterval(heartbeatInterval);
          this.connectionManager.removeConnection(connectionId);
        }
      } else {
        clearInterval(heartbeatInterval);
      }
    }, 30000); // Heartbeat every 30 seconds
  }

  /**
   * Handle reconnection attempt
   */
  handleReconnection(reconnectToken: string, res: Response): boolean {
    const tokenData = this.reconnectTokens.get(reconnectToken);
    
    if (!tokenData || tokenData.expiresAt < new Date()) {
      // Token expired or invalid
      this.reconnectTokens.delete(reconnectToken);
      return false;
    }

    // Find existing connection with this token
    const existingConnection = Array.from(this.connectionManager.connections.values())
      .find(conn => conn.reconnectToken === reconnectToken);

    if (existingConnection) {
      // Transfer buffer to new connection
      const newConnection: Connection = {
        id: uuidv4(),
        userId: tokenData.userId,
        response: res,
        subscribedMetrics: existingConnection.subscribedMetrics,
        lastActivity: new Date(),
        isActive: true,
        reconnectToken,
        buffer: [...existingConnection.buffer], // Copy buffer
        maxBufferSize: existingConnection.maxBufferSize
      };

      // Remove old connection and add new one
      this.connectionManager.removeConnection(existingConnection.id);
      this.connectionManager.addConnection(newConnection);

      // Send reconnection confirmation
      const reconnectionData: MetricsUpdate = {
        type: 'reconnection_successful',
        data: { 
          message: 'Reconnection successful',
          previousConnectionId: existingConnection.id,
          bufferedMessagesCount: existingConnection.buffer.length
        },
        timestamp: new Date().toISOString(),
        priority: 'high'
      };

      res.write(`data: ${JSON.stringify(reconnectionData)}\n\n`);
      return true;
    }

    return false;
  }

  /**
   * Send initial metrics data to a new connection
   */
  private async sendInitialMetrics(connection: Connection): Promise<void> {
    try {
      // Get current metrics based on subscribed metrics
      const metricsData: any = {};

      if (connection.subscribedMetrics.includes('dashboard') || connection.subscribedMetrics.length === 0) {
        metricsData.dashboard = await AnalyticsService.getDashboardMetrics();
      }

      if (connection.subscribedMetrics.includes('users') || connection.subscribedMetrics.length === 0) {
        metricsData.users = await AnalyticsService.getUserMetrics();
      }

      if (connection.subscribedMetrics.includes('credits') || connection.subscribedMetrics.length === 0) {
        metricsData.credits = await AnalyticsService.getCreditMetrics();
      }

      if (connection.subscribedMetrics.includes('content') || connection.subscribedMetrics.length === 0) {
        metricsData.content = await AnalyticsService.getContentMetrics();
      }

      if (connection.subscribedMetrics.includes('system') || connection.subscribedMetrics.length === 0) {
        metricsData.system = await AnalyticsService.getSystemMetrics();
      }

      if (connection.subscribedMetrics.includes('alerts') || connection.subscribedMetrics.length === 0) {
        metricsData.alerts = await AnalyticsService.getRealTimeAlerts();
      }

      const initialMetrics: MetricsUpdate = {
        type: 'initial_metrics',
        data: metricsData,
        timestamp: new Date().toISOString(),
        priority: 'high'
      };

      if (connection.isActive && !connection.response.writableEnded) {
        connection.response.write(`data: ${JSON.stringify(initialMetrics)}\n\n`);
      } else {
        // Buffer if connection not ready
        this.connectionManager.broadcastToUser(connection.userId, initialMetrics);
      }
    } catch (error) {
      console.error('Failed to send initial metrics:', error);
      
      const errorUpdate: MetricsUpdate = {
        type: 'error',
        data: { message: 'Failed to load initial metrics' },
        timestamp: new Date().toISOString(),
        priority: 'high'
      };

      if (connection.isActive && !connection.response.writableEnded) {
        connection.response.write(`data: ${JSON.stringify(errorUpdate)}\n\n`);
      } else {
        // Buffer if connection not ready
        this.connectionManager.broadcastToUser(connection.userId, errorUpdate);
      }
    }
  }

  /**
   * Broadcast metrics update to all connected clients
   */
  private async broadcastMetricsUpdate(): Promise<void> {
    try {
      // Get current metrics
      const metrics = await AnalyticsService.getAllMetrics();
      
      const update: MetricsUpdate = {
        type: 'metrics_update',
        data: metrics,
        timestamp: new Date().toISOString(),
        priority: 'normal'
      };

      // Broadcast to all connections (SSE)
      this.connectionManager.broadcastToAll(update);
      
      // Also broadcast via WebSocket
      webSocketService.broadcastToAll(update);
    } catch (error) {
      console.error('Failed to broadcast metrics update:', error);
    }
  }

  /**
   * Send specific metrics update to a user
   */
  async sendMetricsUpdateToUser(userId: string, metricsType: string, data: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): Promise<void> {
    const update: MetricsUpdate = {
      type: metricsType,
      data,
      timestamp: new Date().toISOString(),
      priority
    };

    // Send via SSE
    this.connectionManager.broadcastToUser(userId, update);
    
    // Also send via WebSocket
    webSocketService.broadcastToUser(userId, update);
  }

  /**
   * Send system alert to all connected clients
   */
  async broadcastSystemAlert(alert: any): Promise<void> {
    const update: MetricsUpdate = {
      type: 'system_alert',
      data: alert,
      timestamp: new Date().toISOString(),
      priority: 'high'
    };

    // Broadcast via SSE
    this.connectionManager.broadcastToAll(update);
    
    // Also broadcast via WebSocket
    webSocketService.broadcastToAll(update);
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    totalConnections: number;
    activeConnections: number;
    connectionsByUser: Record<string, number>;
    totalBufferedMessages: number;
    reconnectTokensCount: number;
  } {
    const sseStats = this.connectionManager.getConnectionStats();
    
    return {
      ...sseStats,
      reconnectTokensCount: this.reconnectTokens.size
    };
  }

  /**
   * Subscribe a user to specific metrics
   */
  subscribeToMetrics(userId: string, metrics: string[]): void {
    // Update SSE connections
    const userConnections = this.connectionManager.getConnectionsByUser(userId);
    userConnections.forEach(connection => {
      connection.subscribedMetrics = [...new Set([...connection.subscribedMetrics, ...metrics])];
    });
    
    // Also update WebSocket connections
    // Note: WebSocket service handles its own subscriptions
  }

  /**
   * Unsubscribe a user from specific metrics
   */
  unsubscribeFromMetrics(userId: string, metrics: string[]): void {
    // Update SSE connections
    const userConnections = this.connectionManager.getConnectionsByUser(userId);
    userConnections.forEach(connection => {
      connection.subscribedMetrics = connection.subscribedMetrics.filter(
        metric => !metrics.includes(metric)
      );
    });
    
    // Also update WebSocket connections
    // Note: WebSocket service handles its own subscriptions
  }

  /**
   * Handle connection disconnection
   */
  handleDisconnection(connectionId: string): void {
    this.connectionManager.removeConnection(connectionId);
  }


  /**
   * Cleanup and destroy the service
   */
  destroy(): void {
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
      this.metricsUpdateInterval = null;
    }
    
    if (this.connectionManager) {
      this.connectionManager.destroy();
    }

    // Clean up reconnect tokens
    this.reconnectTokens.clear();

    this.isInitialized = false;
  }
}

// Export singleton instance
export const realTimeService = new RealTimeService();
