"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const token = api.getToken();
      if (!token) {
        setUser(null);
        return;
      }
      const currentUser = await api.getMe();
      setUser(currentUser);
    } catch (err) {
      api.setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email.trim(), password.trim());
      setUser(res.user);
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      } else {
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async () => {
    await login("demo@cybershield.ai", "CyberShield2026!");
  };

  const register = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(email.trim(), password.trim(), fullName?.trim());
      setUser(res.user);
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      } else {
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
