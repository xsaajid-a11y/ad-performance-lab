import React, { useState } from "react";
import { 
  Tv, 
  Play, 
  Heart, 
  MessageSquare, 
  X, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  Flame,
  ChevronRight,
  Database
} from "lucide-react";
import { supabase } from "../lib/supabase";

// =========================================================================
// EASY EXTENSION SYSTEM FOR NICHES & TABLES
// To add new niches, simply append an object to this NICHE_OPTIONS array.
// The system will automatically build the UI selector and query the 
// matching table on Supabase dynamically!
// =========================================================================
export interface NicheOption {
  id: string;
  name: string;
  tableName: string;
}

export const NICHE_OPTIONS: NicheOption[] = [
  { 
    id: "meta_ads", 
    name: "Meta Ad Leads", 
    tableName: "meta_ads" 
  },
  // ADD MORE NICHES HERE IN THE FUTURE:
  // {
  //   id: "ecom_beauty",
  //   name: "E-Commerce Beauty",
  //   tableName: "ecom_beauty"
  // },
];

export interface ReelsInspirationVideo {
  id: string;
  video_id: string;
  username: string;
  thumbnail_url: string;
  video_url: string;
  post_url: string;
  play_count: number;
  like_count: number;
  comment_count: number;
  caption: string;
  formatted_views: string;
  formatted_likes: string;
  formatted_comments: string;
}

export default function ReelsInspirationFinder() {
  const [selectedNicheId, setSelectedNicheId] = useState<string>(NICHE_OPTIONS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [videos, setVideos] = useState<ReelsInspirationVideo[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [trainingVideoIds, setTrainingVideoIds] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Maintain separate offsets for each niche so users can paginate independently
  const [nicheOffsets, setNicheOffsets] = useState<Record<string, number>>({});

  // Helper to read current license key from localStorage for n8n processed webhooks
  const getLicenseKey = (): string => {
    try {
      const saved = localStorage.getItem("cl_license_obj");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.key || "";
      }
    } catch (e) {
      console.error("Error reading license key:", e);
    }
    return "";
  };

  // Helper to parse views/likes/comments metrics to integers safely
  const parseNumber = (val: any): number => {
    if (typeof val === "number") return val;
    if (!val) return 0;
    const clean = String(val).replace(/,/g, "");
    const num = parseInt(clean, 10);
    return isNaN(num) ? 0 : num;
  };

  // Helper to elegantly format views/likes/comments (e.g. 1.2M, 45.2K)
  const formatDisplayValue = (val: any): string => {
    if (val === undefined || val === null) return "0";
    const str = String(val).trim();
    if (/[a-zA-Z]/.test(str)) return str; // if already formatted
    
    const num = Number(str.replace(/,/g, ""));
    if (isNaN(num)) return str;
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  // Fetch the next 10 items for the selected niche
  const handleFindInspiration = async () => {
    const selectedNiche = NICHE_OPTIONS.find(n => n.id === selectedNicheId);
    if (!selectedNiche) {
      setErrorMsg("Selected niche is invalid.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const currentOffset = nicheOffsets[selectedNiche.id] || 0;

      // 1. Query the selected table from Supabase using range pagination (10 rows)
      const { data, error, count } = await supabase
        .from(selectedNiche.tableName)
        .select("*", { count: "exact" })
        .range(currentOffset, currentOffset + 9);

      if (error) {
        throw error;
      }

      let fetchedRows = data || [];

      // 2. Wrap-around behavior: if no more rows are returned, reset offset to 0 and query again
      if (fetchedRows.length === 0 && currentOffset > 0) {
        const wrapRes = await supabase
          .from(selectedNiche.tableName)
          .select("*", { count: "exact" })
          .range(0, 9);

        if (wrapRes.error) {
          throw wrapRes.error;
        }

        fetchedRows = wrapRes.data || [];
        
        // Update offset state to wrap around for next run
        const totalCount = wrapRes.count || fetchedRows.length;
        const nextOffset = (totalCount && 10 >= totalCount) ? 0 : 10;
        setNicheOffsets(prev => ({
          ...prev,
          [selectedNiche.id]: nextOffset
        }));
      } else {
        // Increment the offset by 10 for subsequent fetches. If we reached the end, reset to 0.
        const totalCount = count || fetchedRows.length;
        const nextOffset = (totalCount && currentOffset + 10 >= totalCount) ? 0 : currentOffset + 10;
        setNicheOffsets(prev => ({
          ...prev,
          [selectedNiche.id]: nextOffset
        }));
      }

      // 3. Map database rows to local schema
      const mappedVideos: ReelsInspirationVideo[] = fetchedRows.map((row: any, index: number) => ({
        id: row.id || `row_${currentOffset + index}`,
        video_id: row.id || `row_${currentOffset + index}`,
        username: row.username || "anonymous",
        thumbnail_url: row.thumbnail_url || "",
        video_url: row.post_url || row.video_url || "#",
        post_url: row.post_url || row.video_url || "#",
        play_count: parseNumber(row.views),
        like_count: parseNumber(row.likes),
        comment_count: parseNumber(row.comments),
        caption: row.caption || "",
        formatted_views: formatDisplayValue(row.views),
        formatted_likes: formatDisplayValue(row.likes),
        formatted_comments: formatDisplayValue(row.comments),
      }));

      setVideos(mappedVideos);
      setShowModal(true);
    } catch (err: any) {
      console.error("Inspiration Finder database error:", err);
      setErrorMsg(`Failed to retrieve creative assets from "${selectedNiche.tableName}" table: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Optional n8n processed hook integration
  const handleTrainAI = async (video: ReelsInspirationVideo) => {
    const videoId = video.video_id;
    if (trainingVideoIds.has(videoId)) return;

    showToast("Training in Process");

    setTrainingVideoIds(prev => {
      const next = new Set(prev);
      next.add(videoId);
      return next;
    });

    try {
      const payload = {
        action: "save_and_process",
        video_id: video.video_id,
        username: video.username,
        thumbnail_url: video.thumbnail_url,
        video_url: video.post_url,
        post_url: video.post_url,
        play_count: video.play_count,
        like_count: video.like_count,
        comment_count: video.comment_count,
        caption: video.caption,
        license_key: getLicenseKey()
      };

      const response = await fetch("https://elvazagroup.app.n8n.cloud/webhook-test/b3f5aed7-9583-48e6-ba74-3af4dc35696a", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Webhook failed");
      }
    } catch (err) {
      console.error("Failed to train AI with selected video:", err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const currentNiche = NICHE_OPTIONS.find(n => n.id === selectedNicheId);
  const currentOffsetVal = nicheOffsets[selectedNicheId] || 0;

  return (
    <div className="w-full space-y-6">
      {/* HEADER BAR */}
      <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-yellow-600/20 border border-amber-500/20">
          <Flame className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-100 font-display">Reels & TikTok Inspiration Finder</h2>
          <p className="text-xs text-zinc-400">Fetch proven, top-performing marketing hooks and creative references from database logs</p>
        </div>
      </div>

      {/* SECURE DATABASE FINDER SECTION */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 lg:p-12 shadow-3xl relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full space-y-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold flex items-center justify-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Verified Database Integration
            </span>
            <h3 className="text-xl font-bold text-zinc-100 font-display tracking-tight">Access Viral Content Vault</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Select your marketing niche category below. The system fetches exactly 10 high-performance ads from the connected Supabase table and iterates to the next batch on each click.
            </p>
          </div>

          <div className="w-full space-y-4">
            {/* Dropdown Selector */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider">
                Select Niche Option
              </label>
              <div className="relative">
                <select
                  value={selectedNicheId}
                  onChange={(e) => setSelectedNicheId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-100 text-xs rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all cursor-pointer font-sans appearance-none"
                >
                  {NICHE_OPTIONS.map((niche) => (
                    <option key={niche.id} value={niche.id} className="bg-zinc-950 text-zinc-100">
                      {niche.name} (Table: {niche.tableName})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Pagination / Offset Metadata Indicator */}
            <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-850 px-4 py-2.5 rounded-xl text-[11px] font-mono text-zinc-400">
              <span>Next starting offset:</span>
              <span className="text-amber-400 font-bold">Row #{currentOffsetVal}</span>
            </div>

            <button
              onClick={handleFindInspiration}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 disabled:text-zinc-650 text-zinc-950 font-bold rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mx-auto shadow-lg shadow-amber-900/10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Loading Row #{currentOffsetVal} - #{currentOffsetVal + 9}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  <span>Fetch Inspirations #{currentOffsetVal + 1} - #{currentOffsetVal + 10}</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 font-mono bg-red-950/15 border border-red-900/30 py-2.5 px-4 rounded-xl">
              {errorMsg}
            </p>
          )}
        </div>
      </div>

      {/* HIGH CONVERTING CONCEPTS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-900 rounded-3xl shadow-3xl flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-900 bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 font-display">Viral Creative Assets ({currentNiche?.name})</h3>
                  <p className="text-[11px] text-zinc-500">Showing rows {Math.max(0, currentOffsetVal - 10) + 1} to {Math.max(0, currentOffsetVal - 10) + videos.length} from {currentNiche?.tableName}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Grid Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-950/40">
              {videos.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Tv className="w-12 h-12 text-zinc-800 mx-auto" />
                  <p className="text-sm text-zinc-400">No active assets could be retrieved from Supabase table &ldquo;{currentNiche?.tableName}&rdquo;</p>
                  <p className="text-xs text-zinc-500">Please make sure the table has active records and is configured correctly.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videos.map((video) => {
                    const isTraining = trainingVideoIds.has(video.video_id);
                    return (
                      <InspirationCard 
                        key={video.video_id}
                        video={video}
                        isTraining={isTraining}
                        onTrain={handleTrainAI}
                      />
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-900 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-medium px-5 py-2.5 rounded-xl text-xs font-mono transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-400 text-zinc-950 px-5 py-3.5 rounded-2xl shadow-3xl border border-amber-300/40 flex items-center gap-3 animate-fade-in-up">
          <div className="p-1 bg-zinc-950/10 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-zinc-950" />
          </div>
          <div>
            <p className="text-xs font-bold font-mono tracking-wide uppercase">Training in Process</p>
            <p className="text-[10px] text-zinc-800 mt-0.5">n8n is parsing performance signals with your license...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SELF-CONTAINED INSPIRATION CARD COMPONENT
// Each card manages its own collapsable "Show Caption" toggle state
// =========================================================================
interface InspirationCardProps {
  video: ReelsInspirationVideo;
  isTraining: boolean;
  onTrain: (video: ReelsInspirationVideo) => void;
}

const InspirationCard: React.FC<InspirationCardProps> = ({ video, isTraining, onTrain }) => {
  const [showCaption, setShowCaption] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden flex flex-col hover:border-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-950/5">
      
      {/* Clickable Thumbnail (opens post_url in a new tab) */}
      <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden border-b border-zinc-900">
        {video.thumbnail_url ? (
          <a 
            href={video.post_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full relative group/thumb cursor-pointer animate-fade-in"
          >
            <img 
              src={video.thumbnail_url} 
              alt={video.username}
              className="w-full h-full object-cover group-hover/thumb:scale-[1.03] transition-transform duration-500"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // High contrast backup aesthetic image if thumbnail fails
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60";
              }}
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity duration-300">
              <div className="p-3 rounded-full bg-amber-400 text-zinc-950 shadow-2xl flex items-center justify-center transform scale-90 group-hover/thumb:scale-100 transition-transform duration-300">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
            {/* Direct Badge */}
            <div className="absolute bottom-2 right-2 bg-zinc-950/90 border border-zinc-800 backdrop-blur-md text-[8px] font-mono px-2 py-0.5 rounded text-zinc-400 tracking-wider">
              OPEN ORIGIN POST
            </div>
          </a>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-950">
            <Tv className="w-8 h-8 text-zinc-800 animate-pulse" />
          </div>
        )}
      </div>

      {/* Stats and Content Details */}
      <div className="p-5 flex-grow flex flex-col justify-between gap-4">
        <div className="space-y-3">
          {/* Creator Information & Target Header */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-bold text-zinc-200 tracking-tight leading-snug">
                Meta Ad Variation
              </h4>
              <p className="text-xs font-semibold text-amber-400 font-mono mt-0.5">
                @{video.username}
              </p>
            </div>
            {video.post_url && (
              <a 
                href={video.post_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-amber-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-all"
                title="Go to original post"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Core Performance metrics map from: views, likes, comments */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="flex flex-col items-center justify-center bg-amber-500/5 border border-amber-500/10 rounded-xl py-2 px-1">
              <Play className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
              <span className="text-xs font-extrabold text-amber-400 font-mono">
                {video.formatted_views || "0"}
              </span>
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Views</span>
            </div>

            <div className="flex flex-col items-center justify-center bg-zinc-950/60 border border-zinc-850 rounded-xl py-2 px-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 mb-0.5" />
              <span className="text-xs font-bold text-zinc-200 font-mono">
                {video.formatted_likes || "0"}
              </span>
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Likes</span>
            </div>

            <div className="flex flex-col items-center justify-center bg-zinc-950/60 border border-zinc-850 rounded-xl py-2 px-1">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400 mb-0.5" />
              <span className="text-xs font-bold text-zinc-200 font-mono">
                {video.formatted_comments || "0"}
              </span>
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Comments</span>
            </div>
          </div>

          {/* Show / Hide Caption Drawer */}
          <div className="pt-1.5">
            <button
              type="button"
              onClick={() => setShowCaption(!showCaption)}
              className="w-full text-center py-1.5 px-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-[10px] font-mono font-bold text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer"
            >
              {showCaption ? "Hide Caption" : "Show Caption"}
            </button>
            {showCaption && (
              <div className="mt-2 p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-400 leading-relaxed font-sans max-h-32 overflow-y-auto scrollbar-thin select-text">
                {video.caption ? video.caption : <span className="text-zinc-650 italic">No caption text found.</span>}
              </div>
            )}
          </div>
        </div>

        {/* Action button to trigger n8n processor */}
        <div className="pt-3 border-t border-zinc-900">
          <button
            onClick={() => onTrain(video)}
            className={`w-full py-2.5 px-4 font-bold rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              isTraining 
                ? "bg-zinc-800/80 text-zinc-500 border border-zinc-750/50 cursor-not-allowed" 
                : "bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-md hover:shadow-lg active:scale-[0.99]"
            }`}
          >
            {isTraining ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Training Initiated</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-zinc-950 animate-pulse" />
                <span>Train my AI with this</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
