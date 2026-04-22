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

  const riskRows = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      avgIntegrityScore: sql<number>`coalesce(avg(${sessionsTable.sessionIntegrityScore}), 100)`,
      totalIdleIncidents: sql<number>`coalesce(sum(${sessionsTable.idleIncidentCount}), 0)`,
      totalTabSwitches: sql<number>`coalesce(sum(${sessionsTable.tabSwitchCount}), 0)`,
    })
    .from(usersTable)
    .leftJoin(sessionsTable, eq(sessionsTable.userId, usersTable.id))
    .where(eq(usersTable.role, "student"))
    .groupBy(usersTable.id, usersTable.name)
    .orderBy(
      sql`coalesce(avg(${sessionsTable.sessionIntegrityScore}), 100) asc`,
      sql`coalesce(sum(${sessionsTable.idleIncidentCount}), 0) desc`,
      sql`coalesce(sum(${sessionsTable.tabSwitchCount}), 0) desc`,
    )
    .limit(5);

  const atRiskStudents = riskRows
    .filter((row) => row.avgIntegrityScore < 80 || row.totalIdleIncidents > 2 || row.totalTabSwitches > 5)
    .map((row) => ({
      id: row.id,
      name: row.name,
      avgIntegrityScore: Math.round(row.avgIntegrityScore),
      totalIdleIncidents: Number(row.totalIdleIncidents),
      totalTabSwitches: Number(row.totalTabSwitches),
    }));

  const students = await db
    .select({ id: usersTable.id, name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.role, "student"));

  const sessions = await db
    .select({
      userId: sessionsTable.userId,
      pointsEarned: sessionsTable.pointsEarned,
      idleIncidentCount: sessionsTable.idleIncidentCount,
      tabSwitchCount: sessionsTable.tabSwitchCount,
      sessionIntegrityScore: sessionsTable.sessionIntegrityScore,
      recallAccuracy: sessionsTable.recallAccuracy,
      pauseCount: sessionsTable.pauseCount,
      createdAt: sessionsTable.createdAt,
    })
    .from(sessionsTable);

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const start7 = now - 7 * dayMs;
  const start14 = now - 14 * dayMs;

  const byStudent = new Map<number, typeof sessions>();
  for (const s of sessions) {
    const list = byStudent.get(s.userId) ?? [];
    list.push(s);
    byStudent.set(s.userId, list);
  }

  const improvingStudents = students
    .map((student) => {
      const userSessions = byStudent.get(student.id) ?? [];
      const last7 = userSessions.filter((s) => new Date(s.createdAt).getTime() >= start7);
      const prev7 = userSessions.filter((s) => {
        const t = new Date(s.createdAt).getTime();
        return t >= start14 && t < start7;
      });
      const pointsDelta7d = last7.reduce((sum, s) => sum + s.pointsEarned, 0) - prev7.reduce((sum, s) => sum + s.pointsEarned, 0);
      const avgIntegrityScore = last7.length > 0
        ? Math.round(last7.reduce((sum, s) => sum + s.sessionIntegrityScore, 0) / last7.length)
        : 100;
      return {
        id: student.id,
        name: student.name,
        pointsDelta7d,
        avgIntegrityScore,
      };
    })
    .filter((s) => s.pointsDelta7d > 0)
    .sort((a, b) => b.pointsDelta7d - a.pointsDelta7d)
    .slice(0, 5);

  const driftingStudents = students
    .map((student) => {
      const userSessions = (byStudent.get(student.id) ?? []).filter((s) => new Date(s.createdAt).getTime() >= start7);
      const avgIdleIncidents = userSessions.length > 0
        ? Math.round(userSessions.reduce((sum, s) => sum + s.idleIncidentCount, 0) / userSessions.length)
        : 0;
      const avgRecallAccuracy = userSessions.length > 0
        ? Math.round(userSessions.reduce((sum, s) => sum + s.recallAccuracy, 0) / userSessions.length)
        : 0;
      return {
        id: student.id,
        name: student.name,
        avgIdleIncidents,
        avgRecallAccuracy,
      };
    })
    .filter((s) => s.avgIdleIncidents > 1 || s.avgRecallAccuracy < 55)
    .sort((a, b) => (b.avgIdleIncidents - a.avgIdleIncidents) || (a.avgRecallAccuracy - b.avgRecallAccuracy))
    .slice(0, 5);

  const stressedStudents = students
    .map((student) => {
      const userSessions = (byStudent.get(student.id) ?? []).filter((s) => new Date(s.createdAt).getTime() >= start7);
      const pauseRate = userSessions.length > 0
        ? Math.round(userSessions.reduce((sum, s) => sum + s.pauseCount, 0) / userSessions.length)
        : 0;
      const lateNightSessions = userSessions.filter((s) => {
        const hour = new Date(s.createdAt).getHours();
        return hour >= 23 || hour < 5;
      }).length;
      return {
        id: student.id,
        name: student.name,
        pauseRate,
        lateNightSessions,
      };
    })
    .filter((s) => s.pauseRate >= 3 || s.lateNightSessions >= 2)
    .sort((a, b) => (b.pauseRate - a.pauseRate) || (b.lateNightSessions - a.lateNightSessions))
    .slice(0, 5);

  res.json({
    totalStudents,
    totalMentors,
    totalMaterials,
    totalSessions,
    topStudents: topStudents.map((s, i) => ({ ...s, rank: i + 1 })),
    atRiskStudents,
    improvingStudents,
    driftingStudents,
    stressedStudents,
  });
});

export default router;
