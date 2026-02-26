export interface Address {
  buildingName: string;
  streetName: string;
  landmark: string;
  district: string;
  city: string;
  pin: string;
  stateName: string;
  latitude: string;
  longitude: string;
  type: 'HOME' | 'OFFICE' | 'OTHER';
}

export interface User {
  id?: number;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  address?: Address;
  status?: string;
  otpVerified?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  data: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface SetPasswordRequest {
  token: string;
  password: string;
}