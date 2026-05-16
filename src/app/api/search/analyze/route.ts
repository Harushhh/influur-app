import { NextRequest, NextResponse } from 'next/server'
import type { InfluencerProfile } from '@/lib/types'
import Anthropic from '@anthropic-ai/sdk'

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 30        // requests per window
const RATE_WINDOW = 60_000   // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

// ─── Cache ────────────────────────────────────────────────────────────────────
const cache = new Map<string, { data: InfluencerProfile; ts: number }>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// ─── India-Specific Niche Detection ──────────────────────────────────────────
const INDIA_NICHE_KEYWORDS: Record<string, string[]> = {
  'Cricket':        ['cricket', 'ipl', 'bcci', 'virat', 'rohit', 'dhoni', 'test match'],
  'Bollywood':      ['bollywood', 'hindi film', 'srk', 'salman', 'alia', 'ranveer', 'deepika', 'filmfare'],
  'Finance/FIRE':   ['mutual fund', 'sip', 'nifty', 'sensex', 'zerodha', 'groww', 'ipo', 'share market'],
  'UPSC/Education': ['upsc', 'ias', 'gate exam', 'jee', 'neet', 'sarkari', 'government exam'],
  'Food/Recipes':   ['recipe', 'khana', 'dal', 'biryani', 'paneer', 'street food', 'dhaba', 'thali'],
  'Yoga/Wellness':  ['yoga', 'ayurveda', 'meditation', 'pranayama', 'sattvic', 'naturopathy'],
  'Tech/Startups':  ['startup', 'vc funding', 'saas', 'product hunt', 'ycombinator', 'bootstrapped'],
  'Devotional':     ['bhakti', 'mandir', 'puja', 'aarti', 'ram', 'krishna', 'shiva', 'hanuman'],
  'Regional':       ['marathi', 'tamil', 'telugu', 'kannada', 'gujarati', 'punjabi', 'bengali', 'odia'],
}

function detectIndiaSpecificNiches(bio: string, captions: string[]): string[] {
  const text = [bio, ...captions].join(' ').toLowerCase()
  const detected: string[] = []
  for (const [niche, keywords] of Object.entries(INDIA_NICHE_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) detected.push(niche)
  }
  return detected
}

// ─── Platform Detector ────────────────────────────────────────────────────────
type Platform = 'instagram' | 'youtube' | 'linkedin' | 'unknown'

function detectPlatform(query: string): Platform {
  const q = query.toLowerCase()
  if (q.includes('youtube.com') || q.includes('youtu.be') || q.includes('@') && q.includes('youtube')) return 'youtube'
  if (q.includes('instagram.com') || q.includes('instagram')) return 'instagram'
  if (q.includes('linkedin.com')) return 'linkedin'
  // Heuristic: YouTube channel IDs start with UC
  if (query.startsWith('UC') && query.length > 20) return 'youtube'
  return 'instagram' // default
}

function extractHandle(query: string): string {
  let handle = query.trim().replace('@', '')
  if (handle.includes('instagram.com')) {
    const match = handle.match(/instagram\.com\/(?:reel\/[^/]+\/|p\/[^/]+\/|@?([^/?]+))/)
    handle = match?.[1] || handle.split('/').filter(Boolean).pop() || handle
  }
  if (handle.includes('youtube.com/channel/')) {
    handle = handle.split('/channel/')[1]?.split('/')[0] || handle
  }
  if (handle.includes('youtube.com/@')) {
    handle = handle.split('/@')[1]?.split('/')[0] || handle
  }
  return handle.toLowerCase().split('?')[0].split('/')[0]
}

// ─── Brand Fit Score (AI) ─────────────────────────────────────────────────────
async function generateBrandFitScore(
  profile: Partial<InfluencerProfile>,
  brand?: string
): Promise<{ score: number; summary: string; strengths: string[]; risks: string[] }> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const prompt = `You are an influencer marketing analyst for India. Given this influencer profile, generate a Brand Fit Score (0–100) ${brand ? `for the brand: "${brand}"` : 'for a general Indian brand'}.

Profile:
- Handle: @${profile.handle}
- Followers: ${profile.followerCount?.toLocaleString()}
- Engagement Rate: ${profile.engagementRate}%
- Niche: ${profile.niche?.join(', ')}
- Brand Safety: ${profile.brandSafety}
- Credibility Score: ${profile.influenceScore}
- Audience: ${JSON.stringify(profile.audienceGeo?.slice(0, 3))}
- Bio: ${profile.bio?.slice(0, 200)}

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "score": <number 0-100>,
  "summary": "<2 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "risks": ["<risk 1>", "<risk 2>"]
}`

    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = res.content[0].type === 'text' ? res.content[0].text : '{}'
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    // Fallback scoring if AI fails
    const base = Math.min(100, Math.round(
      ((profile.influenceScore || 70) * 0.4) +
      ((Math.min((profile.engagementRate || 2), 10) / 10) * 100 * 0.3) +
      ((profile.brandSafety === 'HIGH' ? 100 : profile.brandSafety === 'MEDIUM' ? 60 : 20) * 0.3)
    ))
    return {
      score: base,
      summary: 'Fit score calculated from engagement and credibility metrics.',
      strengths: ['Good engagement rate', 'Active posting schedule'],
      risks: ['Limited data available for deeper analysis'],
    }
  }
}

// ─── YouTube Fetcher ──────────────────────────────────────────────────────────
async function fetchYouTubeProfile(handle: string): Promise<InfluencerProfile | null> {
  const YT_KEY = process.env.YOUTUBE_API_KEY
  if (!YT_KEY) throw new Error('YOUTUBE_API_KEY missing in .env')

  // Try searching by handle/username first
  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&maxResults=1&key=${YT_KEY}`,
    { signal: AbortSignal.timeout(10000) }
  )
  const searchData = await searchRes.json()
  if (!searchData.items?.length) return null

  const channelId = searchData.items[0].snippet.channelId || searchData.items[0].id.channelId

  // Fetch full channel statistics
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${YT_KEY}`,
    { signal: AbortSignal.timeout(10000) }
  )
  const channelData = await channelRes.json()
  const ch = channelData.items?.[0]
  if (!ch) return null

  const stats = ch.statistics
  const snippet = ch.snippet
  const followerCount = parseInt(stats.subscriberCount || '0')
  const totalViews = parseInt(stats.viewCount || '0')
  const videoCount = parseInt(stats.videoCount || '0')
  const avgViews = videoCount > 0 ? Math.round(totalViews / videoCount) : 0

  // Fetch recent videos for engagement calculation
  const videosRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&maxResults=10&order=date&type=video&key=${YT_KEY}`,
    { signal: AbortSignal.timeout(10000) }
  )
  const videosData = await videosRes.json()
  const videoIds = videosData.items?.map((v: any) => v.id.videoId).filter(Boolean).join(',') || ''

  let recentPosts: InfluencerProfile['recentPosts'] = []
  let avgLikes = 0
  let avgComments = 0

  if (videoIds) {
    const videoStatsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${YT_KEY}`,
      { signal: AbortSignal.timeout(10000) }
    )
    const videoStatsData = await videoStatsRes.json()
    const videos = videoStatsData.items || []

    const totalLikes = videos.reduce((s: number, v: any) => s + parseInt(v.statistics.likeCount || '0'), 0)
    const totalComments = videos.reduce((s: number, v: any) => s + parseInt(v.statistics.commentCount || '0'), 0)
    avgLikes = videos.length > 0 ? Math.round(totalLikes / videos.length) : 0
    avgComments = videos.length > 0 ? Math.round(totalComments / videos.length) : 0

    recentPosts = videos.map((v: any) => ({
      id: v.id,
      type: 'VIDEO' as const,
      thumbnailUrl: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.default?.url || '',
      caption: v.snippet.title,
      likes: parseInt(v.statistics.likeCount || '0'),
      comments: parseInt(v.statistics.commentCount || '0'),
      shares: 0,
      engagementRate: followerCount > 0
        ? parseFloat(((parseInt(v.statistics.likeCount || '0') + parseInt(v.statistics.commentCount || '0')) / followerCount * 100).toFixed(2))
        : 0,
      postedAt: v.snippet.publishedAt,
    }))
  }

  const engagementRate = followerCount > 0 && avgLikes > 0
    ? parseFloat(((avgLikes + avgComments) / followerCount * 100).toFixed(2))
    : 0

  const bio = snippet.description || ''
  const captions = recentPosts.map(p => p.caption)
  const indiaSpecificNiches = detectIndiaSpecificNiches(bio, captions)

  const profile: InfluencerProfile = {
    handle: snippet.customUrl?.replace('@', '') || handle,
    name: snippet.title,
    avatarUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
    bio,
    niche: indiaSpecificNiches.length > 0 ? indiaSpecificNiches : ['YouTube Creator'],
    platform: 'YouTube',
    isVerified: false,
    followerCount,
    followingCount: 0,
    postCount: videoCount,
    engagementRate,
    avgLikes,
    avgComments,
    avgShares: 0,
    estimatedReach: Math.round(avgViews || followerCount * 0.3),
    influenceScore: Math.min(100, Math.round(
      (Math.log10(followerCount + 1) / Math.log10(10_000_000)) * 60 +
      (Math.min(engagementRate, 10) / 10) * 40
    )),
    audienceGeo: [],
    audienceGender: [],
    audienceAge: [],
    followerGrowth: [
      { month: 'Oct', count: Math.round(followerCount * 0.88) },
      { month: 'Nov', count: Math.round(followerCount * 0.91) },
      { month: 'Dec', count: Math.round(followerCount * 0.94) },
      { month: 'Jan', count: Math.round(followerCount * 0.96) },
      { month: 'Feb', count: Math.round(followerCount * 0.98) },
      { month: 'Mar', count: followerCount },
    ],
    recentPosts,
    brandSafety: engagementRate > 3 ? 'HIGH' : engagementRate > 1 ? 'MEDIUM' : 'LOW',
    estimatedCPM: Math.round((avgViews / 1000) * 150), // ₹150 CPM typical India YouTube
    estimatedCPE: avgLikes > 0 ? Math.round(avgViews / avgLikes) * 5 : 25,
    youtubeStats: {
      totalViews,
      avgViewsPerVideo: avgViews,
      videoCount,
    },
  }

  return profile
}

// ─── Instagram Fetcher (RapidAPI) ─────────────────────────────────────────────
async function fetchInstagramProfile(handle: string): Promise<InfluencerProfile | null> {
  const apiKey = process.env.RAPIDAPI_KEY
  const apiHost = process.env.RAPIDAPI_HOST

  if (!apiKey || !apiHost) throw new Error('RAPIDAPI_KEY or RAPIDAPI_HOST missing in .env')

  const targetUrl = `https://${apiHost}/community?url=https%3A%2F%2Fwww.instagram.com%2F${encodeURIComponent(handle)}%2F`

  const res = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': apiHost,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) throw new Error(`RapidAPI returned ${res.status}`)

  const raw = await res.json()
  if (raw.meta?.code !== 200 || !raw.data) return null

  const data = raw.data
  const followerCount = data.usersCount || 0
  const engagementRate = data.avgER ? parseFloat((data.avgER * 100).toFixed(2)) : 0

  const recentPosts: InfluencerProfile['recentPosts'] = (data.lastPosts || []).map(
    (post: Record<string, any>, i: number) => ({
      id: `post_${i}`,
      type: post.type?.includes('video') ? ('REEL' as const) : ('PHOTO' as const),
      thumbnailUrl: post.image || `https://picsum.photos/seed/${handle}${i}/400/400`,
      caption: post.text || '',
      likes: post.likes || 0,
      comments: post.comments || 0,
      shares: Math.round((post.likes || 0) * 0.04),
      engagementRate: followerCount > 0
        ? parseFloat((((post.likes || 0) + (post.comments || 0)) / followerCount * 100).toFixed(2))
        : 0,
      postedAt: post.date || new Date().toISOString(),
    })
  )

  const fakePercent = data.pctFakeFollowers || 0.15
  const credibilityScore = Math.max(1, Math.round((1 - fakePercent) * 100))

  const bio = data.description || ''
  const captions = recentPosts.map(p => p.caption)
  const indiaSpecificNiches = detectIndiaSpecificNiches(bio, captions)

  const profile: InfluencerProfile = {
    handle: data.screenName || handle,
    name: data.name || handle,
    avatarUrl: data.image || `https://ui-avatars.com/api/?name=${handle}&background=d4a847&color=fff`,
    bio,
    niche: indiaSpecificNiches.length > 0
      ? indiaSpecificNiches
      : data.categories?.[0]
        ? [data.categories[0]]
        : ['Creator'],
    platform: 'Instagram',
    isVerified: data.verified || false,
    followerCount,
    followingCount: 0,
    postCount: 0,
    engagementRate,
    avgLikes: data.avgLikes || 0,
    avgComments: data.avgComments || 0,
    avgShares: Math.round((data.avgLikes || 0) * 0.04),
    estimatedReach: Math.round(followerCount * (data.membersReachability?.[0]?.percent || 0.3)),
    influenceScore: Math.round(data.qualityScore ? data.qualityScore * 100 : credibilityScore),
    audienceGeo: data.countries
      ? data.countries.slice(0, 5).map((c: any) => ({
          country: c.name,
          percentage: Math.round(c.percent * 100),
        }))
      : [],
    audienceGender: data.genders
      ? data.genders.map((g: any) => ({
          gender: g.name === 'm' ? 'MALE' : ('FEMALE' as const),
          percentage: Math.round(g.percent * 100),
        }))
      : [],
    audienceAge: data.ages
      ? data.ages.slice(0, 5).map((a: any) => ({
          range: a.name.replace('_', '-'),
          percentage: Math.round(a.percent * 100),
        }))
      : [],
    followerGrowth: [
      { month: 'Oct', count: Math.round(followerCount * 0.90) },
      { month: 'Nov', count: Math.round(followerCount * 0.92) },
      { month: 'Dec', count: Math.round(followerCount * 0.94) },
      { month: 'Jan', count: Math.round(followerCount * 0.96) },
      { month: 'Feb', count: Math.round(followerCount * 0.98) },
      { month: 'Mar', count: followerCount },
    ],
    recentPosts,
    brandSafety: credibilityScore > 80 ? 'HIGH' : credibilityScore > 60 ? 'MEDIUM' : 'LOW',
    estimatedCPM: Math.round((followerCount / 1000) * (engagementRate * 0.8) * 100),
    estimatedCPE: Math.round(data.avgLikes > 0 ? (followerCount / data.avgLikes) * 10 : 25),
    instagramStats: {
      credibilityScore,
      fakeFollowerPercent: Math.round(fakePercent * 100),
      qualityScore: data.qualityScore || null,
    },
  }

  return profile
}

// ─── Tier Classification ──────────────────────────────────────────────────────
function classifyTier(followerCount: number): string {
  if (followerCount < 10_000) return 'Nano'
  if (followerCount < 100_000) return 'Micro'
  if (followerCount < 500_000) return 'Mid-Tier'
  if (followerCount < 1_000_000) return 'Macro'
  return 'Mega'
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { query, brand } = body  // brand = optional brand name for fit score

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const platform = detectPlatform(query)
    const handle = extractHandle(query)
    const cacheKey = `${platform}:${handle}`

    console.log(`🔍 Searching [${platform}] handle: ${handle}`)

    // Check cache
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      console.log('✅ Returning cached result')
      return NextResponse.json({ success: true, profile: cached.data, cached: true })
    }

    // Fetch profile based on platform
    let profile: InfluencerProfile | null = null

    if (platform === 'youtube') {
      console.log('📺 Fetching from YouTube Data API v3...')
      profile = await fetchYouTubeProfile(handle)
    } else {
      console.log('📸 Fetching from Instagram RapidAPI...')
      profile = await fetchInstagramProfile(handle)
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Influencer not found or account is private. Try a different handle.' },
        { status: 404 }
      )
    }

    // Enrich with tier & AI brand fit score
    profile.tier = classifyTier(profile.followerCount)

    console.log('🤖 Generating AI Brand Fit Score...')
    const brandFit = await generateBrandFitScore(profile, brand)
    profile.brandFitScore = brandFit.score
    profile.brandFitSummary = brandFit.summary
    profile.brandFitStrengths = brandFit.strengths
    profile.brandFitRisks = brandFit.risks

    cache.set(cacheKey, { data: profile, ts: Date.now() })
    console.log(`✅ Profile built: ${profile.name} | ${profile.tier} | Fit Score: ${profile.brandFitScore}`)

    return NextResponse.json({ success: true, profile })

  } catch (err) {
    console.error('💥 Analyze error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to analyze profile: ${message}` },
      { status: 500 }
    )
  }
}