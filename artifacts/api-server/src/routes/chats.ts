import { Router } from "express";
import { db, chatsTable, usersTable } from "@workspace/db";
import { eq, or, and, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { SendMessageBody } from "@workspace/api-zod";

const router = Router();

router.get("/chats/:userId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const currentUserId = req.user!.id;
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const otherUserId = parseInt(raw, 10);
  if (isNaN(otherUserId)) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }

  const messages = await db
    .select({
      id: chatsTable.id,
      senderId: chatsTable.senderId,
      receiverId: chatsTable.receiverId,
      message: chatsTable.message,
      timestamp: chatsTable.timestamp,
      senderName: usersTable.name,
    })
    .from(chatsTable)
    .leftJoin(usersTable, eq(chatsTable.senderId, usersTable.id))
    .where(
      or(
        and(eq(chatsTable.senderId, currentUserId), eq(chatsTable.receiverId, otherUserId)),
        and(eq(chatsTable.senderId, otherUserId), eq(chatsTable.receiverId, currentUserId)),
      )
    )
    .orderBy(sql`${chatsTable.timestamp} asc`);

  res.json(messages.map(m => ({ ...m, senderName: m.senderName ?? "Unknown" })));
});

router.post("/chats/:userId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const currentUserId = req.user!.id;
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const receiverId = parseInt(raw, 10);
  if (isNaN(receiverId)) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [chat] = await db.insert(chatsTable).values({
    senderId: currentUserId,
    receiverId,
    message: parsed.data.message,
  }).returning();

  const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, currentUserId));

  res.status(201).json({
    ...chat,
    senderName: user?.name ?? "Unknown",
  });
});

export default router;
