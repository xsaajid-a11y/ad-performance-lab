import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

const app = reportMissingConfigInDbSetup() ? express() : express();
function reportMissingConfigInDbSetup() { return false; }
const PORT = 3000;

app.use(express.json());

// Lazy initialization of Gemini SDK to prevent startup crashes when the API key is temporarily absent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please add it via the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized successfully with URL:", supabaseUrl);
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
}

// REST Endpoints to manage persistent variations in Supabase
app.get("/api/database", async (req, res) => {
  if (!supabase) {
    return res.json({ 
      status: "unconfigured", 
      data: [], 
      message: "Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are missing." 
    });
  }
  try {
    const { data, error } = await supabase
      .from("ad_variations")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      // P0001, missing relation (42P01), or schema cache missing table (PGRST205)
      const isTableMissing = 
        error.code === "42P01" || 
        error.code === "PGRST205" || 
        error.message?.includes("relation") || 
        error.message?.includes("does not exist") || 
        error.message?.includes("schema cache") ||
        error.message?.includes("not found");

      if (isTableMissing) {
        console.log("Database table 'ad_variations' does not exist yet. This is expected until initialized via the SQL Setup Script.");
        return res.json({ 
          status: "table_missing", 
          data: [], 
          message: "Table 'ad_variations' does not exist in your Supabase database." 
        });
      }
      console.error("Supabase select error:", error);
      return res.status(400).json({ status: "error", error: error.message, data: [] });
    }
    
    const mappedData = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      niche: row.niche,
      hook: row.hook,
      body: row.body,
      cta: row.cta,
      visualStyle: row.visual_style || row.visualStyle,
      trend: row.trend,
      ctr: Number(row.ctr),
      conversions: Number(row.conversions),
      spend: Number(row.spend),
      days: Number(row.days),
      impressions: Number(row.impressions),
      headline: row.headline || "",
      reelBodyDescription: row.reel_body_description || "",
      reelCtaDescription: row.reel_cta_description || "",
      adType: row.ad_type || "video",
      createdAt: row.created_at
    }));
    
    return res.json({ status: "success", data: mappedData });
  } catch (err: any) {
    console.error("Database fetch handler error:", err);
    return res.status(500).json({ status: "error", error: err.message, data: [] });
  }
});

app.post("/api/database", async (req, res) => {
  if (!supabase) {
    return res.status(400).json({ status: "unconfigured", error: "Supabase client not initialized." });
  }
  
  try {
    const v = req.body;
    const dbRow = {
      name: v.name,
      niche: v.niche,
      hook: v.hook,
      body: v.body,
      cta: v.cta,
      visual_style: v.visualStyle || v.visual_style,
      trend: v.trend,
      ctr: Number(v.ctr),
      conversions: Number(v.conversions),
      spend: Number(v.spend),
      days: Number(v.days),
      impressions: Number(v.impressions),
      headline: v.headline,
      reel_body_description: v.reelBodyDescription,
      reel_cta_description: v.reelCtaDescription,
      ad_type: v.adType
    };
    
    const { data, error } = await supabase
      .from("ad_variations")
      .insert([dbRow])
      .select();
      
    if (error) {
      const isTableMissing = 
        error.code === "42P01" || 
        error.code === "PGRST205" || 
        error.message?.includes("relation") || 
        error.message?.includes("does not exist") || 
        error.message?.includes("schema cache") ||
        error.message?.includes("not found");

      if (isTableMissing) {
        console.log("Supabase insert ignored because ad_variations table is not created yet.");
        return res.status(400).json({ status: "table_missing", error: "Table 'ad_variations' does not exist." });
      }
      console.error("Supabase insert error:", error);
      return res.status(400).json({ status: "error", error: error.message });
    }
    
    const row = data[0];
    const mapped = {
      id: row.id,
      name: row.name,
      niche: row.niche,
      hook: row.hook,
      body: row.body,
      cta: row.cta,
      visualStyle: row.visual_style,
      trend: row.trend,
      ctr: Number(row.ctr),
      conversions: Number(row.conversions),
      spend: Number(row.spend),
      days: Number(row.days),
      impressions: Number(row.impressions),
      headline: row.headline,
      reelBodyDescription: row.reel_body_description,
      reelCtaDescription: row.reel_cta_description,
      adType: row.ad_type,
      createdAt: row.created_at
    };
    
    return res.json({ status: "success", data: mapped });
  } catch (err: any) {
    console.error("Database insert handler error:", err);
    return res.status(500).json({ status: "error", error: err.message });
  }
});

app.delete("/api/database/:id", async (req, res) => {
  if (!supabase) {
    return res.status(400).json({ status: "unconfigured", error: "Supabase client not initialized." });
  }
  
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("ad_variations")
      .delete()
      .eq("id", id);
      
    if (error) {
      const isTableMissing = 
        error.code === "42P01" || 
        error.code === "PGRST205" || 
        error.message?.includes("relation") || 
        error.message?.includes("does not exist") || 
        error.message?.includes("schema cache") ||
        error.message?.includes("not found");

      if (isTableMissing) {
        console.log("Supabase delete ignored because ad_variations table is not created yet.");
        return res.status(400).json({ status: "table_missing", error: "Table 'ad_variations' does not exist." });
      }
      console.error("Supabase delete error:", error);
      return res.status(400).json({ status: "error", error: error.message });
    }
    
    return res.json({ status: "success", message: `Deleted row with ID ${id}` });
  } catch (err: any) {
    console.error("Database delete handler error:", err);
    return res.status(500).json({ status: "error", error: err.message });
  }
});

// REST Endpoint to optimize and generate creative variations
app.post("/api/optimize", async (req, res) => {
  try {
    const { niche, variations, viralInspirations, notes } = req.body;

    if (!niche) {
      return res.status(400).json({ error: "Niche is required." });
    }

    const variationsList = variations || [];
    const viralList = viralInspirations || [];
    
    // Perform checks for Gemini Client initialization
    let client: GoogleGenAI;
    try {
      client = getGeminiClient();
    } catch (err: any) {
      console.warn("Gemini client configuration warning:", err.message);
      return res.status(503).json({
        error: "Gemini API key is missing. Please configure GEMINI_API_KEY in the Secrets panel."
      });
    }

    // Compose prompt
    const prompt = `You are an elite performance marketing copywriter and Meta Ads strategist. 
Analyze the following past ad creative variations and external viral competitor inspirations for the niche "${niche}" to extract key insights about what worked, what went viral, and what didn't. 
Then, generate 3 brand new, high-converting creative ad variations designed to outperform the existing ones.

Past Variations and Performance Data (Our Ad Account):
${variationsList.length > 0 
  ? variationsList.map((v: any, index: number) => `
Variation #${index + 1}: ${v.name || 'Unnamed'}
- Ad Format/Type: "${v.adType || 'video'}"
- Headline: "${v.headline || 'N/A'}"
- Hook Line: "${v.hook}"
- Primary Caption Body Copy: "${v.body}"
- Mid-video Body Action Description: "${v.reelBodyDescription || 'N/A'}"
- Call to Action: "${v.cta}"
- End-of-video CTA Action Description: "${v.reelCtaDescription || 'N/A'}"
- Visual Style / Staging: "${v.visualStyle || 'N/A'}"
- Style/Trend Concept: "${v.trend || 'N/A'}"
- Metrics:
  * Duration run: ${v.days} days
  * Ad Spend: $${v.spend} USD
  * CTR: ${v.ctr}%
  * Conversions: ${v.conversions}
  * Impressions: ${v.impressions || 'N/A'}
  * Learning Audit Status: ${v.spend >= 75 && v.days >= 14 ? "VERIFIED (Full significance)" : "UNVERIFIED (Insufficient run duration or spend)"}
`).join('\n')
  : "No past variations provided."
}

Viral Competitor Inspirations (Successful external examples in same niche to emulate/learn from):
${viralList.length > 0
  ? viralList.map((ins: any, index: number) => `
Inspiration #${index + 1}: ${ins.title || 'Unnamed Reel/Ad'}
- Hook: "${ins.hook}"
- Body Copy: "${ins.body}"
- CTA: "${ins.cta}"
- Description/Staging: "${ins.description}"
- Key Performance Metrics: Views: ${ins.views || 'N/A'}, Likes: ${ins.likes || 'N/A'}
`).join('\n')
  : "No viral competitor inspirations provided."
}

${notes ? `Additional Strategy Notes or Instructions: "${notes}"` : ''}

Using the learning data and viral concepts, diagnose underlying problems (such as weak hooks, passive CTAs, or poor product alignment) and output:
1. An overall strategic analysis of key findings, winning angles, and underperforming elements based on historical performance and viral references.
2. 3 brand new, higher-performing ad variations including name, hook, body copy, CTA, visual style direction, specific trend applied, and strategic rationale explaining why it will beat previous ads and capture viral energy.`;

    // Make content generation request with strict output schema
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite Meta Ads copywriter. Deliver clear, high-readability copy with rich visual directions. Do not output markdown container wrappers inside properties, and ensure the response matches the JSON schema exactly.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.OBJECT,
              properties: {
                keyFindings: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Key analytical insights about what is working in this niche based on data."
                },
                underperformingElements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Elements in the past variations that did not capture attention or conversions (e.g. weak hook, passive CTA)."
                },
                winningAngles: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Concepts, psychological triggers, or visual styles with high correlation to conversions or strong CTR."
                }
              },
              required: ["keyFindings", "underperformingElements", "winningAngles"]
            },
            recommendations: {
              type: Type.ARRAY,
              description: "3 highly optimized, strategic new ad variation scripts based on historical lessons.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Engaging, professional concept name" },
                  hook: { type: Type.STRING, description: "The attention-grabbing first 3 seconds hook (verbal script + visual command)" },
                  body: { type: Type.STRING, description: "The core persuasive ad body copy, highlighting pain points, benefits, and a friction-free bridge" },
                  cta: { type: Type.STRING, description: "Actionable CTA aligned with the target user intent" },
                  visualStyle: { type: Type.STRING, description: "Detailed visual execution: staging, panning, pacing, and on-screen caption designs" },
                  trend: { type: Type.STRING, description: "Specific trending framework (e.g., UGC aesthetic, founder story, green-screen review, myth busting, side-by-side split)" },
                  rationale: { type: Type.STRING, description: "Strategic explanation of how this fixes previous ad flaws or scales previous wins" }
                },
                required: ["name", "hook", "body", "cta", "visualStyle", "trend", "rationale"]
              }
            }
          },
          required: ["analysis", "recommendations"]
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Gemini optimization error:", error);
    res.status(500).json({ error: error.message || "Failed to generate ad creative recommendations." });
  }
});

// Configure Vite integration or build static server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express dev server running on port ${PORT}`);
  });
}

startServer();
