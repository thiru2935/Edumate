import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

router.get("/users", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { search, role } = req.query as { search?: string; role?: string };

  let conditions = [];
  if (search) {
    conditions.push(ilike(usersTable.name, `%${search}%`));
  }
  if (role && ["student", "mentor", "teacher"].includes(role)) {
    conditions.push(eq(usersTable.role, role as "student" | "mentor" | "teacher"));
  }

  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      role: usersTable.role,
      age: usersTable.age,
      focusPoints: usersTable.focusPoints,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${usersTable.focusPoints} desc`);

  res.json(users);
});

router.get("/users/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      role: usersTable.role,
      age: usersTable.age,
      focusPoints: usersTable.focusPoints,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
});

router.patch("/users/:id/focus-points", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  if (req.user!.role !== "teacher") {
    res.status(403).json({ error: "Only teachers can update focus points" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { points } = req.body;
  if (typeof points !== "number") {
    res.status(400).json({ error: "points must be a number" });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({ focusPoints: points })
    .where(eq(usersTable.id, id))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      role: usersTable.role,
      age: usersTable.age,
      focusPoints: usersTable.focusPoints,
      createdAt: usersTable.createdAt,
    });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
});

export default router;
