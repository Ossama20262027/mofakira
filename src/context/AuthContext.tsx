import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { apiClient } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  quickAccess: () => Promise<void>;
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

export const DEFAULT_PRINCIPAL_USER: UserProfile = {
  id: 'user-principal-chamkha',
  name: 'الأستاذ أمحمد شامخة',
  email: 'chamkha2804@gmail.com',
  institutionName: 'متوسطة الشهيد زبانة',
  wilaya: 'الجزائر',
  academicYear: '2026/2027',
  settings: {
    darkMode: false,
    soundEnabled: true,
    alertSound: 'bell',
    alertAdvanceMinutes: 15,
    notificationsEnabled: true,
    autoSyncIntervalMinutes: 2,
    academicYear: '2026/2027',
  },
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const cached = apiClient.getLocalData();
      if (cached?.cachedUser) {
        return {
          ...DEFAULT_PRINCIPAL_USER,
          ...cached.cachedUser,
          name: 'الأستاذ أمحمد شامخة',
        };
      }
    } catch {}
    return DEFAULT_PRINCIPAL_USER;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication in background without blocking Dashboard
  useEffect(() => {
    async function initAuth() {
      try {
        if (!apiClient.getToken()) {
          const res = await apiClient.quickAccess();
          if (res?.user) {
            setUser({
              ...res.user,
              name: 'الأستاذ أمحمد شامخة',
            });
            return;
          }
        }
        const { user: serverUser } = await apiClient.getMe();
        if (serverUser) {
          setUser({
            ...serverUser,
            name: 'الأستاذ أمحمد شامخة',
          });
        }
      } catch (err: any) {
        // Retain default principal user smoothly
        setUser(DEFAULT_PRINCIPAL_USER);
      }
    }

    initAuth();
  }, []);

  const quickAccess = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.quickAccess();
      setUser(res.user);
      const cached = apiClient.getLocalData() || {};
      apiClient.saveLocalData({ ...cached, cachedUser: res.user });
    } catch (err: any) {
      // Fallback: offline or network issue fallback for the principal
      const fallbackUser: UserProfile = {
        id: 'user-principal-chamkha',
        name: 'الأستاذ شامخة أمحمد',
        email: 'chamkha2804@gmail.com',
        institutionName: 'متوسطة الشهيد زبانة',
        wilaya: 'الجزائر',
        academicYear: '2026/2027',
        settings: {
          darkMode: false,
          soundEnabled: true,
          alertSound: 'bell',
          alertAdvanceMinutes: 15,
          notificationsEnabled: true,
          autoSyncIntervalMinutes: 2,
          academicYear: '2026/2027',
        },
        createdAt: new Date().toISOString(),
      };
      apiClient.setToken('token-principal-chamkha-direct');
      setUser(fallbackUser);
      const cached = apiClient.getLocalData() || {};
      apiClient.saveLocalData({ ...cached, cachedUser: fallbackUser });
    } finally {
      setIsLoading(false);
    }
  };

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
    setUser(DEFAULT_PRINCIPAL_USER);
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
        isAuthenticated: true,
        isLoading,
        error,
        login,
        quickAccess,
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
