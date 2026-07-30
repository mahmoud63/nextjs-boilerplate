import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/welcome']

// Next's generated metadata routes (app/icon.tsx, app/apple-icon.tsx) are served
// from extensionless paths, so the dotted-file check below never matches them and
// they were being redirected to the landing page — a broken favicon while logged
// out, and a PWA install that could not fetch its icons.
const ASSET_PATHS = ['/icon', '/apple-icon', '/favicon.ico', '/manifest.json']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')
  const { pathname } = request.nextUrl

  // Files in /public (PWA icons, screenshots) must stay reachable while logged out,
  // otherwise install prompts and the landing page lose their assets.
  const isStaticAsset =
    /\.[a-z0-9]+$/i.test(pathname) ||
    ASSET_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (isStaticAsset) return NextResponse.next()

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  if (!token) {
    // Logged-out visitors meet the landing page at the root URL rather than a
    // login wall. Rewrite, not redirect, so the marketing page lives at "/".
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/welcome', request.url))
    }
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Signed in: the landing page and login screen have nothing left to offer.
  if (isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)'],
}
