import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetLeaderboard, useGetChat, useSendMessage, getGetChatQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Users, MessageSquare, Send, Zap } from "lucide-react";

export default function MentorPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMentor, setSelectedMentor] = useState<{ id: number; name: string } | null>(null);
  const [message, setMessage] = useState("");

  const { data: leaderboard } = useGetLeaderboard();
  const mentors = leaderboard?.filter((u) => u.role === "mentor") || [];

  const { data: messages } = useGetChat(selectedMentor?.id ?? 0, {
    query: { enabled: !!selectedMentor, queryKey: getGetChatQueryKey(selectedMentor?.id ?? 0) },
  });

  const sendMessage = useSendMessage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetChatQueryKey(selectedMentor!.id) });
        setMessage("");
      },
    },
  });

  const handleSend = () => {
    if (!message.trim() || !selectedMentor) return;
    sendMessage.mutate({
      userId: selectedMentor.id,
      data: { message },
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            Find a Mentor
          </h1>
          <p className="text-muted-foreground mt-1">Connect with top-performing mentors who can guide your studies.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mentor list */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Available Mentors</h2>
            {mentors.length === 0 ? (
              <Card className="border">
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  No mentors found yet.
                </CardContent>
              </Card>
            ) : (
              mentors.map((mentor) => (
                <Card
                  key={mentor.id}
                  className={`border cursor-pointer transition-all hover:border-indigo-300 hover:shadow-md ${selectedMentor?.id === mentor.id ? "border-indigo-500 bg-indigo-50" : ""}`}
                  onClick={() => setSelectedMentor({ id: mentor.id, name: mentor.name })}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                        {mentor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{mentor.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3 text-indigo-500" />
                        <span>{mentor.focusPoints.toLocaleString()} pts</span>
                      </div>
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">
                      #{mentor.rank}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Chat area */}
          <div className="lg:col-span-2">
            {!selectedMentor ? (
              <Card className="border h-full min-h-80 flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Select a mentor to start chatting</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border flex flex-col h-[500px]">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                        {selectedMentor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedMentor.name}
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
                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isOwn ? "bg-indigo-600 text-white rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
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
}
