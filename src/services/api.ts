import { UserProfile, SyncPayload } from '../types';

const TOKEN_KEY = 'principal_assistant_jwt_token';
const OFFLINE_DATA_KEY = 'principal_assistant_local_data';

export const apiClient = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },

  async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ في الاتصال بالخادم');
      }

      return data;
    } catch (err: any) {
      // If network offline or fetch failed
      if (!navigator.onLine || err.message?.includes('Failed to fetch')) {
        throw new Error('OFFLINE');
      }
      throw err;
    }
  },

  // Auth methods
  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    institutionName: string;
    wilaya: string;
    academicYear: string;
    phone?: string;
  }): Promise<{ token: string; user: UserProfile }> {
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: UserProfile }> {
    return await this.request('/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch {}
    this.removeToken();
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<{ user: UserProfile }> {
    return await this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<any> {
    return await this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  async forgotPassword(email: string): Promise<{ recoveryCode?: string; message: string }> {
    return await this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<any> {
    return await this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
  },

  async deleteAccount(): Promise<any> {
    const res = await this.request('/api/auth/delete-account', {
      method: 'DELETE',
    });
    this.removeToken();
    return res;
  },

  // Data & Sync methods
  async fetchServerData(): Promise<any> {
    return await this.request('/api/data');
  },

  async syncWithServer(data: Partial<SyncPayload>): Promise<any> {
    return await this.request('/api/data/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Assistant & Voice NLP
  async queryAssistant(query: string): Promise<{ response: string; proposedAction?: any }> {
    return await this.request('/api/assistant', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  // Backup
  async exportBackup(): Promise<any> {
    return await this.request('/api/backup/export');
  },

  async importBackup(data: any): Promise<any> {
    return await this.request('/api/backup/import', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },

  // Local storage caching for offline resilience
  getLocalData(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(OFFLINE_DATA_KEY);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  saveLocalData(data: any) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  },
};
