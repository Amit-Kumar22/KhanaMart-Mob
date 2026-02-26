import { create } from 'zustand';
import { Address } from '../features/auth/types';
import { profileService } from '../features/dashboard/services/profileService';

export interface ProfileData {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  address: Address | null;
  status: string;
  otpVerified: boolean;
}

interface ProfileState {
  profile: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  setProfile: (profile: ProfileData) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await profileService.getProfile();
      set({ profile: res.result as ProfileData, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load profile', isLoading: false });
    }
  },

  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null, error: null }),
}));
