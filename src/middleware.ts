import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // TEMPORARILY DISABLED: Skip all authentication checks
  console.log('Middleware: Authentication disabled for testing')
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth routes (to prevent redirect loops)
     * - api routes (let them handle their own auth)
     * - test routes (for debugging)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth|api|test|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}