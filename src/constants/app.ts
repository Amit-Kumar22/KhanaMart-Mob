export const APP_NAME = 'KhanaMart';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgotPassword',
    SET_PASSWORD: '/auth/set-password',
    LOGOUT: '/auth/logout',
  },
} as const;