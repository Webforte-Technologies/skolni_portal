import { Response } from 'express';
import { SSEMessage } from '../../types/ai-generators';

/**
 * Send Server-Sent Event message to client
 */
export function sendSSEMessage(res: Response, message: SSEMessage): void {
  const data = `data: ${JSON.stringify(message)}\n\n`;
  res.write(data);
}

/**
 * Escape content for SSE transmission
 */
export function escapeSSEContent(content: string): string {
  return content
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Setup SSE headers for streaming response
 */
export function setupSSEHeaders(res: Response): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
}

/**
 * Send initial SSE connection message
 */
export function sendSSEConnectionMessage(res: Response): void {
  sendSSEMessage(res, { type: 'connection', message: 'SSE connection established' });
}

/**
 * Send error message via SSE
 */
export function sendSSEError(res: Response, message: string): void {
  sendSSEMessage(res, { type: 'error', message });
}

/**
 * Send progress update via SSE
 */
export function sendSSEProgress(res: Response, progress: number, message?: string): void {
  sendSSEMessage(res, { 
    type: 'progress', 
    progress: progress, 
    message: message || `Progress: ${progress}%` 
  });
}

/**
 * Send chunk of data via SSE
 */
export function sendSSEChunk(res: Response, content: string): void {
  sendSSEMessage(res, { type: 'chunk', content });
}

/**
 * Send completion message via SSE
 */
export function sendSSEComplete(res: Response, data?: any): void {
  sendSSEMessage(res, { type: 'end', ...data });
  res.end();
}
