import { api } from '@/api/axios';
import { Address, User } from '../../auth/types';

// ─── GET Profile Response ──────────────────────────────────────────────────────
export interface ProfileResponse {
  statusCode: string;
  message: string;
  result: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    address: Address;
    status: string;
    otpVerified: boolean;
  };
}

// ─── UPDATE Profile ────────────────────────────────────────────────────────────
export interface UpdateProfileRequest {
  name: string;
  phone: string;
  address: Address;
}

export interface UpdateProfileResponse {
  statusCode: string;
  message: string;
  result: {};
}

// ─── UPDATE Password ───────────────────────────────────────────────────────────
export interface UpdatePasswordRequest {
  password: string;
  confirmPassword: string;
  code: string;
}

export const profileService = {
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get('/v1/api/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const response = await api.put('/v1/api/profile/update', data);
    return response.data;
  },

  updatePassword: async (data: UpdatePasswordRequest): Promise<UpdateProfileResponse> => {
    const response = await api.put('/v1/api/profile/update-password', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.delete('/v1/api/profile/logout');
  },
};
