import React, { useState, useEffect } from "react";
import { NICHE_TEMPLATES } from "./data";
import { AdVariation, OptimizationResult, RecommendedAd, ViralInspiration } from "./types";
import DashboardStats from "./components/DashboardStats";
import AdVariationCard from "./components/AdVariationCard";
import AICreativeRecommendations from "./components/AICreativeRecommendations";
import SavedScripts from "./components/SavedScripts";
import AddVariationModal from "./components/AddVariationModal";
import CtrTrendsChart from "./components/CtrTrendsChart";
import ReelsInspirationFinder from "./components/ReelsInspirationFinder";
import { 
  Sparkles, 
  Layers, 
  Bookmark, 
  Plus, 
  ArrowRight, 
  RotateCcw, 
  Info, 
  Lightbulb, 
  Wand2,
  Database,
  Tv,
  ChevronDown,
  Trash2,
  Check,
  AlertCircle,
  Eye,
  X,
  Link2,
  DatabaseZap,
  HelpCircle
} from "lucide-react";

// Pre-populated Sample Viral Inspirations to give a beautiful immediate experience
const SAMPLE_VIRAL_INSPIRATIONS: ViralInspiration[] = [
  {
    id: "viral_skin_1",
    niche: "DTC Skincare & Beauty",
    title: "Viral 3-Second Ice & Glow Reel",
    hook: "POV: You've been washing your face wrong for 24 years.",
    body: "Don't just slap thick moisturizer on bone-dry skin. Try the double-hydration technique with organic rosehip facial serum first. It binds moisture deep into the pores, giving you that bouncy glazed donut look.",
    cta: "Get 15% Off Serum",
    description: "Fast-paced aesthetic UGC showing creator icing her face, dripping active serum in slow-mo, then tapping her cheek to show insane hydration shine.",
    views: "4.5M views",
    likes: "210k likes"
  },
  {
    id: "viral_saas_1",
    niche: "B2B SaaS (AI Smart Calendar)",
    title: "Chaotic Slack DM Montage",
    hook: "This slack DM literally saved me from a mental breakdown...",
    body: "My boss sent me 14 scheduling links an hour. I sent him one ChronosAI block that auto-clustered all meetings and defended my 3-hour focus window. He didn't even know what hit him.",
    cta: "Try Free",
    description: "Green-screen zoom of chaotic Slack messages overlay, matching high-stress sound effect, transitioning to creator smiling holding an iced coffee.",
    views: "1.2M views",
    likes: "45k likes"
  },
  {
    id: "viral_tumbler_1",
    niche: "DTC E-Commerce (Eco Tumbler)",
    title: "Extreme Car Ice Test",
    hook: "My car literally burned down but look at this cup.",
    body: "No joke, the entire dashboard melted but the ice inside my EcoMug was still fully solid. Dual-wall vacuum steel is no joke. Spill-proof, burn-proof, and completely plastic-free.",
    cta: "Shop EcoMug",
    description: "Shock-value handheld footage panning from a charred car seat to a perfectly pristine mint green tumbler with clinking ice sounds.",
    views: "8.4M views",
    likes: "920k likes"
  },
  {
    id: "viral_apparel_1",
    niche: "Apparel & Fashion (Activewear)",
    title: "The Ultimate Leg Press Squat Check",
    hook: "Don't buy activewear leggings until you see this test.",
    body: "We stretched our leggings over a bright neon balloon and pushed 400 lbs on the leg press. Zero tearing, zero transparency, absolutely squat-proof. Best gym upgrade of 2026.",
    cta: "Shop Seamless Leggings",
    description: "Satisfying macro-shots of thick textured squat-proof activewear stretched tightly under heavy weights to prove high fabric opacity.",
    views: "2.1M views",
    likes: "185k likes"
  }
];

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value || value === "undefined") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    console.warn("JSON parsing error", e);
    return fallback;
  }
}

export default function App() {
  // 1. STATE INITIALIZATION
  const [selectedNicheId, setSelectedNicheId] = useState<string>(NICHE_TEMPLATES[0].id);
  
  // Mutable drafts / reference examples (User can delete these if needed)
  const [variations, setVariations] = useState<AdVariation[]>(() => {
    const saved = localStorage.getItem("advantage_variations");
    return safeJsonParse(saved, NICHE_TEMPLATES.flatMap(t => t.preloadedVariations));
  });

  // Supabase Database States
  const [loggedDatabase, setLoggedDatabase] = useState<AdVariation[]>([]);
  const [dbStatus, setDbStatus] = useState<"loading" | "connected" | "unconfigured" | "table_missing" | "error">("loading");
  const [dbMessage, setDbMessage] = useState<string>("");
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Fetch logged variations on mount
  const fetchLoggedVariations = async () => {
    try {
      setDbStatus("loading");
      const res = await fetch("/api/database");
      const result = await res.json();
      
      if (result.status === "success") {
        setLoggedDatabase(result.data);
        setDbStatus("connected");
        setDbMessage("LIVE: Synced to your active Supabase database!");
      } else if (result.status === "table_missing") {
        setDbStatus("table_missing");
        setDbMessage("Table 'ad_variations' does not exist in your Supabase database yet.");
        // Fallback to local
        const saved = localStorage.getItem("advantage_logged_database");
        setLoggedDatabase(safeJsonParse(saved, []));
      } else {
        setDbStatus("unconfigured");
        setDbMessage("Supabase credentials not configured. Local fallback enabled.");
        // Fallback to local
        const saved = localStorage.getItem("advantage_logged_database");
        setLoggedDatabase(safeJsonParse(saved, []));
      }
    } catch (err: any) {
      console.error("Failed to load Supabase variations:", err);
      setDbStatus("error");
      setDbMessage("Could not connect to database proxy server.");
      const saved = localStorage.getItem("advantage_logged_database");
      setLoggedDatabase(safeJsonParse(saved, []));
    }
  };

  useEffect(() => {
    fetchLoggedVariations();
  }, []);

  // Viral inspirations state
  const [viralInspirations, setViralInspirations] = useState<ViralInspiration[]>(() => {
    const saved = localStorage.getItem("advantage_viral_inspirations");
    return safeJsonParse(saved, SAMPLE_VIRAL_INSPIRATIONS);
  });

  const [savedScripts, setSavedScripts] = useState<RecommendedAd[]>(() => {
    const saved = localStorage.getItem("advantage_saved_scripts");
    return safeJsonParse(saved, []);
  });

  const [notes, setNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "ai" | "saved" | "inspiration">("dashboard");
  const [optimizationResults, setOptimizationResults] = useState<{ [nicheId: string]: OptimizationResult }>({});

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showInspirationModal, setShowInspirationModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Inspiration Form State
  const [newInspiration, setNewInspiration] = useState({
    title: "",
    hook: "",
    body: "",
    cta: "",
    description: "",
    views: "",
    likes: ""
  });

  // Sync states to localStorage
  useEffect(() => {
    localStorage.setItem("advantage_variations", JSON.stringify(variations));
  }, [variations]);

  useEffect(() => {
    localStorage.setItem("advantage_logged_database", JSON.stringify(loggedDatabase));
  }, [loggedDatabase]);

  useEffect(() => {
    localStorage.setItem("advantage_viral_inspirations", JSON.stringify(viralInspirations));
  }, [viralInspirations]);

  useEffect(() => {
    localStorage.setItem("advantage_saved_scripts", JSON.stringify(savedScripts));
  }, [savedScripts]);

  useEffect(() => {
    const savedResults = localStorage.getItem("advantage_optimization_results");
    setOptimizationResults(safeJsonParse(savedResults, {}));
  }, []);

  // 2. COMPUTED STATES
  const activeNicheTemplate = NICHE_TEMPLATES.find(n => n.id === selectedNicheId) || NICHE_TEMPLATES[0];
  
  // Draft variations specifically for the selected niche
  const activeDraftVariations = variations.filter(v => v.niche === activeNicheTemplate.name);

  // Logged background database variations specifically for this niche
  const activeDatabaseVariations = loggedDatabase.filter(v => v.niche === activeNicheTemplate.name);

  // Combined variations for metrics calculation and AI input
  const combinedNicheVariations = [
    ...activeDraftVariations,
    ...activeDatabaseVariations
  ];

  // Selected niche viral inspirations
  const activeViralInspirations = viralInspirations.filter(ins => ins.niche === activeNicheTemplate.name);

  const activeNicheResult = optimizationResults[selectedNicheId] || null;

  // 3. HANDLERS
  const handleDeleteVariation = (id: string) => {
    setVariations((prev) => prev.filter(v => v.id !== id));
  };

  const handleAddDraftVariation = () => {
    // Generate a default draft so they can edit or delete it
    const newDraft: AdVariation = {
      id: "draft_" + Date.now(),
      name: "Custom Concept Draft #" + (activeDraftVariations.length + 1),
      niche: activeNicheTemplate.name,
      hook: "Add your eye-catching attention grabber hook line here.",
      body: "Describe your core product benefit, pain point solution, and direct value proposition.",
      cta: "Learn More",
      visualStyle: "Brief visual command: creator looking at camera",
      trend: "UGC Aesthetic Vlog",
      ctr: 1.5,
      conversions: 10,
      spend: 50,
      days: 5,
      impressions: 2500
    };
    setVariations((prev) => [newDraft, ...prev]);
  };

  const handleLogToDatabase = async (confirmedVariation: AdVariation) => {
    if (dbStatus === "connected") {
      try {
        const response = await fetch("/api/database", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(confirmedVariation)
        });
        
        if (response.ok) {
          const resData = await response.json();
          if (resData.status === "success" && resData.data) {
            setLoggedDatabase((prev) => [resData.data, ...prev]);
            return;
          }
        }
      } catch (err) {
        console.error("Error writing to Supabase, saving to local storage fallback:", err);
      }
    }
    
    // Fallback: update local state & trigger localStorage sync
    const fallbackVar = {
      ...confirmedVariation,
      id: "local_" + Date.now()
    };
    setLoggedDatabase((prev) => [fallbackVar, ...prev]);
  };

  const handleDeleteDatabaseVariation = async (id: string) => {
    if (dbStatus === "connected" && !id.startsWith("local_") && !id.startsWith("draft_")) {
      try {
        const response = await fetch(`/api/database/${id}`, {
          method: "DELETE"
        });
        if (response.ok) {
          setLoggedDatabase((prev) => prev.filter(v => v.id !== id));
        } else {
          console.error("Failed to delete from database");
        }
      } catch (err) {
        console.error("Error deleting from database:", err);
      }
    } else {
      // Local fallback delete
      setLoggedDatabase((prev) => prev.filter(v => v.id !== id));
    }
  };

  const handleAddViralInspiration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInspiration.title.trim() || !newInspiration.hook.trim() || !newInspiration.body.trim()) {
      alert("Please fill in Title, Hook, and Body copy.");
      return;
    }

    const inspirationRecord: ViralInspiration = {
      id: "viral_" + Date.now(),
      niche: activeNicheTemplate.name,
      title: newInspiration.title,
      hook: newInspiration.hook,
      body: newInspiration.body,
      cta: newInspiration.cta || "Shop Now",
      description: newInspiration.description || "Organic handheld presentation",
      views: newInspiration.views ? `${newInspiration.views} views` : undefined,
      likes: newInspiration.likes ? `${newInspiration.likes} likes` : undefined
    };

    setViralInspirations((prev) => [inspirationRecord, ...prev]);
    setShowInspirationModal(false);
    setNewInspiration({
      title: "",
      hook: "",
      body: "",
      cta: "",
      description: "",
      views: "",
      likes: ""
    });
  };

  const handleDeleteViralInspiration = (id: string) => {
    setViralInspirations((prev) => prev.filter(v => v.id !== id));
  };

  const handleRestoreDefaults = () => {
    if (confirm("Restore original reference template examples for this niche? This will reload preloaded variations.")) {
      const otherVariations = variations.filter(v => v.niche !== activeNicheTemplate.name);
      setVariations([...otherVariations, ...activeNicheTemplate.preloadedVariations]);
    }
  };

  const handleSaveScript = (script: RecommendedAd) => {
    setSavedScripts((prev) => {
      if (prev.some(s => s.name === script.name && s.hook === script.hook)) {
        return prev;
      }
      return [script, ...prev];
    });
  };

  const handleDeleteSavedScript = (idx: number) => {
    setSavedScripts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClearAllSaved = () => {
    if (confirm("Clear your entire saved creative scripts library?")) {
      setSavedScripts([]);
    }
  };

  const handleOptimize = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setActiveTab("ai");

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: activeNicheTemplate.name,
          variations: combinedNicheVariations,
          viralInspirations: activeViralInspirations,
          notes: notes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze variations.");
      }

      const data: OptimizationResult = await response.json();
      
      const updatedResults = {
        ...optimizationResults,
        [selectedNicheId]: data
      };
      
      setOptimizationResults(updatedResults);
      localStorage.setItem("advantage_optimization_results", JSON.stringify(updatedResults));
    } catch (err: any) {
      console.error("Optimization failed:", err);
      setErrorMsg(err.message || "An unexpected error occurred during creative generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  // High/low performing ads computing
  const sortedByCtr = [...activeDraftVariations].sort((a, b) => b.ctr - a.ctr);
  const bestPerformers = sortedByCtr.slice(0, 1);
  const worstPerformers = sortedByCtr.length > 1 ? sortedByCtr.slice(-1) : [];

  const loadingSteps = [
    "Auditing your logged performance databases...",
    "Querying local viral competitor references...",
    "Extracting conversion triggers with Gemini 3.5-Flash...",
    "Bypassing Meta ad learning phase constraints...",
    "Drafting customized, high-CTR hook variations...",
    "Formulating action-oriented, friction-free CTAs..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setGenerationStep((prev) => (prev + 1) % loadingSteps.length);
      }, 2500);
    } else {
      setGenerationStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      
      {/* 1. MINIMALIST TOP NAV BAR */}
      <header id="app-header" className="border-b border-zinc-900 bg-black/90 backdrop-blur-md px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-6 sticky top-0 z-40">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-950/20 border border-amber-900/40 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display text-zinc-100 tracking-tight">AdVantage AI</h1>
              <span className="text-[9px] font-mono bg-amber-950/30 text-amber-400 border border-amber-900/40 px-2.5 py-0.5 rounded-full font-bold">META PERFORMANCE LAB</span>
            </div>
          </div>
        </div>

        {/* Global Tab Navigation */}
        <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`px-5 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "dashboard" 
                ? "bg-amber-400 text-black font-semibold" 
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Dashboard
          </button>
          <button 
            onClick={() => {
              setActiveTab("ai");
              setErrorMsg(null);
            }}
            className={`px-5 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "ai" 
                ? "bg-amber-400 text-black font-semibold" 
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" /> AI Optimizer
          </button>
          <button 
            onClick={() => setActiveTab("saved")}
            className={`px-5 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "saved" 
                ? "bg-amber-400 text-black font-semibold" 
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" /> Bookmarks ({savedScripts.length})
          </button>
          <button 
            onClick={() => {
              setActiveTab("inspiration");
              setErrorMsg(null);
            }}
            className={`px-5 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "inspiration" 
                ? "bg-amber-400 text-black font-semibold" 
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> Inspiration Finder
          </button>
        </div>
      </header>

      {/* 2. MAIN GRID LAYOUT - SPACIOUS MARGINS */}
      <main className="flex-grow p-8 lg:p-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* SIDEBAR AREA (4 COLS) - ELEVATED MINIMAL SELECTOR & SETTINGS */}
        <section id="sidebar-configuration" className="lg:col-span-4 space-y-8">
          
          {/* Niche Dropdown Card */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-1.5 font-mono">
              <Layers className="w-4 h-4 text-amber-400" /> Choose Active Niche
            </h3>
            
            <div className="relative">
              <select
                value={selectedNicheId}
                onChange={(e) => {
                  setSelectedNicheId(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 font-semibold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 appearance-none cursor-pointer"
              >
                {NICHE_TEMPLATES.map((niche) => (
                  <option key={niche.id} value={niche.id}>
                    {niche.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <p className="text-xs text-zinc-400 mt-4 leading-relaxed font-sans">
              {activeNicheTemplate.description}
            </p>
          </div>

          {/* AI Creative Settings & Guidelines */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-2xl space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 font-mono">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Strategic Directions
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Optionally specify target audiences, promotional constraints, or voice tone to guide Gemini's recommendation process.
            </p>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on pain points of professional women over 30, emphasize organic nature, witty tone..."
              rows={4}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 resize-none leading-relaxed font-sans"
            />

            {/* Run AI Optimization Button */}
            <button
              onClick={handleOptimize}
              disabled={isGenerating || combinedNicheVariations.length === 0}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider shadow-lg disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 group cursor-pointer font-mono"
            >
              <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
              <span>{isGenerating ? "Analyzing Database..." : "Optimize Creatives"}</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>

          {/* INTERACTIVE SUPABASE CONNECTION KIT & SCHEMA GUIDE */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <DatabaseZap className="w-4.5 h-4.5 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100 font-mono">Supabase Sync Status</h3>
              </div>
              <div className="flex items-center">
                {dbStatus === "connected" && (
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-900/40 flex items-center gap-1">
                    ● CONNECTED
                  </span>
                )}
                {dbStatus === "loading" && (
                  <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 flex items-center gap-1 animate-pulse">
                    ● CONNECTING...
                  </span>
                )}
                {dbStatus === "table_missing" && (
                  <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-900/40 flex items-center gap-1">
                    ● SCHEMA MISSING
                  </span>
                )}
                {dbStatus === "unconfigured" && (
                  <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 flex items-center gap-1">
                    ● UNCONFIGURED
                  </span>
                )}
                {dbStatus === "error" && (
                  <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/20 px-2 py-0.5 rounded-full border border-red-900/40 flex items-center gap-1">
                    ● ERROR
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {dbStatus === "connected" 
                ? "Your live input boxes are connected directly to your persistent production Supabase database cluster!" 
                : "Configure your production database by creating the ad_variations table in your Supabase project."}
            </p>

            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase block font-semibold">1. Table Name</span>
                <code className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-amber-400 block mt-1 font-bold">
                  ad_variations
                </code>
              </div>

              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase block font-semibold mb-1">2. Database Schema Script</span>
                <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-[10px] font-mono text-zinc-400 max-h-32 overflow-y-auto whitespace-pre leading-relaxed select-all">
{`CREATE TABLE ad_variations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  niche text NOT NULL,
  hook text NOT NULL,
  body text NOT NULL,
  cta text NOT NULL,
  visual_style text NOT NULL,
  trend text NOT NULL,
  ctr numeric NOT NULL,
  conversions integer NOT NULL,
  spend numeric NOT NULL,
  days integer NOT NULL,
  impressions integer NOT NULL,
  headline text,
  reel_body_description text,
  reel_cta_description text,
  ad_type text,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- MIGRATE EXISTING TABLE IF IT ALREADY EXISTS:
ALTER TABLE ad_variations ADD COLUMN IF NOT EXISTS headline text;
ALTER TABLE ad_variations ADD COLUMN IF NOT EXISTS reel_body_description text;
ALTER TABLE ad_variations ADD COLUMN IF NOT EXISTS reel_cta_description text;
ALTER TABLE ad_variations ADD COLUMN IF NOT EXISTS ad_type text;`}
                </div>
                <button
                  onClick={() => {
                    const sqlText = `CREATE TABLE ad_variations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  niche text NOT NULL,
  hook text NOT NULL,
  body text NOT NULL,
  cta text NOT NULL,
  visual_style text NOT NULL,
  trend text NOT NULL,
  ctr numeric NOT NULL,
  conversions integer NOT NULL,
  spend numeric NOT NULL,
  days integer NOT NULL,
  impressions integer NOT NULL,
  headline text,
  reel_body_description text,
  reel_cta_description text,
  ad_type text,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- MIGRATE EXISTING TABLE IF IT ALREADY EXISTS:
ALTER TABLE ad_variations ADD COLUMN IF NOT EXISTS headline text;
ALTER TABLE ad_variations ADD COLUMN IF NOT EXISTS reel_body_description text;
ALTER TABLE ad_variations ADD COLUMN IF NOT EXISTS reel_cta_description text;
ALTER TABLE ad_variations ADD COLUMN IF NOT EXISTS ad_type text;`;
                    navigator.clipboard.writeText(sqlText);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="w-full mt-2 py-2 px-3 border border-zinc-800 hover:border-amber-400 rounded-xl text-center text-[10px] font-mono text-zinc-400 hover:text-amber-400 bg-zinc-900/40 cursor-pointer transition-colors"
                >
                  {copiedSql ? "✓ Copied to Clipboard!" : "Copy SQL Setup Script"}
                </button>
              </div>

              <div className="border-t border-zinc-900 pt-3">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block font-semibold mb-1">3. Status Message</span>
                <p className="text-[10px] text-zinc-400 leading-relaxed bg-zinc-900/20 border border-zinc-850 p-2.5 rounded-xl font-mono text-center">
                  {dbMessage || "Testing database cluster availability..."}
                </p>
              </div>
            </div>
          </div>

        </section>

        {/* WORKSPACE CORE AREA (8 COLS) - LUXURIOUS SPACING */}
        <section id="workspace-core" className="lg:col-span-8 space-y-8">
          
          {/* TAB 1: MINIMALIST DASHBOARD */}
          {activeTab === "dashboard" && (
            <div id="learning-bank-workspace" className="space-y-8 animate-fade-in">
              
              {/* ONBOARDING QUICK START GUIDELINE BANNER */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl relative overflow-hidden">
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Quick Start Protocol</span>
                  <h2 className="text-lg font-bold text-zinc-100 font-display">Feed Your Creative AI Engine</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    This workspace acts as your private performance laboratory. Feed it reference variations or described competitor inspirations to let the AI isolate viral copywriting formulas.
                  </p>
                </div>
                <div className="flex flex-col justify-center space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex-1 bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all font-mono"
                    >
                      <Database className="w-3.5 h-3.5" /> Log Creative DB
                    </button>
                    <button
                      onClick={handleAddDraftVariation}
                      className="flex-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-medium px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all font-mono"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-500" /> Add Draft
                    </button>
                  </div>
                  <button
                    onClick={() => setShowInspirationModal(true)}
                    className="w-full bg-zinc-900 border border-zinc-800 hover:border-amber-400/30 text-zinc-300 font-medium px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-zinc-900/80 transition-all"
                  >
                    <Tv className="w-3.5 h-3.5 text-amber-400" /> Describe Competitor Viral Reel
                  </button>
                </div>
              </div>

              {/* Minimalist Key Stats Aggregator */}
              <DashboardStats variations={combinedNicheVariations} />

              {/* Dynamic CTR trends comparison chart */}
              <div className="mb-8">
                <CtrTrendsChart variations={combinedNicheVariations} />
              </div>

              {/* TWO COLUMN MINIMALIST FEED LAYOUT */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                {/* COLUMN A: DRAFTS & EXAMPLES FEED */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5 font-display">
                        <Layers className="w-4 h-4 text-amber-400" /> Active Reference Examples
                      </h3>
                      <p className="text-[11px] text-zinc-400">Deletable draft workspace for tests</p>
                    </div>
                    {activeDraftVariations.length > 0 && (
                      <button 
                        onClick={handleRestoreDefaults}
                        className="text-[10px] font-mono text-zinc-400 hover:text-zinc-100 flex items-center gap-1 cursor-pointer"
                        title="Restore initial templates"
                      >
                        <RotateCcw className="w-3 h-3 text-zinc-400" /> Restore Examples
                      </button>
                    )}
                  </div>

                  {activeDraftVariations.length === 0 ? (
                    <div className="bg-zinc-950 border border-zinc-900 border-dashed rounded-2xl p-10 text-center text-zinc-500 text-xs space-y-2.5">
                      <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
                      <p>No active reference examples in this workspace.</p>
                      <button 
                        onClick={handleAddDraftVariation}
                        className="text-xs text-amber-400 underline font-mono cursor-pointer"
                      >
                        + Create Draft Concept
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* ONLY SHOW HIGHEST CTR AND LOWEST CTR FOR MINIMAL CLUTTER */}
                      <div className="space-y-6">
                        <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider block px-1 font-semibold">
                          📊 Performance Focus Feed
                        </span>
                        
                        {/* Best Performer */}
                        {bestPerformers.map(v => (
                          <div key={v.id} className="relative group">
                            <AdVariationCard 
                              variation={v} 
                              onDelete={handleDeleteVariation} 
                              badge={
                                <span className="text-[9px] font-mono bg-amber-950/20 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded-full font-bold">
                                  🏆 BEST CTR
                                </span>
                              }
                            />
                          </div>
                        ))}

                        {/* Worst Performer */}
                        {worstPerformers.map(v => (
                          <div key={v.id} className="relative group">
                            <AdVariationCard 
                              variation={v} 
                              onDelete={handleDeleteVariation} 
                              badge={
                                <span className="text-[9px] font-mono bg-red-950/20 text-red-400 border border-red-900/40 px-2 py-0.5 rounded-full font-bold">
                                  ⚠️ ATTENTION REQUIRED
                                </span>
                              }
                            />
                          </div>
                        ))}
                      </div>

                      {/* COMPACT COLLAPSIBLE TABLE FOR ALL OTHER VARIATIONS */}
                      {activeDraftVariations.length > 2 && (
                        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4 shadow-2xl">
                          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block font-semibold">
                            All Other Draft Concepts ({activeDraftVariations.length - 2})
                          </span>
                          <div className="divide-y divide-zinc-900 text-xs">
                            {activeDraftVariations.filter(v => !bestPerformers.includes(v) && !worstPerformers.includes(v)).map(v => (
                              <div key={v.id} className="py-3 flex justify-between items-center gap-3">
                                <div className="space-y-0.5 truncate">
                                  <span className="font-semibold text-zinc-100 block truncate">{v.name}</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">{v.trend}</span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="font-mono text-amber-400 font-bold bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/40">
                                    {v.ctr}% CTR
                                  </span>
                                  <button 
                                    onClick={() => handleDeleteVariation(v.id)}
                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {/* COLUMN B: VIRAL COMPETITOR INSPIRATIONS BOARD */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5 font-display">
                        <Tv className="w-4 h-4 text-amber-400" /> Viral Competitor Inspirations
                      </h3>
                      <p className="text-[11px] text-zinc-400">Describe successful ads of others to model</p>
                    </div>
                    <button
                      onClick={() => setShowInspirationModal(true)}
                      className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      + Add Viral Reel
                    </button>
                  </div>

                  {activeViralInspirations.length === 0 ? (
                    <div className="bg-zinc-950 border border-zinc-900 border-dashed rounded-2xl p-10 text-center text-zinc-500 text-xs space-y-3">
                      <Tv className="w-8 h-8 text-zinc-600 mx-auto" />
                      <p>No competitor viral reels described yet for this niche.</p>
                      <div className="flex flex-col items-center gap-2 pt-1">
                        <button 
                          onClick={() => setShowInspirationModal(true)}
                          className="text-xs text-amber-400 underline font-mono cursor-pointer"
                        >
                          + Describe Manual Reference
                        </button>
                        <span className="text-[10px] text-zinc-600 font-mono">or</span>
                        <button 
                          onClick={() => {
                            setActiveTab("inspiration");
                            setErrorMsg(null);
                          }}
                          className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg font-mono cursor-pointer transition-all flex items-center gap-1 shadow-lg shadow-blue-900/10"
                        >
                          🔍 Use Live Inspiration Finder
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {activeViralInspirations.map((ins) => (
                        <div 
                          key={ins.id}
                          className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 hover:border-amber-400/20 shadow-2xl flex flex-col justify-between"
                        >
                          <div className="flex justify-between items-start border-b border-zinc-900 pb-3 mb-3 gap-3">
                            <div>
                              <h4 className="text-xs font-bold text-zinc-100 leading-tight">{ins.title}</h4>
                              <p className="text-[9px] font-mono text-zinc-500 uppercase mt-1 tracking-wider">{activeNicheTemplate.name}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {(ins.views || ins.likes) && (
                                <span className="text-[9px] font-mono bg-amber-950/20 border border-amber-900/40 text-amber-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5 text-amber-400" /> {ins.views || "Viral"}
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteViralInspiration(ins.id)}
                                className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3 text-xs">
                            <div>
                              <span className="text-[9px] font-mono text-zinc-500 uppercase block font-semibold">The Viral Hook</span>
                              <p className="text-zinc-100 font-semibold italic mt-1 leading-relaxed">&ldquo;{ins.hook}&rdquo;</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-zinc-500 uppercase block font-semibold">The Core Staging & Description</span>
                              <p className="text-zinc-400 leading-relaxed mt-1 text-[11px]">{ins.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-zinc-900">
                              <div>
                                <span className="text-[8px] font-mono text-zinc-500 uppercase block font-semibold">Body Copy</span>
                                <p className="text-[10px] text-zinc-400 truncate leading-normal">{ins.body}</p>
                              </div>
                              <div>
                                <span className="text-[8px] font-mono text-zinc-500 uppercase block font-semibold font-bold">CTA Action</span>
                                <p className="text-[10px] text-amber-400 font-semibold mt-0.5">{ins.cta}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* DYNAMIC PERSISTENT CLOUD VAULT SECTION */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 font-display">
                      <Database className="text-amber-400 w-5 h-5" />
                      <span>Supabase Cloud Vault</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Persistent training entries stored in your active cloud relational database
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchLoggedVariations}
                      className="px-3.5 py-1.5 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-400 hover:text-amber-400 bg-zinc-900 hover:bg-zinc-850 transition-colors cursor-pointer flex items-center gap-1.5 shadow-none"
                    >
                      <RotateCcw className="w-3 h-3 animate-pulse" /> Sync Vault
                    </button>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg text-[10px] font-mono transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg"
                    >
                      <Plus className="w-3 h-3 text-black" /> Log Variation
                    </button>
                  </div>
                </div>

                {dbStatus === "loading" && (
                  <div className="text-center py-12 text-zinc-500 font-mono text-xs space-y-3">
                    <div className="w-6 h-6 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin mx-auto" />
                    <p>Contacting Supabase API cluster...</p>
                  </div>
                )}

                {dbStatus === "table_missing" && (
                  <div className="bg-amber-950/20 border border-amber-900/40 rounded-2xl p-6 text-center space-y-3.5">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wide font-mono">Table Schema Not Activated</h4>
                      <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                        To activate this cloud training set, you must run the SQL creation script inside your Supabase SQL Editor. Copy the script from the sidebar and execute it.
                      </p>
                    </div>
                  </div>
                )}

                {(dbStatus === "connected" || dbStatus === "unconfigured" || dbStatus === "error") && activeDatabaseVariations.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-xs space-y-2">
                    <Database className="w-7 h-7 text-zinc-600 mx-auto" />
                    <p className="font-semibold text-zinc-400">No persistent variations logged yet for the {activeNicheTemplate.name} niche.</p>
                    <p className="text-[11px] text-zinc-500">Click &ldquo;Log Variation&rdquo; or use the multi-step form to push a verified campaign to your training set.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-900 text-xs">
                    {activeDatabaseVariations.map((v) => (
                      <div key={v.id} className="py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-5 group/row hover:bg-zinc-900/40 px-3 -mx-3 rounded-xl transition-colors">
                        <div className="space-y-2 flex-grow max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-zinc-100 font-sans text-xs">{v.name}</span>
                            {v.adType && (
                              <span className="text-[9px] font-mono bg-amber-950/20 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded uppercase font-bold">
                                {v.adType}
                              </span>
                            )}
                            <span className="text-[9px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded">
                              {v.trend}
                            </span>
                            <span className="text-[9px] font-mono bg-amber-950/20 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded font-bold">
                              {v.ctr}% CTR
                            </span>
                            {v.id.startsWith("local_") && (
                              <span className="text-[9px] font-mono bg-amber-950/20 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded">
                                Local Cached Backup
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-zinc-400 leading-relaxed bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900 font-sans">
                            <div className="space-y-1.5">
                              {v.headline && (
                                <div>
                                  <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold mb-0.5">Headline:</span>
                                  <span className="font-semibold text-zinc-100">{v.headline}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold mb-0.5">Tested Hook:</span>
                                <span className="italic font-medium text-zinc-200">&ldquo;{v.hook}&rdquo;</span>
                              </div>
                              {v.reelBodyDescription && (
                                <div>
                                  <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold mb-0.5">Mid-Video Body Action:</span>
                                  <span className="text-zinc-300 block text-[11px] leading-relaxed">{v.reelBodyDescription}</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <div>
                                <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold mb-0.5">Visual Staging:</span>
                                <span className="text-zinc-300">{v.visualStyle || v.visual_style}</span>
                              </div>
                              {v.reelCtaDescription && (
                                <div>
                                  <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold mb-0.5">End-of-Video CTA Action:</span>
                                  <span className="text-zinc-300 block text-[11px] leading-relaxed">{v.reelCtaDescription}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold mb-0.5">Primary Caption / Copy:</span>
                                <p className="text-zinc-400 text-[11px] mt-0.5 line-clamp-2">{v.body}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 border-t md:border-t-0 border-zinc-900 pt-3 md:pt-0">
                          <div className="grid grid-cols-3 gap-3.5 text-right font-mono text-[10px] text-zinc-500">
                            <div>
                              <span className="text-[8px] uppercase tracking-wider text-zinc-500 block font-semibold">Spend</span>
                              <span className="text-zinc-100 font-bold">${v.spend}</span>
                            </div>
                            <div>
                              <span className="text-[8px] uppercase tracking-wider text-zinc-500 block font-semibold">Convs</span>
                              <span className="text-zinc-100 font-bold">{v.conversions}</span>
                            </div>
                            <div>
                              <span className="text-[8px] uppercase tracking-wider text-zinc-500 block font-semibold">Days</span>
                              <span className="text-zinc-100 font-bold">{v.days}d</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleDeleteDatabaseVariation(v.id)}
                            className="p-2 border border-zinc-800 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-900 hover:border-zinc-800 transition-all cursor-pointer shadow-none md:opacity-0 group-hover/row:opacity-100"
                            title="Delete from Database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: AI OPTIMIZER WORKSPACE */}
          {activeTab === "ai" && (
            <div id="ai-chamber-workspace" className="space-y-8">
              
              {/* Loading Tech Terminal */}
              {isGenerating && (
                <div id="terminal-loader" className="bg-zinc-950 border border-zinc-900 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
                  
                  <div className="relative mb-6">
                    <div className="w-14 h-14 rounded-full border-4 border-amber-400/10 border-t-amber-400 animate-spin flex items-center justify-center" />
                    <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                  </div>

                  <h3 className="text-base font-bold font-display text-zinc-100 mb-2">Analyzing Meta Performance Curves</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
                    Gemini is processing your combined {combinedNicheVariations.length} reference and logged database variations, along with {activeViralInspirations.length} competitor references.
                  </p>

                  {/* Tech terminal line logs */}
                  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl max-w-lg w-full text-left font-mono text-[11px] text-zinc-400 space-y-2.5 shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">❯</span>
                      <span>DB_INIT: linked performance_vault count = {activeDatabaseVariations.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">❯</span>
                      <span>COMPETITOR_VAULT: viral_inspirations count = {activeViralInspirations.length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400 font-semibold">
                      <span className="text-amber-400 animate-pulse">●</span>
                      <span>{loadingSteps[generationStep]}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error boundary display */}
              {errorMsg && !isGenerating && (
                <div id="error-alert" className="bg-red-950/20 border border-red-900/40 text-red-200 p-6 rounded-2xl space-y-3 shadow-2xl">
                  <h3 className="text-base font-bold font-display">Generation Interrupted</h3>
                  <p className="text-xs leading-relaxed">{errorMsg}</p>
                  <button 
                    onClick={handleOptimize}
                    className="text-xs font-mono font-bold text-red-200 bg-red-900/30 border border-red-800 px-4 py-2 rounded-lg hover:bg-red-900 transition-all cursor-pointer"
                  >
                    Retry Creative Synthesis
                  </button>
                </div>
              )}

              {/* No analysis empty state */}
              {!activeNicheResult && !isGenerating && !errorMsg && (
                <div id="ai-chamber-empty" className="bg-zinc-950 border border-zinc-900 rounded-3xl p-12 text-center max-w-xl mx-auto my-8 space-y-6 shadow-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-amber-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-lg font-bold font-display text-zinc-100">AI Creative Chamber Ready</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      We will analyze your {combinedNicheVariations.length} total variations (reference examples and locked database entries) and {activeViralInspirations.length} competitor reels to engineer high-CTR ad concepts.
                    </p>
                  </div>
                  <button
                    onClick={handleOptimize}
                    className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider font-mono hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    Run Strategic Optimization
                  </button>
                </div>
              )}

              {/* AI Recommendations Output */}
              {activeNicheResult && !isGenerating && !errorMsg && (
                <AICreativeRecommendations 
                  data={activeNicheResult}
                  onSaveScript={handleSaveScript}
                  savedScripts={savedScripts}
                  nicheName={activeNicheTemplate.name}
                />
              )}
            </div>
          )}

          {/* TAB 3: BOOKMARKS WORKSPACE */}
          {activeTab === "saved" && (
            <div id="bookmarks-workspace" className="animate-fade-in">
              <SavedScripts 
                scripts={savedScripts}
                onDeleteScript={handleDeleteSavedScript}
                onClearAll={handleClearAllSaved}
              />
            </div>
          )}

          {/* TAB 4: REELS & TIKTOK INSPIRATION FINDER */}
          {activeTab === "inspiration" && (
            <div id="reels-inspiration-workspace" className="animate-fade-in">
              <ReelsInspirationFinder licenseKey={licenseKey} />
            </div>
          )}

        </section>
      </main>

      {/* 3. INSPIRATION MODAL */}
      {showInspirationModal && (
        <div id="inspiration-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center space-x-2.5">
                <Tv className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Describe Viral Reel / Ad</h3>
                  <p className="text-[10px] text-zinc-400">Linked to: <span className="text-amber-400 font-mono font-semibold">{activeNicheTemplate.name}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setShowInspirationModal(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddViralInspiration} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1 font-semibold">Inspiration Title *</label>
                <input 
                  type="text"
                  placeholder="e.g. Creator Glazed Donut Face Hack"
                  value={newInspiration.title}
                  onChange={(e) => setNewInspiration(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1 font-semibold">Views Count (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. 1.2M"
                    value={newInspiration.views}
                    onChange={(e) => setNewInspiration(prev => ({ ...prev, views: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1 font-semibold">Likes Count (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. 85k"
                    value={newInspiration.likes}
                    onChange={(e) => setNewInspiration(prev => ({ ...prev, likes: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1 font-semibold">The Viral Hook Line *</label>
                <input 
                  type="text"
                  placeholder="e.g. If you wash your face with hot water, stop..."
                  value={newInspiration.hook}
                  onChange={(e) => setNewInspiration(prev => ({ ...prev, hook: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1 font-semibold">Body Copy Message *</label>
                <textarea 
                  placeholder="Describe what the speaker said or the caption text..."
                  value={newInspiration.body}
                  onChange={(e) => setNewInspiration(prev => ({ ...prev, body: e.target.value }))}
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 resize-none font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1 font-semibold">Concept / Video Staging Description</label>
                <textarea 
                  placeholder="e.g. Quick cuts of creator splashing cold water, zooming onto the frosted serum glass bottle..."
                  value={newInspiration.description}
                  onChange={(e) => setNewInspiration(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 resize-none font-sans"
                />
              </div>

              <div className="border-t border-zinc-900 pt-4 flex justify-end space-x-2 bg-zinc-900/40 -mx-6 -mb-6 p-6">
                <button 
                  type="button" 
                  onClick={() => setShowInspirationModal(false)}
                  className="px-4 py-2.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl transition-all cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2.5 text-xs bg-amber-400 text-black font-bold rounded-xl shadow-lg hover:bg-amber-300 transition-all cursor-pointer font-mono"
                >
                  Save Inspiration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER METADATA - CLEAN & METADATA-FREE */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 p-6 text-center text-xs text-zinc-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>AdVantage Performance Analytics & Copywriting Engine. Stored securely on simulated Supabase Database clusters.</p>
        </div>
      </footer>

      {/* MULTI-STEP CREATIVE LOGGING DATABASE MODAL */}
      {showAddModal && (
        <AddVariationModal 
          onClose={() => setShowAddModal(false)}
          onLogToDatabase={handleLogToDatabase}
          activeNiche={activeNicheTemplate.name}
        />
      )}
    </div>
  );
}
