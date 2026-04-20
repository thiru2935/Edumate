import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useCreateSession } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetStudentSummaryQueryKey, getListSessionsQueryKey } from "@workspace/api-client-react";
import { Timer, Play, Pause, RotateCcw, CheckCircle, BookOpen, Zap } from "lucide-react";

const POMODORO_MINUTES = 25;
const TOTAL_SECONDS = POMODORO_MINUTES * 60;

const mockQuiz = [
  {
    question: "What study technique involves 25-minute focused sessions?",
    options: ["The Pomodoro Technique", "The Cornell Method", "Mind Mapping", "Spaced Repetition"],
    answer: 0,
  },
  {
    question: "What happens to memory retention with regular review sessions?",
    options: ["It decreases rapidly", "It stays the same", "It significantly improves", "It has no effect"],
    answer: 2,
  },
  {
    question: "Which is the most effective note-taking strategy for retention?",
    options: ["Copying word-for-word", "Summarizing in own words", "Highlighting only", "Not taking notes"],
    answer: 1,
  },
];

export default function FocusLearning() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [material, setMaterial] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createSession = useCreateSession({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetStudentSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
      },
    },
  });

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setCompleted(true);
            setShowQuiz(true);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const progress = ((TOTAL_SECONDS - seconds) / TOTAL_SECONDS) * 100;

  const reset = () => {
    setSeconds(TOTAL_SECONDS);
    setRunning(false);
    setCompleted(false);
    setShowQuiz(false);
    setCurrentQ(0);
    setSelected(null);
    setCorrect(0);
    setQuizDone(false);
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === mockQuiz[currentQ].answer) setCorrect((c) => c + 1);
  };

  const nextQuestion = () => {
    if (currentQ < mockQuiz.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
    } else {
      setQuizDone(true);
      const pointsEarned = POMODORO_MINUTES + correct * 5;
      createSession.mutate({
        data: { duration: POMODORO_MINUTES, pointsEarned },
      });
      toast({
        title: "Session Complete!",
        description: `You earned ${pointsEarned} focus points! (${correct}/${mockQuiz.length} quiz correct)`,
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Timer className="h-6 w-6 text-indigo-600" />
            Focus Learning
          </h1>
          <p className="text-muted-foreground mt-1">Start a Pomodoro session and earn focus points.</p>
        </div>

        {!showQuiz ? (
          <div className="space-y-6">
            {/* Material input */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  What are you studying?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="material">Study topic or material URL</Label>
                  <Input
                    id="material"
                    placeholder="e.g. Calculus Chapter 3, Organic Chemistry..."
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    disabled={running}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Timer */}
            <Card className="border text-center">
              <CardContent className="pt-8 pb-8">
                {/* Circular progress indicator */}
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
                    <circle
                      cx="50" cy="50" r="45" fill="none"
                      stroke="hsl(var(--primary))" strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-5xl font-bold font-mono text-foreground">{formatTime(seconds)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {completed ? "Complete!" : running ? "Focusing..." : "Ready"}
                    </p>
                  </div>
                </div>

                <Progress value={progress} className="mb-6 h-2 max-w-xs mx-auto" />

                <div className="flex justify-center gap-3">
                  <Button
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 px-8"
                    onClick={() => setRunning(!running)}
                    disabled={completed}
                  >
                    {running ? <><Pause className="h-5 w-5 mr-2" />Pause</> : <><Play className="h-5 w-5 mr-2" />Start</>}
                  </Button>
                  <Button variant="outline" size="lg" onClick={reset}>
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>

                <div className="mt-6 flex justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-indigo-500" />
                    <span>+{POMODORO_MINUTES} pts on complete</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-emerald-500" />
                    <span>+5 pts per quiz answer</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : quizDone ? (
          <Card className="border text-center">
            <CardContent className="py-12">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
              <p className="text-muted-foreground mb-4">
                You scored {correct}/{mockQuiz.length} on the quiz.
              </p>
              <Badge className="text-base px-6 py-2 bg-indigo-600 text-white border-0 mb-6">
                +{POMODORO_MINUTES + correct * 5} focus points earned
              </Badge>
              <br />
              <Button onClick={reset} className="bg-indigo-600 hover:bg-indigo-700">
                Start Another Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Quick Knowledge Check</CardTitle>
                <Badge variant="outline">{currentQ + 1}/{mockQuiz.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-6">{mockQuiz[currentQ].question}</p>
              <div className="space-y-3">
                {mockQuiz[currentQ].options.map((opt, i) => {
                  let variant: string = "outline";
                  if (selected !== null) {
                    if (i === mockQuiz[currentQ].answer) variant = "correct";
                    else if (i === selected) variant = "wrong";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className={`w-full text-left p-4 rounded-xl border transition-all text-sm font-medium
                        ${selected === null ? "hover:border-indigo-400 hover:bg-indigo-50" : ""}
                        ${variant === "correct" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : ""}
                        ${variant === "wrong" ? "border-red-400 bg-red-50 text-red-800" : ""}
                        ${selected !== null && variant === "outline" ? "opacity-60" : ""}
                      `}
                    >
                      <span className="inline-flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selected !== null && (
                <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700" onClick={nextQuestion}>
                  {currentQ < mockQuiz.length - 1 ? "Next Question" : "Finish Quiz"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
