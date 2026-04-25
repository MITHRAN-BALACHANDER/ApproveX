"use client";

import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/components/providers";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { DutyRequest, LeaveRequest } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    FileText, Plus, Lock, LogOut, GraduationCap, Clock, CheckCircle, XCircle,
    Loader2, Palmtree, User, Upload,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard-layout";

function StudentDashboardContent() {
    const { user, logout } = useAuth();
    type TabValue = "overview" | "new-od" | "od-status" | "new-leave" | "leave-status";
    const [activeTab, setActiveTab] = useState<TabValue>("overview");
    const [odRequests, setOdRequests] = useState<DutyRequest[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // OD Form state
    const [odForm, setOdForm] = useState({
        eventTitle: "", eventDescription: "", reasonType: "seminar",
        venue: "", startDate: "", endDate: "", organizingBody: "",
    });
    const [odFiles, setOdFiles] = useState<{ invitation?: File; permissionLetter?: File }>({});
    const [isSubmittingOd, setIsSubmittingOd] = useState(false);

    // Leave Form state
    const [leaveForm, setLeaveForm] = useState({
        leaveType: "sick", reason: "", startDate: "", endDate: "",
    });
    const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [odRes, leaveRes] = await Promise.all([
                api.get("/duty-requests"),
                api.get("/leave-requests"),
            ]);
            setOdRequests(Array.isArray(odRes.data) ? odRes.data : []);
            const ld = leaveRes.data;
            setLeaveRequests(Array.isArray(ld) ? ld : ld?.data || []);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const stats = {
        totalOd: odRequests.length,
        pendingOd: odRequests.filter((r) => r.overallStatus === "pending" || r.overallStatus === "under_review").length,
        approvedOd: odRequests.filter((r) => r.overallStatus === "approved").length,
        totalLeave: leaveRequests.length,
    };

    const submitOdRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!odForm.eventTitle || !odForm.startDate || !odForm.endDate || !odFiles.invitation) {
            toast.error("Please fill required fields and upload invitation");
            return;
        }
        setIsSubmittingOd(true);
        try {
            const formData = new FormData();
            const requestData = {
                studentInfo: {
                    fullName: user?.profile?.fullName || "",
                    registerNumber: user?.profile?.registerNumber || "",
                    department: user?.profile?.department || "",
                    year: user?.profile?.year || "",
                    section: user?.profile?.section || "",
                },
                eventDetails: {
                    eventTitle: odForm.eventTitle,
                    eventDescription: odForm.eventDescription,
                    reasonType: odForm.reasonType,
                    venue: odForm.venue,
                    dateRange: { startDate: odForm.startDate, endDate: odForm.endDate },
                    organizingBody: odForm.organizingBody,
                },
            };
            formData.append("requestData", JSON.stringify(requestData));
            if (odFiles.invitation) formData.append("invitation", odFiles.invitation);
            if (odFiles.permissionLetter) formData.append("permissionLetter", odFiles.permissionLetter);

            await api.post("/duty-requests", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("OD request submitted successfully!");
            setOdForm({ eventTitle: "", eventDescription: "", reasonType: "seminar", venue: "", startDate: "", endDate: "", organizingBody: "" });
            setOdFiles({});
            setActiveTab("od-status");
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to submit OD request");
        } finally {
            setIsSubmittingOd(false);
        }
    };

    const submitLeaveRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leaveForm.reason || !leaveForm.startDate || !leaveForm.endDate) {
            toast.error("Please fill all required fields");
            return;
        }
        setIsSubmittingLeave(true);
        try {
            await api.post("/leave-requests", leaveForm);
            toast.success("Leave request submitted!");
            setLeaveForm({ leaveType: "sick", reason: "", startDate: "", endDate: "" });
            setActiveTab("leave-status");
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to submit leave request");
        } finally {
            setIsSubmittingLeave(false);
        }
    };

    const getStatusVariant = (s: string) => {
        if (s === "approved") return "default" as const;
        if (s === "rejected") return "destructive" as const;
        return "secondary" as const;
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
                <div className="pb-2">
                    <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
                    <p className="text-muted-foreground">Manage your college presence and requests.</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="flex-wrap h-auto gap-1">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="new-od">New OD</TabsTrigger>
                        <TabsTrigger value="od-status">OD Status</TabsTrigger>
                        <TabsTrigger value="new-leave">New Leave</TabsTrigger>
                        <TabsTrigger value="leave-status">Leave Status</TabsTrigger>
                    </TabsList>

                    {/* Overview */}
                    <TabsContent value="overview">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total OD Requests</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalOd}</div></CardContent></Card>
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{stats.pendingOd}</div></CardContent></Card>
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Approved</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.approvedOd}</div></CardContent></Card>
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Leave Requests</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalLeave}</div></CardContent></Card>
                        </div>
                    </TabsContent>

                    {/* New OD Request */}
                    <TabsContent value="new-od">
                        <Card>
                            <CardHeader>
                                <CardTitle>Submit OD Request</CardTitle>
                                <CardDescription>Fill in the event details and upload required documents</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitOdRequest} className="space-y-4 max-w-2xl">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label>Event Title *</Label>
                                            <Input value={odForm.eventTitle} onChange={(e) => setOdForm({ ...odForm, eventTitle: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label>Description</Label>
                                            <Textarea value={odForm.eventDescription} onChange={(e) => setOdForm({ ...odForm, eventDescription: e.target.value })} rows={3} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Reason Type *</Label>
                                            <Select value={odForm.reasonType} onValueChange={(v) => setOdForm({ ...odForm, reasonType: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {["seminar", "workshop", "symposium", "internship", "hackathon", "placement_drive", "cultural", "sports", "medical", "conference", "competition", "training", "other"].map((t) => (
                                                        <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Venue</Label>
                                            <Input value={odForm.venue} onChange={(e) => setOdForm({ ...odForm, venue: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Start Date *</Label>
                                            <Input type="date" value={odForm.startDate} onChange={(e) => setOdForm({ ...odForm, startDate: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Date *</Label>
                                            <Input type="date" value={odForm.endDate} onChange={(e) => setOdForm({ ...odForm, endDate: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label>Organizing Body</Label>
                                            <Input value={odForm.organizingBody} onChange={(e) => setOdForm({ ...odForm, organizingBody: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Invitation / Proof *</Label>
                                            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setOdFiles({ ...odFiles, invitation: e.target.files?.[0] })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Permission Letter</Label>
                                            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setOdFiles({ ...odFiles, permissionLetter: e.target.files?.[0] })} />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={isSubmittingOd}>
                                        {isSubmittingOd && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit OD Request
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* OD Status */}
                    <TabsContent value="od-status">
                        <Card>
                            <CardHeader>
                                <CardTitle>OD Request Status</CardTitle>
                                <CardDescription>Track your on-duty request submissions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Event</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Submitted</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {odRequests.length ? odRequests.map((req) => (
                                            <TableRow key={req._id}>
                                                <TableCell className="font-medium max-w-[200px] truncate">{req.eventDetails?.eventTitle}</TableCell>
                                                <TableCell className="text-sm">
                                                    {new Date(req.eventDetails?.dateRange?.startDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(req.overallStatus)} className="capitalize gap-1">
                                                        {req.overallStatus === "approved" && <CheckCircle className="h-3 w-3" />}
                                                        {req.overallStatus === "rejected" && <XCircle className="h-3 w-3" />}
                                                        {(req.overallStatus === "pending" || req.overallStatus === "under_review") && <Clock className="h-3 w-3" />}
                                                        {req.overallStatus.replace("_", " ")}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-sm text-muted-foreground">
                                                    {new Date(req.submittedAt).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                    No OD requests yet. <Button variant="link" onClick={() => setActiveTab("new-od")}>Submit one now</Button>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* New Leave */}
                    <TabsContent value="new-leave">
                        <Card>
                            <CardHeader>
                                <CardTitle>Submit Leave Request</CardTitle>
                                <CardDescription>Apply for leave with required details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitLeaveRequest} className="space-y-4 max-w-xl">
                                    <div className="space-y-2">
                                        <Label>Leave Type *</Label>
                                        <Select value={leaveForm.leaveType} onValueChange={(v) => setLeaveForm({ ...leaveForm, leaveType: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {["sick", "personal", "family", "medical", "emergency", "other"].map((t) => (
                                                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Reason *</Label>
                                        <Textarea value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} rows={3} required />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} required /></div>
                                        <div className="space-y-2"><Label>End Date *</Label><Input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} required /></div>
                                    </div>
                                    <Button type="submit" disabled={isSubmittingLeave}>
                                        {isSubmittingLeave && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit Leave Request
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Leave Status */}
                    <TabsContent value="leave-status">
                        <Card>
                            <CardHeader>
                                <CardTitle>Leave Request Status</CardTitle>
                                <CardDescription>Track your leave applications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Dates</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {leaveRequests.length ? leaveRequests.map((lr) => (
                                            <TableRow key={lr._id}>
                                                <TableCell><Badge variant="outline" className="capitalize">{lr.leaveType}</Badge></TableCell>
                                                <TableCell className="max-w-[200px] truncate">{lr.reason}</TableCell>
                                                <TableCell className="text-sm">{new Date(lr.startDate).toLocaleDateString()} - {new Date(lr.endDate).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(lr.status)} className="capitalize">{lr.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                    No leave requests yet
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}

export default function StudentDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboardContent />
        </ProtectedRoute>
    );
}
