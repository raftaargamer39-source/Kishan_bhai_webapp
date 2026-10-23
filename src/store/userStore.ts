import { create } from 'zustand';
import { UserProfile, UserRole, FarmerProfileData } from '../../shared/types';

export const DEFAULT_FARMER_USER: UserProfile = {
  id: 'usr_farmer_ramesh',
  fullName: 'Ramesh Patel',
  email: 'ramesh.patel@kishanbhai.in',
  phone: '+91 98251 44320',
  role: 'FARMER',
  village: 'Anandpur, Rajkot',
  state: 'Gujarat',
  verified: true,
  farmSizeAcres: 4.5,
  crops: ['Cotton (Bt)', 'Groundnut', 'Wheat'],
  preferredLanguage: 'hi',
  createdAt: '2025-01-15T00:00:00.000Z',
};

interface UserStore {
  currentUser: UserProfile | null;
  userRole: UserRole;
  farmerProfile: FarmerProfileData;
  setCurrentUser: (user: UserProfile | null) => void;
  setUserRole: (role: UserRole) => void;
  updateProfile: (profile: Partial<FarmerProfileData>) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: (() => {
    try {
      const saved = localStorage.getItem('kb_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) return parsed;
      }
      return DEFAULT_FARMER_USER;
    } catch {
      return DEFAULT_FARMER_USER;
    }
  })(),
  userRole: (() => {
    try {
      const savedUser = localStorage.getItem('kb_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.role) return parsed.role as UserRole;
      }
    } catch {}
    return 'FARMER' as UserRole;
  })(),
  farmerProfile: (() => {
    try {
      const saved = localStorage.getItem('kb_farmer_profile');
      return saved ? JSON.parse(saved) : {
        name: 'Ramesh Patel',
        mobile: '+91 98251 44320',
        state: 'Gujarat',
        district: 'Rajkot',
        village: 'Anandpur',
        farmSizeAcres: 4.5,
        soilType: 'Medium Black Cotton',
        mainCrop: 'Cotton (Bt) & Groundnut',
        preferredLanguage: 'hi',
      };
    } catch {
      return {
        name: 'Ramesh Patel',
        mobile: '+91 98251 44320',
        state: 'Gujarat',
        district: 'Rajkot',
        village: 'Anandpur',
        farmSizeAcres: 4.5,
        soilType: 'Medium Black Cotton',
        mainCrop: 'Cotton (Bt) & Groundnut',
        preferredLanguage: 'hi',
      };
    }
  })(),
  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem('kb_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kb_user');
    }
    set({ currentUser: user });
  },
  setUserRole: (role) => {
    set({ userRole: role });
  },
  updateProfile: (profile) => {
    set((state) => {
      const merged = { ...state.farmerProfile, ...profile };
      try {
        localStorage.setItem('kb_farmer_profile', JSON.stringify(merged));
      } catch {}
      return { farmerProfile: merged };
    });
  }
}));
