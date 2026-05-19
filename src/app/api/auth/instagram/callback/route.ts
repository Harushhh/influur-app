import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  console.log("=== META OAUTH CALLBACK STARTED ===")

  // THE UNBREAKABLE RULE FOR ROUTING
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? "https://influur-gymf90t9w-harshtiwari5711-8068s-projects.vercel.app"
    : "http://localhost:3000"

  const redirectUri = `${baseUrl}/api/auth/instagram/callback`

  if (code) {
    try {
      const appId = process.env.INSTAGRAM_APP_ID!
      const appSecret = process.env.INSTAGRAM_APP_SECRET!

      console.log("1. Exchanging code for token...")
      const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`)
      const tokenData = await tokenRes.json()
      const accessToken = tokenData.access_token

      if (accessToken) {
        console.log("2. Token acquired successfully!")
        cookies().set('ig_token', accessToken, { path: '/' })

        console.log("3. Fetching Facebook Pages...")
        const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=name,instagram_business_account&access_token=${accessToken}`)
        const pagesData = await pagesRes.json()

        if (pagesData.data && pagesData.data.length > 0) {
          const pageWithIG = pagesData.data.find((page: any) => page.instagram_business_account?.id)
          
          if (pageWithIG) {
            console.log(`4. SUCCESS! Found IG ID: ${pageWithIG.instagram_business_account.id}`)
            cookies().set('ig_user_id', pageWithIG.instagram_business_account.id, { path: '/' })
          }
        }
      }

      // Force the redirect to the exact base URL
      return NextResponse.redirect(new URL(`/influencer/dashboard`, baseUrl))
    } catch (err) {
      console.error("CRITICAL SERVER ERROR:", err)
      return NextResponse.redirect(new URL('/influencer/login?error=server_crash', baseUrl))
    }
  }
  return NextResponse.redirect(new URL('/influencer/login', baseUrl))
}