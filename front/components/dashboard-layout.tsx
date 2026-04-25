"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { getDashboardRoute } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    LayoutDashboard,
    Users,
    FileText,
    History,
    Settings,
    LogOut,
    Menu,
    GraduationCap,
    Shield,
    Briefcase,
    Lock,
} from "lucide-react";
import ChangePasswordDialog from "./change-password-dialog";

// Define navigation items per role
const roleLinks: Record<UserRole, { title: string; href: string; icon: React.ElementType }[]> = {
    admin: [
        { title: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
        { title: "Teachers", href: "/admin/teachers", icon: Users },
        { title: "History", href: "/admin/approval-history", icon: History },
    ],
    teacher: [
        { title: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
    ],
    student: [
        { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    ],
};

const RoleIcon = ({ role, className }: { role: UserRole | null; className?: string }) => {
    if (role === "admin") return <Shield className={className} />;
    if (role === "teacher") return <Briefcase className={className} />;
    if (role === "student") return <GraduationCap className={className} />;
    return <LayoutDashboard className={className} />;
};

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, role, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showChangePw, setShowChangePw] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null; // Avoid hydration mismatch

    // Fallback to empty array if no role (though should be redirected)
    const links = role ? roleLinks[role] : [];

    const handleLogout = () => {
        logout();
        router.push("/login"); // The auth context also redirects, but good to be explicit
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col gap-4">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href={role ? getDashboardRoute(role) : "/dashboard"} className="flex items-center gap-2 font-semibold">
                    <RoleIcon role={role} className="h-6 w-6 text-primary" />
                    <span className="text-lg">OD Provider</span>
                </Link>
            </div>

            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    <div className="mb-4 px-4 py-2">
                        <h2 className="mb-2 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                            Menu
                        </h2>
                        <div className="space-y-1">
                            {links.map((link) => {
                                const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                                            isActive ? "bg-muted text-foreground" : "hover:bg-muted/50"
                                        )}
                                    >
                                        <link.icon className="h-4 w-4" />
                                        {link.title}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>
            </div>

            <div className="mt-auto p-4 border-t">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start gap-2 px-2 hover:bg-muted">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-sm overflow-hidden">
                                <span className="truncate font-medium">{user?.profile?.fullName || "User"}</span>
                                <span className="truncate text-xs text-muted-foreground">{role}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowChangePw(true)}>
                            <Lock className="mr-2 h-4 w-4" />
                            Change Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden border-r bg-muted/20 md:block">
                <SidebarContent />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col">
                {/* Mobile Header */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0 flex flex-col">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <SheetDescription className="sr-only">Access dashboard sections relevant to your role.</SheetDescription>
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>

                    <div className="flex w-full items-center justify-between">
                        <div className="font-semibold">{role ? role.charAt(0).toUpperCase() + role.slice(1) : ""} Dashboard</div>
                        {/* Mobile quick actions if needed, for now standard top right corner user icon could be here, but it's in the drawer bottom. */}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto rounded-xl">
                    <div className="container mx-auto p-4 md:p-6 lg:p-8 pt-6">
                        {children}
                    </div>
                </main>
            </div>

            <ChangePasswordDialog open={showChangePw} onOpenChange={setShowChangePw} />
        </div>
    );
}
