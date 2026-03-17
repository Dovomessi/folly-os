import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes: booking pages and public API
  if (pathname.startsWith('/book/') || pathname.startsWith('/api/booking/')) {
    return NextResponse.next()
  }

  // Health check is public
  if (pathname === '/api/health') {
    return NextResponse.next()
  }

  // API routes with Bearer token: let the route handler verify the key
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer fos_')) {
      return NextResponse.next()
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
