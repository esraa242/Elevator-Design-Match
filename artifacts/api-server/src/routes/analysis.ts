import { Router } from "express";
import { db } from "@workspace/db";
import { cabinsTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { AnalyzeAndMatchBody } from "@workspace/api-zod";

const router = Router();

router.post("/analysis/match", async (req, res) => {
  try {
    const parsed = AnalyzeAndMatchBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error });
      return;
    }

    const { imageBase64, mimeType = "image/jpeg" } = parsed.data;

    // Fetch all cabin designs from DB
    const cabins = await db.select().from(cabinsTable).orderBy(cabinsTable.id);

    if (cabins.length === 0) {
      res.status(400).json({ error: "No cabin designs available for matching" });
      return;
    }

    // Build cabin catalog description for the AI
    const cabinCatalog = cabins.map((c) => ({
      id: c.id,
      name: c.name,
      style: c.style,
      tags: c.tags,
      description: c.description,
      specs: {
        ceiling: c.ceiling,
        wallPanels: c.wallPanels,
        handrail: c.handrail,
        flooring: c.flooring,
        lighting: c.lighting,
        finish: c.finish,
      },
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

    const userMessage = `Here is our cabin catalog:
${JSON.stringify(cabinCatalog, null, 2)}

Please analyze the attached interior photo and rank all ${cabins.length} cabin designs by compatibility score.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userMessage },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
    });

    const rawContent = response.choices[0]?.message?.content ?? "{}";
    
    // Extract JSON from the response
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

    // Map cabin IDs to full cabin objects
    const cabinMap = new Map(cabins.map((c) => [c.id, c]));
    const matches = analysisData.matches
      .filter((m) => cabinMap.has(m.cabinId))
      .map((m) => {
        const cabin = cabinMap.get(m.cabinId)!;
        return {
          cabin: {
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
