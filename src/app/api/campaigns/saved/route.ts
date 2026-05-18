import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // 👈 Fixed: Used curly braces

// Force Next.js to fetch fresh data every time instead of caching it
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Fetch all saved influencers, newest first
    const savedInfluencers = await prisma.savedInfluencer.findMany({
      orderBy: { savedAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: savedInfluencers })
  } catch (error) {
    console.error("Failed to fetch CRM data:", error)
    return NextResponse.json({ success: false, error: 'Failed to fetch CRM data' }, { status: 500 })
  }
}