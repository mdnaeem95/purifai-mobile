// User types

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  hasCompletedOnboarding: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
