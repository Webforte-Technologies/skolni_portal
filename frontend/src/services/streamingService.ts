import { api } from './apiClient';

export interface StreamingResponse {
  type: 'start' | 'chunk' | 'end' | 'error';
  content?: string;
  message?: string;
  credits_used?: number;
  credits_balance?: number;
  session_id?: string;
  worksheet?: any;
}

export interface StreamingCallbacks {
  onStart?: () => void;
  onChunk?: (content: string) => void;
  onEnd?: (metadata: { credits_used: number; credits_balance: number; session_id: string }) => void;
  onError?: (message: string) => void;
}

export interface WorksheetStreamingCallbacks {
  onStart?: () => void;
  onChunk?: (content: string) => void;
  onEnd?: (metadata: { worksheet: any; credits_used: number; credits_balance: number }) => void;
  onError?: (message: string) => void;
}

export const streamingService = {
  // Send message with streaming response
  sendMessageStream: async (
    message: string, 
    sessionId: string | undefined,
    conversationId?: string,
    callbacks: StreamingCallbacks
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
        conversation_id: conversationId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamingResponse = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'start':
                  callbacks.onStart?.();
                  break;
                case 'chunk':
                  if (data.content) {
                    callbacks.onChunk?.(data.content);
                  }
                  break;
                case 'end':
                  if (data.credits_used !== undefined && data.credits_balance !== undefined && data.session_id !== undefined) {
                    callbacks.onEnd?.({
                      credits_used: data.credits_used,
                      credits_balance: data.credits_balance,
                      session_id: data.session_id
                    });
                  }
                  break;
                case 'error':
                  callbacks.onError?.(data.message || 'An error occurred');
                  break;
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  // Generate worksheet with streaming response
  generateWorksheetStream: async (
    topic: string,
    callbacks: WorksheetStreamingCallbacks
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/generate-worksheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate worksheet');
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamingResponse = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'start':
                  callbacks.onStart?.();
                  break;
                case 'chunk':
                  if (data.content) {
                    callbacks.onChunk?.(data.content);
                  }
                  break;
                case 'end':
                  if (data.worksheet && data.credits_used !== undefined && data.credits_balance !== undefined) {
                    callbacks.onEnd?.({
                      worksheet: data.worksheet,
                      credits_used: data.credits_used,
                      credits_balance: data.credits_balance
                    });
                  }
                  break;
                case 'error':
                  callbacks.onError?.(data.message || 'An error occurred');
                  break;
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}; 