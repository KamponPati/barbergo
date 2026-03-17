import { create } from "zustand";
import type { Role } from "../lib/types";
import { storage } from "../lib/storage";
import { login as apiLogin } from "../lib/api";

interface AuthState {
  token: string | null;
  role: Role | null;
  userId: string | null;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  login: (role: Role) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token:    null,
  role:     null,
  userId:   null,
  hydrated: false,

  hydrate: async () => {
    const saved = await storage.loadAuth();
    if (saved) {
      set({
        token:    saved.token,
        role:     saved.role as Role,
        userId:   saved.userId,
        hydrated: true,
      });
    } else {
      set({ hydrated: true });
    }
  },

  login: async (role: Role) => {
    const token = await apiLogin(role);
    // userId mapping matches api.ts mock
    const userId =
      role === "admin"   ? "admin_1" :
      role === "partner" ? "partner_1" :
                           "cust_1";

    await storage.saveAuth(token, role, userId);
    set({ token, role, userId });
  },

  logout: async () => {
    await storage.clearAuth();
    set({ token: null, role: null, userId: null });
  },
}));
