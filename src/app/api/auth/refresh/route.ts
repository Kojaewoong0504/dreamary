import { NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/jwt';
import { validateRefreshToken, storeRefreshToken, revokeRefreshToken } from '@/lib/tokenStore';

import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
        return NextResponse.json({ error: 'Refresh token required' }, { status: 401 });
    }

    // Verify token signature
    const decoded = verifyRefreshToken(refreshToken) as { userId: string } | null;
    if (!decoded) {
        console.log("[Refresh] Invalid token signature");
        return NextResponse.json({ error: 'Invalid refresh token' }, { status: 403 });
    }

    const { userId } = decoded;

    // RTR Check: Is this the latest token issued to this user?
    const isValid = await validateRefreshToken(userId, refreshToken);

    if (!isValid) {
        console.log(`[Refresh] Token Mismatch! User: ${userId}`);
        // For debugging, let's see what's in the DB (be careful not to leak full tokens in prod logs, but ok for dev)
        // const { token: dbToken } = await getUserRefreshToken(userId);
        // console.log(`[Refresh] Cookie: ${refreshToken.substring(0, 10)}... | DB: ${dbToken?.substring(0, 10)}...`);

        // Token Reuse Detected! Potential theft.
        // Revoke all tokens for this user to force re-login.
        await revokeRefreshToken(userId);
        return NextResponse.json({ error: 'Token reuse detected. Please log in again.' }, { status: 403 });
    }

    // Issue new pair
    const newAccessToken = signAccessToken({ userId });
    const newRefreshToken = signRefreshToken({ userId });

    // Update store with new token (RTR)
    await storeRefreshToken(userId, newRefreshToken);

    // Return new tokens
    const response = NextResponse.json({ accessToken: newAccessToken });

    // Set Access Token Cookie (Short-lived)
    response.cookies.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 15 * 60, // 15 minutes
    });

    // Set Refresh Token Cookie
    response.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
}
