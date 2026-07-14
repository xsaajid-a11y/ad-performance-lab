import React, { useState } from "react";
import { 
  Search, 
  Tv, 
  Play, 
  Heart, 
  MessageSquare, 
  Share2, 
  X, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  Sparkles,
  Flame
} from "lucide-react";
import { ReelsInspirationVideo } from "../types";

export default function ReelsInspirationFinder() {
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [videos, setVideos] = useState<ReelsInspirationVideo[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [trainingVideoIds, setTrainingVideoIds] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Trigger n8n Search Webhook
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // POST the raw keyword JSON string as requested: "the word the user typed"
      const response = await fetch("https://elvazagroup.app.n8n.cloud/webhook-test/b3f5aed7-9583-48e6-ba74-3af4dc35696a", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(keyword.trim())
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      // Robustly handle different response formats (array vs nested object)
      let list: ReelsInspirationVideo[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && typeof data === "object") {
        list = data.results || data.data || data.videos || (data.keyword ? [] : Object.values(data));
      }

      setVideos(list || []);
      setShowModal(true);
    } catch (err: any) {
      console.error("Inspiration Finder error:", err);
      setErrorMsg("Failed to retrieve viral concepts. Please ensure the webhook is active and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger n8n Action Logic Webhook
  const handleTrainAI = async (video: ReelsInspirationVideo) => {
    const videoId = video.video_id || video.id || "unknown_id";
    
    // Prevent duplicate clicks
    if (trainingVideoIds.has(videoId)) return;

    // Immediately show brief, elegant success toast message
    showToast("Training in Process");

    // Optimistically add to training list
    setTrainingVideoIds(prev => {
      const next = new Set(prev);
      next.add(videoId);
      return next;
    });

    try {
      const payload = {
        action: "save_and_process",
        video_id: videoId,
        username: video.username || video.user || "anonymous_creator",
        thumbnail_url: video.thumbnail_url || "",
        video_url: video.video_url || "",
        play_count: video.ig_play_count || video.play_count || 0,
        like_count: video.like_count || 0,
        share_count: video.share_count || 0
      };

      const response = await fetch("https://elvazagroup.app.n8n.cloud/webhook-test/b3f5aed7-9583-48e6-ba74-3af4dc35696a", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to post training action");
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

  // Human readable stats formatter
  const formatCount = (num: number | undefined): string => {
    if (num === undefined || num === null) return "0";
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="w-full space-y-6">
      {/* HEADER BAR */}
      <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/20">
          <Flame className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-100 font-display">Reels & TikTok Inspiration Finder</h2>
          <p className="text-xs text-zinc-400">Query live viral video assets directly from active competitor logs</p>
        </div>
      </div>

      {/* SEARCH SECTION - CENTERED & MODERN */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 lg:p-12 shadow-3xl relative overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full space-y-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">LIVE VIRAL RETRIEVAL</span>
            <h3 className="text-xl font-bold text-zinc-100 font-display tracking-tight">Discover Winning Hook Concepts</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter any product niche, topic, or competitor keywords to fetch high-performance creative references for Reels, Shorts, and TikTok campaigns.
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. ice face serum, eco tumbler, activewear squat check"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500/50 rounded-2xl pl-11 pr-4 py-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !keyword.trim()}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mx-auto shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Searching Live Logs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Find Viral Concepts</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs text-red-400 font-mono bg-red-950/20 border border-red-900/30 py-2.5 px-4 rounded-xl">
              {errorMsg}
            </p>
          )}
        </div>
      </div>

      {/* VIRAL CONCEPTS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-900 rounded-3xl shadow-3xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-900">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20">
                  <Flame className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 font-display">Viral Concepts Found</h3>
                  <p className="text-[11px] text-zinc-400">Discovered {videos.length} performance references for &ldquo;{keyword}&rdquo;</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {videos.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Tv className="w-12 h-12 text-zinc-700 mx-auto" />
                  <p className="text-sm text-zinc-400">No active campaign assets matched your precise keyphrase on n8n servers.</p>
                  <p className="text-xs text-zinc-500">Try searching for other performance categories or broaden your keyword.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video, idx) => {
                    const videoId = video.video_id || video.id || `video_${idx}`;
                    const username = video.username || video.user || "anonymous";
                    const isTraining = trainingVideoIds.has(videoId);

                    return (
                      <div 
                        key={videoId}
                        className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-blue-500/20 transition-all duration-200"
                      >
                        {/* Interactive Thumbnail */}
                        <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                          {video.thumbnail_url ? (
                            <img 
                              src={video.thumbnail_url} 
                              alt={`Thumbnail by ${username}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                // Fallback if image fails to load
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                              <Tv className="w-8 h-8 text-zinc-800" />
                            </div>
                          )}
                          
                          {/* Play Overlay */}
                          {video.video_url && (
                            <a 
                              href={video.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200"
                            >
                              <div className="p-3 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-200">
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              </div>
                            </a>
                          )}
                        </div>

                        {/* Content Area */}
                        <div className="p-4 space-y-4 flex-grow flex flex-col justify-between">
                          <div>
                            {/* Creator Username */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-zinc-100 font-mono tracking-tight hover:text-blue-400 transition-colors">
                                @{username}
                              </span>
                              {video.video_url && (
                                <a 
                                  href={video.video_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-zinc-500 hover:text-zinc-300"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>

                            {/* Performance Stats Row */}
                            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-900/80">
                              <div className="flex flex-col items-center justify-center bg-zinc-950/40 py-2 rounded-xl border border-zinc-900/30">
                                <Play className="w-3.5 h-3.5 text-blue-400 mb-1" />
                                <span className="text-[10px] font-mono text-zinc-100 font-bold">
                                  {formatCount(video.ig_play_count || video.play_count)}
                                </span>
                                <span className="text-[8px] font-mono text-zinc-500 uppercase">Plays</span>
                              </div>
                              <div className="flex flex-col items-center justify-center bg-zinc-950/40 py-2 rounded-xl border border-zinc-900/30">
                                <Heart className="w-3.5 h-3.5 text-rose-400 mb-1" />
                                <span className="text-[10px] font-mono text-zinc-100 font-bold">
                                  {formatCount(video.like_count)}
                                </span>
                                <span className="text-[8px] font-mono text-zinc-500 uppercase">Likes</span>
                              </div>
                              <div className="flex flex-col items-center justify-center bg-zinc-950/40 py-2 rounded-xl border border-zinc-900/30">
                                <Share2 className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                                <span className="text-[10px] font-mono text-zinc-100 font-bold">
                                  {formatCount(video.share_count)}
                                </span>
                                <span className="text-[8px] font-mono text-zinc-500 uppercase">Shares</span>
                              </div>
                            </div>
                          </div>

                          {/* Training Action Button */}
                          <div className="pt-3">
                            <button
                              onClick={() => handleTrainAI(video)}
                              className={`w-full py-2.5 px-4 font-bold rounded-xl text-[11px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                                isTraining 
                                  ? "bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed" 
                                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/20 hover:shadow-blue-900/30"
                              }`}
                            >
                              {isTraining ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                                  <span>Training Initiated</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-white" />
                                  <span>Train my AI with this</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 bg-zinc-950/60 border-t border-zinc-900 flex justify-end">
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

      {/* FLOATABLE SUCCESS TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-5 py-3.5 rounded-2xl shadow-3xl border border-blue-500 flex items-center gap-3 animate-fade-in-up">
          <div className="p-1 bg-white/20 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold font-mono tracking-wide uppercase">Training in Process</p>
            <p className="text-[10px] text-blue-100 mt-0.5">n8n is parsing performance signals...</p>
          </div>
        </div>
      )}
    </div>
  );
}
