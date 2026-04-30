import { NextRequest, NextResponse } from 'next/server'

interface SchedulePayload {
  caption: string
  mediaUrls: string[]
  hashtags: string[]
  scheduledAt: string
  platform?: string
  aiGenerated?: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body: SchedulePayload = await req.json()
    const { caption, mediaUrls, hashtags, scheduledAt } = body

    if (!caption || !scheduledAt) {
      return NextResponse.json({ error: 'Caption and scheduledAt are required' }, { status: 400 })
    }
    if (!mediaUrls?.length) {
      return NextResponse.json({ error: 'At least one media URL is required' }, { status: 400 })
    }

    const scheduledDate = new Date(scheduledAt)
    if (scheduledDate <= new Date()) {
      return NextResponse.json({ error: 'Scheduled time must be in the future' }, { status: 400 })
    }

    // Instagram Graph API flow (production):
    // 1. POST /v18.0/{ig-user-id}/media → create container → get container_id
    // 2. Poll container status until FINISHED
    // 3. POST /v18.0/{ig-user-id}/media_publish at scheduledAt time

    await new Promise(r => setTimeout(r, 800))

    const postId = `post_${Date.now()}`
    return NextResponse.json({
      success: true,
      postId,
      status: 'SCHEDULED',
      scheduledAt: scheduledDate.toISOString(),
      caption,
      mediaUrls,
      hashtags,
      platform: body.platform || 'instagram',
      aiGenerated: body.aiGenerated || false,
      estimatedReach: Math.round(Math.random() * 50000 + 20000),
      bestTimeScore: Math.round(Math.random() * 30 + 70),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to schedule post' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  // Mock scheduled posts queue
  const posts = [
    { id: 'post_1', status: 'SCHEDULED', scheduledAt: new Date(Date.now() + 2 * 3600000).toISOString(), caption: 'Morning routine reveal 🌿', platform: 'instagram', aiGenerated: true },
    { id: 'post_2', status: 'DRAFT', scheduledAt: new Date(Date.now() + 26 * 3600000).toISOString(), caption: 'Behind the scenes of the shoot 🎬', platform: 'instagram', aiGenerated: false },
    { id: 'post_3', status: 'PUBLISHED', scheduledAt: new Date(Date.now() - 24 * 3600000).toISOString(), caption: 'Golden hour vibes ✨', platform: 'instagram', aiGenerated: false, publishedAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  ].filter(p => !status || p.status === status)

  return NextResponse.json({ posts })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('id')
  if (!postId) return NextResponse.json({ error: 'Post ID required' }, { status: 400 })

  await new Promise(r => setTimeout(r, 300))
  return NextResponse.json({ success: true, deletedId: postId })
}
