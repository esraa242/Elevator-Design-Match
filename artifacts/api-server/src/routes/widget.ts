import { Router } from "express";
import { db } from "@workspace/db";
import { tenantsTable, usageTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

// GET /widget.js — embeddable widget script
router.get("/widget.js", async (req, res) => {
  const tenantId = req.query.tenant as string;
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const script = `
(function() {
  var TENANT_ID = "${tenantId || ""}";
  var BASE_URL = "${baseUrl}";

  if (!TENANT_ID) {
    console.error("[ElevatorMatcher] Missing tenant ID. Add data-tenant attribute.");
    return;
  }

  // Inject styles
  var style = document.createElement("style");
  style.textContent = [
    "#em-widget-btn { position:fixed; bottom:28px; right:28px; z-index:999998; border:none; cursor:pointer; border-radius:50px; padding:14px 22px; font-family:sans-serif; font-size:15px; font-weight:600; display:flex; align-items:center; gap:8px; box-shadow:0 4px 24px rgba(0,0,0,0.35); transition:transform .2s,box-shadow .2s; }",
    "#em-widget-btn:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.45); }",
    "#em-widget-overlay { position:fixed; inset:0; z-index:999999; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity .25s; }",
    "#em-widget-overlay.open { opacity:1; pointer-events:all; }",
    "#em-widget-modal { width:min(1100px,96vw); height:min(700px,92vh); border-radius:20px; overflow:hidden; background:#0a0a0a; border:1px solid rgba(255,255,255,0.1); box-shadow:0 32px 80px rgba(0,0,0,0.7); position:relative; }",
    "#em-widget-iframe { width:100%; height:100%; border:none; }",
    "#em-widget-close { position:absolute; top:14px; right:14px; z-index:10; background:rgba(255,255,255,0.1); border:none; color:#fff; width:36px; height:36px; border-radius:50%; cursor:pointer; font-size:20px; display:flex; align-items:center; justify-content:center; }",
    "#em-widget-close:hover { background:rgba(255,255,255,0.2); }",
  ].join("");
  document.head.appendChild(style);

  // Fetch tenant config
  fetch(BASE_URL + "/api/tenants/" + TENANT_ID + "/public")
    .then(function(r) { return r.json(); })
    .then(function(tenant) {
      // Create floating button
      var btn = document.createElement("button");
      btn.id = "em-widget-btn";
      btn.style.background = tenant.primaryColor || "#b8960c";
      btn.style.color = tenant.accentColor || "#ffffff";
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> Find My Elevator';
      document.body.appendChild(btn);

      // Create overlay + modal
      var overlay = document.createElement("div");
      overlay.id = "em-widget-overlay";

      var modal = document.createElement("div");
      modal.id = "em-widget-modal";

      var closeBtn = document.createElement("button");
      closeBtn.id = "em-widget-close";
      closeBtn.innerHTML = "&times;";
      closeBtn.onclick = function() { overlay.classList.remove("open"); };

      var iframe = document.createElement("iframe");
      iframe.id = "em-widget-iframe";
      iframe.src = BASE_URL + "/?tenant=" + TENANT_ID + "&embedded=1";
      iframe.allow = "camera";

      modal.appendChild(closeBtn);
      modal.appendChild(iframe);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      btn.onclick = function() {
        if (tenant.limitReached) {
          alert("This elevator matcher has reached its monthly limit. Please contact the company directly.");
          return;
        }
        overlay.classList.add("open");
      };

      overlay.onclick = function(e) {
        if (e.target === overlay) overlay.classList.remove("open");
      };
    })
    .catch(function(e) {
      console.error("[ElevatorMatcher] Failed to load tenant config:", e);
    });
})();
`;

  res.set("Content-Type", "application/javascript");
  res.set("Cache-Control", "public, max-age=60");
  res.send(script);
});

// POST /tenants/:id/track-usage — increment usage counter
router.post("/tenants/:id/track-usage", async (req, res) => {
  try {
    const tenantId = parseInt(req.params.id);
    if (isNaN(tenantId)) { res.status(400).json({ error: "Invalid tenant id" }); return; }

    const month = new Date().toISOString().slice(0, 7);

    await db.insert(usageTable)
      .values({ tenantId, month, requestsCount: 1 })
      .onConflictDoUpdate({
        target: [usageTable.tenantId, usageTable.month],
        set: { requestsCount: sql`usage.requests_count + 1`, updatedAt: new Date() },
      });

    // Check limit
    const [tenant] = await db.select({ usageLimit: tenantsTable.usageLimit })
      .from(tenantsTable).where(eq(tenantsTable.id, tenantId));
    const [usage] = await db.select({ count: usageTable.requestsCount })
      .from(usageTable).where(and(eq(usageTable.tenantId, tenantId), eq(usageTable.month, month)));

    const limitReached = (usage?.count ?? 0) >= (tenant?.usageLimit ?? 50);
    res.json({ requestsCount: usage?.count ?? 0, limitReached });
  } catch (err) {
    req.log.error({ err }, "Failed to track usage");
    res.status(500).json({ error: "Failed to track usage" });
  }
});

export default router;
