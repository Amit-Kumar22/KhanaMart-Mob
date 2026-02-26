import { useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { useAuthStore } from '@/store/authStore';
import { LoginRequest, RegisterRequest, ForgotPasswordRequest, SetPasswordRequest } from '../types';

export const useLogin = () => {
  const setAuth = useAuthStore(state => state.setAuth);
  
  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      await AsyncStorage.setItem('authToken', data.accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.data));
      setAuth(data.data, data.accessToken);
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore(state => state.setAuth);
  
  return useMutation({
    mutationFn: authService.register,
    onSuccess: async (data) => {
      await AsyncStorage.setItem('authToken', data.accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.data));
      setAuth(data.data, data.accessToken);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
  });
};

export const useSetPassword = () => {
  return useMutation({
    mutationFn: authService.setPassword,
  });
};

export const useLogout = () => {
  const logout = useAuthStore(state => state.logout);
  
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: async () => {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      logout();
    },
  });
};