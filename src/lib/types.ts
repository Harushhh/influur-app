export type Role = 'MARKETER' | 'INFLUENCER'
export type OptInStatus = 'PENDING' | 'INTERESTED' | 'DECLINED' | 'UNLOCKED'
export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED'
export type CampaignStatus = 'DRAFT' | 'SENT' | 'FAILED'

export interface InfluencerProfile {
  handle: string
  name: string
  avatarUrl: string
  bio: string
  niche: string[]
  isVerified: boolean
  followerCount: number
  followingCount: number
  postCount: number
  engagementRate: number
  avgLikes: number
  avgComments: number
  avgShares: number
  estimatedReach: number
  influenceScore: number
  audienceGeo: { country: string; pct: number }[]
  audienceAge: { range: string; pct: number }[]
  audienceGender: { male: number; female: number; other: number }
  followerGrowth: { month: string; count: number }[]
  recentPosts: RecentPost[]
  brandSafety: 'HIGH' | 'MEDIUM' | 'LOW'
  estimatedCPM: number
  estimatedCPE: number
}

export interface RecentPost {
  id: string
  type: 'REEL' | 'PHOTO' | 'CAROUSEL' | 'STORY'
  thumbnailUrl: string
  caption: string
  likes: number
  comments: number
  shares: number
  engagementRate: number
  postedAt: string
}

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
}

export interface RateCard {
  feedPost: number
  reel: number
  story: number
  ugcOnly: number
}

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
}

export interface ScheduledPostItem {
  id: string
  caption: string
  mediaUrls: string[]
  hashtags: string[]
  platform: string
  status: PostStatus
  scheduledAt: string
  aiGenerated: boolean
}

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
}

export interface AIAnalysis {
  summary: string
  brandFitScore: number
  topStrengths: string[]
  risks: string[]
  recommendedBudget: string
  contentSuggestions: string[]
}
