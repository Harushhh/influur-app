import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Force Vercel to NEVER cache this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const isDashboard = searchParams.get('dashboard')

  if (isDashboard) {
    try {
      const cookieStore = cookies()
      const token = cookieStore.get('ig_token')?.value
      const igId = cookieStore.get('ig_user_id')?.value

      const zeroData = {
        reach: 0, impressions: 0, profileViews: 0, websiteClicks: 0,
        recentInsights: [ 
          { date: 'Day 1', reach: 0, impressions: 0 }, { date: 'Day 2', reach: 0, impressions: 0 },
          { date: 'Day 3', reach: 0, impressions: 0 }, { date: 'Day 4', reach: 0, impressions: 0 },
          { date: 'Day 5', reach: 0, impressions: 0 }, { date: 'Day 6', reach: 0, impressions: 0 },
          { date: 'Day 7', reach: 0, impressions: 0 },
        ],
        scheduledPosts: [] 
      }

      if (token && igId) {
        // Fetch Profile & Media safely
        const profileRes = await fetch(`https://graph.facebook.com/v19.0/${igId}?fields=followers_count,media_count,username,name,profile_picture_url&access_token=${token}`)
        const liveProfile = await profileRes.json()
        
        const mediaRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media?fields=media_product_type,media_type,like_count,comments_count&limit=20&access_token=${token}`)
        const mediaData = await mediaRes.json()

        let reelsCount = 0; let photoCount = 0; let totalLikes = 0; let totalComments = 0;

        if (mediaData.data) {
          mediaData.data.forEach((post: any) => {
            if (post.media_type === 'VIDEO' || post.media_product_type === 'REELS') reelsCount++;
            else photoCount++;
            totalLikes += (post.like_count || 0);
            totalComments += (post.comments_count || 0);
          });
        }

        const realFollowers = liveProfile.followers_count || 0
        let engagementRate = 0;
        if (realFollowers > 0) engagementRate = ((totalLikes + totalComments) / realFollowers) * 100;

        // Fetch Insights safely
        const insightsRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${token}`)
        const insightsRaw = await insightsRes.json()

        let totalReach = 0; let totalImpressions = 0; let totalProfileViews = 0;
        let chartData: { date: string; reach: number; impressions: number }[] = [];

        if (insightsRaw.data) {
          const impData = insightsRaw.data.find((m: any) => m.name === 'impressions')?.values || [];
          const reachData = insightsRaw.data.find((m: any) => m.name === 'reach')?.values || [];
          const viewsData = insightsRaw.data.find((m: any) => m.name === 'profile_views')?.values || [];

          impData.forEach((day: any) => totalImpressions += day.value);
          reachData.forEach((day: any) => totalReach += day.value);
          viewsData.forEach((day: any) => totalProfileViews += day.value);

          for (let i = 0; i < reachData.length; i++) {
            const dateObj = new Date(reachData[i].end_time);
            const shortDate = dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            chartData.push({ date: shortDate, reach: reachData[i]?.value || 0, impressions: impData[i]?.value || 0 });
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            isConnected: true, isLive: true,
            username: liveProfile.username || 'Creator', fullName: liveProfile.name || '', profilePicUrl: liveProfile.profile_picture_url || '',
            followerCount: realFollowers, totalPosts: liveProfile.media_count || 0, recentReels: reelsCount, recentPhotos: photoCount, engagementRate: engagementRate.toFixed(2), totalRecentLikes: totalLikes,
            reach: totalReach, impressions: totalImpressions, profileViews: totalProfileViews, recentInsights: chartData.length > 0 ? chartData : zeroData.recentInsights, websiteClicks: 0, scheduledPosts: [] 
          }
        })
      }

      if (token) return NextResponse.json({ success: true, data: { isConnected: true, isLive: false, ...zeroData } })
      return NextResponse.json({ success: true, data: { isConnected: false, isLive: false, ...zeroData } })

    } catch (err: any) {
      console.error("API Fetch Error:", err)
      return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
    }
  }

  // BULLETPROOF ENCODING for the Departure Login link
  const appId = process.env.INSTAGRAM_APP_ID || ''
  const redirectUri = "https://influur-app.vercel.app/api/auth/instagram/callback"
  
  const authUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
  authUrl.searchParams.append('client_id', appId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', 'public_profile,instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement,business_management,instagram_content_publish,instagram_manage_messages');
  authUrl.searchParams.append('response_type', 'code');

  return NextResponse.redirect(authUrl.toString())
}