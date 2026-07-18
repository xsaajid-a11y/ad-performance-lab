import React from "react";
import { AdVariation } from "../types";
import { Calendar, CircleDollarSign, CheckCircle2, AlertTriangle, ArrowUpRight, Trash2 } from "lucide-react";

interface AdVariationCardProps {
  variation: AdVariation;
  onDelete: (id: string) => void;
  badge?: React.ReactNode;
}

const AdVariationCard: React.FC<AdVariationCardProps> = ({ variation, onDelete, badge }) => {
  const isSpendValid = variation.spend >= 75;
  const isDaysValid = variation.days >= 14;
  const isVerified = isSpendValid && isDaysValid;

  // Gauge percentages capped at 100
  const spendPct = Math.min(Math.round((variation.spend / 75) * 100), 100);
  const daysPct = Math.min(Math.round((variation.days / 14) * 100), 100);

  return (
    <div 
      id={`variation-card-${variation.id}`}
      className="bg-zinc-950 border border-zinc-850 rounded-2xl overflow-hidden shadow-xl hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between"
    >
      {/* Card Header */}
      <div className="p-6 border-b border-zinc-850 bg-zinc-900/30 flex justify-between items-start gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
              {variation.trend || "Static Ad Concept"}
            </span>
            {badge}
          </div>
          <h3 className="text-base font-bold font-display text-zinc-100 leading-tight">{variation.name}</h3>
          <p className="text-[11px] text-zinc-400 font-mono tracking-tight">{variation.niche}</p>
        </div>
        
        {/* Verification Status */}
        <div className="flex items-center space-x-2 shrink-0">
          {isVerified ? (
            <div className="flex items-center space-x-1 bg-amber-950/20 border border-amber-900/40 px-2.5 py-1 rounded-full text-amber-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Verified Learning</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full text-zinc-400 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" />
              <span>Unverified Phase</span>
            </div>
          )}
          <button 
            onClick={() => onDelete(variation.id)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Delete this variation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content (Variables) */}
      <div className="p-6 space-y-5 flex-grow">
        <div>
          <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider font-semibold block mb-1">Hook Line (First 3s)</span>
          <p className="text-sm font-medium text-zinc-100 border-l-2 border-amber-400 pl-3 py-1.5 bg-zinc-900/40 rounded-r-lg">
            &ldquo;{variation.hook}&rdquo;
          </p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider font-semibold block mb-1">Primary Ad Body Copy</span>
          <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/20 p-3 rounded-lg border border-zinc-850">
            {variation.body}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider font-semibold block mb-1">Action Directive (CTA)</span>
            <div className="text-xs font-mono font-medium text-amber-400 bg-amber-950/20 border border-amber-900/40 px-2.5 py-1 rounded inline-block">
              {variation.cta}
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider font-semibold block mb-1">Visual & Art Direction</span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {variation.visualStyle}
            </p>
          </div>
        </div>

        {/* Dynamic Learning Phase Verification Progress Bars */}
        <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <CircleDollarSign className="w-3.5 h-3.5 text-zinc-500" /> Spend Threshold:
            </span>
            <span className={isSpendValid ? "text-amber-400 font-semibold" : "text-zinc-400 font-medium"}>
              ${variation.spend} / $75
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isSpendValid ? "bg-amber-400" : "bg-zinc-600"}`} 
              style={{ width: `${spendPct}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Duration Threshold:
            </span>
            <span className={isDaysValid ? "text-amber-400 font-semibold" : "text-zinc-400 font-medium"}>
              {variation.days} / 14 days
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isDaysValid ? "bg-amber-400" : "bg-zinc-600"}`} 
              style={{ width: `${daysPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ad Performance Metrics Footer */}
      <div className="p-4 bg-zinc-900/30 border-t border-zinc-850 grid grid-cols-3 gap-2 text-center">
        <div className="border-r border-zinc-800">
          <span className="text-[9px] uppercase font-mono text-zinc-500 block tracking-wider font-semibold">CTR</span>
          <span className="text-sm font-bold text-zinc-100 font-mono flex items-center justify-center gap-0.5 mt-0.5">
            {variation.ctr}% 
            <ArrowUpRight className="w-3 h-3 text-amber-400 inline" />
          </span>
        </div>
        <div className="border-r border-zinc-800">
          <span className="text-[9px] uppercase font-mono text-zinc-500 block tracking-wider font-semibold">Conversions</span>
          <span className="text-sm font-bold text-zinc-100 font-mono mt-0.5 block">
            {variation.conversions}
          </span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-mono text-zinc-500 block tracking-wider font-semibold">Impressions</span>
          <span className="text-sm font-semibold text-zinc-300 font-mono mt-0.5 block">
            {variation.impressions >= 1000 
              ? `${(variation.impressions / 1000).toFixed(1)}k` 
              : variation.impressions}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdVariationCard;
