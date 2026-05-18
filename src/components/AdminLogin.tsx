import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lock, Mail } from "lucide-react";
import adminlogo from "../assests/adminlogo.png";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        // Mock Admin Login
        if (email === "admin@gmail.com" && password === "admin123") {
            navigate("/");
        } else {
            setError("Invalid admin credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">

            {/* Background Blur Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
            </div>

            <Card className="w-full max-w-md elevated-card animate-fade-in border border-border/50 shadow-2xl">

                <CardHeader className="text-center space-y-4 pb-2">

                    {/* Logo */}
                    <div className="mx-auto w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center p-2">
                        <img
                            src={adminlogo}
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">
                            Admin Portal
                        </h1>

                        <p className="text-sm text-muted-foreground mt-2">
                            Automated Timetable Management System
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Admin Email</Label>

                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-11"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-11"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                <p className="text-sm text-destructive font-medium">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Button */}
                        <Button
                            type="submit"
                            className="w-full gradient-primary text-primary-foreground h-11 text-base font-semibold"
                        >
                            Sign In as Admin
                        </Button>

                        {/* Footer */}
                        <p className="text-xs text-center text-muted-foreground">
                            Secure Admin Access Only
                        </p>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogin;