import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { apiClient } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    institutionName: string;
    wilaya: string;
    academicYear: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication check on startup
  useEffect(() => {
    async function initAuth() {
      const token = apiClient.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { user } = await apiClient.getMe();
        setUser(user);
      } catch (err: any) {
        if (err.message === 'OFFLINE') {
          // In offline mode, check cached user data
          const cached = apiClient.getLocalData();
          if (cached?.cachedUser) {
            setUser(cached.cachedUser);
          }
        } else {
          apiClient.removeToken();
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.login(email, pass);
      setUser(res.user);
      // Cache user for offline access
      const cached = apiClient.getLocalData() || {};
      apiClient.saveLocalData({ ...cached, cachedUser: res.user });
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    institutionName: string;
    wilaya: string;
    academicYear: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.register(payload);
      setUser(res.user);
      const cached = apiClient.getLocalData() || {};
      apiClient.saveLocalData({ ...cached, cachedUser: res.user });
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch {}
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const res = await apiClient.updateProfile(data);
      setUser(res.user);
      const cached = apiClient.getLocalData() || {};
      apiClient.saveLocalData({ ...cached, cachedUser: res.user });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
