import { OptimizationResult, RecommendedAd } from "../types";
import { Sparkles, Eye, Copy, Check, Bookmark, BookmarkCheck, TrendingUp, AlertCircle, CheckCircle, Download } from "lucide-react";
import { useState } from "react";
import { jsPDF } from "jspdf";

interface AICreativeRecommendationsProps {
  data: OptimizationResult;
  onSaveScript: (script: RecommendedAd) => void;
  savedScripts: RecommendedAd[];
  nicheName: string;
}

export default function AICreativeRecommendations({ data, onSaveScript, savedScripts, nicheName }: AICreativeRecommendationsProps) {
  const [copiedIndex, setCopiedIndex] = useState<{ [key: string]: boolean }>({});

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedIndex((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const isAlreadySaved = (rec: RecommendedAd) => {
    return savedScripts.some(s => s.name === rec.name && s.hook === rec.hook);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    let y = 15;

    const checkPageSpace = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = 15;
      }
    };

    const drawPageBorder = () => {
      // Draw top subtle line on all pages
      doc.setDrawColor(39, 39, 42); // zinc-800
      doc.setLineWidth(0.2);
      doc.line(margin, margin - 5, pageWidth - margin, margin - 5);
      doc.line(margin, pageHeight - margin + 5, pageWidth - margin, pageHeight - margin + 5);

      // Draw standard page footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(113, 113, 122); // zinc-500
      doc.text("AdVantage AI Performance Lab", margin, pageHeight - margin + 9);
      doc.text(`Page ${doc.internal.pages.length - 1} of ${totalPages}`, pageWidth - margin - 20, pageHeight - margin + 9);
    };

    // 1. BRAND HEADER BANNER
    doc.setFillColor(9, 9, 11); // zinc-950
    doc.rect(margin, y, contentWidth, 24, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("AdVantage AI Performance Lab", margin + 6, y + 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(251, 191, 36); // amber-400
    doc.text("PERFORMANCE-AUDITED HIGH-CTR AD CREATIVES", margin + 6, y + 14);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122); // zinc-500
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, y + 9);

    y += 31;

    // 2. META DATA
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(244, 244, 245); // zinc-100
    doc.text(`Niche Campaign: ${nicheName || "Meta Performance Optimization"}`, margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(161, 161, 170); // zinc-400
    const descriptionText = "Custom high-CTR scripts engineered by Analytical AI using performance-audited historical reference concepts, designed to maximize hook conversion rates and reduce Meta Ad learning friction.";
    const descLines = doc.splitTextToSize(descriptionText, contentWidth);
    doc.text(descLines, margin, y);
    y += (descLines.length * 4) + 6;

    // 3. ANALYSIS PANEL
    doc.setFillColor(9, 9, 11); // zinc-950
    doc.rect(margin, y, contentWidth, 54, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(244, 244, 245); // zinc-100
    doc.text("Strategic Performance Diagnostics", margin + 5, y + 6.5);

    // separator line
    doc.setDrawColor(39, 39, 42); // zinc-800
    doc.line(margin + 5, y + 9, pageWidth - margin - 5, y + 9);

    let listY = y + 14;

    // Key insights
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(251, 191, 36); // amber-400
    doc.text("Winning Hook Directions:", margin + 5, listY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(212, 212, 216); // zinc-300
    const keyFindings = (data.analysis?.keyFindings || []).slice(0, 3);
    keyFindings.forEach((finding) => {
      const lines = doc.splitTextToSize(`• ${finding}`, contentWidth - 10);
      doc.text(lines, margin + 5, listY + 3.5);
      listY += (lines.length * 3.5) + 1;
    });

    listY += 3;

    // Drags to avoid
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(228, 228, 231); // zinc-200
    doc.text("Performance Drags to Avoid:", margin + 5, listY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(161, 161, 170); // zinc-400
    const drags = (data.analysis?.underperformingElements || []).slice(0, 2);
    drags.forEach((drag) => {
      const lines = doc.splitTextToSize(`• ${drag}`, contentWidth - 10);
      doc.text(lines, margin + 5, listY + 3.5);
      listY += (lines.length * 3.5) + 1;
    });

    y = listY + 6;

    // 4. CREATIVE SCRIPTS TITLE
    checkPageSpace(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(244, 244, 245); // zinc-100
    doc.text("RECONFIGURED CREATIVE VARIATIONS", margin, y);
    y += 7;

    // 5. RECOMMENDATIONS CARDS
    data.recommendations.forEach((rec, idx) => {
      checkPageSpace(60);

      // Card Header Background
      doc.setFillColor(24, 24, 27); // zinc-900
      doc.rect(margin, y, contentWidth, 7, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(244, 244, 245); // zinc-100
      doc.text(`Variation #${idx + 1}: ${rec.name}`, margin + 4, y + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(251, 191, 36); // amber-400
      doc.text(rec.trend.toUpperCase(), pageWidth - margin - 35, y + 4.5);

      y += 11;

      // The Hook Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170); // zinc-400
      doc.text("The Hook (First 3 Seconds):", margin + 4, y);
      y += 3.5;

      doc.setFont("helvetica", "oblique");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      const hookLines = doc.splitTextToSize(`"${rec.hook}"`, contentWidth - 8);
      doc.text(hookLines, margin + 4, y);
      y += (hookLines.length * 3.5) + 4;

      // Primary Body Copy
      checkPageSpace(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170); // zinc-400
      doc.text("Primary Ad Body Copy:", margin + 4, y);
      y += 3.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(212, 212, 216); // zinc-300
      const bodyLines = doc.splitTextToSize(rec.body, contentWidth - 8);
      doc.text(bodyLines, margin + 4, y);
      y += (bodyLines.length * 3.5) + 4;

      // Call to Action & Visual Style
      checkPageSpace(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(161, 161, 170); // zinc-400
      doc.text("Call to Action (CTA):", margin + 4, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(251, 191, 36); // amber-400
      doc.text(rec.cta, margin + 35, y);
      y += 4.5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(161, 161, 170); // zinc-400
      doc.text("Visual Style & Direction:", margin + 4, y);
      y += 3.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(212, 212, 216); // zinc-300
      const visualLines = doc.splitTextToSize(rec.visualStyle, contentWidth - 8);
      doc.text(visualLines, margin + 4, y);
      y += (visualLines.length * 3.5) + 4;

      // Strategic Rationale
      checkPageSpace(18);
      doc.setFillColor(39, 39, 42); // zinc-800
      doc.rect(margin + 2, y, contentWidth - 4, 11, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(251, 191, 36); // amber-400
      doc.text("STRATEGIC RATIONALE:", margin + 5, y + 4);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(244, 244, 245); // zinc-100
      const rationaleLines = doc.splitTextToSize(rec.rationale, contentWidth - 40);
      doc.text(rationaleLines, margin + 38, y + 4);

      y += 16;
    });

    // Draw standard header and footers for all pages
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawPageBorder();
    }

    const campaignClean = (nicheName || "optimized").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    doc.save(`advantage-${campaignClean}-ad-scripts.pdf`);
  };

  return (
    <div id="ai-recommendations-wrapper" className="space-y-8 animate-fade-in">
      
      {/* 1. DIAGNOSTICS & ANALYSIS PANEL */}
      <div id="diagnostic-panel" className="bg-zinc-950 border border-zinc-850 rounded-3xl p-8 shadow-2xl relative">
        <div className="absolute top-0 right-0 p-6 opacity-[0.02]">
          <Sparkles className="w-24 h-24 text-amber-400" />
        </div>
        
        <div className="flex items-center space-x-2.5 mb-8">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          <h2 className="text-xl font-bold font-display text-zinc-100">AI Strategic Performance Diagnostics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Key Insights */}
          <div className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-amber-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-amber-400" /> Key Insights
            </h3>
            <ul className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              {data.analysis.keyFindings.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold select-none">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Underperforming Elements */}
          <div className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-zinc-500" /> Performance Drags
            </h3>
            <ul className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              {data.analysis.underperformingElements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-zinc-500 font-bold select-none">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Winning Angles */}
          <div className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-amber-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" /> Winning Core Hooks
            </h3>
            <ul className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              {data.analysis.winningAngles.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold select-none">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 2. RECONSTRUCTED HIGH-PERFORMANCE CREATIVES LIST */}
      <div id="recommended-ads-section" className="space-y-8 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-display text-zinc-100">Reconfigured Creative Variations</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Engineered using the validated lessons of past ads to bypass the Meta Ad learning filters.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="bg-zinc-950 border border-zinc-850 hover:border-amber-400/50 text-zinc-300 hover:text-amber-400 px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
              title="Download professional PDF of generated ad copy"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" /> Export PDF
            </button>
            <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-950/20 px-3 py-2 rounded-full border border-amber-900/40">
              3 scripts generated
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {data.recommendations.map((rec, idx) => {
            const saved = isAlreadySaved(rec);
            const copyId = `rec-${idx}`;

            return (
              <div 
                key={idx} 
                className="bg-zinc-950 border border-zinc-850 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-amber-400/40 transition-all duration-300"
              >
                {/* recommendation card header */}
                <div className="p-6 border-b border-zinc-850 bg-zinc-900/30 flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400 bg-amber-950/30 border border-amber-900/40 px-2.5 py-0.5 rounded-full">
                      {rec.trend}
                    </span>
                    <h3 className="text-base font-bold font-display text-zinc-100 mt-2.5 leading-snug">{rec.name}</h3>
                  </div>
                  
                  {/* Save to Chamber Button */}
                  <button
                    onClick={() => onSaveScript(rec)}
                    disabled={saved}
                    className={`p-2 rounded-xl border transition-all duration-300 shrink-0 cursor-pointer ${
                      saved 
                        ? "bg-amber-950/30 border-amber-900/40 text-amber-400" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-amber-400 hover:border-amber-400/40"
                    }`}
                    title={saved ? "Saved to Chamber" : "Save this ad script"}
                  >
                    {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                {/* Card Variables (Hook, Body, CTA, Visuals) */}
                <div className="p-6 space-y-5 flex-grow">
                  {/* HOOK */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider font-semibold">The Hook (First 3 Seconds)</span>
                      <button 
                        onClick={() => handleCopy(rec.hook, `${copyId}-hook`)} 
                        className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedIndex[`${copyId}-hook`] ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex[`${copyId}-hook`] ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="text-sm font-medium text-zinc-100 bg-zinc-900/40 border border-zinc-850 rounded-lg p-3.5 border-l-4 border-l-amber-400 italic leading-relaxed">
                      &ldquo;{rec.hook}&rdquo;
                    </p>
                  </div>

                  {/* BODY COPY */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider font-semibold">Primary Ad Body Copy</span>
                      <button 
                        onClick={() => handleCopy(rec.body, `${copyId}-body`)} 
                        className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedIndex[`${copyId}-body`] ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex[`${copyId}-body`] ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-zinc-300 bg-zinc-900/20 border border-zinc-850 rounded-lg p-3.5 whitespace-pre-line leading-relaxed">
                      {rec.body}
                    </p>
                  </div>

                  {/* CTA & VISUALS */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-zinc-900/20 p-4 rounded-xl border border-zinc-850">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider block font-semibold">Call to Action (CTA)</span>
                      <span className="text-xs font-mono font-bold text-amber-400 block mt-1">
                        {rec.cta}
                      </span>
                    </div>

                    <div className="bg-zinc-900/20 p-4 rounded-xl border border-zinc-850">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider block font-semibold">Visuals & Art Direction</span>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {rec.visualStyle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Strategic Rationale */}
                <div className="p-5 bg-zinc-900/40 border-t border-zinc-850 rounded-b-3xl">
                  <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider block font-semibold">Strategic Rationale</span>
                  <p className="text-[11px] text-zinc-100 mt-1.5 leading-relaxed bg-amber-950/20 border border-amber-900/40 p-3 rounded-lg">
                    {rec.rationale}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
