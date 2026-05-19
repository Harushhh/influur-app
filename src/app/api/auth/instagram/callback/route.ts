import { NextRequest, NextResponse } from 'next/server'

// Force Vercel to NEVER cache this API route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  const baseUrl = "https://influur-app.vercel.app"
  const redirectUri = `${baseUrl}/api/auth/instagram/callback`

  if (code) {
    try {
      const appId = process.env.INSTAGRAM_APP_ID!
      const appSecret = process.env.INSTAGRAM_APP_SECRET!

      const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`)
      const tokenData = await tokenRes.json()
      const accessToken = tokenData.access_token

      if (accessToken) {
        const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=name,instagram_business_account&access_token=${accessToken}`)
        const pagesData = await pagesRes.json()

        let igUserId = null;
        if (pagesData.data && pagesData.data.length > 0) {
          const pageWithIG = pagesData.data.find((page: any) => page.instagram_business_account?.id)
          if (pageWithIG) {
            igUserId = pageWithIG.instagram_business_account.id
          }
        }

        // Attach errors to the URL so the dashboard can read them
        const redirectUrl = new URL(`/influencer/dashboard${!igUserId ? '?error=missing_ig_business_account' : ''}`, baseUrl)
        const response = NextResponse.redirect(redirectUrl)
        
        // Use response.cookies to ensure Next.js doesn't drop them during redirect
        response.cookies.set({ name: 'ig_token', value: accessToken, path: '/', secure: true, sameSite: 'lax', maxAge: 2592000 })
        if (igUserId) {
          response.cookies.set({ name: 'ig_user_id', value: igUserId, path: '/', secure: true, sameSite: 'lax', maxAge: 2592000 })
        }
        
        return response
      } else {
        return NextResponse.redirect(new URL(`/influencer/dashboard?error=token_failed`, baseUrl))
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/influencer/dashboard?error=server_crash', baseUrl))
    }
  }
  return NextResponse.redirect(new URL('/influencer/login', baseUrl))
}