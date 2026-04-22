import { Router } from "express";
import { db, sessionsTable, usersTable, focusEventsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { CreateSessionBody } from "@workspace/api-zod";

const router = Router();

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const sessionCreationByUser = new Map<number, number[]>();
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_SESSIONS_PER_HOUR = 20;

router.get("/sessions", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.user!.id;

  const sessions = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.userId, userId))
    .orderBy(sql`${sessionsTable.createdAt} desc`);

  res.json(sessions);
});

router.post("/sessions", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = req.user!.id;
  const now = Date.now();
  const timestamps = sessionCreationByUser.get(userId) ?? [];
  const recent = timestamps.filter((t) => now - t <= RATE_WINDOW_MS);
  if (recent.length >= MAX_SESSIONS_PER_HOUR) {
    res.status(429).json({ error: "Too many sessions recorded recently. Please try again later." });
    return;
  }

  const {
    level = "deep",
    duration,
    pointsEarned,
    pointsBase = 100,
    pointsQuizBonus = 0,
    pointsFocusBonus = 0,
    pointsBehaviorBonus = 0,
    pointsStreakBonus = 0,
    pointsDailyGoalBonus = 0,
    pointsPenaltyTab = 0,
    pointsPenaltyIdle = 0,
    pointsIntegrityMultiplier,
    focusScore = 0,
    focusChecks = 0,
    focusedChecks = 0,
    tabSwitchCount = 0,
    windowBlurCount = 0,
    idleIncidentCount = 0,
    idleSeconds = 0,
    mouseMoves = 0,
    scrollEvents = 0,
    keyPresses = 0,
    pauseCount = 0,
    behaviorScore = 0,
    sessionIntegrityScore,
    consistencyScore,
    recallAccuracy = 0,
    fatigueRiskScore = 0,
    screenLightMode = false,
    reflectionRequired = false,
    mentorReviewFlagged = false,
    reflectionNote = "",
    cameraUsed = false,
  } = parsed.data;

  const interactionCount = mouseMoves + scrollEvents + keyPresses;
  const expectedInteractions = Math.max(20, Math.round(duration * 25));
  const derivedBehaviorScore = clamp(Math.round((interactionCount / expectedInteractions) * 100), 0, 100);

  const antiCheatPenalty = tabSwitchCount * 10 + idleIncidentCount * 20 + windowBlurCount * 4 + pauseCount * 2;
  const derivedIntegrityScore = clamp(100 - antiCheatPenalty, 0, 100);

  const derivedConsistencyScore = clamp(
    Math.round((duration >= 20 ? 40 : 20) + (interactionCount >= expectedInteractions * 0.7 ? 30 : 10) + (antiCheatPenalty <= 20 ? 30 : 10)),
    0,
    100,
  );

  const integrity = clamp(sessionIntegrityScore ?? derivedIntegrityScore, 0, 100);
  const finalMultiplier = clamp(
    pointsIntegrityMultiplier ?? (integrity < 40 ? 50 : integrity < 60 ? 70 : integrity < 75 ? 85 : 100),
    0,
    100,
  );
  const finalPointsEarned = Math.max(0, Math.round(pointsEarned * (finalMultiplier / 100)));
  const finalReflectionRequired = reflectionRequired || integrity < 60;
  const finalMentorReviewFlagged = mentorReviewFlagged || integrity < 50 || idleIncidentCount >= 4 || tabSwitchCount >= 8;

  if (finalReflectionRequired && (!reflectionNote || reflectionNote.trim().length < 12)) {
    res.status(400).json({ error: "Low integrity sessions require a reflection note (at least 12 characters)." });
    return;
  }

  const [session] = await db.insert(sessionsTable).values({
    userId,
    level,
    duration,
    pointsEarned: finalPointsEarned,
    pointsBase,
    pointsQuizBonus,
    pointsFocusBonus,
    pointsBehaviorBonus,
    pointsStreakBonus,
    pointsDailyGoalBonus,
    pointsPenaltyTab,
    pointsPenaltyIdle,
    pointsIntegrityMultiplier: finalMultiplier,
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
    behaviorScore: clamp(behaviorScore || derivedBehaviorScore, 0, 100),
    sessionIntegrityScore: integrity,
    consistencyScore: clamp(consistencyScore ?? derivedConsistencyScore, 0, 100),
    recallAccuracy: clamp(recallAccuracy, 0, 100),
    fatigueRiskScore: clamp(fatigueRiskScore, 0, 100),
    screenLightMode,
    reflectionRequired: finalReflectionRequired,
    mentorReviewFlagged: finalMentorReviewFlagged,
    reflectionNote,
    cameraUsed,
  }).returning();

  const eventRows = [
    { userId, sessionId: session.id, eventType: "session_integrity", eventValue: integrity, metadata: level },
    { userId, sessionId: session.id, eventType: "tab_switch", eventValue: tabSwitchCount, metadata: "anti_cheat" },
    { userId, sessionId: session.id, eventType: "idle_incident", eventValue: idleIncidentCount, metadata: "anti_cheat" },
    { userId, sessionId: session.id, eventType: "behavior_score", eventValue: clamp(behaviorScore || derivedBehaviorScore, 0, 100), metadata: "engagement" },
    { userId, sessionId: session.id, eventType: "fatigue_risk", eventValue: clamp(fatigueRiskScore, 0, 100), metadata: screenLightMode ? "screen_light_mode" : "regular_mode" },
  ];
  await db.insert(focusEventsTable).values(eventRows);

  sessionCreationByUser.set(userId, [...recent, now]);

  await db
    .update(usersTable)
    .set({ focusPoints: sql`${usersTable.focusPoints} + ${finalPointsEarned}` })
    .where(eq(usersTable.id, userId));

  res.status(201).json(session);
});

export default router;
