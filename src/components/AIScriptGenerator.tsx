import React, { useState } from "react";
import { 
  Sparkles, 
  HelpCircle, 
  Tv, 
  Play, 
  BookOpen, 
  Copy, 
  Check, 
  Bookmark, 
  Loader2, 
  Info,
  ChevronDown,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { AdVariation, ViralInspiration, RecommendedAd } from "../types";

interface Product {
  id: string;
  name: string;
  description: string;
}

interface AIScriptGeneratorProps {
  niche: string;
  products: Product[];
  loggedDatabase: AdVariation[];
  viralInspirations: ViralInspiration[];
  onSaveScript: (script: RecommendedAd) => void;
  savedScripts: RecommendedAd[];
}

export default function AIScriptGenerator({
  niche,
  products,
  loggedDatabase,
  viralInspirations,
  onSaveScript,
  savedScripts
}: AIScriptGeneratorProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || "custom");
  const [customProduct, setCustomProduct] = useState({ name: "", description: "" });
  const [campaignGoal, setCampaignGoal] = useState("Maximize Hook Rate (Attention)");
  const [additionalAngle, setAdditionalAngle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [generatedScript, setGeneratedScript] = useState<RecommendedAd | null>(null);
  const [rawTextResponse, setRawTextResponse] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [webhookUrlOverride, setWebhookUrlOverride] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeProduct = selectedProductId === "custom" 
    ? { name: customProduct.name || "My Custom Product", description: customProduct.description || "Enter description below." }
    : products.find(p => p.id === selectedProductId) || { name: "No Product", description: "" };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isSaved = generatedScript && savedScripts.some(s => s.name === generatedScript.name && s.hook === generatedScript.hook);

  const triggerTypewriterLogs = (callback: () => Promise<void>) => {
    const logs = [
      "⚡ Compiling your custom business niche database...",
      "🔍 Sifting through your logged winners and low-performing ad curves...",
      "🌟 Merging competitor hook patterns and viral duration indicators...",
      "📡 Connecting secure websocket tunnel to your n8n workflow engine...",
      "🧠 n8n script cluster is constructing high-CTR hooks & body scripts..."
    ];
    
    setLogMessages([]);
    let idx = 0;
    
    const interval = setInterval(() => {
      if (idx < logs.length) {
        setLogMessages(prev => [...prev, logs[idx]]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 1200);

    return callback().finally(() => {
      clearInterval(interval);
    });
  };

  const handleGenerate = async () => {
    if (selectedProductId === "custom" && !customProduct.name) {
      alert("Please enter a custom product name first.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedScript(null);
    setRawTextResponse(null);

    const performRequest = async () => {
      try {
        // Compile all the context in a clean, comprehensive payload
        const payload = {
          timestamp: new Date().toISOString(),
          businessContext: {
            niche: niche,
            targetProduct: activeProduct,
            otherProducts: products.filter(p => p.id !== selectedProductId)
          },
          campaignGoal: campaignGoal,
          specialAngle: additionalAngle,
          trainingDatabase: {
            // Include their own logged variations with metrics
            loggedAds: loggedDatabase.map(ad => ({
              name: ad.name,
              hook: ad.hook,
              body: ad.body,
              ctr: ad.ctr,
              conversions: ad.conversions,
              spend: ad.spend,
              days: ad.days,
              views: ad.impressions || 1000
            })),
            // Include described competitor reels
            competitorInspirations: viralInspirations.map(ins => ({
              title: ins.title,
              hook: ins.hook,
              body: ins.body,
              views: ins.views,
              likes: ins.likes
            }))
          }
        };

        // Call our backend proxy
        const response = await fetch("/api/generate-script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webhookUrl: webhookUrlOverride.trim() || undefined,
            payload: payload
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Webhook failed to process.");
        }

        const resData = await response.json();
        
        // n8n might return standard structured script JSON, or a raw text string
        if (resData.status === "success") {
          const payloadData = resData.data;
          
          if (typeof payloadData === "object" && payloadData !== null) {
            // Check if it is already in the structured RecommendedAd format
            const rec = payloadData.recommendation || payloadData;
            if (rec && (rec.hook || rec.body)) {
              setGeneratedScript({
                name: rec.name || `Custom ${campaignGoal} Concept`,
                hook: rec.hook || "No hook returned",
                body: rec.body || "No body copy returned",
                cta: rec.cta || "Shop Now",
                visualStyle: rec.visualStyle || "Simple UGC styling",
                trend: rec.trend || "UGC Framework",
                rationale: rec.rationale || "Optimized based on performance trends."
              });
            } else {
              // Fallback to text representation of JSON
              setRawTextResponse(JSON.stringify(payloadData, null, 2));
            }
          } else if (typeof payloadData === "string") {
            // If it is a string (e.g. Markdown text), show it directly
            setRawTextResponse(payloadData);
          }
        } else {
          throw new Error("Invalid response envelope received from server.");
        }
      } catch (err: any) {
        console.error("Generator error:", err);
        setErrorMsg(err.message || "An unexpected error occurred while communicating with n8n.");
      } finally {
        setIsGenerating(false);
      }
    };

    await triggerTypewriterLogs(performRequest);
  };

  const handleSaveGenerated = () => {
    if (!generatedScript) return;
    onSaveScript(generatedScript);
    showToast("✓ Ad Script Bookmarked!");
  };

  // Mini Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8">
      
      {/* SECTION HEADER */}
      <div className="border-b border-zinc-900 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-display text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> AI Script & Idea Generator
          </h2>
          <p className="text-xs text-zinc-400">Generate fully tailored high-CTR ad ideations based on your training parameters.</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="p-8 text-center bg-zinc-900/20 border border-zinc-850 rounded-2xl max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-200">No registered products found</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Please register your business profile and list your active products to unlock the script generator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* PARAMETER CONFIG FORM (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              
              {/* Product Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Select Active Product</label>
                <div className="relative">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-100 text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500/40 cursor-pointer appearance-none font-sans"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                    <option value="custom">-- Custom Product --</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Custom Product Fields (if selected) */}
              {selectedProductId === "custom" && (
                <div className="space-y-3 p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase font-mono">Custom Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Lavender Sleep Spray"
                      value={customProduct.name}
                      onChange={(e) => setCustomProduct({ ...customProduct, name: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase font-mono">Custom Product Description</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Direct spray that infuses sheets with soothing lavender essential oil and melatonin..."
                      value={customProduct.description}
                      onChange={(e) => setCustomProduct({ ...customProduct, description: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Active Product display summary */}
              {selectedProductId !== "custom" && activeProduct && (
                <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl text-xs space-y-1">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Active Product Description:</span>
                  <p className="text-zinc-300 leading-relaxed font-sans">{activeProduct.description}</p>
                </div>
              )}

              {/* Campaign Goal Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Choose Campaigns Goal</label>
                <div className="relative">
                  <select
                    value={campaignGoal}
                    onChange={(e) => setCampaignGoal(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-100 text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500/40 cursor-pointer appearance-none"
                  >
                    <option value="Maximize Hook Rate (Attention)">Maximize Hook Rate (Attention)</option>
                    <option value="Cold Acquisition (Conversions)">Cold Acquisition (Conversions)</option>
                    <option value="Retargeting & Social Proof (Trust)">Retargeting & Social Proof (Trust)</option>
                    <option value="Viral Engagement (Shares & Comments)">Viral Engagement (Shares & Comments)</option>
                    <option value="Benefit Deep-Dive (Customer Education)">Benefit Deep-Dive (Customer Education)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Special Angle or Hook Focus (Optional Textbox) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Specific Angles or Additional Notes (Optional)</label>
                <textarea
                  rows={4}
                  value={additionalAngle}
                  onChange={(e) => setAdditionalAngle(e.target.value)}
                  placeholder="e.g. Focus on micro-targeting busy mothers. Emphasize chemical-free ingredients. Frame it as a 15-second nightly ritual..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 resize-none leading-relaxed"
                />
              </div>

              {/* Advanced Settings toggle */}
              <div className="pt-2 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-[10px] font-mono font-bold text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                >
                  {showAdvanced ? "[-]" : "[+]"} Show Advanced n8n Settings
                </button>
                {showAdvanced && (
                  <div className="mt-3 p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl space-y-3 animate-fade-in">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">n8n Webhook Endpoint Override</label>
                      <input
                        type="text"
                        placeholder="https://your-n8n-instance.cloud/webhook..."
                        value={webhookUrlOverride}
                        onChange={(e) => setWebhookUrlOverride(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[11px] text-zinc-300 font-mono focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-[9px] text-zinc-500 block leading-relaxed mt-1">
                        Defaults to the primary configured n8n workspace endpoint if left empty.
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Submit Generation Action */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 px-6 bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-900 disabled:text-zinc-600 text-zinc-950 font-bold text-xs uppercase tracking-wider font-mono rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-650" />
                  <span>Processing with n8n...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  <span>Generate Custom Ad Scripts</span>
                </>
              )}
            </button>
          </div>

          {/* RESPONSE VIEWER (7 COLS) */}
          <div className="lg:col-span-7 bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 min-h-[450px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* INITIAL LOADING STATE WITH TYPEWRITER LOGS */}
            {isGenerating && (
              <div className="flex-1 flex flex-col justify-center items-center py-12 space-y-6">
                <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                <div className="max-w-md w-full space-y-2.5">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest text-center block">AI Training Pipeline Active</span>
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-2 font-mono text-[10px] text-zinc-400 leading-relaxed overflow-hidden shadow-inner h-44 flex flex-col justify-end">
                    {logMessages.map((msg, i) => (
                      <div key={i} className="animate-fade-in text-zinc-300">
                        {msg}
                      </div>
                    ))}
                    <div className="text-amber-400 animate-pulse flex items-center gap-1.5">
                      <span>❯</span>
                      <span className="w-2 h-3.5 bg-amber-400 block animate-blink" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {!isGenerating && !generatedScript && !rawTextResponse && !errorMsg && (
              <div className="flex-grow flex flex-col justify-center items-center text-center p-8 space-y-4">
                <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-2xl text-zinc-500">
                  <Tv className="w-8 h-8" />
                </div>
                <div className="max-w-sm space-y-1">
                  <h3 className="text-sm font-bold text-zinc-200">Awaiting Generation Input</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Choose a product and campaign goal, then click generate. Your custom n8n workspace will process all active learning cues to deliver performance-structured ad copy.
                  </p>
                </div>
              </div>
            )}

            {/* ERROR PRESENTATION */}
            {errorMsg && (
              <div className="flex-grow flex flex-col justify-center items-center p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <div className="max-w-md space-y-1">
                  <h3 className="text-sm font-bold text-zinc-200">Generation Handshake Failed</h3>
                  <p className="text-xs text-red-400 font-mono bg-red-950/10 border border-red-900/30 p-3 rounded-xl leading-relaxed">
                    {errorMsg}
                  </p>
                  <p className="text-[10px] text-zinc-500 pt-1">
                    Please ensure your n8n workflow is running and accepting POST requests on this webhook.
                  </p>
                </div>
              </div>
            )}

            {/* STRUCTURED JSON RESPONSE RENDER */}
            {generatedScript && !isGenerating && (
              <div className="flex-grow flex flex-col justify-between h-full space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono font-bold tracking-wider text-amber-400 uppercase bg-amber-950/30 border border-amber-900/40 px-2.5 py-0.5 rounded-full">
                      {generatedScript.trend}
                    </span>
                    <h3 className="text-base font-bold font-display text-zinc-100 mt-2">{generatedScript.name}</h3>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveGenerated}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isSaved
                          ? "bg-amber-400 border-amber-400 text-zinc-950"
                          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                      }`}
                      title={isSaved ? "Saved to Library" : "Save Script"}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto max-h-[380px] scrollbar-thin pr-1">
                  
                  {/* Hook Action box */}
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 space-y-1.5 relative group/item">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Hook line (0-3s)</span>
                      <button
                        onClick={() => handleCopy(generatedScript.hook, "gen-hook")}
                        className="text-[9px] font-mono text-amber-400 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-1 hover:text-amber-300"
                      >
                        {copiedKey === "gen-hook" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "gen-hook" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-zinc-100 italic leading-relaxed">&ldquo;{generatedScript.hook}&rdquo;</p>
                  </div>

                  {/* Body Caption Action Box */}
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 space-y-1.5 relative group/item">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Primary Caption Copy</span>
                      <button
                        onClick={() => handleCopy(generatedScript.body, "gen-body")}
                        className="text-[9px] font-mono text-amber-400 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-1 hover:text-amber-300"
                      >
                        {copiedKey === "gen-body" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "gen-body" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">{generatedScript.body}</p>
                  </div>

                  {/* CTA & Visual design directions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-zinc-900/20 border border-zinc-850 rounded-xl">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Suggested Call-To-Action</span>
                      <span className="text-xs font-bold text-amber-400 block mt-1">{generatedScript.cta}</span>
                    </div>
                    <div className="p-3.5 bg-zinc-900/20 border border-zinc-850 rounded-xl">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Visual Style / Staging</span>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{generatedScript.visualStyle}</p>
                    </div>
                  </div>

                  {/* Strategic feedback rationale */}
                  <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl text-xs text-zinc-300 leading-relaxed">
                    <span className="font-bold text-amber-400 block mb-1">Strategic Rationale:</span>
                    {generatedScript.rationale}
                  </div>

                </div>

                <div className="pt-4 border-t border-zinc-900 text-center">
                  <p className="text-[10px] text-zinc-500">Bookmarked scripts can be managed directly in the "Bookmarked Assets" library.</p>
                </div>
              </div>
            )}

            {/* RAW TEXT / MARKDOWN RESPONSE RENDER */}
            {rawTextResponse && !isGenerating && (
              <div className="flex-grow flex flex-col justify-between h-full space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                  <span className="text-xs font-bold text-zinc-200">Generated Script Output</span>
                  <button
                    onClick={() => handleCopy(rawTextResponse, "raw-text")}
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === "raw-text" ? <Check className="w-3 h-3" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "raw-text" ? "Copied Full Text" : "Copy Full Text"}</span>
                  </button>
                </div>

                <div className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl p-4 font-mono text-[11px] text-zinc-300 overflow-y-auto max-h-[380px] leading-relaxed whitespace-pre-wrap select-text scrollbar-thin">
                  {rawTextResponse}
                </div>

                <div className="pt-2 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-500">
                  <span>Processed via custom n8n workflow</span>
                  <button
                    onClick={() => {
                      // Attempt to create a standard bookmarks structure out of raw text if bookmarks are wanted
                      const fallbackBookmark: RecommendedAd = {
                        name: `${campaignGoal} (Raw Text)`,
                        hook: rawTextResponse.slice(0, 80) + "...",
                        body: rawTextResponse,
                        cta: "Shop Now",
                        visualStyle: "UGC Staging",
                        trend: "Text Output",
                        rationale: "Exported from raw n8n webhook text response."
                      };
                      onSaveScript(fallbackBookmark);
                      showToast("✓ Custom bookmark created from output!");
                    }}
                    className="text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Bookmark className="w-3 h-3 fill-current" /> Save as Bookmark
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* MINI TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-400 text-zinc-950 px-5 py-3.5 rounded-2xl shadow-3xl border border-amber-300/40 flex items-center gap-3 animate-fade-in-up">
          <span className="text-xs font-bold font-mono tracking-wide uppercase">{toastMsg}</span>
        </div>
      )}

    </div>
  );
}
