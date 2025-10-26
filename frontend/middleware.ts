// middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
// import { updateSession } from '@/lib/supabase/middleware' // adjust path
import { updateSession } from './utils/supabase/middleware' // adjust path

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const url = new URL(request.url)
  const path = url.pathname

  const isDashboard = path.startsWith('/dashboard')
  const isAccount = path.startsWith('/account')
  const isAuthPage = path === '/login' || path === '/signup'
  const redirectTo = encodeURIComponent(path + url.search)

  if ((isDashboard || isAccount) && !user) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${redirectTo}`, request.url))
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// only run on the routes you care about
export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/login', '/signup'],
}
