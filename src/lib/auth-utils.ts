import { verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function getUserIdFromRequest(req: Request): Promise<string | null> {
    let userId: string | null = null;

    // 1. Try Authorization Header
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token) as any;
        if (decoded?.userId) return decoded.userId;
    }

    const cookieStore = await cookies();

    // 2. Try Access Token Cookie
    const accessToken = cookieStore.get('accessToken')?.value;
    if (accessToken) {
        const decoded = verifyAccessToken(accessToken) as any;
        if (decoded?.userId) return decoded.userId;
    }

    // 3. Try Refresh Token Cookie (Fallback)
    const refreshToken = cookieStore.get('refreshToken')?.value;
    if (refreshToken) {
        const decoded = verifyRefreshToken(refreshToken) as any;
        if (decoded?.userId) return decoded.userId;
    }

    return null;
}
