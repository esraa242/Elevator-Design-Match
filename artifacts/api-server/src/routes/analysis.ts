import { Router } from "express";
import { db } from "@workspace/db";
import { cabinsTable, tenantsTable, tenantCabinsTable, usageTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { AnalyzeAndMatchBody } from "@workspace/api-zod";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

router.post("/analysis/match", async (req, res) => {
  try {
    const parsed = AnalyzeAndMatchBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error });
      return;
    }

    const { imageBase64, mimeType = "image/jpeg" } = parsed.data;
    const tenantId = req.body.tenantId ? parseInt(req.body.tenantId) : null;

    // If tenant context, check usage limit and fetch their enabled cabins
    let cabins;
    if (tenantId && !isNaN(tenantId)) {
      const [tenant] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, tenantId));
      if (!tenant || !tenant.isActive) {
        res.status(403).json({ error: "Tenant not found or inactive" });
        return;
      }
      // Check usage
      const month = new Date().toISOString().slice(0, 7);
      const [usage] = await db.select().from(usageTable)
        .where(and(eq(usageTable.tenantId, tenantId), eq(usageTable.month, month)));
      if ((usage?.requestsCount ?? 0) >= tenant.usageLimit) {
        res.status(429).json({ error: "Monthly usage limit reached", limitReached: true });
        return;
      }
      // Get tenant's enabled cabins
      const rows = await db
        .select({ cabin: cabinsTable })
        .from(tenantCabinsTable)
        .innerJoin(cabinsTable, eq(cabinsTable.id, tenantCabinsTable.cabinId))
        .where(and(eq(tenantCabinsTable.tenantId, tenantId), eq(tenantCabinsTable.isEnabled, true)));
      cabins = rows.map(r => r.cabin);
      // Track usage
      await db.insert(usageTable)
        .values({ tenantId, month, requestsCount: 1 })
        .onConflictDoUpdate({
          target: [usageTable.tenantId, usageTable.month],
          set: { requestsCount: sql`usage.requests_count + 1`, updatedAt: new Date() },
        });
    } else {
      cabins = await db.select().from(cabinsTable).orderBy(cabinsTable.id);
    }

    if (cabins.length === 0) {
      res.status(400).json({ error: "No cabin designs available for matching" });
      return;
    }

    const cabinCatalog = cabins.map((c) => ({
      id: c.id, name: c.name, style: c.style, tags: c.tags, description: c.description,
      specs: { ceiling: c.ceiling, wallPanels: c.wallPanels, handrail: c.handrail, flooring: c.flooring, lighting: c.lighting, finish: c.finish },
    }));

    const systemPrompt = `You are an expert interior design consultant and elevator cabin specialist. 
Your job is to analyze a customer's interior photo and match it to the best elevator cabin designs from our catalog.

You must respond ONLY with valid JSON matching this exact schema:
{
  "interiorStyle": "string - the detected design style (e.g. Modern Luxury, Classic, Contemporary, Minimalist, Industrial)",
  "dominantColors": ["array of color names detected in the interior"],
  "styleKeywords": ["array of 3-6 style descriptors"],
  "matches": [
    {
      "cabinId": number,
      "matchScore": number (0-100),
      "matchReason": "string - specific reason why this cabin suits this interior"
    }
  ]
}

Rules:
- Return ALL cabins in the matches array, ranked by matchScore (highest first)
- matchScore must reflect true compatibility based on style, colors, materials
- matchReason should be specific and mention actual design elements from the photo
- Be generous with scores - if a cabin genuinely matches, score 85+`;

    const userMessage = `Here is our cabin catalog:\n${JSON.stringify(cabinCatalog, null, 2)}\n\nPlease analyze the attached interior photo and rank all ${cabins.length} cabin designs by compatibility score.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userMessage },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: "high" } },
          ],
        },
      ],
    });

    const rawContent = response.choices[0]?.message?.content ?? "{}";
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      req.log.error({ rawContent }, "AI response did not contain valid JSON");
      res.status(500).json({ error: "AI analysis failed to return valid response" });
      return;
    }

    const analysisData = JSON.parse(jsonMatch[0]) as {
      interiorStyle: string;
      dominantColors: string[];
      styleKeywords: string[];
      matches: Array<{ cabinId: number; matchScore: number; matchReason: string }>;
    };

    const cabinMap = new Map(cabins.map((c) => [c.id, c]));
    const matches = analysisData.matches
      .filter((m) => cabinMap.has(m.cabinId))
      .map((m) => {
        const cabin = cabinMap.get(m.cabinId)!;
        return {
          cabin: {
            id: cabin.id, name: cabin.name, style: cabin.style, description: cabin.description,
            imageUrl: cabin.imageUrl, thumbnailUrl: cabin.thumbnailUrl, tags: cabin.tags,
            specs: { ceiling: cabin.ceiling, wallPanels: cabin.wallPanels, handrail: cabin.handrail, flooring: cabin.flooring, lighting: cabin.lighting, capacity: cabin.capacity, finish: cabin.finish, warranty: cabin.warranty },
          },
          matchScore: Math.min(100, Math.max(0, m.matchScore)),
          matchReason: m.matchReason,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      interiorStyle: analysisData.interiorStyle,
      dominantColors: analysisData.dominantColors ?? [],
      styleKeywords: analysisData.styleKeywords ?? [],
      matches,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to analyze image");
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

export default router;
