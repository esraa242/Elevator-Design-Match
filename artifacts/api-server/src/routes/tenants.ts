import { Router } from "express";
import { db } from "@workspace/db";
import { tenantsTable, cabinsTable, tenantCabinsTable, usageTable, leadsTable } from "@workspace/db";
import { eq, and, sql, gte } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + process.env.SESSION_SECRET).digest("hex");
}

// POST /tenants/login — dashboard auth
router.post("/tenants/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.email, email));
    if (!tenant || tenant.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = Buffer.from(`${tenant.id}:${hashPassword(password)}`).toString("base64");
    res.json({ token, tenant: sanitizeTenant(tenant) });
  } catch (err) {
    req.log.error({ err }, "Login failed");
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /tenants/register — create a new tenant account
router.post("/tenants/register", async (req, res) => {
  try {
    const { name, email, password, whatsappNumber } = req.body as {
      name: string; email: string; password: string; whatsappNumber?: string;
    };
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email and password required" });
      return;
    }
    const [existing] = await db.select({ id: tenantsTable.id }).from(tenantsTable).where(eq(tenantsTable.email, email));
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const [tenant] = await db.insert(tenantsTable).values({
      name,
      email,
      passwordHash: hashPassword(password),
      whatsappNumber: whatsappNumber ?? "971501234567",
      plan: "starter",
      usageLimit: 50,
    }).returning();

    // Assign all cabins to the new tenant by default
    const allCabins = await db.select({ id: cabinsTable.id }).from(cabinsTable);
    if (allCabins.length > 0) {
      await db.insert(tenantCabinsTable).values(
        allCabins.map(c => ({ tenantId: tenant.id, cabinId: c.id, isEnabled: true }))
      ).onConflictDoNothing();
    }

    const token = Buffer.from(`${tenant.id}:${hashPassword(password)}`).toString("base64");
    res.status(201).json({ token, tenant: sanitizeTenant(tenant) });
  } catch (err) {
    req.log.error({ err }, "Registration failed");
    res.status(500).json({ error: "Registration failed" });
  }
});

// GET /tenants/:id/public — public tenant config for widget (no auth needed)
router.get("/tenants/:id/public", async (req, res) => {
  try {
    const tenantId = parseInt(req.params.id);
    if (isNaN(tenantId)) { res.status(400).json({ error: "Invalid tenant id" }); return; }

    const [tenant] = await db.select().from(tenantsTable).where(
      and(eq(tenantsTable.id, tenantId), eq(tenantsTable.isActive, true))
    );
    if (!tenant) { res.status(404).json({ error: "Tenant not found" }); return; }

    // Check usage limit
    const month = new Date().toISOString().slice(0, 7);
    const [usage] = await db.select().from(usageTable)
      .where(and(eq(usageTable.tenantId, tenantId), eq(usageTable.month, month)));
    const usedRequests = usage?.requestsCount ?? 0;
    const limitReached = usedRequests >= tenant.usageLimit;

    res.json({
      id: tenant.id,
      name: tenant.name,
      logoUrl: tenant.logoUrl,
      primaryColor: tenant.primaryColor,
      accentColor: tenant.accentColor,
      whatsappNumber: tenant.whatsappNumber,
      plan: tenant.plan,
      usageLimit: tenant.usageLimit,
      usedRequests,
      limitReached,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get tenant public config");
    res.status(500).json({ error: "Failed to get tenant config" });
  }
});

// Middleware: verify auth token
export function requireAuth(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const decoded = Buffer.from(auth.slice(7), "base64").toString();
    const [idStr] = decoded.split(":");
    const tenantId = parseInt(idStr);
    if (isNaN(tenantId)) throw new Error("Invalid token");
    req.tenantId = tenantId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// GET /tenants/me — get current tenant profile
router.get("/tenants/me", requireAuth, async (req: any, res) => {
  try {
    const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, req.tenantId));
    if (!tenant) { res.status(404).json({ error: "Tenant not found" }); return; }
    res.json(sanitizeTenant(tenant));
  } catch (err) {
    req.log.error({ err }, "Failed to get tenant");
    res.status(500).json({ error: "Failed to get tenant" });
  }
});

// PATCH /tenants/me — update branding/settings
router.patch("/tenants/me", requireAuth, async (req: any, res) => {
  try {
    const { name, logoUrl, primaryColor, accentColor, whatsappNumber } = req.body as {
      name?: string; logoUrl?: string; primaryColor?: string; accentColor?: string; whatsappNumber?: string;
    };
    const updates: Partial<typeof tenantsTable.$inferInsert> = {};
    if (name) updates.name = name;
    if (logoUrl !== undefined) updates.logoUrl = logoUrl;
    if (primaryColor) updates.primaryColor = primaryColor;
    if (accentColor) updates.accentColor = accentColor;
    if (whatsappNumber) updates.whatsappNumber = whatsappNumber;

    const [updated] = await db.update(tenantsTable).set(updates)
      .where(eq(tenantsTable.id, req.tenantId)).returning();
    res.json(sanitizeTenant(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update tenant");
    res.status(500).json({ error: "Failed to update tenant" });
  }
});

// GET /tenants/me/cabins — list cabins for this tenant
router.get("/tenants/me/cabins", requireAuth, async (req: any, res) => {
  try {
    const rows = await db
      .select({ cabin: cabinsTable, isEnabled: tenantCabinsTable.isEnabled })
      .from(tenantCabinsTable)
      .innerJoin(cabinsTable, eq(cabinsTable.id, tenantCabinsTable.cabinId))
      .where(eq(tenantCabinsTable.tenantId, req.tenantId))
      .orderBy(cabinsTable.id);

    res.json(rows.map(r => ({
      ...r.cabin,
      isEnabled: r.isEnabled,
      specs: {
        ceiling: r.cabin.ceiling,
        wallPanels: r.cabin.wallPanels,
        handrail: r.cabin.handrail,
        flooring: r.cabin.flooring,
        lighting: r.cabin.lighting,
        capacity: r.cabin.capacity,
        finish: r.cabin.finish,
        warranty: r.cabin.warranty,
      },
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get tenant cabins");
    res.status(500).json({ error: "Failed to get cabins" });
  }
});

// PATCH /tenants/me/cabins/:cabinId — enable/disable a cabin
router.patch("/tenants/me/cabins/:cabinId", requireAuth, async (req: any, res) => {
  try {
    const cabinId = parseInt(req.params.cabinId);
    const { isEnabled } = req.body as { isEnabled: boolean };
    if (isNaN(cabinId)) { res.status(400).json({ error: "Invalid cabin id" }); return; }

    await db.insert(tenantCabinsTable)
      .values({ tenantId: req.tenantId, cabinId, isEnabled })
      .onConflictDoUpdate({
        target: [tenantCabinsTable.tenantId, tenantCabinsTable.cabinId],
        set: { isEnabled },
      });
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update cabin");
    res.status(500).json({ error: "Failed to update cabin" });
  }
});

// GET /tenants/me/leads — paginated leads for this tenant
router.get("/tenants/me/leads", requireAuth, async (req: any, res) => {
  try {
    const leads = await db
      .select({
        id: leadsTable.id,
        name: leadsTable.name,
        phone: leadsTable.phone,
        matchScore: leadsTable.matchScore,
        createdAt: leadsTable.createdAt,
        cabinName: cabinsTable.name,
      })
      .from(leadsTable)
      .innerJoin(cabinsTable, eq(cabinsTable.id, leadsTable.cabinId))
      .where(eq(leadsTable.tenantId, req.tenantId))
      .orderBy(sql`${leadsTable.createdAt} desc`)
      .limit(100);
    res.json(leads);
  } catch (err) {
    req.log.error({ err }, "Failed to get leads");
    res.status(500).json({ error: "Failed to get leads" });
  }
});

// GET /tenants/me/usage — usage stats for this tenant
router.get("/tenants/me/usage", requireAuth, async (req: any, res) => {
  try {
    const allUsage = await db.select().from(usageTable)
      .where(eq(usageTable.tenantId, req.tenantId))
      .orderBy(sql`${usageTable.month} desc`)
      .limit(12);

    const month = new Date().toISOString().slice(0, 7);
    const currentMonth = allUsage.find(u => u.month === month);
    const [tenant] = await db.select({ usageLimit: tenantsTable.usageLimit, plan: tenantsTable.plan })
      .from(tenantsTable).where(eq(tenantsTable.id, req.tenantId));

    const [totalLeads] = await db.select({ count: sql<number>`count(*)::int` })
      .from(leadsTable).where(eq(leadsTable.tenantId, req.tenantId));

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [weekLeads] = await db.select({ count: sql<number>`count(*)::int` })
      .from(leadsTable)
      .where(and(eq(leadsTable.tenantId, req.tenantId), gte(leadsTable.createdAt, oneWeekAgo)));

    const [avgScore] = await db.select({ avg: sql<number>`round(avg(match_score))` })
      .from(leadsTable).where(eq(leadsTable.tenantId, req.tenantId));

    res.json({
      currentMonth: currentMonth?.requestsCount ?? 0,
      usageLimit: tenant?.usageLimit ?? 50,
      plan: tenant?.plan ?? "starter",
      totalLeads: totalLeads?.count ?? 0,
      leadsThisWeek: weekLeads?.count ?? 0,
      averageMatchScore: avgScore?.avg ?? 0,
      history: allUsage,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get usage");
    res.status(500).json({ error: "Failed to get usage" });
  }
});

function sanitizeTenant(t: typeof tenantsTable.$inferSelect) {
  const { passwordHash: _, ...safe } = t;
  return safe;
}

export default router;
