export const COLORS = {
  primary: '#16A34A',
  primaryDark: '#064E3B',
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
  },
  red: {
    500: '#EF4444',
  },
  blue: {
    50: '#EFF6FF',
    600: '#2563EB',
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const FONT_SIZES = {
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '4xl': 36,
} as const;