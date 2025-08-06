import { api } from './apiClient';
import { ChatRequest, ChatResponse, AIFeature, AIStats } from '../types';

export const assistantService = {
  // Send message to AI assistant
  sendMessage: async (message: string, sessionId?: string): Promise<ChatResponse> => {
    const requestData: ChatRequest = {
      message,
      session_id: sessionId
    };

    const response = await api.post<ChatResponse>('/ai/chat', requestData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to send message');
  },

  // Get AI features
  getFeatures: async (): Promise<AIFeature[]> => {
    const response = await api.get<AIFeature[]>('/ai/features');
    
    if (response.data.success && response.data.data) {
      return response.data.data.features;
    }
    
    throw new Error(response.data.error || 'Failed to get AI features');
  },

  // Get AI usage statistics
  getStats: async (): Promise<AIStats> => {
    const response = await api.get<AIStats>('/ai/stats');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to get AI statistics');
  },

  // Generate worksheet
  generateWorksheet: async (topic: string): Promise<{ worksheet: any; credits_used: number; credits_balance: number }> => {
    const response = await api.post('/ai/generate-worksheet', { topic });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to generate worksheet');
  }
}; 