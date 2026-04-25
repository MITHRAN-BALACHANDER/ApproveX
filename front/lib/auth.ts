import api from "./api";
import type { User, UserRole, LoginPayload, LoginResponse, AuthStatus } from "./types";

const TOKEN_KEYS: Record<UserRole, string> = {
    student: "userToken",
    teacher: "teacherToken",
    admin: "adminToken",
};

const INFO_KEYS: Record<UserRole, string> = {
    student: "userInfo",
    teacher: "teacherInfo",
    admin: "adminInfo",
};

export function getTokenKey(role: UserRole): string {
    return TOKEN_KEYS[role];
}

export function getInfoKey(role: UserRole): string {
    return INFO_KEYS[role];
}

export function getCurrentToken(): string | null {
    if (typeof window === "undefined") return null;
    return (
        localStorage.getItem("adminToken") ||
        localStorage.getItem("teacherToken") ||
        localStorage.getItem("userToken")
    );
}

export function getCurrentRole(): UserRole | null {
    if (typeof window === "undefined") return null;
    if (localStorage.getItem("adminToken")) return "admin";
    if (localStorage.getItem("teacherToken")) return "teacher";
    if (localStorage.getItem("userToken")) return "student";
    return null;
}

export function getCachedUserInfo(role?: UserRole | null): User | null {
    if (typeof window === "undefined") return null;
    const currentRole = role || getCurrentRole();
    if (!currentRole) return null;
    const infoKey = getInfoKey(currentRole);
    const userInfo = localStorage.getItem(infoKey);
    return userInfo ? JSON.parse(userInfo) : null;
}

export function getAuthStatus(): AuthStatus {
    const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const teacherToken = typeof window !== "undefined" ? localStorage.getItem("teacherToken") : null;
    const userToken = typeof window !== "undefined" ? localStorage.getItem("userToken") : null;

    if (adminToken) {
        return { isAuthenticated: true, role: "admin", token: adminToken, userInfo: getCachedUserInfo("admin") };
    }
    if (teacherToken) {
        return { isAuthenticated: true, role: "teacher", token: teacherToken, userInfo: getCachedUserInfo("teacher") };
    }
    if (userToken) {
        return { isAuthenticated: true, role: "student", token: userToken, userInfo: getCachedUserInfo("student") };
    }
    return { isAuthenticated: false, role: null, token: null, userInfo: null };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/role-auth/auto-login", payload);
    const data = res.data;

    if (data.success && data.role) {
        const tokenKey = getTokenKey(data.role);
        const infoKey = getInfoKey(data.role);

        localStorage.setItem(tokenKey, data.token);
        localStorage.setItem(infoKey, JSON.stringify(data.user));

        // Clear tokens from other roles
        const allRoles: UserRole[] = ["student", "teacher", "admin"];
        allRoles.forEach((r) => {
            if (r !== data.role) {
                localStorage.removeItem(getTokenKey(r));
                localStorage.removeItem(getInfoKey(r));
            }
        });
    }

    return data;
}

export async function verifyToken(): Promise<{ valid: boolean; user?: User }> {
    try {
        const token = getCurrentToken();
        if (!token) return { valid: false };
        const res = await api.get("/role-auth/verify");
        return res.data;
    } catch {
        return { valid: false };
    }
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const token = getCurrentToken();
        if (!token) return null;
        const res = await api.get("/role-auth/me");
        if (res.data.success) return res.data.user;
        return getCachedUserInfo();
    } catch {
        return getCachedUserInfo();
    }
}

export function logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("teacherInfo");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
}

export function getDashboardRoute(role: UserRole): string {
    const routes: Record<UserRole, string> = {
        student: "/student/dashboard",
        teacher: "/teacher/dashboard",
        admin: "/admin/dashboard",
    };
    return routes[role] || "/login";
}
