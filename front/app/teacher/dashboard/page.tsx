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
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Lock, FileText, CheckCircle, XCircle, Clock, Eye, LogOut, Loader2,
    LayoutDashboard, Palmtree,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard-layout";

interface TeacherDashData {
    stats: { pending: number; approved: number; rejected: number; total: number };
    pendingRequests: DutyRequest[];
    recentApprovals: DutyRequest[];
}

function TeacherDashboardContent() {
    const [data, setData] = useState<TeacherDashData | null>(null);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("od-requests");
    const [selectedRequest, setSelectedRequest] = useState<DutyRequest | null>(null);
    const [reviewAction, setReviewAction] = useState<"approved" | "rejected" | null>(null);
    const [remarks, setRemarks] = useState("");
    const [isReviewing, setIsReviewing] = useState(false);
    const { logout } = useAuth();

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem("teacherToken");
            const headers = { Authorization: `Bearer ${token}` };
            const [dashRes, leaveRes] = await Promise.all([
                api.get("/teacher/dashboard", { headers }),
                api.get("/leave-requests", { headers }),
            ]);
            setData(dashRes.data);
            setLeaveRequests(Array.isArray(leaveRes.data) ? leaveRes.data : leaveRes.data?.data || []);
        } catch {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const submitReview = async () => {
        if (!selectedRequest || !reviewAction) return;
        setIsReviewing(true);
        try {
            const token = localStorage.getItem("teacherToken");
            await api.post(`/teacher/requests/${selectedRequest._id}/review`, {
                action: reviewAction,
                remarks,
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Request ${reviewAction} successfully`);
            setSelectedRequest(null);
            setReviewAction(null);
            setRemarks("");
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Review failed");
        } finally {
            setIsReviewing(false);
        }
    };

    const handleLeaveApproval = async (id: string, approvalType: string, status: string) => {
        try {
            const token = localStorage.getItem("teacherToken");
            await api.put(`/leave-requests/${id}/approve`, {
                approvalType,
                status,
                remarks: "",
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Leave request ${status}`);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Action failed");
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
                <div className="pb-2">
                    <h1 className="text-2xl font-bold tracking-tight">Teacher Dashboard</h1>
                    <p className="text-muted-foreground">Manage student on-duty and leave requests.</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: "Pending", value: data?.stats?.pending, color: "text-yellow-600" },
                        { title: "Approved", value: data?.stats?.approved, color: "text-green-600" },
                        { title: "Rejected", value: data?.stats?.rejected, color: "text-red-600" },
                        { title: "Total", value: data?.stats?.total, color: "" },
                    ].map((s) => (
                        <Card key={s.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${s.color}`}>{s.value ?? 0}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="od-requests" className="gap-1.5">
                            <FileText className="h-4 w-4" /> OD Requests
                        </TabsTrigger>
                        <TabsTrigger value="leave-requests" className="gap-1.5">
                            <Palmtree className="h-4 w-4" /> Leave Requests
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="od-requests">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending OD Requests</CardTitle>
                                <CardDescription>Review and approve/reject duty requests</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Event</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data?.pendingRequests?.length ? (
                                            data.pendingRequests.map((req) => (
                                                <TableRow key={req._id}>
                                                    <TableCell>
                                                        <div className="font-medium">{req.studentInfo.fullName}</div>
                                                        <div className="text-xs text-muted-foreground">{req.studentInfo.department}</div>
                                                    </TableCell>
                                                    <TableCell className="max-w-[150px] truncate">{req.eventDetails?.eventTitle}</TableCell>
                                                    <TableCell className="text-sm">
                                                        {new Date(req.eventDetails?.dateRange?.startDate).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="capitalize">
                                                            {req.overallStatus.replace("_", " ")}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button size="sm" variant="ghost" onClick={() => { setSelectedRequest(req); setReviewAction(null); }}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="default" onClick={() => { setSelectedRequest(req); setReviewAction("approved"); }}>
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => { setSelectedRequest(req); setReviewAction("rejected"); }}>
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                    No pending OD requests
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="leave-requests">
                        <Card>
                            <CardHeader>
                                <CardTitle>Leave Requests</CardTitle>
                                <CardDescription>Review and approve/reject student leave requests</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Dates</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {leaveRequests.length ? (
                                            leaveRequests
                                                .filter((lr) => lr.status === "pending")
                                                .map((lr) => (
                                                    <TableRow key={lr._id}>
                                                        <TableCell>
                                                            <div className="font-medium">{lr.studentInfo?.fullName}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">{lr.leaveType}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {new Date(lr.startDate).toLocaleDateString()} - {new Date(lr.endDate).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="capitalize">{lr.status}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button size="sm" variant="default" onClick={() => handleLeaveApproval(lr._id, "classTeacher", "approved")}>
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="sm" variant="destructive" onClick={() => handleLeaveApproval(lr._id, "classTeacher", "rejected")}>
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                    No pending leave requests
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
            {/* Review Dialog */}
            <Dialog open={!!selectedRequest && !!reviewAction} onOpenChange={(open) => { if (!open) { setSelectedRequest(null); setReviewAction(null); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{reviewAction === "approved" ? "Approve" : "Reject"} Request</DialogTitle>
                        <DialogDescription>
                            {reviewAction === "approved" ? "Approve" : "Reject"} the OD request from {selectedRequest?.studentInfo?.fullName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium mb-1">Event</p>
                            <p className="text-sm text-muted-foreground">{selectedRequest?.eventDetails?.eventTitle}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">Remarks (optional)</p>
                            <Textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Add any remarks..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setSelectedRequest(null); setReviewAction(null); }}>Cancel</Button>
                        <Button
                            variant={reviewAction === "approved" ? "default" : "destructive"}
                            disabled={isReviewing}
                            onClick={submitReview}
                        >
                            {isReviewing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {reviewAction === "approved" ? "Approve" : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Detail View Dialog */}
            <Dialog open={!!selectedRequest && !reviewAction} onOpenChange={(open) => { if (!open) setSelectedRequest(null); }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Request Details</DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="text-muted-foreground">Student</p><p className="font-medium">{selectedRequest.studentInfo.fullName}</p></div>
                                <div><p className="text-muted-foreground">Register No</p><p className="font-medium">{selectedRequest.studentInfo.registerNumber}</p></div>
                                <div><p className="text-muted-foreground">Department</p><p className="font-medium">{selectedRequest.studentInfo.department}</p></div>
                                <div><p className="text-muted-foreground">Year / Section</p><p className="font-medium">{selectedRequest.studentInfo.year} - {selectedRequest.studentInfo.section}</p></div>
                                <div className="col-span-2"><p className="text-muted-foreground">Event</p><p className="font-medium">{selectedRequest.eventDetails?.eventTitle}</p></div>
                                <div className="col-span-2"><p className="text-muted-foreground">Description</p><p className="font-medium">{selectedRequest.eventDetails?.eventDescription}</p></div>
                                <div><p className="text-muted-foreground">Venue</p><p className="font-medium">{selectedRequest.eventDetails?.venue}</p></div>
                                <div><p className="text-muted-foreground">Dates</p><p className="font-medium">{new Date(selectedRequest.eventDetails?.dateRange?.startDate).toLocaleDateString()} - {new Date(selectedRequest.eventDetails?.dateRange?.endDate).toLocaleDateString()}</p></div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => { setReviewAction("approved"); }}>Approve</Button>
                                <Button variant="destructive" onClick={() => { setReviewAction("rejected"); }}>Reject</Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}

export default function TeacherDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherDashboardContent />
        </ProtectedRoute>
    );
}
