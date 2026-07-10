import { RecommendedAd } from "../types";
import { Copy, Check, Trash2, Bookmark } from "lucide-react";
import { useState } from "react";

interface SavedScriptsProps {
  scripts: RecommendedAd[];
  onDeleteScript: (idx: number) => void;
  onClearAll: () => void;
}

export default function SavedScripts({ scripts, onDeleteScript, onClearAll }: SavedScriptsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  if (scripts.length === 0) {
    return (
      <div id="saved-scripts-empty" className="bg-zinc-950 border border-zinc-850 rounded-2xl p-16 text-center max-w-xl mx-auto my-12 shadow-2xl">
        <Bookmark className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold font-display text-zinc-100 mb-2">No Saved Creative Scripts Yet</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Once you analyze your past ad variations, use the bookmark icon on any recommendation card to save it in your private library.
        </p>
      </div>
    );
  }

  return (
    <div id="saved-scripts-container" className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-zinc-100 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" /> Bookmarked Ad Assets ({scripts.length})
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Copy specific components directly to your Facebook Ads Manager.
          </p>
        </div>
        <button 
          onClick={onClearAll}
          className="text-xs font-mono font-medium text-red-400 hover:text-red-300 border border-red-950/40 bg-red-950/20 px-4 py-2 rounded-xl hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
        >
          Clear All Bookmarks
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {scripts.map((script, idx) => (
          <div 
            key={idx}
            className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 shadow-xl hover:border-amber-400/30 transition-all duration-300 relative group"
          >
            <div className="flex justify-between items-start mb-5 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-semibold tracking-wider text-amber-400 uppercase bg-amber-950/30 border border-amber-900/40 px-2.5 py-0.5 rounded-full">
                  {script.trend}
                </span>
                <h4 className="text-base font-bold font-display text-zinc-100 mt-1.5 leading-tight">{script.name}</h4>
              </div>
              <button 
                onClick={() => onDeleteScript(idx)}
                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                title="Remove bookmark"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Assets Stack */}
            <div className="space-y-5">
              {/* Hook Copy */}
              <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-850 relative group/row">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">Hook script (first 3s)</span>
                  <button 
                    onClick={() => handleCopy(script.hook, `saved-${idx}-hook`)}
                    className="text-[10px] font-mono text-amber-400 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center gap-1 hover:text-amber-300 cursor-pointer"
                  >
                    {copiedKey === `saved-${idx}-hook` ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === `saved-${idx}-hook` ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-sm font-medium text-zinc-100 italic leading-relaxed">&ldquo;{script.hook}&rdquo;</p>
              </div>

              {/* Body Copy */}
              <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-850 relative group/row">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">Primary ad body copy</span>
                  <button 
                    onClick={() => handleCopy(script.body, `saved-${idx}-body`)}
                    className="text-[10px] font-mono text-amber-400 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center gap-1 hover:text-amber-300 cursor-pointer"
                  >
                    {copiedKey === `saved-${idx}-body` ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === `saved-${idx}-body` ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">{script.body}</p>
              </div>

              {/* CTA & Art Direction Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/20 p-3.5 rounded-xl border border-zinc-850">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Suggested CTA</span>
                  <span className="text-xs font-bold text-amber-400 block mt-1">{script.cta}</span>
                </div>
                <div className="bg-zinc-900/20 p-3.5 rounded-xl border border-zinc-850">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Visual Style</span>
                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{script.visualStyle}</p>
                </div>
              </div>

              {/* Strategic Backing */}
              <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl text-xs text-zinc-100 leading-relaxed">
                <span className="font-semibold text-amber-400 block mb-1">Strategic Rationale:</span> {script.rationale}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
