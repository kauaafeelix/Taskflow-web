import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/auth/login', '/auth/register']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}