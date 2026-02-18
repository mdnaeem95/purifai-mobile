import { create } from 'zustand';
import { User, AuthState } from '../types/user';
import { saveData, loadData } from '../services/storage';

interface UserStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
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
      set({ user, isAuthenticated: true });
    }
  },
}));
