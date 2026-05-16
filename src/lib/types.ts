// ─── Enums & Unions ───────────────────────────────────────────────────────────

export type Role           = 'MARKETER' | 'INFLUENCER'
export type OptInStatus    = 'PENDING' | 'INTERESTED' | 'DECLINED' | 'UNLOCKED'
export type PostStatus     = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED'
export type CampaignStatus = 'DRAFT' | 'SENT' | 'FAILED'

export type Platform       = 'Instagram' | 'YouTube' | 'LinkedIn'
export type InfluencerTier = 'Nano' | 'Micro' | 'Mid-Tier' | 'Macro' | 'Mega'
export type BrandSafety    = 'HIGH' | 'MEDIUM' | 'LOW'
export type PostType       = 'REEL' | 'PHOTO' | 'CAROUSEL' | 'STORY' | 'VIDEO'
export type GenderType     = 'MALE' | 'FEMALE' | 'OTHER'
export type AIChatMode     = 'analyze' | 'compose_email' | 'suggest_caption' | 'chat' | 'brand_fit'

// ─── Audience Breakdown ───────────────────────────────────────────────────────

export interface AudienceGeo {
  country: string
  pct: number
}

export interface AudienceAge {
  range: string
  pct: number
}

export interface AudienceGender {
  male: number
  female: number
  other: number
}

// ─── Recent Post ──────────────────────────────────────────────────────────────

export interface RecentPost {
  id: string
  type: PostType
  thumbnailUrl: string
  caption: string
  likes: number
  comments: number
  shares: number
  engagementRate: number
  postedAt: string
  // YouTube-specific
  viewCount?: number
  duration?: string              // ISO 8601, e.g. "PT12M34S"
}

// ─── Platform-Specific Stats ─────────────────────────────────────────────────

export interface YouTubeStats {
  totalViews: number
  avgViewsPerVideo: number
  videoCount: number
}

export interface InstagramStats {
  credibilityScore: number        // 0–100 (inverse of fake followers %)
  fakeFollowerPercent: number     // 0–100
  qualityScore: number | null
}

// ─── Rate Card ────────────────────────────────────────────────────────────────

export interface RateCard {
  feedPost: number                // ₹
  reel: number
  story: number
  ugcOnly: number
  youtubeIntegration?: number     // ₹ for YouTube integration segment
  youtubeDedicated?: number       // ₹ for dedicated YouTube video
  linkedInPost?: number           // ₹ for LinkedIn post
}

// ─── Core Influencer Profile ──────────────────────────────────────────────────

export interface InfluencerProfile {
  // ── Identity ───────────────────────────────────────────────────────────────
  handle: string
  name: string
  avatarUrl: string
  bio: string
  niche: string[]                 // e.g. ['Cricket', 'Finance/FIRE']
  isVerified: boolean

  // ── Platform & Tier ────────────────────────────────────────────────────────
  platform?: Platform
  tier?: InfluencerTier

  // ── Core Stats ─────────────────────────────────────────────────────────────
  followerCount: number
  followingCount: number
  postCount: number
  engagementRate: number          // percentage, e.g. 3.5
  avgLikes: number
  avgComments: number
  avgShares: number
  estimatedReach: number
  influenceScore: number          // 0–100

  // ── Audience ───────────────────────────────────────────────────────────────
  audienceGeo: AudienceGeo[]
  audienceAge: AudienceAge[]
  audienceGender: AudienceGender

  // ── Growth ─────────────────────────────────────────────────────────────────
  followerGrowth: { month: string; count: number }[]

  // ── Content ────────────────────────────────────────────────────────────────
  recentPosts: RecentPost[]

  // ── Pricing (₹) ────────────────────────────────────────────────────────────
  brandSafety: BrandSafety
  estimatedCPM: number            // Cost per 1,000 impressions
  estimatedCPE: number            // Cost per engagement

  // ── AI Brand Fit ───────────────────────────────────────────────────────────
  brandFitScore?: number          // 0–100
  brandFitSummary?: string
  brandFitStrengths?: string[]
  brandFitRisks?: string[]

  // ── Platform-Specific Stats ────────────────────────────────────────────────
  youtubeStats?: YouTubeStats
  instagramStats?: InstagramStats

  // ── India-Specific ────────────────────────────────────────────────────────
  languages?: string[]            // e.g. ['Hindi', 'English']
  city?: string                   // e.g. 'Mumbai'
  state?: string                  // e.g. 'Maharashtra'
}

// ─── Saved Influencer (CRM) ───────────────────────────────────────────────────

export interface SavedInfluencer {
  id: string
  influencer: InfluencerProfile & {
    phone?: string
    personalEmail?: string
    rateCard?: RateCard
  }
  optInStatus: OptInStatus
  isUnlocked: boolean
  savedAt: string
  notes?: string
  tags: string[]
  campaignId?: string
  lastContactedAt?: string
  negotiatedRate?: number         // ₹ — final agreed rate
}

// ─── Influencer Dashboard Data ────────────────────────────────────────────────

export interface InfluencerDashboardData {
  reach: number
  impressions: number
  profileViews: number
  websiteClicks: number
  reachGrowth: number
  impressionsGrowth: number
  scheduledPosts: ScheduledPostItem[]
  recentInsights: { date: string; reach: number; impressions: number }[]
  topPosts: RecentPost[]
  estimatedEarningsThisMonth?: number   // ₹
  activeCollabs?: number
}

// ─── Scheduled Post ───────────────────────────────────────────────────────────

export interface ScheduledPostItem {
  id: string
  caption: string
  mediaUrls: string[]
  hashtags: string[]
  platform: Platform
  status: PostStatus
  scheduledAt: string
  aiGenerated: boolean
  type?: PostType
  estimatedReach?: number
}

// ─── Email Campaign ───────────────────────────────────────────────────────────

export interface EmailCampaign {
  id: string
  subject: string
  bodyHtml: string
  bodyText: string
  status: CampaignStatus
  recipientCount: number
  openCount: number
  replyCount: number
  sentAt?: string
  aiGenerated: boolean
  campaignName?: string
  targetNiche?: string[]
  targetTier?: InfluencerTier[]
  estimatedBudget?: number        // ₹
}

// ─── AI Analysis (legacy — kept for backward compat) ─────────────────────────

export interface AIAnalysis {
  summary: string
  brandFitScore: number
  topStrengths: string[]
  risks: string[]
  recommendedBudget: string
  contentSuggestions: string[]
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export interface AIChatMessage {
  role: 'user' | 'assistant'
  content: string
  mode?: AIChatMode
  timestamp?: string
}

// ─── Campaign (Full) ──────────────────────────────────────────────────────────

export interface Campaign {
  id: string
  name: string
  brand: string
  budget: number                  // ₹
  startDate: string
  endDate: string
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'PAUSED'
  influencers: string[]           // array of handles
  deliverables: string
  notes?: string
  createdAt: string
  platform?: Platform[]
  targetNiche?: string[]
  targetTier?: InfluencerTier[]
}

// ─── Outreach Record ──────────────────────────────────────────────────────────

export interface OutreachRecord {
  id: string
  influencerHandle: string
  subject: string
  body: string
  sentAt: string
  status: 'SENT' | 'OPENED' | 'REPLIED' | 'BOUNCED'
  campaignId?: string
}

// ─── India Niche Tags (use across UI dropdowns & filters) ─────────────────────

export const INDIA_NICHES = [
  'Cricket',
  'Bollywood',
  'Finance/FIRE',
  'UPSC/Education',
  'Food/Recipes',
  'Yoga/Wellness',
  'Tech/Startups',
  'Devotional',
  'Regional',
  'Fashion',
  'Beauty',
  'Gaming',
  'Travel',
  'Parenting',
  'Comedy',
  'News/Politics',
  'Automotive',
  'Real Estate',
] as const

export type IndiaNiche = (typeof INDIA_NICHES)[number]

// ─── Tier Ranges (use in filters & pricing UI) ────────────────────────────────

export const TIER_RANGES: Record<InfluencerTier, { min: number; max: number; label: string }> = {
  'Nano':     { min: 0,         max: 10_000,    label: '< 10K'       },
  'Micro':    { min: 10_000,    max: 100_000,   label: '10K – 100K'  },
  'Mid-Tier': { min: 100_000,   max: 500_000,   label: '100K – 500K' },
  'Macro':    { min: 500_000,   max: 1_000_000, label: '500K – 1M'   },
  'Mega':     { min: 1_000_000, max: Infinity,  label: '1M+'         },
}