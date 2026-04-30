import { NextRequest, NextResponse } from 'next/server'

interface SendPayload {
  recipientIds: string[]
  subject: string
  bodyHtml: string
  bodyText: string
  aiGenerated?: boolean
}

// Rate limit map (in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(marketerId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const limit = rateLimitMap.get(marketerId)

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(marketerId, { count: 1, resetAt: now + 60 * 60 * 1000 }) // 1hr window
    return { allowed: true }
  }
  if (limit.count >= 200) {
    return { allowed: false, retryAfter: Math.ceil((limit.resetAt - now) / 1000) }
  }
  limit.count++
  return { allowed: true }
}

export async function POST(req: NextRequest) {
  try {
    const marketerId = req.headers.get('x-marketer-id') || 'mock_marketer'
    const { allowed, retryAfter } = checkRateLimit(marketerId)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 200 emails/hour.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    const body: SendPayload = await req.json()
    const { recipientIds, subject, bodyHtml, bodyText } = body

    if (!recipientIds?.length || !subject || !bodyHtml) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (recipientIds.length > 50) {
      return NextResponse.json({ error: 'Max 50 recipients per campaign' }, { status: 400 })
    }

    // In production: call Resend/SendGrid here
    // await resend.emails.send({ from: 'campaigns@influur.io', to: recipientEmails, subject, html: bodyHtml })

    await new Promise(r => setTimeout(r, 1200)) // Simulate send latency

    const campaignId = `camp_${Date.now()}`
    const result = {
      success: true,
      campaignId,
      recipientCount: recipientIds.length,
      sentAt: new Date().toISOString(),
      // Mock delivery stats — real stats come from webhook
      estimatedDelivery: '2–5 minutes',
      status: 'SENT',
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 })
  }
}

// GET /api/campaigns/send → list campaigns (stub)
export async function GET() {
  return NextResponse.json({
    campaigns: [
      { id: 'camp_mock_1', subject: 'Collab Opportunity Q2', status: 'SENT', recipientCount: 8, openCount: 5, replyCount: 2, sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'camp_mock_2', subject: 'Summer Collection Launch', status: 'SENT', recipientCount: 14, openCount: 9, replyCount: 3, sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    ]
  })
}
