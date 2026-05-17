import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const role = request.cookies.get('influur_role')?.value || 'guest'
  const path = request.nextUrl.pathname

  // 1. BRAND PROTECTION
  if (path.startsWith('/brand') && role === 'creator') {
    return NextResponse.redirect(new URL('/influencer/dashboard', request.url))
  }

  // 2. CREATOR PROTECTION
  if (path.startsWith('/influencer') && role === 'brand') {
    if (path !== '/influencer/login') {
      return NextResponse.redirect(new URL('/brand/dashboard', request.url))
    }
  }

  // 3. GUEST PROTECTION
  if ((path.startsWith('/brand/dashboard') || path.startsWith('/influencer/dashboard')) && role === 'guest') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/brand/:path*', '/influencer/:path*'],
}