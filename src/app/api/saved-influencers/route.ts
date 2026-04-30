import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@influur.com' } 
    })

    if (!user) return NextResponse.json({ success: true, data: [] })

    // 1. Fetch the saved CRM records
    const saved = await prisma.savedInfluencer.findMany({
      where: { marketerId: user.id },
      include: { influencer: true }, 
      orderBy: { savedAt: 'desc' }
    })

    // 2. Fetch the corresponding CreatorDNA records to get the rich metrics
    const usernames = saved.map(s => s.influencer?.username).filter(Boolean) as string[]
    const dnas = await prisma.creatorDNA.findMany({
      where: { username: { in: usernames } }
    })

    // 3. Merge them together for the frontend
    const data = saved.map(s => {
      const dna = dnas.find(d => d.username === s.influencer?.username)
      const advData = (dna?.advancedData as any) || {}

      return {
        id: s.id,
        username: s.influencer?.username || s.username || 'unknown',
        name: s.influencer?.name || s.name || 'Unknown',
        avatar: s.influencer?.avatarUrl || s.avatar || '',
        followers: s.influencer?.followerCount || s.followers || 0,
        engagementRate: s.influencer?.engagementRate?.toFixed(2) || s.engagementRate || '0.00',
        optInStatus: s.optInStatus,
        
        // Passing the real DNA metrics for dynamic KPI calculations
        cpm: dna?.cpm || 0,
        realReach: dna?.realReach || 0,
        audGender: advData.audienceGender || 'split',
        audLocation: advData.audienceLocation || dna?.location || 'Unknown'
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('GET Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    let marketer = await prisma.user.findUnique({
      where: { email: 'test@influur.com' }
    })

    if (!marketer) {
      marketer = await prisma.user.create({
        data: {
          email: 'test@influur.com',
          name: 'Test Marketer',
          role: 'MARKETER',
        }
      })
    }

    const mockEmail = `${body.handle}@mock.influur.com`
    
    let influencer = await prisma.user.findUnique({
      where: { username: body.handle }
    })

    if (!influencer) {
      influencer = await prisma.user.create({
        data: {
          username: body.handle,
          email: mockEmail,
          name: body.name || body.handle,
          role: 'INFLUENCER',
          followerCount: body.followers || body.followerCount,
          engagementRate: parseFloat(body.engagementRate || '0'),
          avatarUrl: body.avatarUrl || body.avatar,
          niche: Array.isArray(body.category) ? body.category : [body.category].filter(Boolean),
          personalEmail: `collab@${body.handle}.com`
        }
      })
    } else {
      influencer = await prisma.user.update({
        where: { id: influencer.id },
        data: {
          followerCount: body.followers || body.followerCount,
          engagementRate: parseFloat(body.engagementRate || '0'),
          avatarUrl: body.avatarUrl || body.avatar || influencer.avatarUrl 
        }
      })
    }

    const existingSave = await prisma.savedInfluencer.findFirst({
      where: {
        marketerId: marketer.id,
        influencerId: influencer.id
      }
    })

    if (existingSave) {
      return NextResponse.json({ success: true, message: 'Already saved!' })
    }

    await prisma.savedInfluencer.create({
      data: {
        marketerId: marketer.id,
        influencerId: influencer.id,
        optInStatus: 'PENDING'
      }
    })

    console.log(`✅ Successfully saved @${body.handle} to real DB!`)
    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('💥 POST Error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, optInStatus, isUnlocked, notes, tags } = await req.json()
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const updateData: any = {}
    if (optInStatus) updateData.optInStatus = optInStatus
    if (isUnlocked !== undefined) {
      updateData.isUnlocked = isUnlocked
      updateData.unlockedAt = isUnlocked ? new Date() : null
    }
    if (notes !== undefined) updateData.notes = notes
    if (tags) updateData.tags = tags

    const updated = await prisma.savedInfluencer.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    console.error('PATCH Error:', err.message)
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    await prisma.savedInfluencer.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, deletedId: id })
  } catch (err: any) {
    console.error('DELETE Error:', err.message)
    return NextResponse.json({ success: false, error: 'Not found or delete failed' }, { status: 404 })
  }
}