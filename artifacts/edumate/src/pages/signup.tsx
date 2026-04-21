import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSignup } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    role: "" as "student" | "mentor" | "teacher" | "",
  });

  const signup = useSignup({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("token", data.token);
        toast({ title: "Account created!", description: `Welcome to EduMate, ${data.user.name}!` });
        const role = data.user.role;
        setLocation(`/dashboard/${role}`);
      },
      onError: (err: unknown) => {
        const apiErr = err as {
          status?: number;
          data?: { error?: string; message?: string; detail?: string } | string | null;
          message?: string;
        };

        const dataMessage =
          typeof apiErr.data === "string"
            ? apiErr.data
            : apiErr.data?.error || apiErr.data?.message || apiErr.data?.detail;

        const rawMessage = dataMessage || apiErr.message || "Signup failed";
        const normalized = rawMessage.toLowerCase();

        const msg =
          apiErr.status === 409 ||
          normalized.includes("already registered") ||
          normalized.includes("already exists") ||
          normalized.includes("already exist")
            ? "Account already exists. Please login instead."
            : rawMessage;

        toast({ title: "Error", description: msg, variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role) {
      toast({ title: "Please select a role", variant: "destructive" });
      return;
    }
    signup.mutate({
      data: {
        name: form.name,
        email: form.email,
        password: form.password,
        age: parseInt(form.age),
        role: form.role as "student" | "mentor" | "teacher",
      },
    });
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
          <h2 className="text-4xl font-bold text-white mb-4">Start your learning journey today.</h2>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Join thousands of students turning focused study sessions into real academic success and career opportunities.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6">
            {[
              { label: "Active Learners", value: "10,000+" },
              { label: "Focus Sessions", value: "2M+" },
              { label: "Rewards Given", value: "5,000+" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-indigo-200 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
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
              <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
              <CardDescription>Fill in your details to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    minLength={2}
                  />
                </div>
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
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      minLength={6}
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
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Your age"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    required
                    min={10}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select onValueChange={(v) => setForm({ ...form, role: v as "student" | "mentor" | "teacher" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-black hover:text-white mt-2"
                  disabled={signup.isPending}
                >
                  {signup.isPending ? "Creating account..." : "Create Account"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-indigo-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
