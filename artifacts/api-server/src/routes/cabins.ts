import { Router } from "express";
import { db } from "@workspace/db";
import { cabinsTable, tenantCabinsTable, tenantsTable } from "@workspace/db";
import { GetCabinParams } from "@workspace/api-zod";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "./tenants";

const router = Router();

function formatCabin(c: typeof cabinsTable.$inferSelect) {
  return {
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
  };
}

router.get("/cabins", async (req, res) => {
  try {
    const cabins = await db.select().from(cabinsTable).orderBy(cabinsTable.id);
    res.json(cabins.map(formatCabin));
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
    res.json(formatCabin(cabin));
  } catch (err) {
    req.log.error({ err }, "Failed to fetch cabin");
    res.status(500).json({ error: "Failed to fetch cabin" });
  }
});

// POST /admin/cabins — create a new cabin design (tenant-auth required)
router.post("/admin/cabins", requireAuth, async (req: any, res) => {
  try {
    const {
      name, style, description, imageUrl, thumbnailUrl, tags,
      ceiling, wallPanels, handrail, flooring, lighting, capacity, finish, warranty,
    } = req.body as Record<string, string>;

    if (!name || !style || !imageUrl) {
      res.status(400).json({ error: "name, style and imageUrl are required" });
      return;
    }

    const [cabin] = await db.insert(cabinsTable).values({
      name,
      style,
      description: description || "",
      imageUrl,
      thumbnailUrl: thumbnailUrl || imageUrl,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []),
      ceiling: ceiling || "",
      wallPanels: wallPanels || "",
      handrail: handrail || "",
      flooring: flooring || "",
      lighting: lighting || "",
      capacity: capacity || "",
      finish: finish || "",
      warranty: warranty || "",
    }).returning();

    // Auto-assign to ALL existing tenants (enabled by default)
    const allTenants = await db.select({ id: tenantsTable.id }).from(tenantsTable);
    if (allTenants.length > 0) {
      await db.insert(tenantCabinsTable)
        .values(allTenants.map(t => ({ tenantId: t.id, cabinId: cabin.id, isEnabled: true })))
        .onConflictDoNothing();
    }

    req.log.info({ cabinId: cabin.id }, "Cabin created");
    res.status(201).json(formatCabin(cabin));
  } catch (err) {
    req.log.error({ err }, "Failed to create cabin");
    res.status(500).json({ error: "Failed to create cabin" });
  }
});

// DELETE /admin/cabins/:id — delete a cabin (tenant-auth required)
router.delete("/admin/cabins/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid cabin id" }); return; }

    const [deleted] = await db.delete(cabinsTable).where(eq(cabinsTable.id, id)).returning({ id: cabinsTable.id });
    if (!deleted) { res.status(404).json({ error: "Cabin not found" }); return; }

    res.json({ success: true, id: deleted.id });
  } catch (err) {
    req.log.error({ err }, "Failed to delete cabin");
    res.status(500).json({ error: "Failed to delete cabin" });
  }
});

export default router;
