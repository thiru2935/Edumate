import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Timer,
  Users,
  MessageSquare,
  Award,
  UserCircle,
  LogOut,
  BookOpen,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [location] = useLocation();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) return null;

  const studentLinks = [
    { title: "Dashboard", url: "/dashboard/student", icon: LayoutDashboard },
    { title: "Focus Learning", url: "/dashboard/student/focus", icon: Timer },
    { title: "Mentor", url: "/dashboard/student/mentor", icon: Users },
    { title: "Connect", url: "/dashboard/student/connect", icon: MessageSquare },
    { title: "Rewards", url: "/dashboard/student/rewards", icon: Award },
    { title: "Profile", url: "/dashboard/student/profile", icon: UserCircle },
  ];

  const mentorLinks = [
    { title: "Dashboard", url: "/dashboard/mentor", icon: LayoutDashboard },
    { title: "Profile", url: "/dashboard/mentor/profile", icon: UserCircle },
  ];

  const teacherLinks = [
    { title: "Dashboard", url: "/dashboard/teacher", icon: LayoutDashboard },
    { title: "Students", url: "/dashboard/teacher/students", icon: Users },
    { title: "Materials", url: "/dashboard/teacher/materials", icon: FileText },
  ];

  const links = user.role === "student" ? studentLinks : user.role === "mentor" ? mentorLinks : teacherLinks;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <BookOpen className="h-6 w-6" />
              <span>EduMate</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {links.map((link) => (
                    <SidebarMenuItem key={link.title}>
                      <SidebarMenuButton asChild isActive={location === link.url}>
                        <Link href={link.url}>
                          <link.icon className="h-4 w-4" />
                          <span>{link.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <div className="mt-auto p-4">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}