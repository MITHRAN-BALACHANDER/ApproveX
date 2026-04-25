import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/admin", "/teacher", "/student"];
const publicPaths = ["/login", "/register", "/verify-email"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if this is a protected route
    const isProtectedRoute = protectedPaths.some((p) => pathname.startsWith(p));
    const isPublicRoute = publicPaths.some((p) => pathname.startsWith(p));

    // We cannot access localStorage in middleware (server-side), 
    // so we use a cookie to mirror the auth state.
    // The client-side auth will handle the actual token verification.
    // Middleware only provides a fast redirect hint.
    const hasAuthCookie =
        request.cookies.has("adminToken") ||
        request.cookies.has("teacherToken") ||
        request.cookies.has("userToken");

    // For now, let all routes through and let client-side auth handle protection.
    // This avoids SSR/cookie sync issues with localStorage-based auth.
    // The AuthProvider will redirect unauthenticated users.

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
