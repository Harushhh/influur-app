import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import prisma from '@/lib/prisma'

// Initialize Gemini with your key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  try {
    const { targetUsername } = await req.json()

    if (!targetUsername) {
      return NextResponse.json({ error: 'Please provide a target username' }, { status: 400 })
    }

    // 1. Generate the "Semantic DNA" using Gemini's embedding model
    // This turns the creator's identity into a mathematical coordinate
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
    const dnaResult = await model.embedContent(`Instagram influencer profile for ${targetUsername}`)
    const targetEmbedding = dnaResult.embedding.values

    // 2. Query Postgres using Vector Similarity (The <=> operator)
    // We look for creators in the "CreatorDNA" table who are mathematically closest
    // We use $queryRaw because standard Prisma doesn't support vector math operators yet
    const lookalikes: any[] = await prisma.$queryRaw`
      SELECT 
        username, 
        metadata, 
        (embedding <=> ${targetEmbedding}::vector) as distance
      FROM "CreatorDNA"
      WHERE username != ${targetUsername}
      ORDER BY distance ASC
      LIMIT 10;
    `

    // 3. Format the results for your Discover UI
    const formattedLookalikes = lookalikes.map((l: any) => {
      // Parse metadata if it's stored as a string, otherwise use as object
      const meta = typeof l.metadata === 'string' ? JSON.parse(l.metadata) : l.metadata
      
      return {
        id: `lookalike_${l.username}`,
        username: l.username,
        name: meta.username?.toUpperCase() || l.username,
        avatar: `https://ui-avatars.com/api/?name=${l.username}&background=D4A847&color=1A1A1A&bold=true`,
        followers: meta.followers || 0,
        engagement: meta.avgEngagementRate || 0,
        estCpm: "₹80", 
        emv: "₹1,20,000",
        safetyScore: 94,
        similarity: `${Math.round((1 - l.distance) * 100)}% Match`,
        niches: ['AI Lookalike', 'Semantic Match']
      }
    })

    return NextResponse.json({
      success: true,
      target: targetUsername,
      lookalikes: formattedLookalikes
    })

  } catch (error: any) {
    console.error("Lookalike Engine Error:", error)
    return NextResponse.json({ 
      success: false, 
      error: 'The Lookalike Engine failed to process this request.' 
    }, { status: 500 })
  }
}