import { Router } from "express";
import { db } from "@workspace/db";
import { cabinsTable } from "@workspace/db";
import { GetCabinParams } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/cabins", async (req, res) => {
  try {
    const cabins = await db.select().from(cabinsTable).orderBy(cabinsTable.id);
    const result = cabins.map((c) => ({
      id: c.id,
      name: c.name,
      style: c.style,
      description: c.description,
      imageUrl: c.imageUrl,
      thumbnailUrl: c.thumbnailUrl,
      tags: c.tags,
      specs: {
        ceiling: c.ceiling,
        wallPanels: c.wallPanels,
        handrail: c.handrail,
        flooring: c.flooring,
        lighting: c.lighting,
        capacity: c.capacity,
        finish: c.finish,
        warranty: c.warranty,
      },
    }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch cabins");
    res.status(500).json({ error: "Failed to fetch cabins" });
  }
});

router.get("/cabins/:id", async (req, res) => {
  try {
    const parsed = GetCabinParams.safeParse({ id: req.params.id });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid cabin id" });
      return;
    }
    const [cabin] = await db.select().from(cabinsTable).where(eq(cabinsTable.id, parsed.data.id));
    if (!cabin) {
      res.status(404).json({ error: "Cabin not found" });
      return;
    }
    res.json({
      id: cabin.id,
      name: cabin.name,
      style: cabin.style,
      description: cabin.description,
      imageUrl: cabin.imageUrl,
      thumbnailUrl: cabin.thumbnailUrl,
      tags: cabin.tags,
      specs: {
        ceiling: cabin.ceiling,
        wallPanels: cabin.wallPanels,
        handrail: cabin.handrail,
        flooring: cabin.flooring,
        lighting: cabin.lighting,
        capacity: cabin.capacity,
        finish: cabin.finish,
        warranty: cabin.warranty,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch cabin");
    res.status(500).json({ error: "Failed to fetch cabin" });
  }
});

export default router;
