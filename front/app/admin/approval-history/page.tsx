"use client";

import ProtectedRoute from "@/components/protected-route";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, History, Shield, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard-layout";

interface ApprovalHistoryEntry {
    _id: string;
    studentName: string;
    eventTitle: string;
    reviewerName: string;
    action: "approved" | "rejected";
    remarks: string;
    reviewedAt: string;
    overallStatus: string;
}

function ApprovalHistoryContent() {
    const [history, setHistory] = useState<ApprovalHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const router = useRouter();

    const fetchHistory = useCallback(async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const params = new URLSearchParams();
            if (statusFilter !== "all") params.append("status", statusFilter);
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);

            const res = await api.get(`/admin/approval-history?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHistory(res.data?.approvalHistory || []);
        } catch {
            toast.error("Failed to load approval history");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, startDate, endDate]);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

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
                <div className="pb-2">
                    <h1 className="text-2xl font-bold tracking-tight">Approval History</h1>
                    <p className="text-muted-foreground">View past decisions made by teachers and admins.</p>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="space-y-1">
                                <Label className="text-xs">Status</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">From</Label>
                                <Input type="date" className="w-[150px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">To</Label>
                                <Input type="date" className="w-[150px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                            <Button variant="outline" size="sm" onClick={() => { setStatusFilter("all"); setStartDate(""); setEndDate(""); }}>
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" /> Approval Records
                        </CardTitle>
                        <CardDescription>{history.length} entries found</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Reviewed By</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Remarks</TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.length ? history.map((entry, i) => (
                                    <TableRow key={`${entry._id}-${i}`}>
                                        <TableCell className="font-medium">{entry.studentName}</TableCell>
                                        <TableCell className="max-w-[150px] truncate">{entry.eventTitle}</TableCell>
                                        <TableCell className="text-sm">{entry.reviewerName}</TableCell>
                                        <TableCell>
                                            <Badge variant={entry.action === "approved" ? "default" : "destructive"} className="capitalize gap-1">
                                                {entry.action === "approved" ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                {entry.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate text-muted-foreground text-sm">{entry.remarks || "—"}</TableCell>
                                        <TableCell className="text-right text-sm text-muted-foreground">
                                            {new Date(entry.reviewedAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No approval history found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

export default function ApprovalHistoryPage() {
    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <ApprovalHistoryContent />
        </ProtectedRoute>
    );
}
