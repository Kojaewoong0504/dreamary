import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    // Protected routes
    const protectedRoutes = ['/write', '/archive', '/mypage', '/notifications', '/feed'];
    const isProtectedRoute = protectedRoutes.some((route) =>
        req.nextUrl.pathname.startsWith(route)
    );

    if (isProtectedRoute && !refreshToken) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Redirect to home if logged in and accessing login page
    if (req.nextUrl.pathname === '/login' && refreshToken) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/write/:path*', '/archive/:path*', '/mypage/:path*', '/login'],
};
