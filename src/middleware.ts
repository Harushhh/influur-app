import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const role = request.cookies.get('influur_role')?.value || 'guest'
  const path = request.nextUrl.pathname

  // 1. BRAND PROTECTION (Prevent creators from accessing brand pages)
  if (path.startsWith('/brand') && role === 'creator') {
    return NextResponse.redirect(new URL('/influencer/dashboard', request.url))
  }

  // 2. CREATOR PROTECTION (Prevent brands from accessing creator pages)
  if (path.startsWith('/influencer') && role === 'brand') {
    if (path !== '/influencer/login') {
      return NextResponse.redirect(new URL('/brand/dashboard', request.url))
    }
  }

  // 3. SECURE GUEST PROTECTION (Protects ALL internal pages, including campaigns)
  if (role === 'guest') {
    // If they try to access any brand page (that isn't login/signup), bounce to login
    if (path.startsWith('/brand') && !path.includes('/login') && !path.includes('/signup')) {
      return NextResponse.redirect(new URL('/brand/login', request.url))
    }
    // If they try to access any influencer page (that isn't login/signup), bounce to login
    if (path.startsWith('/influencer') && !path.includes('/login') && !path.includes('/signup')) {
      return NextResponse.redirect(new URL('/influencer/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/brand/:path*', '/influencer/:path*'],
}