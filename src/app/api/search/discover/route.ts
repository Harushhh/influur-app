import { NextRequest, NextResponse } from 'next/server'
// Assuming you are using Prisma based on your earlier setup
import { prisma } from '@/lib/prisma' 

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { filters } = body

    // 1. Build the Database Query dynamically based on the filters
    const queryConditions: any = {}

    // Apply Location Filter
    if (filters.location) {
      queryConditions.location = {
        contains: filters.location,
        mode: 'insensitive' // Case-insensitive search
      }
    }

    // Apply Category Filter
    if (filters.category) {
      queryConditions.category = filters.category
    }

    // Apply Follower Minimum
    if (filters.followers > 0) {
      queryConditions.followers = {
        gte: filters.followers
      }
    }

    // Apply Engagement Minimum
    if (filters.engagement > 0) {
      queryConditions.engagement = {
        gte: filters.engagement
      }
    }

    // 2. Query your Postgres Database
    // This looks inside your CreatorDNA table for matches
    const matchingCreators = await prisma.creatorDNA.findMany({
      where: queryConditions,
      take: 50, // Limit results to prevent crashing
      orderBy: {
        followers: 'desc' // Show biggest creators first
      }
    })

    return NextResponse.json({ success: true, data: matchingCreators })

  } catch (error) {
    console.error("Discovery Search Error:", error)
    return NextResponse.json({ success: false, error: 'Database query failed' }, { status: 500 })
  }
}