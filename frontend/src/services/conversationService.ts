import { api } from './apiClient';
import { Conversation, ConversationWithMessages } from '../types';

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface CreateConversationRequest {
  title: string;
  assistant_type?: string;
}

export const conversationService = {
  // Get all conversations for the authenticated user
  getConversations: async (limit = 50, offset = 0): Promise<ConversationsResponse> => {
    const response = await api.get<ConversationsResponse>(`/conversations?limit=${limit}&offset=${offset}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to get conversations');
  },

  // Get a specific conversation with messages
  getConversation: async (conversationId: string): Promise<ConversationWithMessages> => {
    const response = await api.get<ConversationWithMessages>(`/conversations/${conversationId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to get conversation');
  },

  // Create a new conversation
  createConversation: async (conversationData: CreateConversationRequest): Promise<Conversation> => {
    const response = await api.post<Conversation>('/conversations', conversationData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to create conversation');
  },

  // Update conversation title
  updateConversationTitle: async (conversationId: string, title: string): Promise<Conversation> => {
    const response = await api.put<Conversation>(`/conversations/${conversationId}`, { title });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to update conversation');
  },

  // Delete a conversation
  deleteConversation: async (conversationId: string): Promise<void> => {
    const response = await api.delete(`/conversations/${conversationId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete conversation');
    }
  },

  // Add a message to a conversation
  addMessage: async (conversationId: string, role: 'user' | 'assistant', content: string): Promise<any> => {
    const response = await api.post(`/conversations/${conversationId}/messages`, {
      role,
      content
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to add message');
  }
}; 