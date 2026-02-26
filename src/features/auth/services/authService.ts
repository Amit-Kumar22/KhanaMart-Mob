import { api } from '@/api/axios';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest,
  SetPasswordRequest 
} from '../types';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/v1/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/v1/auth/register', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post('/api/v1/auth/forgotPassword', data);
    return response.data;
  },

  setPassword: async (data: SetPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post('/api/v1/auth/set-password', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.delete('/api/v1/auth/logout');
  },
};