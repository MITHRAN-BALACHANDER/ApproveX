"use client";

import ProtectedRoute from "@/components/protected-route";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { Teacher } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    UserPlus, Search, ArrowLeft, Loader2, Shield, ToggleLeft, ToggleRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard-layout";

function TeacherManagementContent() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [createForm, setCreateForm] = useState({
        email: "", fullName: "", employeeId: "", designation: "", department: "", password: "",
    });
    const router = useRouter();

    const fetchTeachers = useCallback(async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await api.get("/admin/teachers", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTeachers(res.data?.teachers || res.data || []);
        } catch {
            toast.error("Failed to load teachers");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

    const createTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createForm.email || !createForm.fullName || !createForm.department) {
            toast.error("Please fill required fields");
            return;
        }
        setIsCreating(true);
        try {
            const token = localStorage.getItem("adminToken");
            await api.post("/admin/teachers", createForm, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Teacher created successfully");
            setShowCreateDialog(false);
            setCreateForm({ email: "", fullName: "", employeeId: "", designation: "", department: "", password: "" });
            fetchTeachers();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to create teacher");
        } finally {
            setIsCreating(false);
        }
    };

    const toggleTeacherStatus = async (id: string) => {
        try {
            const token = localStorage.getItem("adminToken");
            await api.patch(`/admin/teachers/${id}/toggle-status`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Teacher status updated");
            fetchTeachers();
        } catch {
            toast.error("Failed to update status");
        }
    };

    const filteredTeachers = teachers.filter((t) =>
        t.profile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.profile?.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Teacher Management</h1>
                        <p className="text-muted-foreground">Manage your institution's teaching staff.</p>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <UserPlus className="h-4 w-4 mr-2" /> Add Teacher
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search teachers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Badge variant="secondary">{filteredTeachers.length} teachers</Badge>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTeachers.length ? filteredTeachers.map((t) => (
                                    <TableRow key={t.id || t._id}>
                                        <TableCell>
                                            <div className="font-medium">{t.profile?.fullName}</div>
                                            {t.profile?.employeeId && <div className="text-xs text-muted-foreground">{t.profile.employeeId}</div>}
                                        </TableCell>
                                        <TableCell className="text-sm">{t.email}</TableCell>
                                        <TableCell className="text-sm">{t.profile?.department}</TableCell>
                                        <TableCell className="text-sm">{t.profile?.designation}</TableCell>
                                        <TableCell>
                                            <Badge variant={t.isActive !== false ? "default" : "destructive"}>
                                                {t.isActive !== false ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleTeacherStatus((t.id || t._id)!)}
                                                title={t.isActive !== false ? "Deactivate" : "Activate"}
                                            >
                                                {t.isActive !== false ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            {searchQuery ? "No teachers match your search" : "No teachers added yet"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Create Teacher Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Teacher</DialogTitle>
                        <DialogDescription>Create a teacher account. An invite email will be sent.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={createTeacher} className="space-y-4">
                        <div className="grid gap-3">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input value={createForm.fullName} onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Employee ID</Label>
                                    <Input value={createForm.employeeId} onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Designation</Label>
                                    <Input value={createForm.designation} onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Department *</Label>
                                <Input value={createForm.department} onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Password (optional)</Label>
                                <Input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} placeholder="Leave blank for auto-generated" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Teacher
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {deleteConfirm?.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { setDeleteConfirm(null); }}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}

export default function TeacherManagementPage() {
    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <TeacherManagementContent />
        </ProtectedRoute>
    );
}
