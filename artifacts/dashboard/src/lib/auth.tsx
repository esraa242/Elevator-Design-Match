import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiGetMe } from "./api";

interface Tenant {
  id: number;
  name: string;
  email: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  whatsappNumber: string;
  plan: string;
  usageLimit: number;
  isActive: boolean;
  createdAt: string;
}

interface AuthCtx {
  tenant: Tenant | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, tenant: Tenant) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("em_token"));
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await apiGetMe();
      setTenant(data);
    } catch {
      setToken(null);
      setTenant(null);
      localStorage.removeItem("em_token");
    }
  };

  useEffect(() => {
    if (token) {
      refresh().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = (t: string, ten: Tenant) => {
    localStorage.setItem("em_token", t);
    setToken(t);
    setTenant(ten);
  };

  const logout = () => {
    localStorage.removeItem("em_token");
    setToken(null);
    setTenant(null);
  };

  return <Ctx.Provider value={{ tenant, token, isLoading, login, logout, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
