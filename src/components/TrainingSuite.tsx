import React, { useState } from "react";
import { 
  Database, 
  Tv, 
  PlusCircle, 
  HelpCircle, 
  Search, 
  Sparkles, 
  Heart, 
  MessageSquare, 
  Play, 
  Info, 
  ArrowRight,
  Plus,
  TrendingUp,
  Check,
  Award,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import ReelsInspirationFinder from "./ReelsInspirationFinder";
import { AdVariation, ViralInspiration } from "../types";

interface TrainingSuiteProps {
  activeNiche: string;
  loggedDatabase: AdVariation[];
  onAddLoggedAd: (ad: AdVariation) => void;
  viralInspirations: ViralInspiration[];
  onAddViralInspiration: (ins: ViralInspiration) => void;
}

export default function TrainingSuite({ 
  activeNiche, 
  loggedDatabase, 
  onAddLoggedAd, 
  viralInspirations, 
  onAddViralInspiration 
}: TrainingSuiteProps) {
  const [activeTab, setActiveTab] = useState<"database" | "own_ads" | "competitors" | "guidance">("database");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State for Option 2: Log Own Ads
  const [ownAdForm, setOwnAdForm] = useState({
    name: "",
    hook: "",
    body: "",
    cta: "Shop Now",
    visualStyle: "",
    trend: "UGC Relatability Vlog",
    ctr: "2.80",
    conversions: "24",
    spend: "150",
    days: "14",
    impressions: "8500",
    views: "12000",
    likes: "450",
    comments: "82",
    headline: "",
    reelBodyDescription: "",
    reelCtaDescription: "",
    adType: "video",
    isWinner: "winner" // "winner" | "loser"
  });

  // Form State for Option 3: Describe Competitors
  const [competitorForm, setCompetitorForm] = useState({
    title: "",
    username: "",
    hook: "",
    body: "",
    cta: "Shop Now",
    description: "",
    views: "150000",
    likes: "8500",
    shares: "2400"
  });

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleOwnAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownAdForm.name || !ownAdForm.hook || !ownAdForm.body) {
      alert("Please fill in the Creative Name, Hook script, and Primary Caption.");
      return;
    }

    const calculatedCtr = ownAdForm.ctr ? parseFloat(ownAdForm.ctr) : 2.50;
    const spendVal = ownAdForm.spend ? parseFloat(ownAdForm.spend) : 100;
    const conversionsVal = ownAdForm.conversions ? parseInt(ownAdForm.conversions) : 10;
    const daysVal = ownAdForm.days ? parseInt(ownAdForm.days) : 14;
    const impressionsVal = ownAdForm.impressions ? parseInt(ownAdForm.impressions) : 5000;

    // Use views/likes/comments directly if provided, or fallback to impressions-based estimation
    const viewsVal = parseInt(ownAdForm.views) || impressionsVal;
    const likesVal = parseInt(ownAdForm.likes) || Math.round(viewsVal * 0.05);
    const commentsVal = parseInt(ownAdForm.comments) || Math.round(likesVal * 0.1);

    const newAd: AdVariation = {
      id: "own_ad_" + Date.now(),
      name: ownAdForm.name,
      niche: activeNiche,
      hook: ownAdForm.hook,
      body: ownAdForm.body,
      cta: ownAdForm.cta,
      visualStyle: ownAdForm.visualStyle || "Handheld UGC staging",
      trend: ownAdForm.trend,
      ctr: calculatedCtr,
      conversions: conversionsVal,
      spend: spendVal,
      days: daysVal,
      impressions: impressionsVal,
      headline: ownAdForm.headline || ownAdForm.name,
      reelBodyDescription: ownAdForm.reelBodyDescription || ownAdForm.body,
      reelCtaDescription: ownAdForm.reelCtaDescription || `Points at CTA overlay: ${ownAdForm.cta}`,
      adType: ownAdForm.adType,
    };

    onAddLoggedAd(newAd);
    showToast("✓ Successfully logged your own ad creative metrics!");
    
    // Reset form
    setOwnAdForm({
      name: "",
      hook: "",
      body: "",
      cta: "Shop Now",
      visualStyle: "",
      trend: "UGC Relatability Vlog",
      ctr: "2.80",
      conversions: "24",
      spend: "150",
      days: "14",
      impressions: "8500",
      views: "12000",
      likes: "450",
      comments: "82",
      headline: "",
      reelBodyDescription: "",
      reelCtaDescription: "",
      adType: "video",
      isWinner: "winner"
    });
  };

  const handleCompetitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorForm.title || !competitorForm.hook || !competitorForm.body) {
      alert("Please fill in the Reel Title, Hook script, and Caption.");
      return;
    }

    const mappedViews = parseInt(competitorForm.views) || 0;
    const mappedLikes = parseInt(competitorForm.likes) || 0;
    const mappedShares = parseInt(competitorForm.shares) || 0;

    const formattedViews = mappedViews >= 1000000 
      ? `${(mappedViews / 1000000).toFixed(1)}M views` 
      : mappedViews >= 1000 
      ? `${(mappedViews / 1000).toFixed(1)}K views` 
      : `${mappedViews} views`;

    const formattedLikes = mappedLikes >= 1000000 
      ? `${(mappedLikes / 1000000).toFixed(1)}M likes` 
      : mappedLikes >= 1000 
      ? `${(mappedLikes / 1000).toFixed(1)}K likes` 
      : `${mappedLikes} likes`;

    const newIns: ViralInspiration = {
      id: "comp_" + Date.now(),
      niche: activeNiche,
      title: competitorForm.title,
      hook: competitorForm.hook,
      body: competitorForm.body,
      cta: competitorForm.cta || "Shop Now",
      description: competitorForm.description || "Competitor UGC video description",
      views: formattedViews,
      likes: formattedLikes
    };

    onAddViralInspiration(newIns);
    showToast("✓ Competitor reel inspiration added successfully!");

    setCompetitorForm({
      title: "",
      username: "",
      hook: "",
      body: "",
      cta: "Shop Now",
      description: "",
      views: "150000",
      likes: "8500",
      shares: "2400"
    });
  };

  // Generate tailored search keywords based on their active niche
  const getTailoredKeywords = () => {
    const cleanNiche = activeNiche.replace(/DTC|B2B|SaaS|E-Commerce/gi, "").trim();
    return [
      `${cleanNiche} ugc hook`,
      `${cleanNiche} viral reel`,
      `how to solve ${cleanNiche.toLowerCase()} problem`,
      `trending ${cleanNiche.toLowerCase()} ad`,
      `${cleanNiche} testimonial video`
    ];
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-2xl space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-900">
        <div>
          <h2 className="text-lg font-bold font-display text-zinc-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> AI Training Control Suite
          </h2>
          <p className="text-xs text-zinc-400">Feed performance signals and viral triggers to tune your writing engine.</p>
        </div>
        
        {/* Dynamic mini-stat */}
        <div className="flex gap-4 text-xs font-mono bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
          <div>
            <span className="text-zinc-500">My Ads Logged: </span>
            <span className="text-amber-400 font-bold">{loggedDatabase.length}</span>
          </div>
          <div className="border-l border-zinc-800 pl-4">
            <span className="text-zinc-500">Competitors Logged: </span>
            <span className="text-amber-400 font-bold">{viralInspirations.length}</span>
          </div>
        </div>
      </div>

      {/* TRAINING OPTIONS TABS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-900">
        <button
          onClick={() => setActiveTab("database")}
          className={`px-3 py-2.5 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "database"
              ? "bg-amber-400 text-black shadow-md"
              : "text-zinc-400 hover:text-zinc-100"
          }`}
        >
          <Search className="w-3.5 h-3.5" /> 1. Search DB
        </button>
        <button
          onClick={() => setActiveTab("own_ads")}
          className={`px-3 py-2.5 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "own_ads"
              ? "bg-amber-400 text-black shadow-md"
              : "text-zinc-400 hover:text-zinc-100"
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" /> 2. Log My Ads
        </button>
        <button
          onClick={() => setActiveTab("competitors")}
          className={`px-3 py-2.5 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "competitors"
              ? "bg-amber-400 text-black shadow-md"
              : "text-zinc-400 hover:text-zinc-100"
          }`}
        >
          <Tv className="w-3.5 h-3.5" /> 3. Describe Reels
        </button>
        <button
          onClick={() => setActiveTab("guidance")}
          className={`px-3 py-2.5 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "guidance"
              ? "bg-amber-400 text-black shadow-md"
              : "text-zinc-400 hover:text-zinc-100"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" /> 4. Guided Search
        </button>
      </div>

      {/* ACTIVE TAB CONTENT */}
      <div className="pt-2">
        
        {/* OPTION 1: DATABASE SEARCH */}
        {activeTab === "database" && (
          <div className="space-y-4">
            <ReelsInspirationFinder />
          </div>
        )}

        {/* OPTION 2: LOG MY OWN ADS */}
        {activeTab === "own_ads" && (
          <form onSubmit={handleOwnAdSubmit} className="space-y-5">
            <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-850 space-y-1.5 mb-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Training Protocol: Option 2</span>
              <h3 className="text-sm font-bold text-zinc-200">Log Your Personal Ad Metrics</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Describe ads you have run in your Meta Account. Input both winning configurations and underperforming ones. Our analytics module will isolate differences in performance based strictly on these records.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Creative Name / Concept Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microplastics Shock-Value UGC v1"
                  value={ownAdForm.name}
                  onChange={(e) => setOwnAdForm({ ...ownAdForm, name: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Format Concept / Style Trend</label>
                <select
                  value={ownAdForm.trend}
                  onChange={(e) => setOwnAdForm({ ...ownAdForm, trend: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="UGC Relatability Vlog">UGC Relatability Vlog</option>
                  <option value="Scientific Green Screen Explanation">Scientific Green Screen Explanation</option>
                  <option value="Corporate Office POV Comedy">Corporate Office POV Comedy</option>
                  <option value="Aesthetic Product Showcase">Aesthetic Product Showcase</option>
                  <option value="Extreme Product Durability Test">Extreme Product Durability Test</option>
                  <option value="Founder-to-Founder Referral">Founder-to-Founder Referral</option>
                  <option value="Educational Roadmap Listicle">Educational Roadmap Listicle</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">The Hook Line (First 3 seconds)</label>
              <input
                type="text"
                required
                placeholder="e.g. Stop drinking microplastics with your hot morning brew."
                value={ownAdForm.hook}
                onChange={(e) => setOwnAdForm({ ...ownAdForm, hook: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Primary Caption Copy / Body Script</label>
                <textarea
                  required
                  rows={4}
                  placeholder="The main script copy that outlines pain point, product solution, values, and features."
                  value={ownAdForm.body}
                  onChange={(e) => setOwnAdForm({ ...ownAdForm, body: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Visual Directives / Staging Staging</label>
                <textarea
                  rows={4}
                  placeholder="Describe what is seen on screen. e.g. Creator pours hot coffee in thermal tumbler in front of laptop, steam visible..."
                  value={ownAdForm.visualStyle}
                  onChange={(e) => setOwnAdForm({ ...ownAdForm, visualStyle: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </div>

            {/* METRICS SECTION */}
            <div className="border-t border-zinc-900 pt-4 space-y-4">
              <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">Performance Metrics & Budget Logs</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Spend ($ USD)</label>
                  <input
                    type="number"
                    value={ownAdForm.spend}
                    onChange={(e) => setOwnAdForm({ ...ownAdForm, spend: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">CTR (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ownAdForm.ctr}
                    onChange={(e) => setOwnAdForm({ ...ownAdForm, ctr: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Conversions</label>
                  <input
                    type="number"
                    value={ownAdForm.conversions}
                    onChange={(e) => setOwnAdForm({ ...ownAdForm, conversions: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Days Run</label>
                  <input
                    type="number"
                    value={ownAdForm.days}
                    onChange={(e) => setOwnAdForm({ ...ownAdForm, days: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Estimated Views</label>
                  <input
                    type="number"
                    value={ownAdForm.views}
                    onChange={(e) => setOwnAdForm({ ...ownAdForm, views: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Likes</label>
                  <input
                    type="number"
                    value={ownAdForm.likes}
                    onChange={(e) => setOwnAdForm({ ...ownAdForm, likes: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Comments</label>
                  <input
                    type="number"
                    value={ownAdForm.comments}
                    onChange={(e) => setOwnAdForm({ ...ownAdForm, comments: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-zinc-950" />
              <span>Log Creative Metrics & Save</span>
            </button>
          </form>
        )}

        {/* OPTION 3: DESCRIBE OTHER PEOPLE'S REELS */}
        {activeTab === "competitors" && (
          <form onSubmit={handleCompetitorSubmit} className="space-y-5">
            <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-850 space-y-1.5 mb-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Training Protocol: Option 3</span>
              <h3 className="text-sm font-bold text-zinc-200">Describe Competitor or Viral Reels</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Found a viral reel on Instagram or TikTok? Deconstruct it and note its triggers here. By providing external view counts, likes, and hooking formulas, our AI learns to emulate winning structural pacing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Inspiration Title / Concept Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ice face-dunk hydration glow reel"
                  value={competitorForm.title}
                  onChange={(e) => setCompetitorForm({ ...competitorForm, title: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Instagram/TikTok Handle (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. @skin_expert_glow"
                  value={competitorForm.username}
                  onChange={(e) => setCompetitorForm({ ...competitorForm, username: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">The Hook Used (First 3 seconds)</label>
              <input
                type="text"
                required
                placeholder="e.g. POV: You've been washing your face wrong for 24 years."
                value={competitorForm.hook}
                onChange={(e) => setCompetitorForm({ ...competitorForm, hook: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Caption Text / Script description</label>
              <textarea
                required
                rows={3}
                placeholder="Describe what they said or wrote in the caption overlay..."
                value={competitorForm.body}
                onChange={(e) => setCompetitorForm({ ...competitorForm, body: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Describe visual staging & why it went viral</label>
              <textarea
                rows={3}
                placeholder="e.g. Fast-paced cuts showing ice facial dipping, slow motion serum dropper, direct hand-tapping to show skin glow..."
                value={competitorForm.description}
                onChange={(e) => setCompetitorForm({ ...competitorForm, description: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* EXTERNAL STATS SECTION */}
            <div className="border-t border-zinc-900 pt-4 space-y-4">
              <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">External Engagement Statistics</span>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Views count</label>
                  <input
                    type="number"
                    value={competitorForm.views}
                    onChange={(e) => setCompetitorForm({ ...competitorForm, views: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Likes count</label>
                  <input
                    type="number"
                    value={competitorForm.likes}
                    onChange={(e) => setCompetitorForm({ ...competitorForm, likes: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Shares / Comments</label>
                  <input
                    type="number"
                    value={competitorForm.shares}
                    onChange={(e) => setCompetitorForm({ ...competitorForm, shares: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-zinc-950" />
              <span>Log Competitor Reel & Save</span>
            </button>
          </form>
        )}

        {/* OPTION 4: GUIDED INSTAGRAM SELF-SEARCH */}
        {activeTab === "guidance" && (
          <div className="space-y-6">
            <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-850 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">Training Protocol: Option 4</span>
              <h3 className="text-sm font-bold text-zinc-200">How to Find Viral Gems on Instagram Yourself</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sometimes the best inspirations come directly from active search feeds. Follow our targeted search protocol below to hunt down high-converting concepts.
              </p>
            </div>

            {/* Keyword generator block */}
            <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-zinc-200">Targeted Search Queries for Niche: <span className="text-amber-400 font-mono">{activeNiche}</span></span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Copy any of these tailored, high-intent keywords to paste into your Instagram search bar to reveal top viral reels:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {getTailoredKeywords().map((kw, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      navigator.clipboard.writeText(kw);
                      showToast(`Copied keyword: "${kw}"!`);
                    }}
                    className="p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-400/20 rounded-xl text-[11px] font-mono text-zinc-300 hover:text-amber-400 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <span>❯ "{kw}"</span>
                    <span className="text-[9px] text-zinc-500 font-mono uppercase bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 group-hover:text-amber-400">Copy</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps Checklist */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">Instagram Search Instructions</span>
              
              <div className="space-y-3">
                <div className="flex gap-4 p-4 bg-zinc-900/25 border border-zinc-900 rounded-2xl">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-amber-400 flex items-center justify-center shrink-0">1</div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-zinc-200">Search Tailored Keywords</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">Open Instagram on your phone or computer, go to search, and enter one of the keywords above. Click on the <b>Reels</b> tab to view video assets.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-zinc-900/25 border border-zinc-900 rounded-2xl">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-amber-400 flex items-center justify-center shrink-0">2</div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-zinc-200">Isolate High Engagement Reels</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">Look for reels with substantial play counts (over 100K plays) or containing active comment dialogue. These represent concepts that the algorithm is actively rewarding.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-zinc-900/25 border border-zinc-900 rounded-2xl">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-amber-400 flex items-center justify-center shrink-0">3</div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-zinc-200">Note Hook & Caption Details</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">Listen carefully to the first 3 seconds of the reel (verbal script and visual action). Expand the description to copy the caption body and check the user metrics (views and likes).</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-zinc-900/25 border border-zinc-900 rounded-2xl">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-amber-400 flex items-center justify-center shrink-0">4</div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-zinc-200">Deconstruct & Feed into Option 3</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">Click the <b>"Describe Reels" (Option 3)</b> tab above in the training suite. Type in the hook, caption, views, and likes. Your AI will instantly adapt its writing style using these viral references!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* TOAST NOTIFICATION */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-400 text-zinc-950 px-5 py-3.5 rounded-2xl shadow-3xl border border-amber-300/40 flex items-center gap-3 animate-fade-in-up">
          <span className="text-xs font-bold font-mono tracking-wide">{successMsg}</span>
        </div>
      )}

    </div>
  );
}
