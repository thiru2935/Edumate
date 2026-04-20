import { Router } from "express";
import { db, materialsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { CreateMaterialBody } from "@workspace/api-zod";

const router = Router();

router.get("/materials", requireAuth, async (_req, res): Promise<void> => {
  const materials = await db
    .select({
      id: materialsTable.id,
      title: materialsTable.title,
      fileUrl: materialsTable.fileUrl,
      uploadedBy: materialsTable.uploadedBy,
      uploaderName: usersTable.name,
      createdAt: materialsTable.createdAt,
    })
    .from(materialsTable)
    .leftJoin(usersTable, eq(materialsTable.uploadedBy, usersTable.id))
    .orderBy(sql`${materialsTable.createdAt} desc`);

  res.json(materials.map(m => ({ ...m, uploaderName: m.uploaderName ?? "Unknown" })));
});

router.post("/materials", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateMaterialBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = req.user!.id;
  const { title, fileUrl } = parsed.data;

  const [material] = await db.insert(materialsTable).values({
    title,
    fileUrl,
    uploadedBy: userId,
  }).returning();

  const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, userId));

  res.status(201).json({
    ...material,
    uploaderName: user?.name ?? "Unknown",
  });
});

export default router;
