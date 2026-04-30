import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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

      // SCENARIO A: Fully Connected & Live IG Data Available
      if (token && igId) {
        // 1. Fetch Basic Profile Data 
        const profileRes = await fetch(`https://graph.facebook.com/v19.0/${igId}?fields=followers_count,media_count,username,name,profile_picture_url&access_token=${token}`)
        const liveProfile = await profileRes.json()
        
        // 2. Fetch Recent Posts (To count Reels and calculate Engagement)
        const mediaRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media?fields=media_product_type,media_type,like_count,comments_count&limit=20&access_token=${token}`)
        const mediaData = await mediaRes.json()

        // 3. THE CALCULATOR: Let's crunch the numbers
        let reelsCount = 0;
        let photoCount = 0;
        let totalLikes = 0;
        let totalComments = 0;

        // Loop through the recent posts to count them up
        if (mediaData.data) {
          mediaData.data.forEach((post: any) => {
            // Meta classifies Reels as 'VIDEO' or 'REELS' in the media_product_type
            if (post.media_type === 'VIDEO' || post.media_product_type === 'REELS') {
              reelsCount++;
            } else {
              photoCount++;
            }
            totalLikes += (post.like_count || 0);
            totalComments += (post.comments_count || 0);
          });
        }

        const realFollowers = liveProfile.followers_count || 0

        // Calculate Engagement Rate: (Likes + Comments) / Followers * 100
        let engagementRate = 0;
        if (realFollowers > 0) {
          engagementRate = ((totalLikes + totalComments) / realFollowers) * 100;
        }

        // 4. 🔥 THE INSIGHTS API: Fetch real Reach, Impressions, and Profile Views
        const insightsRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${token}`)
        const insightsRaw = await insightsRes.json()

        // 5. THE DATA CRUNCHER: Translate Meta's timeline into dashboard numbers
        let totalReach = 0;
        let totalImpressions = 0;
        let totalProfileViews = 0;
        let chartData: { date: string; reach: number; impressions: number }[] = [];

        if (insightsRaw.data) {
          // Extract the specific metric arrays
          const impData = insightsRaw.data.find((m: any) => m.name === 'impressions')?.values || [];
          const reachData = insightsRaw.data.find((m: any) => m.name === 'reach')?.values || [];
          const viewsData = insightsRaw.data.find((m: any) => m.name === 'profile_views')?.values || [];

          // Sum up the last 7 days for the top cards
          impData.forEach((day: any) => totalImpressions += day.value);
          reachData.forEach((day: any) => totalReach += day.value);
          viewsData.forEach((day: any) => totalProfileViews += day.value);

          // Build the exact array your frontend chart needs
          for (let i = 0; i < reachData.length; i++) {
            // Format the Meta timestamp into a readable date (e.g., 'Apr 22')
            const dateObj = new Date(reachData[i].end_time);
            const shortDate = dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            
            chartData.push({
              date: shortDate,
              reach: reachData[i]?.value || 0,
              impressions: impData[i]?.value || 0
            });
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            isConnected: true,
            isLive: true,
            username: liveProfile.username || 'Creator',
            fullName: liveProfile.name || '',
            profilePicUrl: liveProfile.profile_picture_url || '',
            
            // Profile Metrics
            followerCount: realFollowers,
            totalPosts: liveProfile.media_count || 0,
            recentReels: reelsCount,
            recentPhotos: photoCount,
            engagementRate: engagementRate.toFixed(2), 
            totalRecentLikes: totalLikes,
            
            // 🔥 REAL Insights Metrics 
            reach: totalReach,
            impressions: totalImpressions,
            profileViews: totalProfileViews,
            recentInsights: chartData.length > 0 ? chartData : zeroData.recentInsights,
            websiteClicks: 0, 
            scheduledPosts: [] 
          }
        })
      }

      // SCENARIO B: Connected to Meta, but missing Instagram Business Account
      if (token) {
        return NextResponse.json({
          success: true,
          data: { isConnected: true, isLive: false, ...zeroData }
        })
      }

      // SCENARIO C: Not connected at all
      return NextResponse.json({
        success: true,
        data: { isConnected: false, isLive: false, ...zeroData }
      })
    } catch (err: any) {
      console.error("API Fetch Error:", err)
      return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
    }
  }

  const appId = process.env.INSTAGRAM_APP_ID
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI
  
  // UPGRADED SCOPES: Ready for Auto-Posting and Chat!
  const metaLoginUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=public_profile,instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement,business_management,instagram_content_publish,instagram_manage_messages&response_type=code`

  return NextResponse.redirect(metaLoginUrl)
}