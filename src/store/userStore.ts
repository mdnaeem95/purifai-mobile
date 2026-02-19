import { create } from 'zustand';
import { User, AuthState } from '../types/user';
import { saveData, loadData } from '../services/storage';

interface UserStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  replayOnboarding: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    // TODO: For now, this is a mock login. Replace with actual authentication later
    const user: User = {
      id: '1',
      name: 'Muhammad Naeem Bin Sani',
      email,
      createdAt: new Date().toISOString(),
      hasCompletedOnboarding: true,
    };

    await saveData('user', user);
    set({ user, isAuthenticated: true });
  },

  register: async (name: string, email: string, password: string) => {
    // TODO: For now, this is a mock registration. Replace with actual authentication later
    const user: User = {
      id: Date.now().toString(),
      name,
      email,
      createdAt: new Date().toISOString(),
      hasCompletedOnboarding: false,
    };

    await saveData('user', user);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await saveData('user', null);
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const user = await loadData<User>('user');
    if (user) {
      // Backward compatibility: existing users without the field skip onboarding
      if (user.hasCompletedOnboarding === undefined) {
        user.hasCompletedOnboarding = true;
      }
      set({ user, isAuthenticated: true });
    }
  },

  completeOnboarding: async () => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, hasCompletedOnboarding: true };
      saveData('user', updatedUser);
      return { user: updatedUser };
    });
  },

  replayOnboarding: async () => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, hasCompletedOnboarding: false };
      saveData('user', updatedUser);
      return { user: updatedUser };
    });
  },
}));
