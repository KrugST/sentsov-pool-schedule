import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { createElement } from "react";
import { adminLogin, setToken, clearToken, hasToken } from "@/lib/api";

interface AdminContextValue {
  isAdmin: boolean;
  login: (pin: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(hasToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-check on mount in case sessionStorage was cleared
  useEffect(() => {
    setIsAdmin(hasToken());
  }, []);

  const login = useCallback(async (pin: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminLogin(pin);
      setToken(res.token);
      setIsAdmin(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setIsAdmin(false);
  }, []);

  return createElement(
    AdminContext.Provider,
    { value: { isAdmin, login, logout, loading, error } },
    children
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
