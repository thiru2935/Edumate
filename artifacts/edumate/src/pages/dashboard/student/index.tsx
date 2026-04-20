import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetStudentSummary, useListSessions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import {
  Zap,
  Flame,
  Clock,
  Target,
  BookOpen,
  TrendingUp,
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useGetStudentSummary();
  const { data: sessions } = useListSessions();

  const recentSessions = sessions?.slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">Here's your learning overview today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Focus Points",
              value: isLoading ? "—" : (summary?.focusPoints ?? 0).toLocaleString(),
              icon: Zap,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
              badge: "pts",
            },
            {
              label: "Current Streak",
              value: isLoading ? "—" : `${summary?.currentStreak ?? 0}`,
              icon: Flame,
              color: "text-amber-500",
              bg: "bg-amber-50",
              badge: "days",
            },
            {
              label: "Study Time",
              value: isLoading ? "—" : `${Math.round((summary?.totalStudyMinutes ?? 0) / 60)}h ${(summary?.totalStudyMinutes ?? 0) % 60}m`,
              icon: Clock,
              color: "text-cyan-500",
              bg: "bg-cyan-50",
              badge: "total",
            },
            {
              label: "Sessions",
              value: isLoading ? "—" : (summary?.sessionCount ?? 0).toString(),
              icon: Target,
              color: "text-emerald-500",
              bg: "bg-emerald-50",
              badge: "completed",
            },
          ].map((stat) => (
            <Card key={stat.label} className="border hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <Badge variant="outline" className="mt-3 text-xs">
                  {stat.badge}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rank card */}
        {summary && (
          <Card className="mb-8 border bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Leaderboard Rank</p>
                  <p className="text-3xl font-bold text-indigo-700">#{summary.rank}</p>
                </div>
              </div>
              <Badge className="bg-indigo-600 text-white border-0 text-sm px-4 py-1.5">
                {summary.focusPoints.toLocaleString()} focus points
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Recent sessions */}
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Target className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No sessions yet. Start your first focus session!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{session.duration} min session</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">
                      +{session.pointsEarned} pts
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
