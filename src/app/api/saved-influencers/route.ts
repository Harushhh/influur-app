import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@influur.com' } 
    })

    if (!user) return NextResponse.json({ success: true, data: [] })

    // 1. Fetch saved records using the correct 'brandId' field
    const saved = await prisma.savedInfluencer.findMany({
      where: { brandId: user.id },
      include: { influencer: true }, 
      orderBy: { savedAt: 'desc' }
    })

    // 2. Extract usernames for DNA lookup
    const usernames = saved.map(s => s.influencer?.username).filter(Boolean) as string[]
    const dnas = await prisma.creatorDNA.findMany({
      where: { username: { in: usernames } }
    })

    // 3. Map data while strictly accessing fields that exist in the schema
    const data = saved.map(s => {
      const dna = dnas.find(d => d.username === s.influencer?.username)
      
      return {
        id: s.id,
        username: s.influencer?.username || 'unknown',
        name: s.influencer?.name || 'Unknown',
        avatar: s.influencer?.avatarUrl || '',
        optInStatus: s.optInStatus,
        cpm: dna?.cpm || 0,
        realReach: dna?.realReach || 0,
        audLocation: dna?.location || 'Unknown'
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
    
    let brand = await prisma.user.findUnique({
      where: { email: 'test@influur.com' }
    })

    if (!brand) {
      brand = await prisma.user.create({
        data: {
          email: 'test@influur.com',
          name: 'Test Marketer',
          role: 'BRAND',
        }
      })
    }

    let influencer = await prisma.user.findUnique({
      where: { username: body.handle }
    })

    if (!influencer) {
      influencer = await prisma.user.create({
        data: {
          username: body.handle,
          email: `${body.handle}@mock.influur.com`,
          name: body.name || body.handle,
          role: 'CREATOR',
        }
      })
    }

    const existingSave = await prisma.savedInfluencer.findFirst({
      where: {
        brandId: brand.id,
        influencerId: influencer.id
      }
    })

    if (existingSave) {
      return NextResponse.json({ success: true, message: 'Already saved!' })
    }

    await prisma.savedInfluencer.create({
      data: {
        brandId: brand.id,
        influencerId: influencer.id,
        optInStatus: 'PENDING'
      }
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, optInStatus, notes } = await req.json()
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const updated = await prisma.savedInfluencer.update({
      where: { id },
      data: { optInStatus, notes }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    await prisma.savedInfluencer.delete({ where: { id } })
    return NextResponse.json({ success: true, deletedId: id })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 404 })
  }
}