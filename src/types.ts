export interface AdVariation {
  id: string;
  name: string;
  niche: string;
  hook: string;
  body: string;
  cta: string;
  visualStyle: string;
  trend: string;
  ctr: number; // CTR as percentage (e.g., 2.45)
  conversions: number;
  spend: number; // Spend in USD
  days: number; // Duration in days
  impressions: number;
  headline?: string;
  reelBodyDescription?: string;
  reelCtaDescription?: string;
  adType?: string; // "video" | "carousel" | "static_image"
}

export interface ViralInspiration {
  id: string;
  niche: string;
  title: string;
  hook: string;
  body: string;
  cta: string;
  description: string; // Describe why it did well or its staging
  views?: string;       // e.g. "1.5M" (optional)
  likes?: string;       // e.g. "95k" (optional)
}

export interface StrategicAnalysis {
  keyFindings: string[];
  underperformingElements: string[];
  winningAngles: string[];
}

export interface RecommendedAd {
  name: string;
  hook: string;
  body: string;
  cta: string;
  visualStyle: string;
  trend: string;
  rationale: string;
}

export interface OptimizationResult {
  analysis: StrategicAnalysis;
  recommendations: RecommendedAd[];
}

export interface NicheTemplate {
  id: string;
  name: string;
  description: string;
  preloadedVariations: AdVariation[];
}

export interface ReelsInspirationVideo {
  id?: string;
  video_id?: string;
  user?: string;
  username?: string;
  thumbnail_url?: string;
  video_url?: string;
  ig_play_count?: number;
  play_count?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
}

