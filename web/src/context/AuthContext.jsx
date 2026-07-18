import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get("/auth/me");
      setUser(data.user);
      return data.user;
    } catch (error) {
      if (error.status !== 401) console.error(error);
      setUser(null);
      return null;
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (credentials) => {
    api.resetCsrf();
    const data = await api.post("/auth/login", credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (details) => {
    api.resetCsrf();
    return api.post("/auth/register", details);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", {});
    } finally {
      api.resetCsrf();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, checking, login, logout, register, refresh }),
    [user, checking, login, logout, register, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
