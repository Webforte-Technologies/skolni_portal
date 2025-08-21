import { api } from './apiClient';
import { ChatRequest, ChatResponse, AIFeature, AIStats } from '../types';

export const assistantService = {
  // Send message to AI assistant
  sendMessage: async (message: string, sessionId?: string): Promise<ChatResponse> => {
    try {
      const requestData: ChatRequest = {
        message,
        session_id: sessionId
      };

      // Use longer timeout for AI chat (30 seconds)
      const response = await api.post<ChatResponse>('/ai/chat', requestData, {
        timeout: 30000
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Failed to send message');
    } catch (error: any) {
      console.error('Error sending message to AI assistant:', error);
      
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Odpověď AI asistenta trvala příliš dlouho. Zkuste to prosím znovu.');
      }
      
      throw error;
    }
  },

  // Get AI features
  getFeatures: async (): Promise<AIFeature[]> => {
    try {
      const response = await api.get<AIFeature[]>('/ai/features');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Failed to get AI features');
    } catch (error: any) {
      console.error('Error getting AI features:', error);
      throw error;
    }
  },

  // Get AI usage statistics
  getStats: async (): Promise<AIStats> => {
    try {
      const response = await api.get<AIStats>('/ai/stats');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Failed to get AI statistics');
    } catch (error: any) {
      console.error('Error getting AI statistics:', error);
      throw error;
    }
  },

  // Generate worksheet
  generateWorksheet: async (topic: string): Promise<{ worksheet: any; credits_used: number; credits_balance: number }> => {
    try {
      // Use longer timeout for worksheet generation (45 seconds)
      const response = await api.post<{ worksheet: any; credits_used: number; credits_balance: number }>('/ai/generate-worksheet', { topic }, {
        timeout: 45000
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error || 'Failed to generate worksheet');
    } catch (error: any) {
      console.error('Error generating worksheet:', error);
      
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Generování cvičení trvalo příliš dlouho. Zkuste to prosím znovu nebo zkraťte popis tématu.');
      }
      
      throw error;
    }
  }
}; 