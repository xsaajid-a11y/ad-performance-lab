import React, { useState, useEffect } from "react";
import { 
  Pipeline, 
  OnboardingData, 
  ActualData, 
  ForecastResponse, 
  RankedPath,
  Variation
} from "./types";
import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_PIPELINE } from "./constants";
import { OnboardingModal } from "./components/OnboardingModal";
import { ActualsModal } from "./components/ActualsModal";
import { PipelineCanvas } from "./components/PipelineCanvas";
import { SimulatorDashboard } from "./components/SimulatorDashboard";
import { AIPanel } from "./components/AIPanel";
import { PipelineImporter } from "./components/PipelineImporter";
import { CURRENCIES, convertCurrency, formatValue, getCurrencyInfo } from "./currency";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Key, 
  RefreshCw, 
  CloudCheck, 
  FileSpreadsheet, 
  Settings, 
  Layout, 
  GitCommit, 
  BookOpen, 
  Database,
  Lock,
  ArrowRight,
  LogOut,
  Coins
} from "lucide-react";

// Direct Client-Side Supabase API configuration for fallback deployment (e.g. Vercel)
const SUPABASE_URL = "https://pfecjlovcscyhpjekeao.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZWNqbG92Y3NjeWhwamVrZWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMzUwMjgsImV4cCI6MjA5ODgxMTAyOH0.JqJgoPAI1vyQn1oucmsocS3dCI9Zz7sZFf9DEHFTGis";

async function supabaseDirectValidateLicense(key: string): Promise<boolean> {
  if (!key) return false;
  try {
    const url = `${SUPABASE_URL}/rest/v1/license_keys?key=eq.${encodeURIComponent(key)}&select=key`;
    const res = await fetch(url, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (!res.ok) {
      console.error("Direct Supabase license query failed:", res.status, await res.text());
      return false;
    }
    const list = await res.json();
    return Array.isArray(list) && list.length > 0;
  } catch (err) {
    console.error("Error validating license key directly with Supabase:", err);
    return false;
  }
}

async function supabaseDirectLoadPipelines(licenseKey: string) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/funnel_data?key=eq.${encodeURIComponent(licenseKey)}&select=data`;
    const res = await fetch(url, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return {
          data: rows[0].data,
          supabase_connected: true,
          supabase_table_missing: false
        };
      }
      return {
        data: null,
        supabase_connected: true,
        supabase_table_missing: false
      };
    } else {
      const text = await res.text();
      const tableMissing = res.status === 404 || text.includes("42P01") || text.includes("relation") || text.includes("does not exist");
      return {
        data: null,
        supabase_connected: false,
        supabase_table_missing: tableMissing
      };
    }
  } catch (err) {
    console.error("Direct Supabase load error:", err);
    return {
      data: null,
      supabase_connected: false,
      supabase_table_missing: false
    };
  }
}

async function supabaseDirectSavePipelines(
  licenseKey: string,
  pipelines: any,
  onboarding: any
) {
  try {
    const selectUrl = `${SUPABASE_URL}/rest/v1/funnel_data?key=eq.${encodeURIComponent(licenseKey)}&select=key`;
    const checkRes = await fetch(selectUrl, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (checkRes.ok) {
      const rows = await checkRes.json();
      const exists = Array.isArray(rows) && rows.length > 0;

      let saveRes;
      if (exists) {
        // UPDATE existing row
        const patchUrl = `${SUPABASE_URL}/rest/v1/funnel_data?key=eq.${encodeURIComponent(licenseKey)}`;
        saveRes = await fetch(patchUrl, {
          method: "PATCH",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            data: { pipelines, onboarding }
          })
        });
      } else {
        // INSERT new row
        const postUrl = `${SUPABASE_URL}/rest/v1/funnel_data`;
        saveRes = await fetch(postUrl, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            key: licenseKey,
            data: { pipelines, onboarding }
          })
        });
      }

      if (saveRes.ok) {
        return { saved_to_supabase: true, supabase_table_missing: false };
      } else {
        const text = await saveRes.text();
        console.error("Direct Supabase save error:", saveRes.status, text);
        const tableMissing = saveRes.status === 404 || text.includes("42P01") || text.includes("relation") || text.includes("does not exist");
        return { saved_to_supabase: false, supabase_table_missing: tableMissing };
      }
    } else {
      const text = await checkRes.text();
      const tableMissing = checkRes.status === 404 || text.includes("42P01") || text.includes("relation") || text.includes("does not exist");
      return { saved_to_supabase: false, supabase_table_missing: tableMissing };
    }
  } catch (err) {
    console.error("Direct Supabase save exception:", err);
    return { saved_to_supabase: false, supabase_table_missing: false };
  }
}

export default function App() {
  // State Initialization
  const [pipelines, setPipelines] = useState<Pipeline[]>([INITIAL_PIPELINE]);
  const [activePipelineId, setActivePipelineId] = useState<string>("pipeline-1");
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [actuals, setActuals] = useState<ActualData[]>([]);
  const [deletedActualIds, setDeletedActualIds] = useState<string[]>([]);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  
  // Gated License & Supabase States
  const [licenseKey, setLicenseKey] = useState<string>("");
  const [isLicenseSynced, setIsLicenseSynced] = useState<boolean>(false);
  const [isCheckingLicense, setIsCheckingLicense] = useState<boolean>(true);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [supabaseTableMissing, setSupabaseTableMissing] = useState<boolean>(false);
  
  // Client-Side Gemini API key
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem("fa_gemini_api_key") || (import.meta as any).env.VITE_GEMINI_API_KEY || "";
  });
  
  // App UI state
  const [isForecastLoading, setIsForecastLoading] = useState<boolean>(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  
  // Modal visibility
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isActualsOpen, setIsActualsOpen] = useState<boolean>(false);
  const [isImporterOpen, setIsImporterOpen] = useState<boolean>(false);

  // Currency Selection
  const [currentCurrency, setCurrentCurrency] = useState<string>(() => {
    return localStorage.getItem("fa_currency_code") || "USD";
  });

  // Global variables
  const [globalAcv, setGlobalAcv] = useState<number>(1200);
  const [globalBudget, setGlobalBudget] = useState<number>(5000);

  // Active pathway selections inside the visual builder
  // index matches node Index, value is selected variationId
  const [activePath, setActivePath] = useState<string[]>([]);

  const activePipeline = pipelines.find((p) => p.id === activePipelineId) || pipelines[0];

  // Currency transition converter
  const handleCurrencyChange = (newCode: string) => {
    const oldCode = currentCurrency;
    if (newCode === oldCode) return;

    // Convert global variables
    const updatedAcv = convertCurrency(globalAcv, oldCode, newCode);
    const updatedBudget = convertCurrency(globalBudget, oldCode, newCode);
    setGlobalAcv(updatedAcv);
    setGlobalBudget(updatedBudget);

    // Convert pipelines
    const updatedPipelines = pipelines.map(p => ({
      ...p,
      nodes: p.nodes.map(n => ({
        ...n,
        variations: n.variations.map(v => ({
          ...v,
          unitCost: convertCurrency(v.unitCost, oldCode, newCode)
        }))
      }))
    }));
    setPipelines(updatedPipelines);

    // Convert onboarding if populated
    let updatedOnboarding: OnboardingData | null = null;
    if (onboarding) {
      updatedOnboarding = {
        ...onboarding,
        acv: convertCurrency(onboarding.acv, oldCode, newCode),
        monthlyBudget: convertCurrency(onboarding.monthlyBudget, oldCode, newCode)
      };
      setOnboarding(updatedOnboarding);
    }

    // Convert actuals
    const updatedActuals = actuals.map(a => ({
      ...a,
      totalCost: convertCurrency(a.totalCost, oldCode, newCode)
    }));
    setActuals(updatedActuals);

    // Update active currency code
    setCurrentCurrency(newCode);
    localStorage.setItem("fa_currency_code", newCode);

    // Trigger cloud backup update
    triggerCloudSave(updatedPipelines, updatedOnboarding, updatedActuals);
  };

  // Sync Global ACV and budget when onboarding gets populated
  useEffect(() => {
    if (onboarding) {
      setGlobalAcv(onboarding.acv);
      setGlobalBudget(onboarding.monthlyBudget);
    }
  }, [onboarding]);

  const loadLedgerRows = async (key: string) => {
    try {
      const url = `${SUPABASE_URL}/rest/v1/performance_ledger?license_key=eq.${encodeURIComponent(key)}&select=*&order=created_at.desc`;
      const res = await fetch(url, {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        // Standardize properties to match our internal array format
        const formatted = rows.map((r: any) => ({
          id: r.id,
          pipelineId: r.pipeline_id,
          nodeId: r.stage_id,
          variationId: r.variation_id,
          trafficVolume: r.volume,
          conversions: r.converted,
          totalCost: Number(r.total_cost),
          notes: r.notes,
          created_at: r.created_at
        }));
        setActuals(formatted);
      }
    } catch (err) {
      console.error("Error fetching performance ledger rows:", err);
    }
  };

  // Verify and Load secure Supabase persistent data
  const verifyAndLoadLicense = async (keyToVerify: string, isStartup = false) => {
    if (!keyToVerify.trim()) {
      setIsCheckingLicense(false);
      return;
    }
    setIsSaving(true);
    setLicenseError(null);
    try {
      let isValid = false;
      let data: any = null;
      let isConnected = false;
      let isTableMissing = false;
      let usedDirectFallback = false;

      // 1. Try server gateway first
      try {
        const valRes = await fetch(`/api/validate-license/${encodeURIComponent(keyToVerify.trim())}`);
        if (!valRes.ok) {
          throw new Error(`Server validation endpoint returned status ${valRes.status}`);
        }
        const valData = await valRes.json();
        isValid = valData.valid;
        
        if (isValid) {
          // 2. Load pipelines, onboarding, and actuals via server gateway
          const response = await fetch(`/api/pipelines/${encodeURIComponent(keyToVerify.trim())}`);
          if (response.status === 401) {
            setLicenseError("Access Denied: Unverified license key session.");
            setIsLicenseSynced(false);
            setIsCheckingLicense(false);
            return;
          }
          if (!response.ok) {
            throw new Error(`Server pipelines endpoint returned status ${response.status}`);
          }
          const resData = await response.json();
          data = resData;
          isConnected = resData.supabase_connected || false;
          isTableMissing = resData.supabase_table_missing || false;
        }
      } catch (serverErr) {
        console.warn("Express server connection failed or unavailable. Falling back to direct client-side Supabase REST client...", serverErr);
        usedDirectFallback = true;
        // Direct Client-Side Fallback
        isValid = await supabaseDirectValidateLicense(keyToVerify.trim());
        if (isValid) {
          const directResult = await supabaseDirectLoadPipelines(keyToVerify.trim());
          data = directResult.data;
          isConnected = directResult.supabase_connected;
          isTableMissing = directResult.supabase_table_missing;
        }
      }
      
      if (!isValid) {
        setLicenseError("Access Denied: Invalid License Key.");
        setIsLicenseSynced(false);
        if (!isStartup) {
          localStorage.removeItem("fa_licenseKey");
        }
        setIsCheckingLicense(false);
        return;
      }

      setSupabaseConnected(isConnected);
      setSupabaseTableMissing(isTableMissing);

      if (data && Array.isArray(data.pipelines) && data.pipelines.length > 0) {
        setPipelines(data.pipelines);
        setActivePipelineId(data.pipelines[0].id);
        setOnboarding(data.onboarding);
        setActuals([]);
      } else {
        // First-time valid key: initialize key state with existing local pipeline structures
        if (usedDirectFallback) {
          const saveResult = await supabaseDirectSavePipelines(keyToVerify.trim(), pipelines, onboarding);
          setSupabaseConnected(saveResult.saved_to_supabase);
          setSupabaseTableMissing(saveResult.supabase_table_missing);
        } else {
          await triggerCloudSave(pipelines, onboarding, [], keyToVerify.trim());
        }
      }
      
      setIsLicenseSynced(true);
      await loadLedgerRows(keyToVerify.trim());
      localStorage.setItem("fa_licenseKey", keyToVerify.trim());
    } catch (e: any) {
      console.error("License sync verification failed:", e);
      const errMsg = e?.message || String(e);
      if (isStartup) {
        setLicenseError(`Network offline: Unable to verify license key with Supabase. (Error: ${errMsg})`);
      } else {
        alert(`License server validation failed. Please check backend connection.\n\nDetails: ${errMsg}`);
      }
    } finally {
      setIsSaving(false);
      setIsCheckingLicense(false);
    }
  };

  // Load state from localStorage on initial startup for offline resilience
  useEffect(() => {
    const cachedPipelines = localStorage.getItem("fa_pipelines");
    const cachedOnboarding = localStorage.getItem("fa_onboarding");
    const cachedActuals = localStorage.getItem("fa_actuals");
    const cachedLicense = localStorage.getItem("fa_licenseKey");

    if (cachedPipelines) {
      try {
        const parsed = JSON.parse(cachedPipelines);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPipelines(parsed);
          setActivePipelineId(parsed[0].id);
        }
      } catch (e) {
        console.error("Local storage error:", e);
      }
    }
    if (cachedOnboarding) {
      try {
        setOnboarding(JSON.parse(cachedOnboarding));
      } catch (e) {}
    }
    if (cachedActuals) {
      try {
        setActuals(JSON.parse(cachedActuals));
      } catch (e) {}
    }

    if (cachedLicense) {
      setLicenseKey(cachedLicense);
      verifyAndLoadLicense(cachedLicense, true);
    } else {
      setIsCheckingLicense(false);
    }
  }, []);

  // Sync active path array to match node counts
  useEffect(() => {
    if (!activePipeline) return;
    
    const newPath = [...activePath];
    // Trim path to fit current nodes length
    if (newPath.length > activePipeline.nodes.length) {
      newPath.splice(activePipeline.nodes.length);
    }
    
    // Ensure each node has a selected variation
    activePipeline.nodes.forEach((node, idx) => {
      if (!newPath[idx] || !node.variations.some((v) => v.id === newPath[idx])) {
        // Default to the first variation of the node
        newPath[idx] = node.variations[0]?.id || "";
      }
    });

    setActivePath(newPath);
  }, [activePipeline, activePipelineId]);

  // Backup to localStorage on any state modification
  useEffect(() => {
    if (pipelines.length > 0) {
      localStorage.setItem("fa_pipelines", JSON.stringify(pipelines));
    }
  }, [pipelines]);

  useEffect(() => {
    localStorage.setItem("fa_actuals", JSON.stringify(actuals));
  }, [actuals]);

  useEffect(() => {
    if (onboarding) {
      localStorage.setItem("fa_onboarding", JSON.stringify(onboarding));
    }
  }, [onboarding]);

  // Trigger server-side cloud sync if license key is active
  const triggerCloudSave = async (
    pList: Pipeline[],
    oData: OnboardingData | null,
    aList?: ActualData[],
    keyOverride?: string,
    delIds?: string[]
  ) => {
    const key = keyOverride || licenseKey.trim();
    if (!key || (!isLicenseSynced && !keyOverride)) return;
    setIsSaving(true);
    try {
      try {
        const response = await fetch(`/api/pipelines/${encodeURIComponent(key)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            pipelines: pList, 
            onboarding: oData
          }),
        });
        if (!response.ok) {
          throw new Error(`Server returned error status ${response.status}`);
        }
        const data = await response.json();
        if (data.saved_to_supabase) {
          setSupabaseConnected(true);
          setSupabaseTableMissing(false);
        } else if (data.supabase_table_missing) {
          setSupabaseTableMissing(true);
        }
      } catch (err) {
        console.warn("Express server save failed, falling back to direct Supabase save...", err);
        const saveResult = await supabaseDirectSavePipelines(key, pList, oData);
        setSupabaseConnected(saveResult.saved_to_supabase);
        setSupabaseTableMissing(saveResult.supabase_table_missing);
      }
    } catch (e) {
      console.error("Cloud saving failed:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // License key authentication / sync loader
  const handleLoadLicenseKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;
    await verifyAndLoadLicense(licenseKey);
  };

  // Run predictive analysis client-side using browser Gemini SDK direct fallback
  const runClientForecast = async (oData: any, nList: any, aList: any, apiKey: string) => {
    let forecastActuals = aList || [];
    const key = licenseKey.trim();
    if (key) {
      try {
        const url = `${SUPABASE_URL}/rest/v1/performance_ledger?license_key=eq.${encodeURIComponent(key)}&order=created_at.desc`;
        const checkRes = await fetch(url, {
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        if (checkRes.ok) {
          const dbRows = await checkRes.json();
          if (Array.isArray(dbRows)) {
            forecastActuals = dbRows.map((r: any) => ({
              id: r.id || `db-${r.created_at}`,
              date: r.created_at || new Date().toISOString(),
              pipelineId: r.pipeline_id,
              nodeId: r.stage_id,
              variationId: r.variation_id,
              trafficVolume: r.volume,
              conversions: r.converted,
              totalCost: r.total_cost,
              notes: r.notes,
              created_at: r.created_at
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching performance_ledger for client forecast:", err);
      }
    }

    if (activePipelineId && forecastActuals.length > 0) {
      forecastActuals = forecastActuals.filter((a: any) => a.pipelineId === activePipelineId);
    }

    let performanceContext = "";
    if (forecastActuals.length === 0) {
      performanceContext = "No past actual performance metrics logged yet.";
    } else {
      performanceContext = forecastActuals.map((act: any, idx: number) => {
        const dateStr = act.created_at || act.date || "N/A";
        return `Log #${idx + 1}:
- Recorded Timestamp: ${dateStr}
- Pipeline ID: ${act.pipelineId}
- Pipeline Stage (Node) ID: ${act.nodeId}
- Variation/Method ID: ${act.variationId}
- Traffic Volume (Impressions/Clicks): ${act.trafficVolume}
- Conversions (Signups/Sales): ${act.conversions}
- Total Spend / Cost: $${act.totalCost} USD
- Calculated Conversion Rate: ${(act.trafficVolume > 0 ? (act.conversions / act.trafficVolume) * 100 : 0).toFixed(2)}%
- Calculated CPA: $${act.conversions > 0 ? (act.totalCost / act.conversions).toFixed(2) : '0.00'} USD
- Marketer Notes: ${act.notes || 'None'}`;
      }).join("\n\n");
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemPrompt = `You are an expert Marketing Funnel Architect, conversion rate optimization (CRO) engineer, and predictive ROI analyst.
Your job is to analyze a visual pipeline consisting of several consecutive Nodes. Each Node has several alternative Variations.
The user provides an onboarding profile about their business (industry, core offer, price/average contract value, ad spend budget, target audience, and past metrics) and optionally some past actual performance data they have logged in the system.

Based on this input, complete these actions:
1. Estimate the conversion rate (as a decimal from 0.0 to 1.0) and cost per unit (CPL/CPC/etc. in USD) for EVERY single variation in the visual nodes that fits the business profile realistically.
2. Formulate the best possible paths from Node 1 through Node N. Since all variations in Node i connect to all variations in Node i+1, a path is a list containing exactly one variation ID from each consecutive node.
3. Determine the top 5 best paths, rank them, give them a score out of 100, calculate their overall estimated conversion rate and estimated ROI/ROAS, and explain the Pros and Cons of each path in detail based on the business type.

Be highly realistic and mathematically consistent! 
- High ticket offers (e.g. B2B SaaS with $5,000 ACV) should have high lead acquisition costs (e.g., $40-$150) and low close rates (e.g., 2% to 15% at sales stages).
- Low ticket offers (e.g. E-commerce with $40 item price) should have low conversion costs ($0.50-$2.00) and higher checkout/cart rates, but smaller margins.
- If the marketer has logged historic actual data, anchor your predictions heavily to those actuals to make future predictions far more accurate.

Output must strictly follow the JSON Schema provided.`;

    const promptMessage = `Business Profile / Onboarding Data:
${JSON.stringify(oData, null, 2)}

Visual Pipeline Nodes and Variations:
${JSON.stringify(nList, null, 2)}

Marketer's Logged Performance Actuals (with Recorded Timestamps):
${performanceContext}

Please provide the forecast predictions and ranked optimal pathways.`;

    const generateConfig = {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["variations", "rankedPaths"],
        properties: {
          variations: {
            type: Type.ARRAY,
            description: "Estimated metrics for each variation in the nodes.",
            items: {
              type: Type.OBJECT,
              required: ["nodeId", "variationId", "conversionRate", "unitCost", "explanation"],
              properties: {
                nodeId: { type: Type.STRING },
                variationId: { type: Type.STRING },
                conversionRate: { 
                  type: Type.NUMBER, 
                  description: "Estimated conversion rate for this variation as decimal, e.g. 0.08 for 8%" 
                },
                unitCost: { 
                  type: Type.NUMBER, 
                  description: "Estimated cost per lead/action/click in USD, e.g. 4.50" 
                },
                explanation: { 
                  type: Type.STRING, 
                  description: "Brief rationale based on the business profile/past data." 
                }
              }
            }
          },
          rankedPaths: {
            type: Type.ARRAY,
            description: "A ranked list of the best pathways through the pipeline from start to end.",
            items: {
              type: Type.OBJECT,
              required: ["path", "score", "roi", "totalConversionRate", "pros", "cons"],
              properties: {
                path: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Array of variation IDs in the sequence of nodes, e.g. ['v_id_1', 'v_id_2']"
                },
                score: { 
                  type: Type.INTEGER, 
                  description: "Score from 0 to 100 for this path's suitability." 
                },
                roi: { 
                  type: Type.NUMBER, 
                  description: "Estimated Return on Ad Spend (ROAS) ratio, e.g. 3.4 for 340% ROI." 
                },
                totalConversionRate: { 
                  type: Type.NUMBER, 
                  description: "Estimated cumulative conversion rate from start to end of funnel." 
                },
                pros: { type: Type.STRING, description: "Strongest benefits of this path." },
                cons: { type: Type.STRING, description: "Key bottlenecks or costs of this path." }
              }
            }
          }
        }
      }
    };

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptMessage,
        config: generateConfig,
      });
    } catch (err: any) {
      console.warn("Primary model gemini-3.5-flash failed or hit high demand, attempting fallback to gemini-2.5-flash:", err);
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptMessage,
        config: generateConfig,
      });
    }

    const resultText = response.text || "{}";
    return JSON.parse(resultText);
  };

  const runClientForecastDirect = async (key: string) => {
    setForecastError(null);
    try {
      const data = await runClientForecast(
        onboarding,
        activePipeline.nodes,
        actuals.filter((a) => a.pipelineId === activePipelineId),
        key
      );
      if (data.error) {
        setForecastError(data.error);
      } else {
        setForecastData(data);
        setForecastError(null);
      }
    } catch (err: any) {
      console.error("Direct Gemini call failed:", err);
      setForecastError(`Direct Gemini analysis failed: ${err?.message || String(err)}`);
    } finally {
      setIsForecastLoading(false);
    }
  };

  // Run predictive analysis via backend, falling back to direct browser call on 404
  const handleRunForecast = async () => {
    setIsForecastLoading(true);
    setForecastError(null);
    try {
      let isStaticDeployment = false;
      let response: Response | null = null;
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      const customKey = geminiApiKey.trim() || localStorage.getItem("fa_gemini_api_key") || "";
      if (customKey) {
        headers["x-gemini-api-key"] = customKey;
      }

      try {
        response = await fetch("/api/forecast", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            onboarding,
            nodes: activePipeline.nodes,
            actuals: actuals.filter((a) => a.pipelineId === activePipelineId),
            licenseKey: licenseKey.trim(),
            pipelineId: activePipelineId,
          }),
        });
        if (response.status === 404) {
          isStaticDeployment = true;
        }
      } catch (err) {
        console.warn("API route unavailable or offline, running direct client fallback...", err);
        isStaticDeployment = true;
      }

      if (isStaticDeployment) {
        const apiKeyToUse = geminiApiKey.trim() || (import.meta as any).env.VITE_GEMINI_API_KEY || localStorage.getItem("fa_gemini_api_key");
        if (!apiKeyToUse) {
          const userKey = window.prompt("AI Predictive Forecasting is unavailable on your static-only web server.\n\nTo run simulations directly from your browser, please enter your Google Gemini API Key (saved only in local storage):");
          if (!userKey || !userKey.trim()) {
            setForecastError("Prediction cancelled. Please configure a Gemini API key first.");
            setIsForecastLoading(false);
            return;
          }
          const trimmedKey = userKey.trim();
          setGeminiApiKey(trimmedKey);
          localStorage.setItem("fa_gemini_api_key", trimmedKey);
          await runClientForecastDirect(trimmedKey);
          return;
        } else {
          await runClientForecastDirect(apiKeyToUse);
          return;
        }
      }

      if (response) {
        if (!response.ok) {
          const text = await response.text();
          let errStr = `Server returned status ${response.status}: ${text.slice(0, 100)}`;
          try {
            const parsed = JSON.parse(text);
            if (parsed.error) errStr = parsed.error;
          } catch (_) {}
          throw new Error(errStr);
        }
        const data = await response.json();
        if (data.error) {
          setForecastError(data.error);
        } else {
          setForecastData(data);
          setForecastError(null);
        }
      }
    } catch (e: any) {
      console.error(e);
      setForecastError(e?.message || String(e));
    } finally {
      setIsForecastLoading(false);
    }
  };

  // Apply ranked path overlays computed by Gemini back into visual editor
  const handleApplyPathMetrics = (rankedPath: RankedPath) => {
    if (!forecastData) return;

    const updatedNodes = activePipeline.nodes.map((node) => {
      const updatedVariations = node.variations.map((v) => {
        // Find if this variation has a predicted metric in the overlay array
        const prediction = forecastData.variations.find(
          (pv) => pv.nodeId === node.id && pv.variationId === v.id
        );

        if (prediction) {
          return {
            ...v,
            conversionRate: prediction.conversionRate,
            unitCost: prediction.unitCost,
            explanation: prediction.explanation,
          };
        }
        return v;
      });

      return {
        ...node,
        variations: updatedVariations,
      };
    });

    const updatedPipelines = pipelines.map((p) =>
      p.id === activePipelineId ? { ...p, nodes: updatedNodes } : p
    );

    setPipelines(updatedPipelines);
    
    // Select this specific sequence immediately in the canvas
    setActivePath(rankedPath.path);
    triggerCloudSave(updatedPipelines, onboarding, actuals);
  };

  // Visual Path select handler
  const handleSelectVariation = (nodeIndex: number, varId: string) => {
    const newPath = [...activePath];
    newPath[nodeIndex] = varId;
    setActivePath(newPath);
  };

  // PIPELINE CRUD
  const handleAddPipeline = () => {
    if (pipelines.length >= 5) {
      alert("License limit: You can manage up to 5 pipelines per account.");
      return;
    }
    const newId = `pipeline-${Date.now()}`;
    const newPipeline: Pipeline = {
      id: newId,
      name: `Pipeline Plan #${pipelines.length + 1}`,
      nodes: [
        {
          id: `node-${Date.now()}-1`,
          name: "Traffic Generation",
          variations: [
            { id: `var-${Date.now()}-1`, name: "Social Media Ads", conversionRate: 0.05, unitCost: 4.00, explanation: "Standard baseline" }
          ]
        },
        {
          id: `node-${Date.now()}-2`,
          name: "Closing Strategy",
          variations: [
            { id: `var-${Date.now()}-2`, name: "Self-Serve Purchase", conversionRate: 0.10, unitCost: 0.00, explanation: "Standard checkouts" }
          ]
        }
      ]
    };
    const updated = [...pipelines, newPipeline];
    setPipelines(updated);
    setActivePipelineId(newId);
    triggerCloudSave(updated, onboarding, actuals);
  };

  const handleDeletePipeline = (id: string) => {
    if (pipelines.length <= 1) {
      alert("At least one pipeline canvas must be kept.");
      return;
    }
    const updated = pipelines.filter((p) => p.id !== id);
    setPipelines(updated);
    setActivePipelineId(updated[0].id);
    triggerCloudSave(updated, onboarding, actuals);
  };

  const handleUpdatePipelineName = (id: string, name: string) => {
    const updated = pipelines.map((p) => (p.id === id ? { ...p, name } : p));
    setPipelines(updated);
    triggerCloudSave(updated, onboarding, actuals);
  };

  const handleImportPipeline = (imported: Omit<Pipeline, "id">, overwriteActive: boolean) => {
    if (overwriteActive) {
      const updatedPipelines = pipelines.map((p) =>
        p.id === activePipelineId ? { ...p, name: imported.name, nodes: imported.nodes } : p
      );
      setPipelines(updatedPipelines);
      triggerCloudSave(updatedPipelines, onboarding, actuals);
    } else {
      const newId = `pipe-${Date.now()}`;
      const newPipeline: Pipeline = {
        ...imported,
        id: newId,
      };
      const updatedPipelines = [...pipelines, newPipeline];
      setPipelines(updatedPipelines);
      setActivePipelineId(newId);
      triggerCloudSave(updatedPipelines, onboarding, actuals);
    }
  };

  // NODE CRUD
  const handleAddNode = () => {
    if (activePipeline.nodes.length >= 10) {
      alert("A visual pipeline is strictly limited to 10 consecutive stages.");
      return;
    }
    const nodeId = `node-${Date.now()}`;
    const varId = `var-${Date.now()}`;
    const newNode = {
      id: nodeId,
      name: `Stage #${activePipeline.nodes.length + 1}`,
      variations: [
        {
          id: varId,
          name: "Interactive Option A",
          conversionRate: 0.15,
          unitCost: 1.50,
          explanation: "Standard default method"
        }
      ]
    };

    const updatedNodes = [...activePipeline.nodes, newNode];
    const updatedPipelines = pipelines.map((p) =>
      p.id === activePipelineId ? { ...p, nodes: updatedNodes } : p
    );

    setPipelines(updatedPipelines);
    triggerCloudSave(updatedPipelines, onboarding, actuals);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (activePipeline.nodes.length <= 1) {
      alert("A visual pipeline must contain at least 1 stage.");
      return;
    }
    const updatedNodes = activePipeline.nodes.filter((n) => n.id !== nodeId);
    const updatedPipelines = pipelines.map((p) =>
      p.id === activePipelineId ? { ...p, nodes: updatedNodes } : p
    );
    setPipelines(updatedPipelines);
    triggerCloudSave(updatedPipelines, onboarding, actuals);
  };

  const handleUpdateNodeName = (nodeId: string, name: string) => {
    const updatedNodes = activePipeline.nodes.map((n) =>
      n.id === nodeId ? { ...n, name } : n
    );
    const updatedPipelines = pipelines.map((p) =>
      p.id === activePipelineId ? { ...p, nodes: updatedNodes } : p
    );
    setPipelines(updatedPipelines);
    triggerCloudSave(updatedPipelines, onboarding, actuals);
  };

  const handleUpdateNodeDescription = (nodeId: string, description: string) => {
    const updatedNodes = activePipeline.nodes.map((n) =>
      n.id === nodeId ? { ...n, description } : n
    );
    const updatedPipelines = pipelines.map((p) =>
      p.id === activePipelineId ? { ...p, nodes: updatedNodes } : p
    );
    setPipelines(updatedPipelines);
    triggerCloudSave(updatedPipelines, onboarding, actuals);
  };

  // VARIATION CRUD
  const handleAddVariation = (nodeId: string) => {
    const varId = `var-${Date.now()}`;
    const newVar = {
      id: varId,
      name: "New Alternative Method",
      conversionRate: 0.10,
      unitCost: 1.50,
      isSpeculative: true,
      explanation: "Just an idea (Speculative baseline)"
    };

    const updatedNodes = activePipeline.nodes.map((n) => {
      if (n.id === nodeId) {
        return {
          ...n,
          variations: [...n.variations, newVar]
        };
      }
      return n;
    });

    const updatedPipelines = pipelines.map((p) =>
      p.id === activePipelineId ? { ...p, nodes: updatedNodes } : p
    );

    setPipelines(updatedPipelines);
    triggerCloudSave(updatedPipelines, onboarding, actuals);
  };

  const handleDeleteVariation = (nodeId: string, varId: string) => {
    const targetNode = activePipeline.nodes.find((n) => n.id === nodeId);
    if (targetNode && targetNode.variations.length <= 1) {
      alert("Each stage must have at least one alternative method.");
      return;
    }

    const updatedNodes = activePipeline.nodes.map((n) => {
      if (n.id === nodeId) {
        return {
          ...n,
          variations: n.variations.filter((v) => v.id !== varId)
        };
      }
      return n;
    });

    const updatedPipelines = pipelines.map((p) =>
      p.id === activePipelineId ? { ...p, nodes: updatedNodes } : p
    );

    setPipelines(updatedPipelines);
    triggerCloudSave(updatedPipelines, onboarding, actuals);
  };

  const handleUpdateVariation = (nodeId: string, varId: string, updates: Partial<Variation>) => {
    const updatedNodes = activePipeline.nodes.map((n) => {
      if (n.id === nodeId) {
        return {
          ...n,
          variations: n.variations.map((v) => (v.id === varId ? { ...v, ...updates } : v))
        };
      }
      return n;
    });

    const updatedPipelines = pipelines.map((p) =>
      p.id === activePipelineId ? { ...p, nodes: updatedNodes } : p
    );

    setPipelines(updatedPipelines);
    triggerCloudSave(updatedPipelines, onboarding, actuals);
  };

  // ACTUALS LEDGER CRUD
  const handleAddActual = async (newAct: Omit<ActualData, "id">) => {
    const key = licenseKey.trim();
    if (!key) return;

    // Safety fallback properties map
    const pipelineId = newAct.pipelineId || activePipelineId;
    const stageId = newAct.nodeId || (newAct as any).stageId || "";
    const variationId = newAct.variationId || (newAct as any).variationId || "";
    const volume = Number(newAct.trafficVolume || (newAct as any).volume || 0);
    const converted = Number(newAct.conversions || (newAct as any).converted || 0);
    const totalCost = Number(newAct.totalCost || 0);
    const notes = newAct.notes || "";

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/performance_ledger`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          license_key: key,
          pipeline_id: pipelineId,
          stage_id: stageId,
          variation_id: variationId,
          volume: volume,
          converted: converted,
          total_cost: totalCost,
          notes: notes
        })
      });

      if (response.ok) {
        await loadLedgerRows(key);
      } else {
        throw new Error(await response.text());
      }
    } catch (err) {
      console.warn("Database insert failed, using local tracking:", err);
      const actRecord = { ...newAct, id: `act-${Date.now()}` } as any;
      setActuals([actRecord, ...actuals]);
    }
  };

  const handleDeleteActual = (id: string) => {
    const updated = actuals.filter((a) => a.id !== id);
    setActuals(updated);
  };

  // Log out from this device and clear session
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out from this device? This will clear your current cached session.")) {
      localStorage.removeItem("fa_licenseKey");
      localStorage.removeItem("fa_pipelines");
      localStorage.removeItem("fa_onboarding");
      localStorage.removeItem("fa_actuals");
      setLicenseKey("");
      setIsLicenseSynced(false);
      setPipelines([INITIAL_PIPELINE]);
      setActivePipelineId("pipeline-1");
      setOnboarding(null);
      setActuals([]);
      setForecastData(null);
      setSupabaseConnected(false);
      setSupabaseTableMissing(false);
    }
  };

  // Full-screen License Gate loading state
  if (isCheckingLicense) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <GitCommit className="w-12 h-12 text-emerald-400 animate-spin" />
          <p className="text-sm font-medium text-zinc-400">Verifying secure license gateway...</p>
        </div>
      </div>
    );
  }

  // Full-screen License Gate Lock Screen
  if (!isLicenseSynced) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center font-sans px-4 py-12 relative overflow-hidden selection:bg-emerald-500 selection:text-zinc-950">
        {/* Ambient decorative lighting */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10 space-y-6">
          
          {/* Lock Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 mb-2">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-zinc-100 tracking-tight">The Funnel Architect</h1>
            <p className="text-xs text-zinc-400">
              Visual pipeline planning, real-time ROI simulations, and predictive AI.
            </p>
          </div>

          <hr className="border-zinc-800/80" />

          {/* Activation Form */}
          <form onSubmit={handleLoadLicenseKey} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="license-key-input" className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                License Activation Key
              </label>
              <div className="relative">
                <input
                  id="license-key-input"
                  type="text"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => {
                    setLicenseKey(e.target.value);
                    if (licenseError) setLicenseError(null);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-sm rounded-xl pl-10 pr-4 py-3 text-zinc-200 focus:outline-hidden transition-all placeholder:text-zinc-700 font-mono tracking-wider"
                  required
                />
                <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
              {licenseError && (
                <p className="text-xs text-red-400 font-medium mt-1 flex items-center gap-1">
                  <span>⚠️</span> {licenseError}
                </p>
              )}
            </div>

            <button
              id="activate-software-btn"
              type="submit"
              disabled={isSaving}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying key...
                </>
              ) : (
                <>
                  Unlock Software <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Setup Guide Information */}
          <div className="bg-zinc-950/50 rounded-2xl p-4 border border-zinc-800/60 space-y-2.5 text-xs text-zinc-500 leading-relaxed">
            <p className="font-semibold text-zinc-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-500" /> Key Management Information:
            </p>
            <p>
              This software is gated. Access keys are stored securely in your <strong className="text-zinc-400">Supabase Cloud Database</strong> inside the <code className="text-emerald-400 bg-zinc-900 px-1 py-0.5 rounded">license_keys</code> table.
            </p>
            <p>
              To authorize new licenses or remove existing ones, insert or delete keys directly in your <strong className="text-zinc-400">Supabase Dashboard</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* Premium Top Navigation Rail */}
      <header className="border-b border-zinc-800 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <GitCommit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              The Funnel Architect
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-zinc-800 text-emerald-400 font-bold rounded-md border border-zinc-700/60">
                Predictive v1.0
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">Visual Pipeline Designer & AI ROI Simulator</p>
          </div>
        </div>

        {/* Currency Selector option right on top */}
        <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-1.5 shadow-md shrink-0">
          <Coins className="w-4 h-4 text-emerald-450 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-400">Currency:</span>
          <select
            id="currency-selector"
            value={currentCurrency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-bold rounded-lg px-2 py-1 focus:outline-hidden focus:border-emerald-500 cursor-pointer transition-colors"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} ({c.code}) - {c.name.split(" - ")[1]}
              </option>
            ))}
          </select>
        </div>

        {/* Authenticated License Info */}
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {supabaseConnected && !supabaseTableMissing ? (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold shadow-sm">
                <CloudCheck className="w-4 h-4" /> Supabase Connected
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-800 text-zinc-400 border border-zinc-700/60 rounded-xl text-xs font-bold shadow-sm" title="Progress saved locally in workspace">
                <Lock className="w-3.5 h-3.5 text-amber-500" /> Offline Local Backup
              </div>
            )}
            
            <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl px-3 py-1.5 text-xs text-zinc-300 font-semibold font-mono tracking-tight flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Key: {licenseKey.length > 10 ? `${licenseKey.slice(0, 5)}...${licenseKey.slice(-5)}` : licenseKey}
            </div>

            <button
              id="logout-btn"
              type="button"
              onClick={handleLogout}
              className="bg-zinc-900 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 text-xs px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-red-900/40 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Log out from this device"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">

        {/* Supabase Table Missing Warning Alert */}
        {supabaseTableMissing && (
          <div className="bg-amber-500/10 border border-amber-500/25 text-amber-200 p-5 rounded-2xl space-y-3.5 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="text-xl leading-none">⚠️</span>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-amber-400">Database Schema Integration Action Required</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Your license key is verified successfully. However, your Supabase cloud database does not yet contain the <code className="text-emerald-400 bg-zinc-950 px-1.5 py-0.5 rounded font-mono font-bold border border-zinc-800">funnel_data</code> table needed for saving simulation records. 
                  Your funnel pipelines are currently being safely saved locally inside this workspace container and local storage.
                </p>
              </div>
            </div>
            
            <div className="space-y-2 pl-8 border-l border-amber-500/10">
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-black">To activate Cloud DB Syncing, run this SQL query in your Supabase SQL Editor:</p>
              <pre className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-[11px] font-mono text-emerald-400 select-all overflow-x-auto leading-relaxed shadow-inner">
{`create table funnel_data (
  key text primary key references license_keys(key) on delete cascade,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);`}
              </pre>
            </div>
          </div>
        )}
        
        {/* Pipeline Tab Switcher & Secondary Utility Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/30 border border-zinc-800/80 p-3 rounded-2xl">
          
          {/* Active Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {pipelines.map((p) => {
              const isActive = p.id === activePipelineId;
              return (
                <div key={p.id} className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  {/* Tab Selector */}
                  <button
                    type="button"
                    onClick={() => {
                      setActivePipelineId(p.id);
                      setForecastData(null); // Clear forecast on tab swap to encourage recalculation
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isActive 
                        ? "bg-zinc-800 text-emerald-400 border border-zinc-700" 
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {p.name}
                  </button>

                  {/* Quick Inline Delete Tab */}
                  {pipelines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeletePipeline(p.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-900 transition-colors"
                      title="Delete pipeline"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add New Pipeline Button */}
            {pipelines.length < 5 && (
              <button
                type="button"
                onClick={handleAddPipeline}
                className="p-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xl transition-all flex items-center gap-1 cursor-pointer text-xs font-medium"
                title="Create up to 5 pipelines"
              >
                <Plus className="w-4 h-4" /> Add Canvas
              </button>
            )}

            {/* AI Importer Trigger Button */}
            <button
              type="button"
              onClick={() => setIsImporterOpen(true)}
              className="px-3 py-2 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 hover:from-amber-500/15 hover:to-emerald-500/15 text-amber-400 hover:text-amber-300 border border-amber-500/20 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold shadow-md shadow-amber-500/5"
              title="Import Funnel from AI Chatbot Code"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Import AI Blueprint</span>
            </button>
          </div>

          {/* Quick Config Row */}
          <div className="flex items-center gap-3.5">
            {/* Rename Pipeline Field */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-xs font-medium">Rename:</span>
              <input
                type="text"
                value={activePipeline?.name || ""}
                onChange={(e) => handleUpdatePipelineName(activePipeline.id, e.target.value)}
                className="bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-hidden max-w-[150px] font-medium"
              />
            </div>

            {/* Onboarding Trigger */}
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" /> Business Profile
            </button>

            {/* Performance Ledger Trigger */}
            <button
              type="button"
              onClick={() => setIsActualsOpen(true)}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" /> Performance Ledger
            </button>
          </div>
        </div>

        {/* Section 1: Visual Pipeline Mesh Canvas */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">1. Interactive Pipeline Workspace</h2>
          </div>
          <PipelineCanvas
            pipeline={activePipeline}
            activePath={activePath}
            onSelectVariation={handleSelectVariation}
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
            onUpdateNodeName={handleUpdateNodeName}
            onUpdateNodeDescription={handleUpdateNodeDescription}
            onAddVariation={handleAddVariation}
            onDeleteVariation={handleDeleteVariation}
            onUpdateVariation={handleUpdateVariation}
            currencyCode={currentCurrency}
          />
        </section>

        {/* Section 2: Real-time Sim & AI Analytics Panels */}
        <div className="space-y-8">
          
          {/* Section 2a: Real-time Slider Simulation */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">2. Real-time ROI Simulator</h2>
            </div>
            <SimulatorDashboard
              pipeline={activePipeline}
              activePath={activePath}
              globalAcv={globalAcv}
              onUpdateGlobalAcv={setGlobalAcv}
              globalBudget={globalBudget}
              onUpdateGlobalBudget={setGlobalBudget}
              onUpdateVariation={handleUpdateVariation}
              currencyCode={currentCurrency}
            />
          </section>

          {/* Section 2b: AI Predictions & Recommendations */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">3. Optimized Marketing Scenarios</h2>
            </div>
            <AIPanel
              onboarding={onboarding}
              pipeline={activePipeline}
              forecastData={forecastData}
              isForecastLoading={isForecastLoading}
              onRunForecast={handleRunForecast}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onApplyPathMetrics={handleApplyPathMetrics}
              onSelectPath={setActivePath}
              activePath={activePath}
              geminiApiKey={geminiApiKey}
              onChangeGeminiApiKey={(key) => {
                setGeminiApiKey(key);
                localStorage.setItem("fa_gemini_api_key", key);
              }}
              forecastError={forecastError}
              onClearForecastError={() => setForecastError(null)}
              currencyCode={currentCurrency}
            />
          </section>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 mt-16 py-8 text-center text-zinc-600 text-xs">
        <p>© 2026 The Funnel Architect. All simulations are predictive based on mathematical models and historical sector statistics.</p>
      </footer>

      {/* MODALS */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        data={onboarding}
        onSave={(data) => {
          setOnboarding(data);
          triggerCloudSave(pipelines, data, actuals);
        }}
        currencyCode={currentCurrency}
      />

      <ActualsModal
        isOpen={isActualsOpen}
        onClose={() => {
          setIsActualsOpen(false);
          setActuals([]);
          setDeletedActualIds([]);
        }}
        pipelines={pipelines}
        actuals={actuals}
        onAddActual={handleAddActual}
        onDeleteActual={handleDeleteActual}
        currencyCode={currentCurrency}
      />

      <PipelineImporter
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImport={handleImportPipeline}
        activePipelineName={activePipeline?.name || ""}
      />
    </div>
  );
}
