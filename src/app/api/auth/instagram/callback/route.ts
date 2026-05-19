import { NextRequest, NextResponse } from 'next/server'

// Force Vercel to NEVER cache this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const baseUrl = "https://influur-app.vercel.app"
  
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.redirect(new URL('/influencer/login?error=no_code', baseUrl))
    }

    const appId = process.env.INSTAGRAM_APP_ID || '';
    const appSecret = process.env.INSTAGRAM_APP_SECRET || '';
    const redirectUri = `${baseUrl}/api/auth/instagram/callback`;

    // 1. BULLETPROOF ENCODING: Safely pack Meta's wild characters
    const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
    tokenUrl.searchParams.append('client_id', appId);
    tokenUrl.searchParams.append('redirect_uri', redirectUri);
    tokenUrl.searchParams.append('client_secret', appSecret);
    tokenUrl.searchParams.append('code', code);

    // 2. Fetch Token securely
    const tokenRes = await fetch(tokenUrl.toString(), { method: 'POST' });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("META TOKEN ERROR:", tokenData);
      return NextResponse.redirect(new URL(`/influencer/dashboard?error=token_failed`, baseUrl))
    }

    // 3. Fetch Pages
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=name,instagram_business_account&access_token=${accessToken}`)
    const pagesData = await pagesRes.json()

    let igUserId = null;
    if (pagesData.data && pagesData.data.length > 0) {
      const pageWithIG = pagesData.data.find((page: any) => page.instagram_business_account?.id)
      if (pageWithIG) igUserId = pageWithIG.instagram_business_account.id;
    }

    // 4. Safe Redirect and Cookie Drop
    const redirectUrl = new URL(`/influencer/dashboard${!igUserId ? '?error=missing_ig_business_account' : ''}`, baseUrl)
    const response = NextResponse.redirect(redirectUrl)
    
    // Safely apply cookies
    response.cookies.set('ig_token', accessToken, { path: '/', secure: true, sameSite: 'lax', maxAge: 2592000 })
    if (igUserId) {
      response.cookies.set('ig_user_id', igUserId, { path: '/', secure: true, sameSite: 'lax', maxAge: 2592000 })
    }
    
    return response;

  } catch (err: any) {
    console.error("CRITICAL CALLBACK ERROR:", err);
    // Absolute fallback so it never 500 errors again
    return NextResponse.redirect(new URL('/influencer/dashboard?error=fatal_crash', baseUrl))
  }
}