import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  console.log("=== META OAUTH CALLBACK STARTED ===")

  if (code) {
    try {
      const appId = process.env.INSTAGRAM_APP_ID!
      const appSecret = process.env.INSTAGRAM_APP_SECRET!
      const redirectUri = process.env.INSTAGRAM_REDIRECT_URI!

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

        console.log("🚨 META API RAW RESPONSE: PAGES & IG DATA 🚨")
        console.log(JSON.stringify(pagesData, null, 2))

        if (pagesData.data && pagesData.data.length > 0) {
          const pageWithIG = pagesData.data.find((page: any) => page.instagram_business_account?.id)
          
          if (pageWithIG) {
            console.log(`4. SUCCESS! Found IG ID: ${pageWithIG.instagram_business_account.id}`)
            cookies().set('ig_user_id', pageWithIG.instagram_business_account.id, { path: '/' })
          } else {
            console.log("❌ FAILED: Meta returned pages, but NONE had an instagram_business_account attached.")
          }
        } else {
          console.log("❌ FAILED: Meta returned 0 Facebook pages.")
        }
      } else {
        console.log("❌ FAILED: Did not receive an access token from Meta.", tokenData)
      }

      return NextResponse.redirect(new URL(`/influencer/dashboard`, req.url))
    } catch (err) {
      console.error("CRITICAL SERVER ERROR:", err)
      return NextResponse.redirect(new URL('/influencer/login?error=server_crash', req.url))
    }
  }
  return NextResponse.redirect(new URL('/influencer/login', req.url))
}