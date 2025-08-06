import { api } from './apiClient';
import { LoginRequest, RegisterRequest, AuthResponse, UserWithSchool } from '../types';

export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    if (response.data.success && response.data.data) {
      // Store token and user data in localStorage
      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Login failed');
  },

  // Register user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    
    if (response.data.success && response.data.data) {
      // Store token and user data in localStorage
      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Registration failed');
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current user from localStorage
  getCurrentUser: (): UserWithSchool | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  // Get user profile from API
  getProfile: async (): Promise<UserWithSchool> => {
    const response = await api.get<UserWithSchool>('/auth/profile');
    
    if (response.data.success && response.data.data) {
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to get profile');
  },

  // Update user profile
  updateProfile: async (updateData: Partial<UserWithSchool>): Promise<UserWithSchool> => {
    const response = await api.put<UserWithSchool>('/auth/profile', updateData);
    
    if (response.data.success && response.data.data) {
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to update profile');
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    const response = await api.put('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to change password');
    }
  },

  // Add demo credits
  addDemoCredits: async (): Promise<{ user: UserWithSchool; credits_added: number }> => {
    const response = await api.post('/auth/me/add-credits');
    
    if (response.data.success && response.data.data) {
      // Update stored user data with new credit balance
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to add demo credits');
  }
}; 