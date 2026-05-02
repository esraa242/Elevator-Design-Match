import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable, cabinsTable } from "@workspace/db";
import { CreateLeadBody } from "@workspace/api-zod";
import { eq, gte, sql } from "drizzle-orm";

const router = Router();

router.post("/leads", async (req, res) => {
  try {
    const parsed = CreateLeadBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error });
      return;
    }
    const { name, phone, cabinId, matchScore } = parsed.data;
    const [lead] = await db.insert(leadsTable).values({ name, phone, cabinId, matchScore }).returning();
    res.status(201).json(lead);
  } catch (err) {
    req.log.error({ err }, "Failed to create lead");
    res.status(500).json({ error: "Failed to create lead" });
  }
});

router.get("/leads/stats", async (req, res) => {
  try {
    const [totalResult] = await db.select({ count: sql<number>`count(*)::int` }).from(leadsTable);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [weekResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leadsTable)
      .where(gte(leadsTable.createdAt, oneWeekAgo));

    const [avgResult] = await db
      .select({ avg: sql<number>`round(avg(match_score))` })
      .from(leadsTable);

    const topCabinResult = await db
      .select({ cabinId: leadsTable.cabinId, count: sql<number>`count(*)::int` })
      .from(leadsTable)
      .groupBy(leadsTable.cabinId)
      .orderBy(sql`count(*) desc`)
      .limit(1);

    let topCabin = "N/A";
    if (topCabinResult.length > 0) {
      const [cabin] = await db
        .select({ name: cabinsTable.name })
        .from(cabinsTable)
        .where(eq(cabinsTable.id, topCabinResult[0].cabinId));
      topCabin = cabin?.name ?? "N/A";
    }

    res.json({
      totalLeads: totalResult?.count ?? 0,
      leadsThisWeek: weekResult?.count ?? 0,
      topCabin,
      averageMatchScore: avgResult?.avg ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get lead stats");
    res.status(500).json({ error: "Failed to get lead stats" });
  }
});

export default router;
