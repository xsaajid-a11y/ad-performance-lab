import React, { useState } from "react";
import { AdVariation } from "../types";
import { Plus, X, Sparkles, AlertTriangle, CheckCircle2, Database, ArrowRight, ShieldCheck, Check } from "lucide-react";

interface AddVariationModalProps {
  onClose: () => void;
  onLogToDatabase: (variation: AdVariation) => void;
  activeNiche: string;
}

export default function AddVariationModal({ onClose, onLogToDatabase, activeNiche }: AddVariationModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    name: "",
    trend: "UGC Aesthetic Vlog",
    hook: "",
    body: "",
    cta: "Shop Now",
    visualStyle: "",
    ctr: "2.50",
    conversions: "35",
    spend: "120",
    days: "14",
    impressions: "5000",
    headline: "",
    reelBodyDescription: "",
    reelCtaDescription: "",
    adType: "video",
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoadSample = () => {
    setFormData({
      name: "UGC Problem-Solver Angle",
      trend: "UGC Relatability Vlog",
      hook: "I used to waste 3 hours trying to clean my kitchen until I found this...",
      body: "Struggling with sticky counters and greasy pans? This plant-based magic tablet dissolves in tap water and cuts through raw grime instantly. Non-toxic, safe for paws, and costs just $1.50 per refill. Grab yours today before it sells out!",
      cta: "Shop Now",
      visualStyle: "Handheld phone footage: Creator pointing at stained countertops, dropping the tablet in glass spray bottle, then wipe-cleaning in one quick swipe.",
      ctr: "3.85",
      conversions: "94",
      spend: "240",
      days: "16",
      impressions: "15500",
      headline: "This Eco-Friendly Tablet Dissolves Dirt Instantly!",
      reelBodyDescription: "The creator records handheld close-ups showing sticky, greasy pans. They drop a green tablet into a glass spray bottle filled with faucet water, watch it fizz, and spray it. In one quick swipe, they wipe away the grease completely.",
      reelCtaDescription: "Creator looks directly at the camera, holding the spray bottle, and points at the 'Shop Now' overlay caption saying, 'Hit the link to grab a starter pack before this batch runs out!'",
      adType: "video",
    });
    setValidationErrors([]);
  };

  const validateStep1 = () => {
    const errors: string[] = [];
    if (!formData.name.trim()) errors.push("Concept Title / Name is required.");
    if (!formData.headline.trim()) errors.push("Headline is required.");
    if (!formData.hook.trim()) errors.push("Hook line (first 3 seconds) is required.");
    if (!formData.body.trim()) errors.push("Primary Ad Body Copy is required.");
    if (!formData.reelBodyDescription.trim()) errors.push("Description of reel body / mid-video is required.");
    if (!formData.reelCtaDescription.trim()) errors.push("Description of end-of-reel CTA action is required.");
    
    // Numeric validations
    if (isNaN(Number(formData.ctr)) || Number(formData.ctr) <= 0) errors.push("CTR must be a positive number.");
    if (isNaN(Number(formData.conversions)) || Number(formData.conversions) < 0) errors.push("Conversions must be a valid number.");
    if (isNaN(Number(formData.spend)) || Number(formData.spend) <= 0) errors.push("Spend must be a valid positive number.");
    if (isNaN(Number(formData.days)) || Number(formData.days) <= 0) errors.push("Days run must be a positive number.");
    if (isNaN(Number(formData.impressions)) || Number(formData.impressions) <= 0) errors.push("Impressions must be a positive number.");

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleConfirmAndSubmit = () => {
    const finalVariation: AdVariation = {
      id: "var_" + Date.now(),
      name: formData.name,
      niche: activeNiche,
      hook: formData.hook,
      body: formData.body,
      cta: formData.cta,
      visualStyle: formData.visualStyle || "Standard staging",
      trend: formData.trend,
      ctr: parseFloat(formData.ctr),
      conversions: parseInt(formData.conversions),
      spend: parseFloat(formData.spend),
      days: parseInt(formData.days),
      impressions: parseInt(formData.impressions),
      headline: formData.headline,
      reelBodyDescription: formData.reelBodyDescription,
      reelCtaDescription: formData.reelCtaDescription,
      adType: formData.adType,
    };

    onLogToDatabase(finalVariation);
    setStep(3);
  };

  const isVerified = parseFloat(formData.spend) >= 75 && parseInt(formData.days) >= 14;

  return (
    <div id="add-variation-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-850 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] transition-all duration-300">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-850 flex justify-between items-center bg-zinc-900/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-950/20 border border-amber-900/40 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-zinc-100">Log Creative to Database</h3>
              <p className="text-xs text-zinc-400">Campaign Niche: <span className="text-amber-400 font-mono font-bold">{activeNiche}</span></p>
            </div>
          </div>
          {step !== 3 && (
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          
          {/* STEP 1: INPUT CREATIVE AND PERFORMANCE DATA */}
          {step === 1 && (
            <form onSubmit={handleProceedToReview} className="space-y-5">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-amber-950/20 border border-amber-900/40 p-4 rounded-2xl gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-amber-400 block">Need high-converting dummy data?</span>
                  <p className="text-[11px] text-zinc-300">Fill instantly to try out the AI optimization learning cycle.</p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs font-mono font-semibold text-amber-400 hover:text-amber-300 bg-amber-950/30 border border-amber-900/40 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Fill Sample Ad
                </button>
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-red-950/20 border border-red-900/40 text-red-400 p-4 rounded-xl text-xs space-y-1 font-mono">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" /> Please resolve errors:
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Creative Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold block mb-1.5">Concept Title / Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    placeholder="e.g. Creator Green Screen Review"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 font-sans"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold block mb-1.5">Ad Format / Type *</label>
                  <select 
                    name="adType" 
                    value={formData.adType} 
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 font-sans cursor-pointer"
                  >
                    <option value="video">Video (Reel / TikTok)</option>
                    <option value="carousel">Carousel</option>
                    <option value="static_image">Static Image</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold block mb-1.5">Ad Style / Framework</label>
                  <select 
                    name="trend" 
                    value={formData.trend} 
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 font-sans cursor-pointer"
                  >
                    <option value="Scientific Green Screen Explanation">Scientific Green Screen Explanation</option>
                    <option value="UGC Aesthetic Vlog">UGC Aesthetic Vlog</option>
                    <option value="Aesthetic Product Showcase">Aesthetic Product Showcase</option>
                    <option value="Corporate Office POV Comedy">Corporate Office POV Comedy</option>
                    <option value="Extreme Product Durability Test">Extreme Product Durability Test</option>
                    <option value="Life Hack Cost Reduction">Life Hack Cost Reduction</option>
                    <option value="Interactive Breathing Stunt">Interactive Breathing Stunt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold block mb-1.5">
                    Ad Headline *
                  </label>
                  <input 
                    type="text" 
                    name="headline" 
                    value={formData.headline} 
                    onChange={handleInputChange}
                    placeholder="e.g. Stop wasting hours on stained pans"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 font-sans"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold block mb-1.5">
                    Hook Line (First 3 Seconds Speech / On-Screen Text) *
                  </label>
                  <input 
                    type="text" 
                    name="hook" 
                    value={formData.hook} 
                    onChange={handleInputChange}
                    placeholder="e.g. Stop drinking microplastics with your hot morning brew..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 font-sans"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold block mb-1.5">
                  Primary Ad Body Copy (Caption / Message) *
                </label>
                <textarea 
                  name="body" 
                  value={formData.body} 
                  onChange={handleInputChange}
                  placeholder="Write the full persuasive caption text used in this ad campaign..."
                  rows={2}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 resize-none font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold block mb-1.5">
                    Reel Body Description (After the Hook) *
                  </label>
                  <textarea 
                    name="reelBodyDescription" 
                    value={formData.reelBodyDescription} 
                    onChange={handleInputChange}
                    placeholder="A rough description of what was done/said after the hook (mid-video/body transcription)..."
                    rows={3}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 resize-none font-sans"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold block mb-1.5">
                    Reel CTA / Outro Description (End of Video) *
                  </label>
                  <textarea 
                    name="reelCtaDescription" 
                    value={formData.reelCtaDescription} 
                    onChange={handleInputChange}
                    placeholder="Rough description of what was done/said at the CTA part at the end of the reel..."
                    rows={3}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 resize-none font-sans"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold block mb-1.5">Call to Action (CTA) Option</label>
                  <select 
                    name="cta" 
                    value={formData.cta} 
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 font-sans cursor-pointer"
                  >
                    <option value="Shop Now">Shop Now</option>
                    <option value="Learn More">Learn More</option>
                    <option value="Get Offer">Get Offer</option>
                    <option value="Sign Up">Sign Up</option>
                    <option value="Download">Download</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-semibold block mb-1.5">Visual Art Direction / Staging</label>
                  <input 
                    type="text" 
                    name="visualStyle" 
                    value={formData.visualStyle} 
                    onChange={handleInputChange}
                    placeholder="e.g. Handheld closeups, screen recordings"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 font-sans"
                  />
                </div>
              </div>

              {/* Performance metrics & validations */}
              <div className="border-t border-zinc-850 pt-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase font-mono text-zinc-400 tracking-wider flex items-center gap-1.5">
                    Meta Ad Performance Metrics
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-mono">Verify performance accuracy</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-500 block mb-1 font-semibold">CTR (%) *</label>
                    <input 
                      type="text" 
                      name="ctr" 
                      value={formData.ctr} 
                      onChange={handleInputChange}
                      placeholder="e.g. 2.45"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-500 block mb-1 font-semibold">Conversions *</label>
                    <input 
                      type="text" 
                      name="conversions" 
                      value={formData.conversions} 
                      onChange={handleInputChange}
                      placeholder="e.g. 45"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-500 block mb-1 font-semibold">Spend (USD) *</label>
                    <input 
                      type="text" 
                      name="spend" 
                      value={formData.spend} 
                      onChange={handleInputChange}
                      placeholder="e.g. 150"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono uppercase text-zinc-500 block mb-1 font-semibold">Days Run *</label>
                    <input 
                      type="text" 
                      name="days" 
                      value={formData.days} 
                      onChange={handleInputChange}
                      placeholder="e.g. 14"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[9px] font-mono uppercase text-zinc-500 block mb-1 font-semibold">Impressions *</label>
                    <input 
                      type="text" 
                      name="impressions" 
                      value={formData.impressions} 
                      onChange={handleInputChange}
                      placeholder="e.g. 5000"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer (Proceed) */}
              <div className="border-t border-zinc-850 pt-5 flex justify-end space-x-3 bg-zinc-900/20 -mx-6 -mb-6 p-6">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl transition-all cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 text-xs bg-amber-400 text-black font-bold rounded-xl shadow-lg hover:bg-amber-300 transition-all flex items-center gap-1.5 cursor-pointer font-mono uppercase"
                >
                  Review Details <ArrowRight className="w-3.5 h-3.5 text-black" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: REVIEW & CONFIRM */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-100">Database Commit Review</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Verify all metrics and copy coordinates are correct before pushing to secure cloud storage. This record will train the generative creative algorithms.
                  </p>
                </div>
              </div>

              {/* Styled Audit Grid Sheet */}
              <div className="bg-zinc-950 rounded-2xl border border-zinc-850 p-6 space-y-5 shadow-2xl">
                <div className="flex justify-between items-start border-b border-zinc-850 pb-4">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">CREATIVE DESIGNATION</span>
                    <h5 className="text-base font-bold text-amber-400 mt-1 flex items-center gap-2">
                      {formData.name}
                      <span className="text-[9px] font-mono bg-amber-950/30 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded uppercase font-bold">
                        {formData.adType}
                      </span>
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg text-zinc-300">
                    {formData.trend}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block font-semibold">1. AD HEADLINE</span>
                    <p className="text-xs text-zinc-100 bg-zinc-900/40 p-3 rounded-xl border border-zinc-850 mt-1.5 font-semibold">
                      {formData.headline}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block font-semibold">2. HOOK ATTENTION OVERLAY</span>
                    <p className="text-xs text-zinc-100 bg-zinc-900/40 p-3 rounded-xl border border-zinc-850 mt-1.5 italic">
                      &ldquo;{formData.hook}&rdquo;
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block font-semibold">3. PRIMARY CAPTION BODY</span>
                    <p className="text-xs text-zinc-300 bg-zinc-900/20 p-3.5 rounded-xl border border-zinc-850 mt-1.5 whitespace-pre-line leading-relaxed">
                      {formData.body}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block font-semibold">4. MID-REEL BODY ACTION & TRANSCRIPTION</span>
                      <p className="text-xs text-zinc-400 bg-zinc-900/20 p-3 rounded-xl border border-zinc-850 mt-1.5 leading-relaxed">
                        {formData.reelBodyDescription}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block font-semibold">5. END-OF-REEL CTA OUTRO ACTION</span>
                      <p className="text-xs text-zinc-400 bg-zinc-900/20 p-3 rounded-xl border border-zinc-850 mt-1.5 leading-relaxed">
                        {formData.reelCtaDescription}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="bg-zinc-900/20 p-3 rounded-xl border border-zinc-850">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block font-semibold">6. CALL TO ACTION (CTA)</span>
                      <span className="text-xs font-bold text-amber-400">{formData.cta}</span>
                    </div>
                    <div className="bg-zinc-900/20 p-3 rounded-xl border border-zinc-850">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block font-semibold">7. VISUAL STAGING</span>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">{formData.visualStyle || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Performance Audit Checklist */}
                <div className="border-t border-zinc-850 pt-5 mt-2">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-3 font-semibold">META LEARNING PHASE VERIFICATION</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-850 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400">CTR Rank:</span>
                      <span className="text-xs font-bold text-zinc-100 font-mono">{formData.ctr}%</span>
                    </div>
                    
                    <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-850 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400">Days Active:</span>
                      <div className="flex items-center gap-1 font-mono">
                        <span className="text-xs font-bold text-zinc-100">{formData.days}d</span>
                        {parseInt(formData.days) >= 14 ? (
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" title="Under 14 day target" />
                        )}
                      </div>
                    </div>

                    <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-850 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400">Ad Spend:</span>
                      <div className="flex items-center gap-1 font-mono">
                        <span className="text-xs font-bold text-zinc-100">${formData.spend}</span>
                        {parseFloat(formData.spend) >= 75 ? (
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" title="Under $75 budget" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 px-1">
                    {isVerified ? (
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" /> METRICS VERIFIED: Ready for highly predictive AI modeling.
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-mono">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" /> UNVERIFIED STATUS: Under $75 spend or 14 days run. Less weight in training.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer (Confirm) */}
              <div className="border-t border-zinc-850 pt-5 flex justify-end space-x-3 bg-zinc-900/20 -mx-6 -mb-6 p-6">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl transition-all cursor-pointer font-medium"
                >
                  Back to Edit
                </button>
                <button 
                  type="button" 
                  onClick={handleConfirmAndSubmit}
                  className="px-5 py-2.5 text-xs bg-amber-400 text-black font-bold rounded-xl shadow-lg hover:bg-amber-300 transition-all flex items-center gap-1.5 cursor-pointer font-mono uppercase"
                >
                  <Database className="w-3.5 h-3.5" /> Confirm & Log to DB
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: STORED IN DATABASE (SUCCESS) */}
          {step === 3 && (
            <div className="space-y-6 text-center py-6 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-amber-950/20 border border-amber-900/40 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-xl font-bold font-display text-zinc-100">Ad Creative Successfully Logged</h4>
                <p className="text-xs text-zinc-400 font-mono">
                  Pushed to Supabase Database Cluster under table <span className="text-amber-400">"ad_variations"</span>.
                </p>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl text-left text-xs text-zinc-300 max-w-lg mx-auto space-y-3 shadow-inner leading-relaxed">
                <div className="flex items-center gap-2 text-amber-400 font-mono font-bold border-b border-zinc-850 pb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> AI TRAINING QUEUE: ENFORCED
                </div>
                <p>
                  This ad variation is now locked and stored in persistent database servers. Rather than cluttering your daily draft boards, it is integrated as high-priority training background context.
                </p>
                <p className="text-zinc-400 font-mono text-[11px]">
                  ❯ Next time you click <span className="text-amber-400">"Optimize Creatives"</span>, Gemini will analyze this past entry alongside competitors to write even stronger scripts.
                </p>
              </div>

              <div className="pt-4">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs bg-amber-400 text-black font-bold rounded-xl hover:bg-amber-300 transition-all cursor-pointer font-mono"
                >
                  Close & Refresh Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
