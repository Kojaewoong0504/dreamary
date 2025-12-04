import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UAParser } from 'ua-parser-js';

export function middleware(req: NextRequest) {
    const refreshToken = req.cookies.get('refreshToken')?.value;
    const { pathname } = req.nextUrl;
    const userAgent = req.headers.get('user-agent') || '';

    // Parse User Agent
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const isMobile = device.type === 'mobile' || device.type === 'tablet';

    // 1. Root Path Handling (/)
    if (pathname === '/') {
        if (isMobile) {
            return NextResponse.redirect(new URL('/app', req.url));
        }
        // Desktop stays at / (Landing Page)
    }

    // 2. App Path Handling (/app) & Dashboard Handling
    if (pathname.startsWith('/app')) {
        if (!isMobile) {
            // Desktop user trying to access /app -> redirect to /dashboard or /
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    }

    if (pathname.startsWith('/dashboard')) {
        if (isMobile) {
            // Mobile user trying to access /dashboard -> redirect to appropriate mobile route
            if (pathname === '/dashboard/shop') return NextResponse.redirect(new URL('/shop', req.url));
            if (pathname === '/dashboard/profile') return NextResponse.redirect(new URL('/mypage', req.url));
            if (pathname === '/dashboard/explore') return NextResponse.redirect(new URL('/feed', req.url));
            if (pathname === '/dashboard/settings') return NextResponse.redirect(new URL('/mypage', req.url));

            // Default fallback
            return NextResponse.redirect(new URL('/app', req.url));
        }
    }

    // Protected routes
    const protectedRoutes = ['/write', '/archive', '/mypage', '/notifications', '/feed', '/dashboard', '/admin'];
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute && !refreshToken) {
        // If trying to access dashboard/admin without login, go to desktop login
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/desktop/login', req.url));
        }
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Admin Route Protection (Basic check, real check happens in layout/page)
    // We can't easily check is_admin here without a DB call, which is expensive in middleware.
    // So we rely on the page/layout to do the final check, or we could decode the JWT if it had the role.
    // For now, we just ensure they are logged in. The Admin Layout will handle the redirect if not admin.

    // Redirect to home (or app home) if logged in and accessing login page
    if ((pathname === '/login' || pathname === '/desktop/login') && refreshToken) {
        // If logged in, where to go? 
        // Mobile -> /app
        // Desktop -> /dashboard
        const destination = isMobile ? '/app' : '/dashboard';
        return NextResponse.redirect(new URL(destination, req.url));
    }

    // Enforce Login Page Split
    if (pathname === '/login' && !isMobile) {
        // Desktop user trying to access mobile login -> redirect to desktop login
        return NextResponse.redirect(new URL('/desktop/login', req.url));
    }
    if (pathname === '/desktop/login' && isMobile) {
        // Mobile user trying to access desktop login -> redirect to mobile login
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - manifest.json (PWA manifest)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)',
    ],
};
