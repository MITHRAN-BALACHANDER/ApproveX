// ========================
// Core Types
// ========================

export type UserRole = "student" | "teacher" | "admin";

export interface UserProfile {
    fullName: string;
    registerNumber?: string;
    department?: string;
    year?: string;
    section?: string;
    employeeId?: string;
    designation?: string;
    adminLevel?: "super_admin" | "admin";
    createdBy?: string;
    approvalStats?: {
        totalRequests: number;
        approved: number;
        rejected: number;
        pending: number;
    };
    isApprover?: boolean;
}

export interface User {
    id: string;
    _id?: string;
    email: string;
    collegeEmail?: string;
    rollNumber?: string;
    role: UserRole;
    profile: UserProfile;
    isEmailVerified?: boolean;
    isActive?: boolean;
    createdAt?: string;
}

// ========================
// Auth Types
// ========================

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    user: User;
    role: UserRole;
    redirectTo: string;
}

export interface RegisterPayload {
    collegeEmail: string;
    rollNumber: string;
}

export interface VerifyEmailPayload {
    token: string;
    password: string;
}

export interface AuthStatus {
    isAuthenticated: boolean;
    role: UserRole | null;
    token: string | null;
    userInfo: User | null;
}

// ========================
// Duty Request Types
// ========================

export interface StudentInfo {
    fullName: string;
    registerNumber: string;
    department: string;
    year: string;
    section: string;
}

export interface EventDetails {
    eventTitle: string;
    eventDescription: string;
    reasonType: string;
    venue: string;
    dateRange: {
        startDate: string;
        endDate: string;
    };
    organizingBody: string;
}

export interface ApprovalEntry {
    reviewedBy: string;
    reviewerName: string;
    reviewerDesignation: string;
    action: "approved" | "rejected";
    remarks: string;
    reviewedAt: string;
}

export interface DutyRequest {
    _id: string;
    studentId: string | User;
    studentInfo: StudentInfo;
    eventDetails: EventDetails;
    documents: {
        invitation?: string;
        permissionLetter?: string;
        travelProof?: string;
        additionalDocs?: string[];
    };
    approval?: {
        status: "pending" | "approved" | "rejected";
        reviewedBy?: string;
        remarks?: string;
        approvedAt?: string;
    };
    approvalHistory: ApprovalEntry[];
    overallStatus: "pending" | "under_review" | "approved" | "rejected";
    submittedAt: string;
}

// ========================
// Leave Request Types
// ========================

export interface LeaveRequest {
    _id: string;
    studentId: string | User;
    studentInfo: StudentInfo;
    leaveType: "sick" | "personal" | "family" | "medical" | "emergency" | "other";
    reason: string;
    startDate: string;
    endDate: string;
    requiresHODApproval: boolean;
    classTeacherApproval: {
        status: "pending" | "approved" | "rejected";
        teacherId?: string;
        remarks?: string;
        approvedAt?: string;
    };
    hodApproval: {
        status: "pending" | "approved" | "rejected";
        teacherId?: string;
        remarks?: string;
        approvedAt?: string;
    };
    status: "pending" | "approved" | "rejected";
    documents: {
        filename: string;
        originalname: string;
        mimetype: string;
        size: number;
    }[];
    createdAt: string;
}

// ========================
// Dashboard Stats Types
// ========================

export interface AdminDashboardData {
    success: boolean;
    stats: {
        totalStudents: number;
        totalTeachers: number;
        totalRequests: number;
        pendingRequests: number;
        approvedRequests: number;
        rejectedRequests: number;
    };
    recentRequests: DutyRequest[];
    teacherStats: TeacherStat[];
}

export interface TeacherStat {
    _id: string;
    fullName: string;
    employeeId?: string;
    designation: string;
    approvalStats: {
        totalRequests: number;
        approved: number;
        rejected: number;
        pending: number;
    };
}

export interface TeacherDashboardData {
    stats: {
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    };
    pendingRequests: DutyRequest[];
    recentApprovals: DutyRequest[];
}

export interface Teacher extends User {
    profile: UserProfile & {
        employeeId?: string;
        designation?: string;
        department?: string;
    };
}

// ========================
// API Response Wrapper
// ========================

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
