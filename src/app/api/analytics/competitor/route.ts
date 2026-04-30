import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma' // Ensure this path points to your Prisma client instance

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const targetUsername = searchParams.get('username')

  if (!targetUsername) {
    return NextResponse.json({ error: 'Please provide a username' }, { status: 400 })
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY
  const rapidApiHost = process.env.RAPIDAPI_HOST
  const geminiApiKey = process.env.GEMINI_API_KEY

  if (!rapidApiKey || !rapidApiHost) {
     return NextResponse.json({ error: 'Server missing RapidAPI Configuration' }, { status: 500 })
  }

  try {
    // ============================================================================
    // STEP 1: FETCH HARD FACTS FROM RAPIDAPI
    // ============================================================================
    const rapidUrl = `https://${rapidApiHost}/v1/info?username=${targetUsername}`
    
    const res = await fetch(rapidUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost
      }
    })

    if (!res.ok) {
      throw new Error(`RapidAPI responded with status: ${res.status}`)
    }

    const rawData = await res.json()
    const user = rawData.data || rawData.user || rawData 

    if (!user) {
        return NextResponse.json({ error: 'User not found or API quota exceeded' }, { status: 404 })
    }

    // --- Format RapidAPI Data ---
    const followerCount = parseInt(user.follower_count || user.followers || 0)
    let calculatedEngagement = parseFloat(user.engagement_rate || 0)
    const recentPosts = user.edge_owner_to_timeline_media?.edges?.slice(0, 5) || []
    
    // Calculate engagement if the API didn't provide it directly
    let recentCommentsAvg = 0
    if (calculatedEngagement === 0 && followerCount > 0 && recentPosts.length > 0) {
         let totalEngagements = 0
         let totalComments = 0
         recentPosts.forEach((edge: any) => {
             totalEngagements += (edge.node.edge_media_preview_like?.count || 0)
             const comms = (edge.node.edge_media_to_comment?.count || 0)
             totalEngagements += comms
             totalComments += comms
         })
         calculatedEngagement = ((totalEngagements / recentPosts.length) / followerCount) * 100
         recentCommentsAvg = totalComments / recentPosts.length
    }

    const bio = user.biography || ""
    const category = user.business_category_name || user.category_name || "Uncategorized"
    
    // Extract captions to send to Gemini
    const captions = recentPosts.map((edge: any) => {
      const captionNodes = edge.node.edge_media_to_caption?.edges || []
      return captionNodes.length > 0 ? captionNodes[0].node.text : ""
    }).join(" | ")

    // ============================================================================
    // STEP 2: HYBRID AI ESTIMATION VIA GEMINI
    // ============================================================================
    let aiEstimates = {
        audienceAgeMin: 18,
        audienceAgeMax: 34,
        audienceGender: "split",
        audienceLocation: "Global",
        audienceLanguage: "English",
        authenticityScore: 85,
        audienceInterest: category,
        accountType: user.is_business_account ? "business" : "personal",
        optedIn: true // Default for MVP
    }

    if (geminiApiKey && (bio.length > 0 || captions.length > 0)) {
        try {
            const genAI = new GoogleGenerativeAI(geminiApiKey)
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

            const prompt = `
            Analyze this Instagram creator's profile data to estimate their core audience demographics.
            
            Username: ${targetUsername}
            Category: ${category}
            Biography: "${bio}"
            Recent Captions: "${captions.substring(0, 500)}"
            
            Return ONLY a valid JSON object matching this exact structure, with no markdown formatting or extra text:
            {
              "audienceAgeMin": number (e.g., 18),
              "audienceAgeMax": number (e.g., 24),
              "audienceGender": string ("male", "female", or "split"),
              "audienceLocation": string (guess primary country/city based on language/bio),
              "audienceLanguage": string (guess primary language),
              "authenticityScore": number (0-100, estimate based on professionalism),
              "audienceInterest": string (1-2 words)
            }`

            const result = await model.generateContent(prompt)
            const responseText = result.response.text()
            
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
            const parsedEstimates = JSON.parse(cleanJson)
            
            aiEstimates = { ...aiEstimates, ...parsedEstimates }
            
        } catch (aiError) {
            console.warn("Gemini Estimation Failed (using defaults):", aiError)
        }
    }

    // ============================================================================
    // STEP 3: CONSTRUCT THE FINAL PAYLOAD
    // ============================================================================
    const formattedRecentPosts = recentPosts.map((edge: any) => ({
      id: edge.node.id,
      media_url: edge.node.display_url,
      like_count: edge.node.edge_media_preview_like?.count || 0,
      comments_count: edge.node.edge_media_to_comment?.count || 0,
      view_count: edge.node.video_view_count || 0
    }))

    const finalData = {
      username: targetUsername,
      name: user.full_name || user.fullName || targetUsername,
      followers: followerCount,
      biography: bio,
      profile_picture_url: user.profile_pic_url_hd || user.profile_pic_url || "",
      avgEngagementRate: calculatedEngagement.toFixed(2),
      isVerified: user.is_verified || false,
      isBusinessAccount: user.is_business_account || false,
      public_email: user.public_email || null,
      contactEmail: user.contact_phone_number || null,
      category: category,
      location: user.business_address_json ? JSON.parse(user.business_address_json).city_name : "Unknown",
      recentPosts: formattedRecentPosts,
      ...aiEstimates
    }

    // ============================================================================
    // STEP 4: PASSIVE INGESTION (Save to Postgres via Prisma)
    // ============================================================================
    try {
      // Calculate database-ready metrics
      const avgLikes = followerCount * (calculatedEngagement / 100)
      const reachRaw = Math.round(avgLikes * 2)
      const cpmCalc = (avgLikes * 2) + (recentCommentsAvg / 10 * 15)
      const hasValidEmail = !!finalData.public_email || !!finalData.contactEmail

      const dbPayload = {
        name: finalData.name,
        avatar: finalData.profile_picture_url,
        bio: finalData.biography,
        followers: finalData.followers,
        engagement: calculatedEngagement,
        location: finalData.location,
        category: finalData.category,
        realReach: reachRaw,
        cpm: cpmCalc,
        isVerified: finalData.isVerified,
        hasEmail: hasValidEmail,
        advancedData: aiEstimates,
        recentPosts: formattedRecentPosts
      }

      await prisma.creatorDNA.upsert({
        where: { username: finalData.username },
        update: { ...dbPayload, updatedAt: new Date() },
        create: {
          username: finalData.username,
          ...dbPayload
        }
      })
      console.log(`[DB] Successfully upserted @${finalData.username} into CreatorDNA`)
    } catch (dbError) {
      console.error(`[DB] Failed to passively ingest @${finalData.username}:`, dbError)
    }

    // ============================================================================
    // STEP 5: RETURN TO UI
    // ============================================================================
    return NextResponse.json({
      success: true,
      data: finalData
    })

  } catch (err: any) {
    console.error("RapidAPI Error:", err)
    return NextResponse.json({ error: 'Failed to fetch competitor data from external service.' }, { status: 500 })
  }
}