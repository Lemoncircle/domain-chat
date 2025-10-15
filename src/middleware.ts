import { createMiddlewareClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  // Refresh session if expired
  await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedRoutes = ['/', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Admin routes that require admin role
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  if (isProtectedRoute && !user) {
    // Redirect to auth page if not authenticated
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (isAdminRoute && user) {
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      // Redirect to home if not admin
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

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
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
