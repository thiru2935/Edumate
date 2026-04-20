import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListUsers, useUpdateFocusPoints, getListUsersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Zap, GraduationCap, Plus, Minus } from "lucide-react";

export default function TeacherStudents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pointInputs, setPointInputs] = useState<Record<number, string>>({});

  const params: Record<string, string> = { role: "student" };
  if (search) params.search = search;

  const { data: students } = useListUsers(params, {
    query: { queryKey: getListUsersQueryKey(params) },
  });

  const updatePoints = useUpdateFocusPoints({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey({ role: "student" }) });
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey(params) });
        toast({ title: "Points updated!", description: `${data.name} now has ${data.focusPoints} focus points.` });
      },
    },
  });

  const handleAdjustPoints = (studentId: number, currentPoints: number, delta: number) => {
    updatePoints.mutate({ id: studentId, data: { points: Math.max(0, currentPoints + delta) } });
  };

  const handleSetPoints = (studentId: number, currentPoints: number) => {
    const val = pointInputs[studentId];
    if (!val) return;
    const newPoints = parseInt(val);
    if (isNaN(newPoints) || newPoints < 0) {
      toast({ title: "Invalid points value", variant: "destructive" });
      return;
    }
    updatePoints.mutate({ id: studentId, data: { points: newPoints } });
    setPointInputs({ ...pointInputs, [studentId]: "" });
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
            Student Profiles
          </h1>
          <p className="text-muted-foreground mt-1">View and manage student focus points.</p>
        </div>

        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(students ?? []).length === 0 ? (
            <Card className="border col-span-2">
              <CardContent className="py-12 text-center text-muted-foreground">No students found.</CardContent>
            </Card>
          ) : (
            (students ?? []).map((student) => (
              <Card key={student.id} className="border hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{student.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">Student</Badge>
                        <span className="text-xs text-muted-foreground">Age {student.age}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-indigo-600 font-bold">
                        <Zap className="h-4 w-4" />
                        <span>{student.focusPoints.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">focus pts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAdjustPoints(student.id, student.focusPoints, -10)}
                      disabled={updatePoints.isPending}
                    >
                      <Minus className="h-3 w-3 mr-1" />
                      10 pts
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAdjustPoints(student.id, student.focusPoints, 10)}
                      disabled={updatePoints.isPending}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      10 pts
                    </Button>
                    <div className="flex gap-1 ml-auto">
                      <Input
                        className="w-20 h-8 text-xs"
                        placeholder="Set pts"
                        value={pointInputs[student.id] || ""}
                        onChange={(e) => setPointInputs({ ...pointInputs, [student.id]: e.target.value })}
                        type="number"
                        min={0}
                      />
                      <Button
                        size="sm"
                        className="h-8 bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => handleSetPoints(student.id, student.focusPoints)}
                        disabled={!pointInputs[student.id]}
                      >
                        Set
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
