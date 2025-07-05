import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authenticate } from '@/lib/jellyfin';

interface User {
  Name: string;
  Id: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  serverUrl: string | null;
  login: (serverUrl: string, username?: string, password?: string) => Promise<void>;
  logout: () => void;
  setServerUrl: (url: string) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      serverUrl: null,
      login: async (serverUrl, username, password) => {
        const data = await authenticate(serverUrl, username, password);
        set({ token: data.AccessToken, user: data.User, serverUrl });
      },
      logout: () => set({ token: null, user: null }),
      setServerUrl: (url) => set({ serverUrl: url }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
