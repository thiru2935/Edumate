import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListUsers, useGetStudentSummary, useGetLeaderboard, useGetChat, useSendMessage, getGetChatQueryKey, getListUsersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Users, MessageSquare, Send, Zap, TrendingUp, GraduationCap } from "lucide-react";

export default function MentorDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<{ id: number; name: string } | null>(null);
  const [message, setMessage] = useState("");

  const { data: students } = useListUsers({ role: "student" }, {
    query: { queryKey: getListUsersQueryKey({ role: "student" }) },
  });
  const { data: summary } = useGetStudentSummary();
  const { data: leaderboard } = useGetLeaderboard();

  const myRank = leaderboard?.find((u) => u.id === user?.id)?.rank;

  const { data: messages } = useGetChat(selectedStudent?.id ?? 0, {
    query: { enabled: !!selectedStudent, queryKey: getGetChatQueryKey(selectedStudent?.id ?? 0) },
  });

  const sendMessage = useSendMessage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetChatQueryKey(selectedStudent!.id) });
        setMessage("");
      },
    },
  });

  const handleSend = () => {
    if (!message.trim() || !selectedStudent) return;
    sendMessage.mutate({ userId: selectedStudent.id, data: { message } });
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Mentor Dashboard</h1>
          <p className="text-muted-foreground mt-1">Support your mentees and track your impact.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Focus Points</p>
                <p className="text-2xl font-bold">{summary?.focusPoints?.toLocaleString() ?? "—"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leaderboard Rank</p>
                <p className="text-2xl font-bold">{myRank ? `#${myRank}` : "—"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students Available</p>
                <p className="text-2xl font-bold">{students?.length ?? "—"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Student list */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Students</h2>
            <ScrollArea className="h-[450px]">
              <div className="space-y-2 pr-2">
                {(students ?? []).map((s) => (
                  <Card
                    key={s.id}
                    className={`border cursor-pointer transition-all hover:border-indigo-300 hover:shadow-sm ${selectedStudent?.id === s.id ? "border-indigo-500 bg-indigo-50" : ""}`}
                    onClick={() => setSelectedStudent({ id: s.id, name: s.name })}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                          {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{s.name}</p>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-indigo-400" />
                          <span className="text-xs text-muted-foreground">{s.focusPoints.toLocaleString()} pts</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat */}
          <div className="lg:col-span-3">
            {!selectedStudent ? (
              <Card className="border h-full min-h-80 flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Select a student to chat with them</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border flex flex-col h-[520px]">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                        {selectedStudent.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedStudent.name}
                  </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1 p-4">
                  {(messages ?? []).length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8">No messages yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {(messages ?? []).map((msg) => {
                        const isOwn = msg.senderId === user?.id;
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isOwn ? "bg-indigo-600 text-white rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                              <p>{msg.message}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
                <div className="p-4 border-t flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={sendMessage.isPending || !message.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
