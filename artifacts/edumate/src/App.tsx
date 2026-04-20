import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import StudentDashboard from "@/pages/dashboard/student/index";
import FocusLearning from "@/pages/dashboard/student/focus";
import MentorPage from "@/pages/dashboard/student/mentor";
import ConnectPage from "@/pages/dashboard/student/connect";
import RewardsPage from "@/pages/dashboard/student/rewards";
import ProfilePage from "@/pages/dashboard/student/profile";
import MentorDashboard from "@/pages/dashboard/mentor/index";
import TeacherDashboard from "@/pages/dashboard/teacher/index";
import TeacherStudents from "@/pages/dashboard/teacher/students";
import TeacherMaterials from "@/pages/dashboard/teacher/materials";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 30,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      {/* Student routes */}
      <Route path="/dashboard/student" component={StudentDashboard} />
      <Route path="/dashboard/student/focus" component={FocusLearning} />
      <Route path="/dashboard/student/mentor" component={MentorPage} />
      <Route path="/dashboard/student/connect" component={ConnectPage} />
      <Route path="/dashboard/student/rewards" component={RewardsPage} />
      <Route path="/dashboard/student/profile" component={ProfilePage} />

      {/* Mentor routes */}
      <Route path="/dashboard/mentor" component={MentorDashboard} />
      <Route path="/dashboard/mentor/profile" component={ProfilePage} />

      {/* Teacher routes */}
      <Route path="/dashboard/teacher" component={TeacherDashboard} />
      <Route path="/dashboard/teacher/students" component={TeacherStudents} />
      <Route path="/dashboard/teacher/materials" component={TeacherMaterials} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
