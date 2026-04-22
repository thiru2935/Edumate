import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useCreateSession } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetStudentSummaryQueryKey,
  getListSessionsQueryKey,
  useGetLeaderboard,
  useGetStudentSummary,
  useListSessions,
} from "@workspace/api-client-react";
import { Timer, Play, Pause, RotateCcw, CheckCircle, BookOpen, Zap, Camera, ShieldAlert, Trophy, Eye, AlertTriangle, BarChart3, MoonStar, Mic } from "lucide-react";

type FocusLevelKey = "warmup" | "deep" | "mastery";

const focusLevels: Record<FocusLevelKey, {
  title: string;
  minutes: number;
  breakMinutes: number;
  autoDimAfterMin: number;
  description: string;
}> = {
  warmup: {
    title: "Level 1 · Warm-up Focus",
    minutes: 15,
    breakMinutes: 3,
    autoDimAfterMin: 15,
    description: "Light intro session with low strain.",
  },
  deep: {
    title: "Level 2 · Deep Focus",
    minutes: 30,
    breakMinutes: 8,
    autoDimAfterMin: 20,
    description: "Controlled Pomodoro intensity with recovery.",
  },
  mastery: {
    title: "Level 3 · Mastery Mode",
    minutes: 20,
    breakMinutes: 12,
    autoDimAfterMin: 15,
    description: "Hybrid behavior-aware focus with longer breaks.",
  },
};

const BASE_SESSION_POINTS = 100;
const TAB_SWITCH_PENALTY = 10;
const IDLE_PENALTY = 20;
const DAILY_GOAL_SESSIONS = 3;
const DAILY_GOAL_BONUS = 30;
const IDLE_THRESHOLD_MS = 45_000;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type FaceDetectorLike = {
  detect: (image: ImageBitmapSource) => Promise<unknown[]>;
};

type FaceDetectorCtor = new (options?: {
  fastMode?: boolean;
  maxDetectedFaces?: number;
}) => FaceDetectorLike;

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
  const [selectedLevel, setSelectedLevel] = useState<FocusLevelKey>("deep");
  const totalSeconds = focusLevels[selectedLevel].minutes * 60;
  const [seconds, setSeconds] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [material, setMaterial] = useState("");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [requireCameraToStart, setRequireCameraToStart] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [focusChecks, setFocusChecks] = useState(0);
  const [focusedChecks, setFocusedChecks] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [windowBlurCount, setWindowBlurCount] = useState(0);
  const [idleIncidentCount, setIdleIncidentCount] = useState(0);
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [mouseMoves, setMouseMoves] = useState(0);
  const [scrollEvents, setScrollEvents] = useState(0);
  const [keyPresses, setKeyPresses] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [audioMode, setAudioMode] = useState(false);
  const [screenLightMode, setScreenLightMode] = useState(false);
  const [reflectionNote, setReflectionNote] = useState("");
  const [inBreak, setInBreak] = useState(false);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analysisIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkingRef = useRef(false);
  const isIdleRef = useRef(false);
  const lastActivityRef = useRef<number>(Date.now());
  const eyeReminderCheckpointRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<FaceDetectorLike | null>(null);

  const sessionsQuery = useListSessions();
  const summaryQuery = useGetStudentSummary();
  const leaderboardQuery = useGetLeaderboard();

  const focusScore = focusChecks > 0 ? Math.round((focusedChecks / focusChecks) * 100) : 0;
  const elapsedSeconds = totalSeconds - seconds;
  const sessionProgress = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0;
  const quizBonus = correct * 5;
  const tabPenalty = tabSwitchCount * TAB_SWITCH_PENALTY;
  const idlePenalty = idleIncidentCount * IDLE_PENALTY;
  const focusBonus = cameraEnabled && focusChecks > 0 ? Math.round((focusScore / 100) * 20) : 0;
  const elapsedMinutes = Math.max(1, elapsedSeconds / 60);
  const interactionCount = mouseMoves + scrollEvents + keyPresses;
  const expectedInteractions = Math.max(20, Math.round(elapsedMinutes * 25));
  const behaviorScore = Math.min(100, Math.round((interactionCount / expectedInteractions) * 100));
  const behaviorBonus = selectedLevel === "mastery" ? Math.round(behaviorScore / 10) : 0;
  const recallAccuracy = Math.round((correct / mockQuiz.length) * 100);
  const consistencyScore = clamp(
    Math.round((sessionProgress * 0.4) + (behaviorScore * 0.4) + (Math.max(0, 100 - (pauseCount * 7 + tabSwitchCount * 10 + idleIncidentCount * 15)) * 0.2)),
    0,
    100,
  );
  const sessionIntegrityScore = clamp(100 - (tabSwitchCount * 10 + idleIncidentCount * 20 + windowBlurCount * 4 + pauseCount * 2), 0, 100);
  const integrityMultiplier = sessionIntegrityScore < 40 ? 50 : sessionIntegrityScore < 60 ? 70 : sessionIntegrityScore < 75 ? 85 : 100;
  const lowIntegrityNeedsReflection = sessionIntegrityScore < 60;
  const streakBonus = (summaryQuery.data?.currentStreak ?? 0) >= 7 ? 25 : (summaryQuery.data?.currentStreak ?? 0) >= 3 ? 10 : 0;
  const todaySessionsCount = (sessionsQuery.data ?? []).filter((session) => {
    const created = new Date(session.createdAt);
    const now = new Date();
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth() && created.getDate() === now.getDate();
  }).length;
  const dailyGoalBonus = todaySessionsCount + 1 === DAILY_GOAL_SESSIONS ? DAILY_GOAL_BONUS : 0;

  const pointsBase = BASE_SESSION_POINTS;
  const pointsQuizBonus = quizBonus;
  const pointsFocusBonus = focusBonus;
  const pointsBehaviorBonus = behaviorBonus;
  const pointsStreakBonus = streakBonus;
  const pointsDailyGoalBonus = dailyGoalBonus;
  const pointsPenaltyTab = tabPenalty;
  const pointsPenaltyIdle = idlePenalty;

  const rawPointsBeforeMultiplier = Math.max(
    0,
    pointsBase + pointsQuizBonus + pointsFocusBonus + pointsBehaviorBonus + pointsStreakBonus + pointsDailyGoalBonus - pointsPenaltyTab - pointsPenaltyIdle,
  );

  const levelScore = Math.round((consistencyScore * 0.4) + (focusScore * 0.3) + (recallAccuracy * 0.3));
  const pointsEarnedPreview = Math.max(0, Math.round(rawPointsBeforeMultiplier * (integrityMultiplier / 100)));
  const todayStudyMinutes = (sessionsQuery.data ?? [])
    .filter((session) => {
      const created = new Date(session.createdAt);
      const now = new Date();
      return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth() && created.getDate() === now.getDate();
    })
    .reduce((sum, session) => sum + session.duration, 0);
  const fatigueRiskScore = clamp(Math.round(Math.min(100, todaySessionsCount * 15 + (todayStudyMinutes / 120) * 35 + (pauseCount * 5))), 0, 100);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfToday);
    day.setDate(startOfToday.getDate() - (6 - i));
    const key = day.toISOString().slice(0, 10);
    const daySessions = (sessionsQuery.data ?? []).filter((session) => new Date(session.createdAt).toISOString().slice(0, 10) === key);
    const totalPoints = daySessions.reduce((sum, s) => sum + s.pointsEarned, 0);
    const avgIntegrity = daySessions.length > 0
      ? Math.round(daySessions.reduce((sum, s) => sum + s.sessionIntegrityScore, 0) / daySessions.length)
      : 0;
    return {
      label: day.toLocaleDateString(undefined, { weekday: "short" }),
      totalPoints,
      avgIntegrity,
      sessions: daySessions.length,
    };
  });
  const trendMaxPoints = Math.max(1, ...weeklyTrend.map((d) => d.totalPoints));

  const recentSessions = (sessionsQuery.data ?? []).slice(0, 5);
  const shouldUseShorterSessionSuggestion = fatigueRiskScore >= 70;
  const shouldUseLongerBreakSuggestion = fatigueRiskScore >= 60;
  const reflectionRequired = lowIntegrityNeedsReflection || screenLightMode;
  const shouldDimScreen = running && elapsedSeconds >= focusLevels[selectedLevel].autoDimAfterMin * 60;

  const speak = (message: string) => {
    if (!audioMode || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const createSession = useCreateSession({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetStudentSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
      },
    },
  });

  useEffect(() => {
    setSeconds(totalSeconds);
    setCompleted(false);
    setShowQuiz(false);
    setCurrentQ(0);
    setSelected(null);
    setCorrect(0);
    setQuizDone(false);
    setFocusChecks(0);
    setFocusedChecks(0);
    setTabSwitchCount(0);
    setWindowBlurCount(0);
    setIdleIncidentCount(0);
    setIdleSeconds(0);
    setMouseMoves(0);
    setScrollEvents(0);
    setKeyPresses(0);
    setPauseCount(0);
    eyeReminderCheckpointRef.current = 0;
  }, [totalSeconds]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setCompleted(true);
            setShowQuiz(true);
            const breakForSeconds = focusLevels[selectedLevel].breakMinutes * 60;
            setInBreak(true);
            setBreakSeconds(breakForSeconds);
            toast({
              title: "Recovery break started",
              description: `Mandatory ${focusLevels[selectedLevel].breakMinutes} min break. Follow the 20-20-20 rule and stretch a bit.`,
            });
            speak("Session complete. Time for a recovery break.");
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, selectedLevel, toast]);

  useEffect(() => {
    if (!inBreak) return;

    const timer = setInterval(() => {
      setBreakSeconds((current) => {
        if (current <= 1) {
          clearInterval(timer);
          setInBreak(false);
          toast({
            title: "Break complete",
            description: "Great recovery! You can start your next focus session now.",
          });
          speak("Break complete. You can begin your next session.");
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [inBreak, toast]);

  const stopCamera = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    detectorRef.current = null;
    setCameraEnabled(false);
  };

  const startCamera = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const win = window as Window & { FaceDetector?: FaceDetectorCtor };
      if (win.FaceDetector) {
        detectorRef.current = new win.FaceDetector({
          fastMode: true,
          maxDetectedFaces: 1,
        });
      }

      setCameraEnabled(true);
      setCameraError(null);
    } catch {
      setCameraError("Unable to access camera. Please allow camera permission.");
      stopCamera();
    }
  };

  useEffect(() => {
    if (!running || !cameraEnabled) {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
      return;
    }

    const runFocusCheck = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        let focused = false;
        const video = videoRef.current;

        if (video && video.readyState >= 2 && !document.hidden) {
          if (detectorRef.current) {
            try {
              const faces = await detectorRef.current.detect(video);
              focused = faces.length > 0;
            } catch {
              focused = true;
            }
          } else {
            focused = true;
          }
        }

        setFocusChecks((v) => v + 1);
        if (focused) {
          setFocusedChecks((v) => v + 1);
        }
      } finally {
        checkingRef.current = false;
      }
    };

    void runFocusCheck();
    analysisIntervalRef.current = setInterval(() => {
      void runFocusCheck();
    }, 3000);

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
    };
  }, [running, cameraEnabled]);

  useEffect(() => {
    const markActivity = () => {
      lastActivityRef.current = Date.now();
      if (isIdleRef.current) {
        isIdleRef.current = false;
      }
    };

    const onMouseMove = () => {
      if (!running) return;
      setMouseMoves((v) => v + 1);
      markActivity();
    };

    const onScroll = () => {
      if (!running) return;
      setScrollEvents((v) => v + 1);
      markActivity();
    };

    const onKeyDown = () => {
      if (!running) return;
      setKeyPresses((v) => v + 1);
      markActivity();
    };

    const onClick = () => {
      if (!running) return;
      markActivity();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("touchstart", onClick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("touchstart", onClick);
    };
  }, [running]);

  useEffect(() => {
    if (!running) {
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current);
        idleCheckIntervalRef.current = null;
      }
      return;
    }

    idleCheckIntervalRef.current = setInterval(() => {
      const idleForMs = Date.now() - lastActivityRef.current;
      if (idleForMs >= IDLE_THRESHOLD_MS) {
        setIdleSeconds((v) => v + 5);
        if (!isIdleRef.current) {
          isIdleRef.current = true;
          setIdleIncidentCount((v) => v + 1);
          toast({
            title: "Idle detected",
            description: "No interaction detected. Idle penalty applied.",
            variant: "destructive",
          });
          speak("You appear idle. Please refocus.");
        }
      }
    }, 5000);

    return () => {
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current);
        idleCheckIntervalRef.current = null;
      }
    };
  }, [running, toast]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!running) return;
      if (!document.hidden) return;

      setTabSwitchCount((v) => v + 1);
      toast({
        title: "Focus warning",
        description: "Tab switch detected. -10 points penalty will apply.",
        variant: "destructive",
      });
      speak("Tab switch detected. Please stay focused.");
    };

    const handleWindowBlur = () => {
      if (!running) return;
      if (document.hidden) return;
      setWindowBlurCount((v) => v + 1);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [running, toast]);

  useEffect(() => {
    if (!running) return;
    const reminderWindow = Math.floor(elapsedSeconds / (20 * 60));
    if (reminderWindow <= 0 || reminderWindow <= eyeReminderCheckpointRef.current) return;

    eyeReminderCheckpointRef.current = reminderWindow;
    toast({
      title: "20-20-20 reminder",
      description: "Look 20 feet away for 20 seconds and relax your eyes.",
    });
    speak("Eye break reminder. Look away for 20 seconds.");
  }, [elapsedSeconds, running, toast]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;

  const formatDuration = (remainingSeconds: number) => {
    const mins = Math.floor(remainingSeconds / 60).toString().padStart(2, "0");
    const secs = (remainingSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const reset = () => {
    setSeconds(totalSeconds);
    setRunning(false);
    setCompleted(false);
    setShowQuiz(false);
    setCurrentQ(0);
    setSelected(null);
    setCorrect(0);
    setQuizDone(false);
    setFocusChecks(0);
    setFocusedChecks(0);
    setTabSwitchCount(0);
    setWindowBlurCount(0);
    setIdleIncidentCount(0);
    setIdleSeconds(0);
    setMouseMoves(0);
    setScrollEvents(0);
    setKeyPresses(0);
    setPauseCount(0);
    eyeReminderCheckpointRef.current = 0;
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
      const pointsEarned = Math.max(
        0,
        BASE_SESSION_POINTS + quizBonus + focusBonus + behaviorBonus + streakBonus + dailyGoalBonus - tabPenalty - idlePenalty,
      );
      createSession.mutate({
        data: {
          level: selectedLevel,
          duration: focusLevels[selectedLevel].minutes,
          pointsEarned,
          pointsBase,
          pointsQuizBonus,
          pointsFocusBonus,
          pointsBehaviorBonus,
          pointsStreakBonus,
          pointsDailyGoalBonus,
          pointsPenaltyTab,
          pointsPenaltyIdle,
          pointsIntegrityMultiplier: integrityMultiplier,
          focusScore,
          focusChecks,
          focusedChecks,
          tabSwitchCount,
          windowBlurCount,
          idleIncidentCount,
          idleSeconds,
          mouseMoves,
          scrollEvents,
          keyPresses,
          pauseCount,
          behaviorScore,
          sessionIntegrityScore,
          consistencyScore,
          recallAccuracy,
          fatigueRiskScore,
          screenLightMode,
          reflectionRequired,
          mentorReviewFlagged: sessionIntegrityScore < 50 || idleIncidentCount >= 4 || tabSwitchCount >= 8,
          reflectionNote: reflectionNote.trim(),
          cameraUsed: cameraEnabled,
        },
      });
      toast({
        title: "Session Complete!",
        description: `+${pointsEarned} points (base ${BASE_SESSION_POINTS}, tab -${tabPenalty}, idle -${idlePenalty}${dailyGoalBonus > 0 ? `, daily goal +${dailyGoalBonus}` : ""}${integrityMultiplier < 100 ? `, integrity ×${integrityMultiplier}%` : ""}).`,
      });
      speak("Excellent work. Session points added.");
    }
  };

  const toggleTimer = () => {
    if (!running && inBreak) {
      toast({
        title: "Break lock active",
        description: `Recovery break in progress (${formatDuration(breakSeconds)} remaining).`,
      });
      return;
    }

    if (!running && requireCameraToStart && !cameraEnabled) {
      toast({
        title: "Camera required",
        description: "Enable front camera before starting the focus session.",
        variant: "destructive",
      });
      return;
    }

    if (!running && seconds === totalSeconds) {
      setFocusChecks(0);
      setFocusedChecks(0);
      setTabSwitchCount(0);
      setWindowBlurCount(0);
      setIdleIncidentCount(0);
      setIdleSeconds(0);
      setMouseMoves(0);
      setScrollEvents(0);
      setKeyPresses(0);
      setPauseCount(0);
      lastActivityRef.current = Date.now();
      isIdleRef.current = false;
      eyeReminderCheckpointRef.current = 0;
    }

    if (running) {
      setPauseCount((v) => v + 1);
    }
    setRunning((v) => !v);
  };

  return (
    <DashboardLayout>
      <div className={`p-6 md:p-8 max-w-3xl mx-auto transition-all ${shouldDimScreen ? "brightness-90 saturate-90" : ""}`}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Timer className="h-6 w-6 text-indigo-600" />
            Focus Learning
          </h1>
          <p className="text-muted-foreground mt-1">More progress = smarter study + better breaks.</p>
        </div>

        {!showQuiz ? (
          <div className="space-y-6">
            {/* Focus levels */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-600" />
                  3-Level Focus Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  {(Object.keys(focusLevels) as FocusLevelKey[]).map((levelKey) => {
                    const level = focusLevels[levelKey];
                    const active = selectedLevel === levelKey;
                    return (
                      <button
                        key={levelKey}
                        type="button"
                        disabled={running}
                        onClick={() => setSelectedLevel(levelKey)}
                        className={`rounded-xl border p-3 text-left transition-all ${active ? "border-indigo-600 bg-indigo-50" : "hover:border-indigo-400"} ${running ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <p className="font-semibold text-sm">{level.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
                        <p className="text-xs mt-2">{level.minutes} min focus · {level.breakMinutes} min break</p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline">Session: {focusLevels[selectedLevel].minutes} min</Badge>
                  <Badge variant="outline">Break lock: {focusLevels[selectedLevel].breakMinutes} min</Badge>
                  <Badge variant="outline">Auto-dim after {focusLevels[selectedLevel].autoDimAfterMin} min</Badge>
                  <Badge variant="outline">Level score: {levelScore}/100</Badge>
                  <Button type="button" variant={audioMode ? "default" : "outline"} onClick={() => setAudioMode((v) => !v)}>
                    Audio reminders: {audioMode ? "On" : "Off"}
                  </Button>
                </div>

                {inBreak && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                    Recovery cycle active: {formatDuration(breakSeconds)} remaining. During this break, avoid scrolling and let your eyes recover.
                  </div>
                )}
              </CardContent>
            </Card>

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

            {/* Camera focus analysis */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Camera className="h-4 w-4 text-indigo-600" />
                  Front Camera Focus Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/20 p-3">
                  <video
                    ref={videoRef}
                    className="w-full rounded-md bg-black/80 aspect-video object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {cameraEnabled ? (
                    <Button variant="outline" onClick={stopCamera} disabled={running}>
                      Disable Camera
                    </Button>
                  ) : (
                    <Button onClick={startCamera} className="bg-indigo-600 hover:bg-indigo-700" disabled={running}>
                      Enable Front Camera
                    </Button>
                  )}

                  <Badge variant={cameraEnabled ? "default" : "outline"}>
                    {cameraEnabled ? "Camera On" : "Camera Off"}
                  </Badge>

                  <Badge variant="outline">
                    Focus score: {focusScore}%
                  </Badge>

                  <Badge variant="outline">
                    Focus bonus: +{focusBonus} pts
                  </Badge>

                  <Badge variant="outline">
                    Face checks: {focusedChecks}/{focusChecks}
                  </Badge>

                  <Badge variant="outline">
                    Behavior score: {behaviorScore}%
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant={requireCameraToStart ? "default" : "outline"}
                    className={requireCameraToStart ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                    onClick={() => setRequireCameraToStart((v) => !v)}
                    disabled={running}
                  >
                    Camera required to start: {requireCameraToStart ? "On" : "Off"}
                  </Button>
                </div>

                {cameraError ? (
                  <p className="text-sm text-red-600">{cameraError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    We analyze your presence during the session. Keep your face in frame for a higher focus score.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Anti-cheat and rewards */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-indigo-600" />
                  Anti-cheat + Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Tab switches: {tabSwitchCount}</Badge>
                  <Badge variant="outline">Window blur: {windowBlurCount}</Badge>
                  <Badge variant="outline">Idle incidents: {idleIncidentCount}</Badge>
                  <Badge variant="outline">Idle time: {Math.floor(idleSeconds / 60)}m {idleSeconds % 60}s</Badge>
                  <Badge variant="outline">Interactions: {interactionCount}</Badge>
                  <Badge variant="outline">Pauses: {pauseCount}</Badge>
                  <Badge variant="outline">Integrity score: {sessionIntegrityScore}%</Badge>
                </div>

                <div className="rounded-lg border p-3 bg-muted/20 text-sm space-y-1">
                  <p className="font-semibold">Scoring logic</p>
                  <p>Full session: +{BASE_SESSION_POINTS}</p>
                  <p>Tab switch: -{TAB_SWITCH_PENALTY} each · Idle event: -{IDLE_PENALTY} each</p>
                  <p>Camera focus bonus: up to +20 · Mastery behavior bonus: up to +10</p>
                  <p>Level progression uses consistency + focus quality + recall accuracy.</p>
                  <p>Daily goal ({DAILY_GOAL_SESSIONS} sessions/day): +{DAILY_GOAL_BONUS} bonus</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Current streak</p>
                    <p className="font-bold text-lg">{summaryQuery.data?.currentStreak ?? 0} days 🔥</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Today progress</p>
                    <p className="font-bold text-lg">{todaySessionsCount}/{DAILY_GOAL_SESSIONS} sessions</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Global rank</p>
                    <p className="font-bold text-lg">#{summaryQuery.data?.rank ?? "-"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground">Quality score</p>
                    <p className="font-bold text-lg">{levelScore}/100</p>
                  </div>
                </div>

                <div className="rounded-lg border p-3 text-sm">
                  <p className="font-semibold mb-2 flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /> Unlock rewards</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>{todaySessionsCount >= DAILY_GOAL_SESSIONS ? "✅" : "⬜"} Daily goal achiever (3 sessions/day)</li>
                    <li>{(summaryQuery.data?.currentStreak ?? 0) >= 7 ? "✅" : "⬜"} 7-day streak badge</li>
                    <li>{focusScore >= 85 ? "✅" : "⬜"} Focus Pro (85%+ camera score)</li>
                  </ul>
                </div>

                <div className="rounded-lg border p-3 text-sm">
                  <p className="font-semibold mb-2">Leaderboard snapshot</p>
                  <div className="space-y-1 text-muted-foreground">
                    {(leaderboardQuery.data ?? []).slice(0, 3).map((entry) => (
                      <p key={entry.id}>#{entry.rank} {entry.name} · {entry.focusPoints} pts</p>
                    ))}
                    {(leaderboardQuery.data ?? []).length === 0 && <p>Leaderboard will appear once data is available.</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recovery intelligence */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MoonStar className="h-4 w-4 text-indigo-600" />
                  Recovery Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Fatigue risk: {fatigueRiskScore}%</Badge>
                  <Badge variant="outline">Screen-light mode: {screenLightMode ? "On" : "Off"}</Badge>
                  <Badge variant="outline">Reflection required: {reflectionRequired ? "Yes" : "No"}</Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    className={`rounded-xl border p-4 text-left transition-all ${screenLightMode ? "border-indigo-600 bg-indigo-50" : "hover:border-indigo-400"}`}
                    onClick={() => setScreenLightMode((v) => !v)}
                    disabled={running}
                  >
                    <p className="font-semibold flex items-center gap-2"><Mic className="h-4 w-4 text-indigo-600" /> Screen-light day</p>
                    <p className="text-sm text-muted-foreground mt-1">Prefer audio-first tasks, shorter screen bursts, and longer breaks.</p>
                  </button>
                  <div className="rounded-xl border p-4 bg-muted/20 text-sm space-y-1">
                    <p className="font-semibold">Suggestions</p>
                    <p>{shouldUseShorterSessionSuggestion ? "Use a shorter next session (10–15 min)." : "Keep your current session length if you feel steady."}</p>
                    <p>{shouldUseLongerBreakSuggestion ? "Take a longer break and do look-away recovery." : "Your break schedule looks healthy."}</p>
                  </div>
                </div>

                {reflectionRequired && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2">
                    <p className="font-semibold flex items-center gap-2 text-amber-900"><AlertTriangle className="h-4 w-4" /> Reflection note required</p>
                    <p className="text-sm text-amber-900">Low integrity or screen-light mode sessions must include a short reflection before saving.</p>
                    <Textarea
                      value={reflectionNote}
                      onChange={(e) => setReflectionNote(e.target.value)}
                      placeholder="What distracted you? What will you change next session?"
                      className="min-h-24 bg-white"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly trend and points history */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  Weekly Focus Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-7 gap-2 items-end h-40">
                  {weeklyTrend.map((day) => (
                    <div key={day.label} className="flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full max-w-12 flex flex-col items-center gap-1 justify-end h-full">
                        <div
                          className="w-full rounded-t-md bg-indigo-500/80"
                          style={{ height: `${Math.max(8, (day.totalPoints / trendMaxPoints) * 100)}%` }}
                          title={`${day.totalPoints} points`}
                        />
                        <div className="w-full rounded-b-md bg-emerald-400/70" style={{ height: `${Math.max(4, day.avgIntegrity)}%`, maxHeight: 28 }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{day.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>Indigo bars = points</span>
                  <span>Green bars = integrity</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  Points Breakdown History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="rounded-xl border p-3 text-sm space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{new Date(session.createdAt).toLocaleDateString()}</p>
                        <Badge variant="outline">{session.level}</Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {session.pointsBase} base + {session.pointsQuizBonus} quiz + {session.pointsFocusBonus} focus + {session.pointsBehaviorBonus} behavior + {session.pointsStreakBonus} streak + {session.pointsDailyGoalBonus} goal - {session.pointsPenaltyTab} tab - {session.pointsPenaltyIdle} idle
                      </p>
                      <p className="text-xs text-muted-foreground">Integrity {session.sessionIntegrityScore}% · Recall {session.recallAccuracy}% · Fatigue {session.fatigueRiskScore}%</p>
                    </div>
                  ))}
                  {recentSessions.length === 0 && <p className="text-sm text-muted-foreground">No session history yet.</p>}
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
                    onClick={toggleTimer}
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
                    <span>+{BASE_SESSION_POINTS} full session</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-emerald-500" />
                    <span>+5 pts per quiz answer</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-cyan-500" />
                    <span>+0 to +20 pts from camera focus score</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-red-500" />
                    <span>-10 pts per tab switch · -20 per idle</span>
                  </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  Estimated earned this session: <span className="font-semibold text-foreground">{pointsEarnedPreview} pts</span>
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
                +{pointsEarnedPreview} focus points earned
              </Badge>
              <br />
              <Button onClick={reset} className="bg-indigo-600 hover:bg-indigo-700" disabled={inBreak}>
                {inBreak ? `Break running (${formatDuration(breakSeconds)})` : "Start Another Session"}
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
