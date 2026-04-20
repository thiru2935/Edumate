import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const login = useLogin({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("token", data.token);
        queryClient.clear();
        toast({ title: "Welcome back!", description: `Logged in as ${data.user.name}` });
        const role = data.user.role;
        setLocation(`/dashboard/${role}`);
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Login failed";
        toast({ title: "Error", description: msg, variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ data: { email: form.email, password: form.password } });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-900 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <BookOpen className="h-6 w-6" />
          <span>EduMate</span>
        </Link>
        <div>
          <h2 className="text-4xl font-bold text-white mb-4">Welcome back, achiever.</h2>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Your study sessions, focus points, and mentorship connections are all waiting for you. Pick up right where you left off.
          </p>
        </div>
        <p className="text-indigo-300 text-sm">&copy; 2026 EduMate</p>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <BookOpen className="h-6 w-6" />
              <span>EduMate</span>
            </Link>
          </div>
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">Sign in to EduMate</CardTitle>
              <CardDescription>Enter your credentials to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2"
                  disabled={login.isPending}
                >
                  {login.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p className="mb-1">Demo accounts: alex@edumate.app / sarah@edumate.app / james@edumate.app</p>
                <p>Password: <span className="font-mono">password123</span></p>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{" "}
                <Link href="/signup" className="text-indigo-600 hover:underline font-medium">
                  Sign up free
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
