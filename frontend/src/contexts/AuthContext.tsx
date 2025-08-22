import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserWithSchool } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserWithSchool | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<UserWithSchool>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserWithSchool | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount and keep it fresh
  useEffect(() => {
    let isMounted = true;
    let isRefreshing = false;
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        const cachedUser = authService.getCurrentUser();
        if (cachedUser) setUser(cachedUser);
        if (token) {
          // Fetch fresh profile
          const fresh = await authService.getProfile();
          if (isMounted) setUser(fresh);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.logout();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const refreshOnFocus = async () => {
      if (isRefreshing) return;
      try {
        const token = authService.getToken();
        if (!token) return;
        isRefreshing = true;
        const fresh = await authService.getProfile();
        if (isMounted) setUser(fresh);
      } catch (e) {
        // noop
      } finally {
        isRefreshing = false;
      }
    };

    initializeAuth();
    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void refreshOnFocus();
    });
    return () => {
      isMounted = false;
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const authResponse = await authService.login({ email, password });
    setUser(authResponse.user);
  };

  const register = async (userData: any) => {
    const authResponse = await authService.register(userData);
    setUser(authResponse.user);
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const updateUser = (userData: Partial<UserWithSchool>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 