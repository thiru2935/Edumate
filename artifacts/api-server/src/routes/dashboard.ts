import { Router } from "express";
import { db, sessionsTable, usersTable, materialsTable } from "@workspace/db";
import { eq, sql, count } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

router.get("/dashboard/student-summary", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.user!.id;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const sessions = await db.select().from(sessionsTable).where(eq(sessionsTable.userId, userId));
  const totalStudyMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const sessionCount = sessions.length;

  const allUsers = await db
    .select({ id: usersTable.id, focusPoints: usersTable.focusPoints })
    .from(usersTable)
    .orderBy(sql`${usersTable.focusPoints} desc`);

  const rank = allUsers.findIndex(u => u.id === userId) + 1;

  const sortedSessions = [...sessions].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let currentStreak = 0;
  const now = new Date();
  for (let i = sortedSessions.length - 1; i >= 0; i--) {
    const sessionDate = new Date(sortedSessions[i].createdAt);
    const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= currentStreak + 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  res.json({
    focusPoints: user.focusPoints,
    totalStudyMinutes,
    sessionCount,
    currentStreak,
    rank,
  });
});

router.get("/dashboard/leaderboard", requireAuth, async (_req, res): Promise<void> => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      role: usersTable.role,
      focusPoints: usersTable.focusPoints,
    })
    .from(usersTable)
    .orderBy(sql`${usersTable.focusPoints} desc`)
    .limit(20);

  const leaderboard = users.map((u, i) => ({
    ...u,
    rank: i + 1,
  }));

  res.json(leaderboard);
});

router.get("/dashboard/teacher-overview", requireAuth, async (_req, res): Promise<void> => {
  const [{ totalStudents }] = await db
    .select({ totalStudents: count() })
    .from(usersTable)
    .where(eq(usersTable.role, "student"));

  const [{ totalMentors }] = await db
    .select({ totalMentors: count() })
    .from(usersTable)
    .where(eq(usersTable.role, "mentor"));

  const [{ totalMaterials }] = await db
    .select({ totalMaterials: count() })
    .from(materialsTable);

  const [{ totalSessions }] = await db
    .select({ totalSessions: count() })
    .from(sessionsTable);

  const topStudents = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      role: usersTable.role,
      focusPoints: usersTable.focusPoints,
    })
    .from(usersTable)
    .where(eq(usersTable.role, "student"))
    .orderBy(sql`${usersTable.focusPoints} desc`)
    .limit(5);

  res.json({
    totalStudents,
    totalMentors,
    totalMaterials,
    totalSessions,
    topStudents: topStudents.map((s, i) => ({ ...s, rank: i + 1 })),
  });
});

export default router;
