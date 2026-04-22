import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const focusEventsTable = pgTable("focus_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: integer("session_id").notNull(),
  eventType: text("event_type").notNull(),
  eventValue: integer("event_value").notNull().default(0),
  metadata: text("metadata").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
