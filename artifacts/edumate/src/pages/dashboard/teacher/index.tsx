import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetTeacherOverview, useGetLeaderboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, BookOpen, Target, Clock, TrendingUp, Zap, GraduationCap, ArrowUpRight, BrainCircuit, AlertTriangle } from "lucide-react";

export default function TeacherDashboard() {
  const { data: overview, isLoading } = useGetTeacherOverview();
  const { data: leaderboard } = useGetLeaderboard();

  const topStudents = leaderboard?.filter((u) => u.role === "student").slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor student progress and manage learning resources.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Students", value: isLoading ? "—" : overview?.totalStudents ?? 0, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Active Mentors", value: isLoading ? "—" : overview?.totalMentors ?? 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Study Materials", value: isLoading ? "—" : overview?.totalMaterials ?? 0, icon: BookOpen, color: "text-cyan-600", bg: "bg-cyan-50" },
            { label: "Total Sessions", value: isLoading ? "—" : overview?.totalSessions ?? 0, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((stat) => (
            <Card key={stat.label} className="border hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top students */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                Top Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No students yet.</div>
              ) : (
                <div className="space-y-3">
                  {topStudents.map((student, i) => (
                    <div key={student.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                          {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{student.name}</p>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-indigo-400" />
                          <span className="text-xs text-muted-foreground">{student.focusPoints.toLocaleString()} pts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                Overall Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(leaderboard ?? []).slice(0, 6).map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2">
                    <span className="w-6 text-xs text-muted-foreground font-mono text-right">#{user.rank}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`text-xs font-semibold ${user.role === "student" ? "bg-blue-100 text-blue-700" : user.role === "mentor" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="flex-1 text-sm font-medium truncate">{user.name}</p>
                    <Badge className={`text-xs ${user.role === "student" ? "bg-blue-50 text-blue-700 border-blue-100" : user.role === "mentor" ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                      {user.role}
                    </Badge>
                    <span className="text-xs font-semibold text-indigo-600">{user.focusPoints.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* At-risk insights */}
          <Card className="border lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-rose-600" />
                Focus Risk Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(overview?.atRiskStudents ?? []).length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">No high-risk students detected. Great class consistency 🎉</div>
              ) : (
                <div className="space-y-3">
                  {overview?.atRiskStudents.map((student) => (
                    <div key={student.id} className="rounded-xl border p-3 flex flex-wrap items-center gap-3">
                      <p className="font-medium text-sm min-w-40">{student.name}</p>
                      <Badge variant="outline">Integrity: {student.avgIntegrityScore}%</Badge>
                      <Badge variant="outline">Idle incidents: {student.totalIdleIncidents}</Badge>
                      <Badge variant="outline">Tab switches: {student.totalTabSwitches}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                Improving Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(overview?.improvingStudents ?? []).length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">No improvement data yet.</div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {overview?.improvingStudents.map((student) => (
                    <div key={student.id} className="rounded-xl border p-3">
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">+{student.pointsDelta7d} pts in 7 days</p>
                      <Badge variant="outline" className="mt-2">Integrity {student.avgIntegrityScore}%</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-amber-600" />
                Drifting Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(overview?.driftingStudents ?? []).length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">No drifting students detected.</div>
              ) : (
                <div className="space-y-3">
                  {overview?.driftingStudents.map((student) => (
                    <div key={student.id} className="rounded-xl border p-3 flex flex-wrap items-center gap-3">
                      <p className="font-medium text-sm min-w-40">{student.name}</p>
                      <Badge variant="outline">Idle avg: {student.avgIdleIncidents}</Badge>
                      <Badge variant="outline">Recall avg: {student.avgRecallAccuracy}%</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                Stressed Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(overview?.stressedStudents ?? []).length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">No stress signals detected.</div>
              ) : (
                <div className="space-y-3">
                  {overview?.stressedStudents.map((student) => (
                    <div key={student.id} className="rounded-xl border p-3 flex flex-wrap items-center gap-3">
                      <p className="font-medium text-sm min-w-40">{student.name}</p>
                      <Badge variant="outline">Pause rate: {student.pauseRate}</Badge>
                      <Badge variant="outline">Late-night sessions: {student.lateNightSessions}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
