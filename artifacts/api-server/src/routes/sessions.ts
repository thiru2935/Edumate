import { Router } from "express";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { CreateSessionBody } from "@workspace/api-zod";

const router = Router();

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
  const { duration, pointsEarned } = parsed.data;

  const [session] = await db.insert(sessionsTable).values({
    userId,
    duration,
    pointsEarned,
  }).returning();

  await db
    .update(usersTable)
    .set({ focusPoints: sql`${usersTable.focusPoints} + ${pointsEarned}` })
    .where(eq(usersTable.id, userId));

  res.status(201).json(session);
});

export default router;
