import { pgTable, serial, integer, timestamp, boolean, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  level: text("level").notNull().default("deep"),
  duration: integer("duration").notNull(),
  pointsEarned: integer("points_earned").notNull(),
  pointsBase: integer("points_base").notNull().default(100),
  pointsQuizBonus: integer("points_quiz_bonus").notNull().default(0),
  pointsFocusBonus: integer("points_focus_bonus").notNull().default(0),
  pointsBehaviorBonus: integer("points_behavior_bonus").notNull().default(0),
  pointsStreakBonus: integer("points_streak_bonus").notNull().default(0),
  pointsDailyGoalBonus: integer("points_daily_goal_bonus").notNull().default(0),
  pointsPenaltyTab: integer("points_penalty_tab").notNull().default(0),
  pointsPenaltyIdle: integer("points_penalty_idle").notNull().default(0),
  pointsIntegrityMultiplier: integer("points_integrity_multiplier").notNull().default(100),
  focusScore: integer("focus_score").notNull().default(0),
  focusChecks: integer("focus_checks").notNull().default(0),
  focusedChecks: integer("focused_checks").notNull().default(0),
  tabSwitchCount: integer("tab_switch_count").notNull().default(0),
  windowBlurCount: integer("window_blur_count").notNull().default(0),
  idleIncidentCount: integer("idle_incident_count").notNull().default(0),
  idleSeconds: integer("idle_seconds").notNull().default(0),
  mouseMoves: integer("mouse_moves").notNull().default(0),
  scrollEvents: integer("scroll_events").notNull().default(0),
  keyPresses: integer("key_presses").notNull().default(0),
  pauseCount: integer("pause_count").notNull().default(0),
  behaviorScore: integer("behavior_score").notNull().default(0),
  sessionIntegrityScore: integer("session_integrity_score").notNull().default(100),
  consistencyScore: integer("consistency_score").notNull().default(0),
  recallAccuracy: integer("recall_accuracy").notNull().default(0),
  fatigueRiskScore: integer("fatigue_risk_score").notNull().default(0),
  screenLightMode: boolean("screen_light_mode").notNull().default(false),
  reflectionRequired: boolean("reflection_required").notNull().default(false),
  mentorReviewFlagged: boolean("mentor_review_flagged").notNull().default(false),
  reflectionNote: text("reflection_note").notNull().default(""),
  cameraUsed: boolean("camera_used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true, createdAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
