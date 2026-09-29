import { create } from "zustand";

export type User = {
  userId: string;
  username: string;
  email: string;
  role: string;
  deletionRequestedAt?: string | null;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  fetchUser: (role?: "client" | "worker") => Promise<void>;
  checkClientSetupStatus: () => Promise<boolean>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  recoverAccount: () => Promise<void>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({
    user: {
      ...user,
      deletionRequestedAt: (user as any).deletion_requested_at || user.deletionRequestedAt || null
    },
    isAuthenticated: true,
    isLoading: false
  }),

  clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),

  fetchUser: async (role) => {
    set({ isLoading: true });
    const currentRole = get().user?.role === "worker" ? "worker" : undefined;
    const rolesToTry = role ? [role] : currentRole ? [currentRole] : ["client", "worker"];

    for (const roleToTry of rolesToTry) {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-request-from": roleToTry,
          },
        });
        if (!res.ok) continue;

        const data = await res.json();
        set({
          user: {
            ...data.user,
            deletionRequestedAt: data.user.deletion_requested_at || data.user.deletionRequestedAt || null
          },
          isAuthenticated: true,
          isLoading: false
        });
        return;
      } catch {
        // Try the next supported session role.
      }
    }

    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkClientSetupStatus: async () => {
    try {
      const res = await fetch(`${API_URL}/api/client/checkSetupStatus`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
      });

      if (!res.ok) {
        return false;
      }

      const data = await res.json();
      return Boolean(data.isSetupComplete);
    } catch {
      return false;
    }
  },

  logout: async () => {
    const role = get().user?.role === "worker" ? "worker" : "client";
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": role,
        },
      });
    } catch {
      // ignore
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  deleteAccount: async () => {
    try {
      await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
      });
    } catch {
      // ignore
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  recoverAccount: async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/recover-account`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-request-from": "client",
        },
      });
      if (res.ok) {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              deletionRequestedAt: null
            }
          });
        }
      }
    } catch {
      // ignore
    }
  },
}));
