import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useListUsers, useGetChat, useSendMessage, getGetChatQueryKey, getListUsersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Search, MessageSquare, Send, Zap, Users } from "lucide-react";

export default function ConnectPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string } | null>(null);
  const [message, setMessage] = useState("");

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (roleFilter !== "all") params.role = roleFilter;

  const { data: users } = useListUsers(
    Object.keys(params).length > 0 ? params : undefined,
    { query: { queryKey: getListUsersQueryKey(params) } }
  );

  const filteredUsers = (users || []).filter((u) => u.id !== user?.id);

  const { data: messages } = useGetChat(selectedUser?.id ?? 0, {
    query: { enabled: !!selectedUser, queryKey: getGetChatQueryKey(selectedUser?.id ?? 0) },
  });

  const sendMessage = useSendMessage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetChatQueryKey(selectedUser!.id) });
        setMessage("");
      },
    },
  });

  const roleColors: Record<string, string> = {
    student: "bg-blue-50 text-blue-700 border-blue-100",
    mentor: "bg-purple-50 text-purple-700 border-purple-100",
    teacher: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            Connect
          </h1>
          <p className="text-muted-foreground mt-1">Find and connect with students, mentors, and teachers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* User list */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="mentor">Mentors</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[450px]">
              <div className="space-y-2 pr-2">
                {filteredUsers.length === 0 ? (
                  <Card className="border">
                    <CardContent className="py-8 text-center text-muted-foreground text-sm">
                      No users found.
                    </CardContent>
                  </Card>
                ) : (
                  filteredUsers.map((u) => (
                    <Card
                      key={u.id}
                      className={`border cursor-pointer transition-all hover:border-indigo-300 hover:shadow-sm ${selectedUser?.id === u.id ? "border-indigo-500 bg-indigo-50" : ""}`}
                      onClick={() => setSelectedUser({ id: u.id, name: u.name })}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                            {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{u.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Zap className="h-3 w-3 text-indigo-400" />
                            <span className="text-xs text-muted-foreground">{u.focusPoints.toLocaleString()} pts</span>
                          </div>
                        </div>
                        <Badge className={`text-xs ${roleColors[u.role] || ""}`}>{u.role}</Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat area */}
          <div className="lg:col-span-3">
            {!selectedUser ? (
              <Card className="border h-full min-h-80 flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Select a user to start chatting</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border flex flex-col h-[520px]">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                        {selectedUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedUser.name}
                  </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1 p-4">
                  {(messages ?? []).length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(messages ?? []).map((msg) => {
                        const isOwn = msg.senderId === user?.id;
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isOwn ? "bg-indigo-600 text-white rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                              <p>{msg.message}</p>
                              <p className={`text-xs mt-1 ${isOwn ? "text-indigo-200" : "text-muted-foreground"}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
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

  function handleSend() {
    if (!message.trim() || !selectedUser) return;
    sendMessage.mutate({ userId: selectedUser.id, data: { message } });
  }
}
