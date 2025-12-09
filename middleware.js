import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Admin routes protection
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    try {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: 'next-auth.session-token' // Explicitly set cookie name
      })
      
      if (!token) {
        // Log for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ No token found, redirecting to login')
        }
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      if (token.role !== 'admin') {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ User is not admin, redirecting to login')
        }
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // Token is valid and user is admin
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Token valid, allowing access to:', pathname)
      }
    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

