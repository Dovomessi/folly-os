import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // For proxied embed routes, strip iframe-blocking headers
  if (pathname.startsWith('/embed/')) {
    const response = NextResponse.next()
    response.headers.delete('x-frame-options')
    response.headers.set('Content-Security-Policy', "frame-ancestors 'self' *")
    return response
  }

  // For API proxy routes, skip Supabase session
  if (pathname.startsWith('/api/proxy')) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
