"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";
import type { User, UserRole, LoginPayload } from "@/lib/types";
import * as authLib from "@/lib/auth";

// ========================
// Auth Context
// ========================

interface AuthContextType {
    user: User | null;
    role: UserRole | null;
    loading: boolean;
    login: (payload: LoginPayload) => Promise<{ success: boolean; message?: string; redirectTo?: string }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    login: async () => ({ success: false }),
    logout: () => { },
    refreshUser: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    const initializeAuth = useCallback(async () => {
        try {
            const status = authLib.getAuthStatus();
            if (status.isAuthenticated && status.token) {
                const verification = await authLib.verifyToken();
                if (verification.valid) {
                    const currentUser = await authLib.getCurrentUser();
                    if (currentUser) {
                        setUser(currentUser);
                        setRole(status.role);
                    } else if (status.userInfo) {
                        setUser(status.userInfo);
                        setRole(status.role);
                    }
                } else {
                    authLib.logout();
                    setUser(null);
                    setRole(null);
                }
            }
        } catch {
            const status = authLib.getAuthStatus();
            if (status.isAuthenticated && status.userInfo) {
                setUser(status.userInfo);
                setRole(status.role);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const loginFn = async (payload: LoginPayload) => {
        try {
            const result = await authLib.login(payload);
            if (result.success && result.role) {
                setUser(result.user);
                setRole(result.role);
                return { success: true, redirectTo: result.redirectTo };
            }
            return { success: false, message: result.message };
        } catch {
            return { success: false, message: "Network error. Please try again." };
        }
    };

    const logoutFn = () => {
        authLib.logout();
        setUser(null);
        setRole(null);
        window.location.href = "/login";
    };

    const refreshUser = async () => {
        const currentUser = await authLib.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, login: loginFn, logout: logoutFn, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

// ========================
// Combined Providers
// ========================

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <AuthProvider>
                {children}
                <Toaster richColors position="top-right" />
            </AuthProvider>
        </NextThemesProvider>
    );
}
