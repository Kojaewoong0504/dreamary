import { NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/jwt';
import { validateRefreshToken, storeRefreshToken, revokeRefreshToken } from '@/lib/tokenStore';

export async function POST(request: Request) {
    const refreshToken = request.headers.get('cookie')?.split('refreshToken=')[1]?.split(';')[0];

    if (!refreshToken) {
        return NextResponse.json({ error: 'Refresh token required' }, { status: 401 });
    }

    // Verify token signature
    const decoded = verifyRefreshToken(refreshToken) as { userId: string } | null;
    if (!decoded) {
        return NextResponse.json({ error: 'Invalid refresh token' }, { status: 403 });
    }

    const { userId } = decoded;

    // RTR Check: Is this the latest token issued to this user?
    if (!validateRefreshToken(userId, refreshToken)) {
        // Token Reuse Detected! Potential theft.
        // Revoke all tokens for this user to force re-login.
        revokeRefreshToken(userId);
        return NextResponse.json({ error: 'Token reuse detected. Please log in again.' }, { status: 403 });
    }

    // Issue new pair
    const newAccessToken = signAccessToken({ userId });
    const newRefreshToken = signRefreshToken({ userId });

    // Update store with new token (RTR)
    storeRefreshToken(userId, newRefreshToken);

    // Return new tokens
    const response = NextResponse.json({ accessToken: newAccessToken });
    response.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
}
