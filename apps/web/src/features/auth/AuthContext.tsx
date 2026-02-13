import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login } from "../../lib/api";
import type { UserRole } from "../../lib/types";

type AuthState = {
  role: UserRole | null;
  token: string;
};

type AuthContextValue = AuthState & {
  loginAs: (role: UserRole) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "barbergo_auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, setState] = useState<AuthState>({ role: null, token: "" });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AuthState;
      if (parsed.role && parsed.token) {
        setState(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      ...state,
      async loginAs(role: UserRole): Promise<void> {
        const data = await login(role);
        const next = { role, token: data.access_token };
        setState(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      },
      logout(): void {
        setState({ role: null, token: "" });
        localStorage.removeItem(STORAGE_KEY);
      }
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
