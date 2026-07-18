import React, { useState, useEffect } from "react";
import { NICHE_TEMPLATES } from "./data";
import { AuthManager } from "./components/AuthManager";
import { AdVariation, OptimizationResult, RecommendedAd, ViralInspiration } from "./types";
import DashboardStats from "./components/DashboardStats";
import AdVariationCard from "./components/AdVariationCard";
import SavedScripts from "./components/SavedScripts";
import OnboardingWizard from "./components/OnboardingWizard";
import TrainingSuite from "./components/TrainingSuite";
import AIScriptGenerator from "./components/AIScriptGenerator";
import CtrTrendsChart from "./components/CtrTrendsChart";
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
  ChevronDown,
  Trash2,
  Check,
  AlertCircle,
  Eye,
  X,
  DatabaseZap,
  HelpCircle,
  BookOpen,
  Settings,
  PlusCircle,
  MessageSquare,
  Play,
  Heart,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  ShieldAlert
} from "lucide-react";

// Pre-populated Sample Viral Inspirations for the database
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
  }
];

interface Product {
  id: string;
  name: string;
  description: string;
}

interface BusinessProfile {
  niche: string;
  products: Product[];
}

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
  // 0. AUTHENTICATION GATING STATE
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("cl_authenticated") === "true";
  });
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem("cl_user_obj");
    return saved ? safeJsonParse(saved, null) : null;
  });
  const [licenseInfo, setLicenseInfo] = useState<any>(() => {
    const saved = localStorage.getItem("cl_license_obj");
    return saved ? safeJsonParse(saved, null) : null;
  });

  // 1. BUSINESS PROFILE STATE
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [editNiche, setEditNiche] = useState("");
  const [editProducts, setEditProducts] = useState<Product[]>([]);
  const [editProdName, setEditProdName] = useState("");
  const [editProdDesc, setEditProdDesc] = useState("");

  // Load business profile on license or authentication changes
  useEffect(() => {
    if (licenseInfo?.key) {
      const savedProfile = localStorage.getItem(`cl_profile_${licenseInfo.key}`);
      if (savedProfile) {
        try {
          setBusinessProfile(JSON.parse(savedProfile));
        } catch (e) {
          console.error("Error reading business profile", e);
        }
      } else {
        setBusinessProfile(null);
      }
    } else {
      setBusinessProfile(null);
    }
  }, [licenseInfo]);

  // Handle Onboarding Completion
  const handleOnboardingComplete = (niche: string, products: Product[]) => {
    if (licenseInfo?.key) {
      const profile: BusinessProfile = { niche, products };
      localStorage.setItem(`cl_profile_${licenseInfo.key}`, JSON.stringify(profile));
      setBusinessProfile(profile);
      setNotes(`Target Niche: ${niche}\nProducts:\n${products.map(p => `- ${p.name}: ${p.description}`).join("\n")}`);
    }
  };

  // 2. STABILITY DATABASE STATES
  const [loggedDatabase, setLoggedDatabase] = useState<AdVariation[]>([]);
  const [dbStatus, setDbStatus] = useState<"loading" | "connected" | "unconfigured" | "table_missing" | "error">("loading");

  // Fetch logged variations on mount
  const fetchLoggedVariations = async () => {
    try {
      setDbStatus("loading");
      const res = await fetch("/api/database");
      const result = await res.json();
      
      if (result.status === "success") {
        setLoggedDatabase(result.data);
        setDbStatus("connected");
      } else {
        setDbStatus("unconfigured");
        const saved = localStorage.getItem("advantage_logged_database");
        setLoggedDatabase(safeJsonParse(saved, []));
      }
    } catch (err: any) {
      console.error("Failed to load cloud variations:", err);
      setDbStatus("error");
      const saved = localStorage.getItem("advantage_logged_database");
      setLoggedDatabase(safeJsonParse(saved, []));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLoggedVariations();
    }
  }, [isAuthenticated]);

  // Viral competitor inspirations state
  const [viralInspirations, setViralInspirations] = useState<ViralInspiration[]>(() => {
    const saved = localStorage.getItem("advantage_viral_inspirations");
    return safeJsonParse(saved, SAMPLE_VIRAL_INSPIRATIONS);
  });

  const [savedScripts, setSavedScripts] = useState<RecommendedAd[]>(() => {
    const saved = localStorage.getItem("advantage_saved_scripts");
    return safeJsonParse(saved, []);
  });

  const [notes, setNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "training" | "generator" | "bookmarks">("dashboard");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state to local storage fallbacks
  useEffect(() => {
    localStorage.setItem("advantage_logged_database", JSON.stringify(loggedDatabase));
  }, [loggedDatabase]);

  useEffect(() => {
    localStorage.setItem("advantage_viral_inspirations", JSON.stringify(viralInspirations));
  }, [viralInspirations]);

  useEffect(() => {
    localStorage.setItem("advantage_saved_scripts", JSON.stringify(savedScripts));
  }, [savedScripts]);

  // 3. HANDLERS FOR TRAINING SUITE ACTIONS
  const handleAddLoggedAd = async (newAd: AdVariation) => {
    // Append license key to payload if syncing with database
    const licenseKey = licenseInfo?.key || "";
    const payloadAd = {
      ...newAd,
      headline: newAd.headline || licenseKey // optionally tag license key or other custom attributes
    };

    if (dbStatus === "connected") {
      try {
        const response = await fetch("/api/database", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadAd)
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.status === "success" && resData.data) {
            setLoggedDatabase((prev) => [resData.data, ...prev]);
            return;
          }
        }
      } catch (err) {
        console.error("Error writing to cloud database, saving local fallback:", err);
      }
    }
    // Local state fallback
    setLoggedDatabase((prev) => [payloadAd, ...prev]);
  };

  const handleDeleteLoggedAd = async (id: string) => {
    if (dbStatus === "connected" && !id.startsWith("own_ad_") && !id.startsWith("local_")) {
      try {
        const response = await fetch(`/api/database/${id}`, {
          method: "DELETE"
        });
        if (response.ok) {
          setLoggedDatabase((prev) => prev.filter(v => v.id !== id));
        } else {
          console.error("Failed to delete from database");
          setLoggedDatabase((prev) => prev.filter(v => v.id !== id));
        }
      } catch (err) {
        console.error("Error deleting database entry:", err);
        setLoggedDatabase((prev) => prev.filter(v => v.id !== id));
      }
    } else {
      setLoggedDatabase((prev) => prev.filter(v => v.id !== id));
    }
  };

  const handleAddViralInspiration = (newIns: ViralInspiration) => {
    setViralInspirations((prev) => [newIns, ...prev]);
  };

  const handleDeleteViralInspiration = (id: string) => {
    setViralInspirations((prev) => prev.filter(v => v.id !== id));
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
    if (confirm("Clear your entire bookmarked scripts library?")) {
      setSavedScripts([]);
    }
  };

  // Profile Editor Modal Actions
  const openEditProfile = () => {
    if (businessProfile) {
      setEditNiche(businessProfile.niche);
      setEditProducts([...businessProfile.products]);
      setShowEditProfileModal(true);
    }
  };

  const handleAddEditProduct = () => {
    if (!editProdName.trim() || !editProdDesc.trim()) return;
    if (editProducts.length >= 10) {
      alert("Capped at 10 products per workspace.");
      return;
    }
    const newP: Product = {
      id: "prod_" + Date.now(),
      name: editProdName.trim(),
      description: editProdDesc.trim()
    };
    setEditProducts(prev => [...prev, newP]);
    setEditProdName("");
    setEditProdDesc("");
  };

  const handleRemoveEditProduct = (id: string) => {
    setEditProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveProfileEdit = () => {
    if (!editNiche.trim() || editProducts.length === 0) {
      alert("Please specify a niche and add at least one product description.");
      return;
    }
    const updated: BusinessProfile = {
      niche: editNiche.trim(),
      products: editProducts
    };
    localStorage.setItem(`cl_profile_${licenseInfo?.key}`, JSON.stringify(updated));
    setBusinessProfile(updated);
    setShowEditProfileModal(false);
  };

  // Gating onboarding step
  if (!isAuthenticated) {
    return (
      <AuthManager 
        onVerified={(user, license) => {
          setIsAuthenticated(true);
          setCurrentUser(user);
          setLicenseInfo(license);
          localStorage.setItem("cl_authenticated", "true");
          localStorage.setItem("cl_user_obj", JSON.stringify(user));
          localStorage.setItem("cl_license_obj", JSON.stringify(license));
        }}
      />
    );
  }

  if (isAuthenticated && !businessProfile) {
    return (
      <OnboardingWizard 
        licenseKey={licenseInfo?.key || ""} 
        onComplete={handleOnboardingComplete} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      
      {/* 1. TOP NAV BAR */}
      <header id="app-header" className="border-b border-zinc-900 bg-black/90 backdrop-blur-md px-6 py-5 flex flex-col xl:flex-row justify-between items-center gap-6 sticky top-0 z-40">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display text-zinc-100 tracking-tight">Creatives Lab</h1>
              <span className="text-[9px] font-mono bg-amber-950/30 text-amber-400 border border-amber-900/40 px-2.5 py-0.5 rounded-full font-bold">WORKSPACE SUITE</span>
            </div>
          </div>
        </div>

        {/* Global Tabs Navigation */}
        <div className="flex items-center bg-zinc-900/50 p-1 rounded-2xl border border-zinc-850 flex-wrap justify-center gap-1">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "dashboard" 
                ? "bg-amber-400 text-black font-semibold" 
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Workspace Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("training")}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "training" 
                ? "bg-amber-400 text-black font-semibold" 
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> AI Training Suite
          </button>
          <button 
            onClick={() => setActiveTab("generator")}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "generator" 
                ? "bg-amber-400 text-black font-semibold" 
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" /> AI Script Generator
          </button>
          <button 
            onClick={() => setActiveTab("bookmarks")}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "bookmarks" 
                ? "bg-amber-400 text-black font-semibold" 
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" /> Bookmarks ({savedScripts.length})
          </button>
        </div>

        {/* Sign Out Trigger */}
        <div className="flex items-center gap-3">
          {licenseInfo && (
            <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-1.5 text-xs">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-zinc-300 font-mono font-semibold">Active Key</span>
                <span className="text-[8px] text-emerald-400 font-mono font-bold tracking-wider uppercase">Verified</span>
              </div>
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setCurrentUser(null);
                  setLicenseInfo(null);
                  setBusinessProfile(null);
                  localStorage.removeItem("cl_authenticated");
                  localStorage.removeItem("cl_user_obj");
                  localStorage.removeItem("cl_license_obj");
                }}
                className="text-[9px] font-mono font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-800 cursor-pointer transition-all"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. MAIN GRID LAYOUT */}
      <main className="flex-grow p-6 md:p-8 lg:p-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* SIDEBAR AREA (4 COLS) - ACTIVE PROFILE DETAILS */}
        <section id="sidebar-configuration" className="lg:col-span-4 space-y-8">
          
          {/* Business Profile Details Card */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest">Active Workspace</span>
                <h3 className="text-sm font-bold text-zinc-200">Business Profile</h3>
              </div>
              <button
                onClick={openEditProfile}
                className="p-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-100 rounded-xl border border-zinc-800 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold"
              >
                <Settings className="w-3.5 h-3.5 text-zinc-400" /> Edit
              </button>
            </div>

            <div className="space-y-4">
              {/* Niche display */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Market Niche Category</span>
                <span className="text-xs font-semibold text-zinc-200 bg-zinc-900/60 border border-zinc-850 px-3 py-2 rounded-xl block truncate">
                  {businessProfile?.niche}
                </span>
              </div>

              {/* Product list display */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Registered Products ({businessProfile?.products.length})</span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {businessProfile?.products.map((p, idx) => (
                    <div key={p.id} className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-extrabold text-amber-400 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900/30">P{idx + 1}</span>
                        <h4 className="text-xs font-bold text-zinc-300 truncate">{p.name}</h4>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* CLOUD CONNECTION STATUS CONTAINER */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <DatabaseZap className="w-4.5 h-4.5 text-amber-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-100 font-mono">Workspace Database</h3>
              </div>
              <div>
                {dbStatus === "connected" ? (
                  <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/20 px-2.5 py-0.5 rounded-full border border-amber-900/40">
                    ● CLOUD ACTIVE
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-bold text-zinc-500 bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-850">
                    ● LOCAL SANDBOX
                  </span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {dbStatus === "connected" 
                ? "Your logged variations and metrics are synchronized in real-time with your private cloud database!" 
                : "No cloud credentials detected. Your workspace variations are saved safely in local sandbox cache."}
            </p>
          </div>

          {/* DANGEROUS/DELETE SECTION */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Account Maintenance</span>
            <div className="p-4 bg-red-950/10 border border-red-950/40 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-bold">GDPR & Data Compliance</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Clicking below initiates complete data deletion from our servers and resets your workspace license key.
              </p>
              
              <a
                href="https://wa.link/1mq5dr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-red-950/40 hover:bg-red-900/30 text-red-400 hover:text-red-300 font-bold text-[10px] font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 border border-red-900/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Data & Reset</span>
              </a>
            </div>
          </div>

        </section>

        {/* 3. WORKING AREA (8 COLS) */}
        <section id="working-canvas" className="lg:col-span-8 space-y-8">
          
          {/* TAB 1: WORKSPACE DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black font-display text-zinc-100 tracking-tight flex items-center gap-2">
                  <LayoutDashboard className="w-6 h-6 text-amber-400" /> Workspace Dashboard
                </h2>
                <p className="text-xs text-zinc-400 mt-1">Real-time performance summaries crunched exclusively from your self-logged ad creatives.</p>
              </div>

              {/* Dynamic Empty State if no ads logged */}
              {loggedDatabase.length === 0 ? (
                <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-5">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
                    <Database className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-200">No self-logged creatives yet</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                      Your historical performance summaries and CTR charts will appear here once you log your first ad creative in the AI Training Suite (Option 2).
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("training")}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider font-mono rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                  >
                    <span>Log My First Ad Creative</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Performance stats calculated STRICTLY from user logged database */}
                  <DashboardStats variations={loggedDatabase} />

                  {/* CTR Trends Chart calculated STRICTLY from user logged database */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-2xl">
                    <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-500 mb-5 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" /> Historical CTR Curves (Last 30 Days)
                    </h3>
                    <div className="h-64">
                      <CtrTrendsChart variations={loggedDatabase} />
                    </div>
                  </div>

                  {/* Logged creative table / card grid */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                      <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                        <Database className="w-4 h-4 text-amber-400" /> My Logged Ad Database ({loggedDatabase.length})
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {loggedDatabase.map((v) => (
                        <AdVariationCard 
                          key={v.id}
                          variation={v}
                          onDelete={(id) => { handleDeleteLoggedAd(id); }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* COMPACT & COLLAPSABLE PRELOADED BENCH REFERENCE */}
              <div className="pt-4">
                <details className="group bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden transition-all duration-300">
                  <summary className="flex justify-between items-center px-6 py-5 cursor-pointer select-none font-bold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900/30 transition-all font-display text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4.5 h-4.5 text-amber-400" />
                      <span>View Preloaded Niche Inspirations & Templates</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono group-open:rotate-180 transition-transform">▼ Expand</span>
                  </summary>
                  
                  <div className="px-6 pb-6 pt-2 border-t border-zinc-900/60 bg-zinc-950/50 space-y-4 text-xs">
                    <p className="text-zinc-400 leading-relaxed leading-normal">
                      These are global reference templates compiled for different industries. They serve as strategic blueprints and do not impact your private dashboard statistics or performance calculations.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {NICHE_TEMPLATES.flatMap(t => t.preloadedVariations).slice(0, 4).map((v, i) => (
                        <div key={v.id || i} className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850 space-y-3 relative">
                          <span className="absolute top-3 right-3 text-[9px] font-mono text-zinc-500 font-bold uppercase bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
                            Template {i + 1}
                          </span>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-amber-400 font-bold block">{v.niche}</span>
                            <h4 className="font-bold text-zinc-200">{v.name}</h4>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase font-semibold block">Hook Line</span>
                            <p className="text-xs text-zinc-300 font-sans italic">&ldquo;{v.hook}&rdquo;</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </div>

            </div>
          )}

          {/* TAB 2: AI TRAINING SUITE */}
          {activeTab === "training" && (
            <div className="animate-fade-in">
              <TrainingSuite 
                activeNiche={businessProfile.niche}
                loggedDatabase={loggedDatabase}
                onAddLoggedAd={handleAddLoggedAd}
                viralInspirations={viralInspirations}
                onAddViralInspiration={handleAddViralInspiration}
              />
            </div>
          )}

          {/* TAB 3: AI SCRIPT GENERATOR */}
          {activeTab === "generator" && (
            <div className="animate-fade-in">
              <AIScriptGenerator 
                niche={businessProfile.niche}
                products={businessProfile.products}
                loggedDatabase={loggedDatabase}
                viralInspirations={viralInspirations}
                onSaveScript={handleSaveScript}
                savedScripts={savedScripts}
              />
            </div>
          )}

          {/* TAB 4: BOOKMARKED ASSETS */}
          {activeTab === "bookmarks" && (
            <div className="animate-fade-in">
              <SavedScripts 
                scripts={savedScripts}
                onDeleteScript={handleDeleteSavedScript}
                onClearAll={handleClearAllSaved}
              />
            </div>
          )}

        </section>

      </main>

      {/* 4. EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 shadow-3xl space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
            
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-zinc-100 font-display">Edit Business Workspace</h3>
              </div>
              <button 
                onClick={() => setShowEditProfileModal(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Edit Niche */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Market Niche Category</label>
                <input
                  type="text"
                  required
                  value={editNiche}
                  onChange={(e) => setEditNiche(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Add Product block */}
              <div className="space-y-3 pt-3 border-t border-zinc-900">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Add Product ({editProducts.length}/10)</span>
                
                <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-xl space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Skin Barrier Cream"
                      value={editProdName}
                      onChange={(e) => setEditProdName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Product Description</label>
                    <textarea
                      rows={2}
                      placeholder="Product features and direct benefits..."
                      value={editProdDesc}
                      onChange={(e) => setEditProdDesc(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 resize-none leading-relaxed"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEditProduct}
                    className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-bold text-[9px] font-mono uppercase rounded-lg transition-all flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-amber-400" /> Add
                  </button>
                </div>
              </div>

              {/* Review Products */}
              {editProducts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Product Registry</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                    {editProducts.map((p, i) => (
                      <div key={p.id} className="flex justify-between items-center bg-zinc-900/30 p-2.5 rounded-lg text-xs">
                        <div className="pr-4 truncate">
                          <span className="text-zinc-200 font-bold block truncate">#{i + 1}. {p.name}</span>
                          <span className="text-zinc-400 text-[10px] block truncate">{p.description}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditProduct(p.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-mono font-semibold px-4 py-2.5 rounded-xl text-xs cursor-pointer border border-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfileEdit}
                className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. FOOTER */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950/20 py-6 text-center text-[10px] font-mono text-zinc-600">
        <p>© 2026 Creatives Lab. Performance Audits Engineered Silently.</p>
      </footer>

    </div>
  );
}
