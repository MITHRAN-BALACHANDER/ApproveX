"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const [collegeEmail, setCollegeEmail] = useState("");
    const [rollNumber, setRollNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!collegeEmail || !rollNumber) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post("/auth/register", { collegeEmail, rollNumber });
            toast.success(res.data.message || "Verification email sent!");
            setIsSubmitted(true);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Check your email</CardTitle>
                        <CardDescription>
                            We&apos;ve sent a verification link to <span className="font-medium text-foreground">{collegeEmail}</span>.
                            Please check your inbox and click the link to complete registration.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full" onClick={() => router.push("/verify-email")}>
                            I have the verification token
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={() => setIsSubmitted(false)}>
                            Use a different email
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
                    <p className="text-muted-foreground">Register with your college email to get started</p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="collegeEmail">College Email</Label>
                                <Input
                                    id="collegeEmail"
                                    type="email"
                                    placeholder="your.name@college.edu"
                                    value={collegeEmail}
                                    onChange={(e) => setCollegeEmail(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Use your official college email address</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rollNumber">Roll Number</Label>
                                <Input
                                    id="rollNumber"
                                    type="text"
                                    placeholder="e.g., 21CS101"
                                    value={rollNumber}
                                    onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Verification Email
                            </Button>
                        </form>

                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary underline-offset-4 hover:underline font-medium">
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
