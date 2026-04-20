import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <BookOpen className="h-6 w-6" />
          <span>EduMate</span>
        </Link>
        <nav className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href={`/dashboard/${user?.role || 'student'}`}>
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}