import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

export interface WebSocketConnection {
  id: string;
  userId: string;
  ws: WebSocket;
  subscribedMetrics: string[];
  lastActivity: Date;
  isActive: boolean;
  reconnectToken?: string;
  pingInterval?: NodeJS.Timeout;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  messageId?: string;
}

export interface WebSocketService {
  initialize(server: Server): void;
  handleConnection(ws: WebSocket, userId: string): void;
  broadcastToUser(userId: string, data: any): void;
  broadcastToAll(data: any): void;
  handleDisconnection(userId: string): void;
  getConnectionStats(): {
    totalConnections: number;
    activeConnections: number;
    connectionsByUser: Record<string, number>;
  };
  destroy(): void;
}

class WebSocketConnectionManager {
  public connections: Map<string, WebSocketConnection> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up inactive connections every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveConnections();
    }, 5 * 60 * 1000);
  }

  addConnection(connection: WebSocketConnection): void {
    this.connections.set(connection.id, connection);
  }

  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // Clean up ping interval
      if (connection.pingInterval) {
        clearInterval(connection.pingInterval);
      }
      
      connection.isActive = false;
      this.connections.delete(connectionId);
    }
  }

  getConnection(connectionId: string): WebSocketConnection | undefined {
    return this.connections.get(connectionId);
  }

  getConnectionsByUser(userId: string): WebSocketConnection[] {
    return Array.from(this.connections.values()).filter(
      conn => conn.userId === userId && conn.isActive
    );
  }

  broadcastToUser(userId: string, data: any): void {
    const userConnections = this.getConnectionsByUser(userId);
    userConnections.forEach(connection => {
      try {
        if (connection.isActive && connection.ws.readyState === WebSocket.OPEN) {
          const message: WebSocketMessage = {
            type: 'metrics_update',
            data,
            timestamp: new Date().toISOString(),
            messageId: uuidv4()
          };
          
          connection.ws.send(JSON.stringify(message));
          connection.lastActivity = new Date();
        }
      } catch (error) {
        console.error(`Failed to send data to WebSocket connection ${connection.id}:`, error);
        this.removeConnection(connection.id);
      }
    });
  }

  broadcastToAll(data: any): void {
    this.connections.forEach((connection, connectionId) => {
      try {
        if (connection.isActive && connection.ws.readyState === WebSocket.OPEN) {
          const message: WebSocketMessage = {
            type: 'metrics_update',
            data,
            timestamp: new Date().toISOString(),
            messageId: uuidv4()
          };
          
          connection.ws.send(JSON.stringify(message));
          connection.lastActivity = new Date();
        }
      } catch (error) {
        console.error(`Failed to send data to WebSocket connection ${connectionId}:`, error);
        this.removeConnection(connectionId);
      }
    });
  }

  cleanupInactiveConnections(): void {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    this.connections.forEach((connection, connectionId) => {
      const timeSinceLastActivity = now.getTime() - connection.lastActivity.getTime();
      
      if (timeSinceLastActivity > inactiveThreshold || !connection.isActive) {
        this.removeConnection(connectionId);
      }
    });
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.connections.clear();
  }
}

export class WebSocketService implements WebSocketService {
  private wss: WebSocketServer | null = null;
  private connectionManager: WebSocketConnectionManager;
  private isInitialized = false;

  constructor() {
    this.connectionManager = new WebSocketConnectionManager();
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server: Server): void {
    if (this.isInitialized) {
      return;
    }

    this.wss = new WebSocketServer({ 
      server,
      path: '/api/admin/analytics/websocket',
      clientTracking: false // We handle tracking ourselves
    });

    this.wss.on('connection', (ws: WebSocket, request) => {
      // Extract and validate authentication token
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const token = url.searchParams.get('token') || request.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      try {
        // Validate JWT token and extract userId
        const userId = this.validateTokenAndExtractUserId(token);
        if (!userId) {
          ws.close(1008, 'Invalid authentication token');
          return;
        }
        
        this.handleConnection(ws, userId);
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        ws.close(1008, 'Authentication failed');
      }
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });

    this.isInitialized = true;
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws: WebSocket, userId: string): void {
    const connectionId = uuidv4();
    
    // Create connection object
    const connection: WebSocketConnection = {
      id: connectionId,
      userId,
      ws,
      subscribedMetrics: [],
      lastActivity: new Date(),
      isActive: true
    };

    // Add connection to manager
    this.connectionManager.addConnection(connection);

    // Send initial connection confirmation
    const initialMessage: WebSocketMessage = {
      type: 'connection_established',
      data: { 
        connectionId, 
        message: 'WebSocket connection established',
        userId,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
    
    ws.send(JSON.stringify(initialMessage));

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleIncomingMessage(connection, message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        
        const errorMessage: WebSocketMessage = {
          type: 'error',
          data: { message: 'Invalid message format' },
          timestamp: new Date().toISOString()
        };
        
        ws.send(JSON.stringify(errorMessage));
      }
    });

    // Handle connection close
    ws.on('close', (code: number, reason: Buffer) => {
      console.log(`WebSocket connection ${connectionId} closed with code: ${code}, reason: ${reason.toString()}`);
      this.connectionManager.removeConnection(connectionId);
    });

    // Handle connection error
    ws.on('error', (error) => {
      console.error(`WebSocket connection error for ${connectionId}:`, error);
      this.connectionManager.removeConnection(connectionId);
    });

    // Handle pong response for ping
    ws.on('pong', () => {
      connection.lastActivity = new Date();
    });

    // Set up ping/pong for connection health monitoring
    const pingInterval = setInterval(() => {
      if (connection.isActive && ws.readyState === WebSocket.OPEN) {
        try {
          ws.ping();
        } catch (error) {
          clearInterval(pingInterval);
          this.connectionManager.removeConnection(connectionId);
        }
      } else {
        clearInterval(pingInterval);
      }
    }, 30000); // Ping every 30 seconds

    // Store ping interval reference for cleanup
    connection.pingInterval = pingInterval;
  }

  /**
   * Validate JWT token and extract userId
   */
  private validateTokenAndExtractUserId(token: string): string | null {
    try {
      const secret = process.env['JWT_SECRET'] || 'default-secret-change-in-production';
      const decoded = jwt.verify(token, secret) as { userId: string };
      
      // Validate userId format (should be a valid UUID)
      if (!decoded.userId || typeof decoded.userId !== 'string' || decoded.userId.length !== 36) {
        return null;
      }
      
      return decoded.userId;
    } catch (error) {
      console.error('JWT validation failed:', error);
      return null;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleIncomingMessage(connection: WebSocketConnection, message: WebSocketMessage): void {
    switch (message.type) {
      case 'subscribe':
        if (message.data && Array.isArray(message.data.metrics)) {
          connection.subscribedMetrics = [...new Set([...connection.subscribedMetrics, ...message.data.metrics])];
          
          const response: WebSocketMessage = {
            type: 'subscribed',
            data: { 
              message: 'Successfully subscribed to metrics',
              metrics: connection.subscribedMetrics 
            },
            timestamp: new Date().toISOString()
          };
          
          connection.ws.send(JSON.stringify(response));
        }
        break;

      case 'unsubscribe':
        if (message.data && Array.isArray(message.data.metrics)) {
          connection.subscribedMetrics = connection.subscribedMetrics.filter(
            metric => !message.data.metrics.includes(metric)
          );
          
          const response: WebSocketMessage = {
            type: 'unsubscribed',
            data: { 
              message: 'Successfully unsubscribed from metrics',
              metrics: connection.subscribedMetrics 
            },
            timestamp: new Date().toISOString()
          };
          
          connection.ws.send(JSON.stringify(response));
        }
        break;

      case 'ping':
        const pongMessage: WebSocketMessage = {
          type: 'pong',
          data: { timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString()
        };
        
        connection.ws.send(JSON.stringify(pongMessage));
        break;

      default:
        // Unknown message type - ignore
        break;
    }

    // Update last activity
    connection.lastActivity = new Date();
  }

  /**
   * Broadcast data to a specific user
   */
  broadcastToUser(userId: string, data: any): void {
    this.connectionManager.broadcastToUser(userId, data);
  }

  /**
   * Broadcast data to all connected clients
   */
  broadcastToAll(data: any): void {
    this.connectionManager.broadcastToAll(data);
  }

  /**
   * Handle connection disconnection
   */
  handleDisconnection(userId: string): void {
    const userConnections = this.connectionManager.getConnectionsByUser(userId);
    userConnections.forEach(connection => {
      this.connectionManager.removeConnection(connection.id);
    });
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    totalConnections: number;
    activeConnections: number;
    connectionsByUser: Record<string, number>;
  } {
    const connections = Array.from(this.connectionManager.connections.values());
    const activeConnections = connections.filter(conn => conn.isActive);
    
    const connectionsByUser: Record<string, number> = {};
    connections.forEach(conn => {
      connectionsByUser[conn.userId] = (connectionsByUser[conn.userId] || 0) + 1;
    });

    return {
      totalConnections: connections.length,
      activeConnections: activeConnections.length,
      connectionsByUser
    };
  }

  /**
   * Cleanup and destroy the service
   */
  destroy(): void {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    
    if (this.connectionManager) {
      this.connectionManager.destroy();
    }

    this.isInitialized = false;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
