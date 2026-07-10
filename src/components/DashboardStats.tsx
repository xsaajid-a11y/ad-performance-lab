import { AdVariation } from "../types";
import { Award, DollarSign, Percent, BookOpen } from "lucide-react";

interface DashboardStatsProps {
  variations: AdVariation[];
}

export default function DashboardStats({ variations }: DashboardStatsProps) {
  const totalSpend = variations.reduce((sum, v) => sum + v.spend, 0);
  const avgCtr = variations.length 
    ? (variations.reduce((sum, v) => sum + v.ctr, 0) / variations.length).toFixed(2)
    : "0.00";
  const totalConversions = variations.reduce((sum, v) => sum + v.conversions, 0);
  
  // Calculate verified ads: Run duration >= 14 days and spend >= 75
  const verifiedCount = variations.filter(v => v.spend >= 75 && v.days >= 14).length;
  const verifiedPercentage = variations.length
    ? Math.round((verifiedCount / variations.length) * 100)
    : 0;

  return (
    <div id="dashboard-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Metric 1: Total Spend */}
      <div id="stat-spend" className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-400/50 transition-all duration-300">
        <div className="absolute -top-3 -right-3 p-3 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-transform duration-300">
          <DollarSign className="w-24 h-24 text-white" />
        </div>
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-amber-400 transition-colors">
            <DollarSign className="w-4 h-4" />
          </div>
          <span className="text-zinc-400 text-xs font-mono uppercase tracking-wider font-semibold">Total Historical Spend</span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-display text-zinc-100">${totalSpend.toLocaleString()}</span>
          <span className="text-xs text-zinc-500 font-mono">USD</span>
        </div>
        <div className="mt-4 text-xs text-zinc-400 flex items-center space-x-1 font-mono">
          <span className="text-amber-400 font-semibold">{variations.length}</span>
          <span>variations analyzed</span>
        </div>
      </div>

      {/* Metric 2: Avg CTR */}
      <div id="stat-ctr" className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-400/50 transition-all duration-300">
        <div className="absolute -top-3 -right-3 p-3 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-transform duration-300">
          <Percent className="w-24 h-24 text-white" />
        </div>
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-amber-400 transition-colors">
            <Percent className="w-4 h-4" />
          </div>
          <span className="text-zinc-400 text-xs font-mono uppercase tracking-wider font-semibold">Average CTR</span>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold font-display text-zinc-100">{avgCtr}%</span>
        </div>
        <div className="mt-4 text-xs text-zinc-400 flex items-center space-x-1 font-mono">
          <span className="text-amber-400 font-semibold">{totalConversions}</span>
          <span>conversions logged</span>
        </div>
      </div>

      {/* Metric 3: Learning Verification Rate */}
      <div id="stat-learning" className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-400/50 transition-all duration-300">
        <div className="absolute -top-3 -right-3 p-3 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-transform duration-300">
          <Award className="w-24 h-24 text-white" />
        </div>
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-900/30 text-amber-400">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-zinc-400 text-xs font-mono uppercase tracking-wider font-semibold">Verified Ad Learning</span>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold font-display text-amber-400">{verifiedPercentage}%</span>
          <span className="text-xs text-zinc-500 font-mono">of ads</span>
        </div>
        <div className="mt-4 text-xs text-zinc-400 font-mono">
          <span className="text-amber-400 font-semibold">{verifiedCount} of {variations.length}</span> ads run 2+ wks
        </div>
      </div>

      {/* Metric 4: Meta Significance Badge */}
      <div id="stat-significance" className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-400/50 transition-all duration-300">
        <div className="absolute -top-3 -right-3 p-3 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-transform duration-300">
          <BookOpen className="w-24 h-24 text-white" />
        </div>
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-amber-400 transition-colors">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-zinc-400 text-xs font-mono uppercase tracking-wider font-semibold">Algorithmic Status</span>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-lg font-bold font-display text-zinc-100">
            {verifiedPercentage >= 66 ? "High Trust" : verifiedPercentage >= 33 ? "Developing" : "Low Trust"}
          </span>
        </div>
        <div className="mt-4 text-xs text-zinc-400 leading-tight">
          {verifiedPercentage >= 66 
            ? "Data is statistically complete for AI." 
            : "More mature references recommended."}
        </div>
      </div>
    </div>
  );
}
