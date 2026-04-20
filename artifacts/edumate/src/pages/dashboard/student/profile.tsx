import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetMe, useGetStudentSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Zap, Calendar, Target, Flame, Clock, TrendingUp } from "lucide-react";

export default function ProfilePage() {
  const { data: me } = useGetMe();
  const { data: summary } = useGetStudentSummary();

  const roleColors: Record<string, string> = {
    student: "bg-blue-50 text-blue-700 border-blue-100",
    mentor: "bg-purple-50 text-purple-700 border-purple-100",
    teacher: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">Your account information and stats.</p>
        </div>

        {me && (
          <>
            <Card className="border mb-6">
              <CardContent className="p-6 flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl font-bold">
                    {me.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{me.name}</h2>
                    <Badge className={`${roleColors[me.role]} capitalize`}>{me.role}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-1">{me.email}</p>
                  <p className="text-sm text-muted-foreground">Age: {me.age}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Member since {new Date(me.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {summary && (
              <Card className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Your Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Focus Points", value: summary.focusPoints.toLocaleString(), icon: Zap, color: "text-indigo-600", bg: "bg-indigo-50" },
                      { label: "Sessions Done", value: summary.sessionCount.toString(), icon: Target, color: "text-cyan-600", bg: "bg-cyan-50" },
                      { label: "Study Time", value: `${Math.round(summary.totalStudyMinutes / 60)}h`, icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
                      { label: "Current Streak", value: `${summary.currentStreak}d`, icon: Flame, color: "text-amber-600", bg: "bg-amber-50" },
                      { label: "Leaderboard Rank", value: `#${summary.rank}`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
                    ].map((stat) => (
                      <div key={stat.label} className={`p-4 rounded-xl ${stat.bg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                        <p className="text-xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
