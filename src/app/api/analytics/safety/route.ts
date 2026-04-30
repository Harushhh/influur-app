import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Gemini AI Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json()

    if (!username) {
      return NextResponse.json({ error: 'Username required for safety scan' }, { status: 400 })
    }

    // 1. 🔥 REAL DATA: Fetch actual live captions from RapidAPI
    const captions = await fetchCaptionsFromRapidAPI(username)

    if (captions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: { safetyScore: 100, sponsorshipSaturation: 0, riskLevel: 'UNKNOWN', flaggedKeywords: [] }
      })
    }

    // 2. Compute Sponsorship Saturation (Local Regex)
    const adPatterns = /#ad|#sponsored|paid partnership|link in bio|use code/i
    let sponsoredPostCount = 0

    captions.forEach(caption => {
      if (adPatterns.test(caption)) sponsoredPostCount++
    })
    
    const saturationPercentage = (sponsoredPostCount / captions.length) * 100

    // 3. Toxicity & PR Risk NLP Scan (Google Gemini)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const nlpPrompt = `
      Analyze the following social media captions for Brand Safety.
      Look for: profanity, polarizing political statements, hate speech, or highly controversial topics.
      
      Return ONLY a raw JSON object strictly matching this schema (do not include markdown ticks like \`\`\`json):
      {
        "toxicityPenalty": number (0 to 100, where 0 is perfectly safe and 100 is highly toxic),
        "flaggedKeywords": string[] (up to 5 controversial or toxic words found, empty if none),
        "riskLevel": string ("LOW", "MEDIUM", "HIGH")
      }
      
      Captions: ${captions.join(' | ')}
    `

    const result = await model.generateContent(nlpPrompt)
    let responseText = result.response.text()
    
    // Clean up any markdown formatting Gemini might accidentally wrap the JSON in
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    
    const nlpData = JSON.parse(responseText || '{}')
    const toxicityPenalty = nlpData.toxicityPenalty || 0

    // 4. Calculate Final Enterprise Safety Score (0-100)
    let finalScore = 100 - toxicityPenalty
    if (saturationPercentage > 20) {
      finalScore -= (saturationPercentage - 20) // Deduct points for Ad Fatigue
    }

    finalScore = Math.max(0, Math.min(100, Math.round(finalScore)))

    return NextResponse.json({
      success: true,
      data: {
        safetyScore: finalScore,
        sponsorshipSaturation: Math.round(saturationPercentage),
        riskLevel: nlpData.riskLevel || 'UNKNOWN',
        flaggedKeywords: nlpData.flaggedKeywords || []
      }
    })

  } catch (error) {
    console.error("Brand Safety NLP Error:", error)
    return NextResponse.json({ success: false, error: 'NLP processing failed.' }, { status: 500 })
  }
}

// 🔥 The Bootstrapper's Live Data Fetcher
async function fetchCaptionsFromRapidAPI(username: string): Promise<string[]> {
  const rapidApiKey = process.env.RAPIDAPI_KEY
  const rapidApiHost = process.env.RAPIDAPI_HOST

  if (!rapidApiKey || !rapidApiHost) {
    console.warn("⚠️ Missing RapidAPI keys in .env. Returning empty array.")
    return []
  }

  // The endpoint path depends on the specific RapidAPI you subscribed to. 
  // This is a standard structure for most Instagram Scraper APIs on the platform.
  const url = `https://${rapidApiHost}/v1/post?username=${username}`

  try {
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost
      }
    })
    
    const data = await res.json()
    
    // Most scraper APIs return an array of items containing a text/caption field
    const items = data.data || data.items || data || []
    
    // Extract up to 20 captions, filtering out empty ones
    const captions = items
      .map((item: any) => item?.caption?.text || item?.text || '')
      .filter(Boolean)
      
    return captions.slice(0, 20)
  } catch (err) {
    console.error("Network failure fetching from RapidAPI:", err)
    return []
  }
}