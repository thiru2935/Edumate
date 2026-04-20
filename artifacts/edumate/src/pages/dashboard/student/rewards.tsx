import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetStudentSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Trophy, GraduationCap, Briefcase, Tag, Lock, CheckCircle, Zap } from "lucide-react";

const rewards = [
  {
    id: 1,
    title: "Partner Discount Coupon",
    description: "20% off on premium study resources from our partner platforms.",
    points: 500,
    icon: Tag,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    id: 2,
    title: "Internship Portal Access",
    description: "Exclusive access to 50+ internship opportunities from top companies.",
    points: 3000,
    icon: Briefcase,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
  },
  {
    id: 3,
    title: "Merit Scholarship",
    description: "Apply for a $500 scholarship awarded to top-performing EduMate students.",
    points: 5000,
    icon: GraduationCap,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    id: 4,
    title: "Premium Mentor Session",
    description: "1-on-1 session with an expert mentor in your chosen field.",
    points: 1500,
    icon: Trophy,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
];

export default function RewardsPage() {
  const { toast } = useToast();
  const { data: summary, isLoading } = useGetStudentSummary();
  const focusPoints = summary?.focusPoints ?? 0;

  const handleRedeem = (reward: typeof rewards[0]) => {
    if (focusPoints < reward.points) {
      toast({
        title: "Not enough points",
        description: `You need ${(reward.points - focusPoints).toLocaleString()} more focus points to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Reward Redeemed!",
      description: `You've successfully redeemed "${reward.title}". Check your email for details.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Rewards
          </h1>
          <p className="text-muted-foreground mt-1">Redeem your focus points for real opportunities.</p>
        </div>

        {/* Points header */}
        <Card className="border mb-8 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm mb-1">Your Focus Points</p>
                <p className="text-5xl font-bold">
                  {isLoading ? "—" : focusPoints.toLocaleString()}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-amber-300" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-indigo-200 mb-2">
                <span>Progress to next tier</span>
                <span>{Math.min(focusPoints, 5000).toLocaleString()} / 5,000 pts</span>
              </div>
              <Progress value={Math.min((focusPoints / 5000) * 100, 100)} className="h-2 bg-white/20" />
            </div>
          </CardContent>
        </Card>

        {/* Rewards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewards.map((reward) => {
            const unlocked = focusPoints >= reward.points;
            const progress = Math.min((focusPoints / reward.points) * 100, 100);
            return (
              <Card key={reward.id} className={`border transition-all hover:shadow-md ${unlocked ? "hover:border-indigo-200" : "opacity-80"}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${reward.bg} flex items-center justify-center flex-shrink-0`}>
                      <reward.icon className={`h-6 w-6 ${reward.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{reward.title}</h3>
                        {unlocked ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Required: {reward.points.toLocaleString()} pts</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={`${reward.bg} ${reward.color} ${reward.border} border`}>
                      {reward.points.toLocaleString()} pts
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleRedeem(reward)}
                      className={unlocked ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                      variant={unlocked ? "default" : "outline"}
                      disabled={!unlocked}
                    >
                      {unlocked ? "Redeem" : `Need ${(reward.points - focusPoints).toLocaleString()} more`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
