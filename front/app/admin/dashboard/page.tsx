"use client";

import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/components/providers";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { AdminDashboardData } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Users, GraduationCap, FileText, Clock, Lock, LogOut, Shield,
    CheckCircle, XCircle, UserPlus, History, Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard-layout";

function AdminDashboardContent() {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const res = await api.get("/admin/dashboard", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setData(res.data);
            } catch {
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "approved": return "default";
            case "rejected": return "destructive";
            case "under_review": return "secondary";
            default: return "outline";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: "Total Students", value: data?.stats?.totalStudents, icon: GraduationCap },
                        { title: "Total Teachers", value: data?.stats?.totalTeachers, icon: Users },
                        { title: "Total Requests", value: data?.stats?.totalRequests, icon: FileText },
                        { title: "Pending", value: data?.stats?.pendingRequests, icon: Clock },
                    ].map((stat) => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value ?? 0}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-7">
                    {/* Recent Requests */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Recent OD Requests</CardTitle>
                            <CardDescription>Latest on-duty requests from students</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.recentRequests?.length ? (
                                        data.recentRequests.map((req) => (
                                            <TableRow key={req._id}>
                                                <TableCell>
                                                    <div className="font-medium">{req.studentInfo.fullName}</div>
                                                    <div className="text-xs text-muted-foreground">{req.studentInfo.registerNumber}</div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">{req.eventDetails?.eventTitle}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(req.overallStatus)} className="capitalize gap-1">
                                                        {req.overallStatus === "approved" && <CheckCircle className="h-3 w-3" />}
                                                        {req.overallStatus === "rejected" && <XCircle className="h-3 w-3" />}
                                                        {req.overallStatus === "under_review" && <Clock className="h-3 w-3" />}
                                                        {req.overallStatus.replace("_", " ")}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground text-sm">
                                                    {new Date(req.submittedAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                No recent requests
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Teacher Stats */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Approval Statistics</CardTitle>
                            <CardDescription>Teacher performance overview</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Teacher</TableHead>
                                        <TableHead className="text-center">Total</TableHead>
                                        <TableHead className="text-center">Apprvd</TableHead>
                                        <TableHead className="text-center">Pend</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.teacherStats?.length ? (
                                        data.teacherStats.map((t) => (
                                            <TableRow key={t._id}>
                                                <TableCell>
                                                    <div className="font-medium">{t.fullName}</div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-[100px]">{t.designation}</div>
                                                </TableCell>
                                                <TableCell className="text-center">{t.approvalStats?.totalRequests ?? 0}</TableCell>
                                                <TableCell className="text-center text-green-600">{t.approvalStats?.approved ?? 0}</TableCell>
                                                <TableCell className="text-center text-yellow-600">{t.approvalStats?.pending ?? 0}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                No teacher data
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function AdminDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardContent />
        </ProtectedRoute>
    );
}
