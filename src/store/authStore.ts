import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/features/auth/types';
import { profileService } from '@/features/dashboard/services/profileService';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  
  setAuth: (user, token) => {
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    try {
      await profileService.logout();
    } catch (_) {}
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.log('Error clearing storage:', error);
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },  setLoading: (loading) => set({ isLoading: loading }),
  
  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      
      const token = await AsyncStorage.getItem('authToken');
      const userString = await AsyncStorage.getItem('user');
      
      if (token && userString) {
        const user = JSON.parse(userString);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ 
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false 
      });
    }
  },
}));