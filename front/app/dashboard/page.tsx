"use client";

import { useAuth } from "@/components/providers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getDashboardRoute } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user || !role) {
                router.replace("/login");
            } else {
                router.replace(getDashboardRoute(role));
            }
        }
    }, [user, role, loading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
