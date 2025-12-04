import { NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { getUserStats } from '@/lib/auth-db';
import { cookies } from 'next/headers';

// Helper to get user ID from request
async function getUserId(req: Request) {
    let userId: string | null = null;

    // 1. Try Authorization Header
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token) as any;
        if (decoded?.userId) userId = decoded.userId;
    }

    // 2. Try Cookie if Header failed
    if (!userId) {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;
        if (refreshToken) {
            const decoded = verifyRefreshToken(refreshToken) as any;
            if (decoded?.userId) userId = decoded.userId;
        }
    }
    return userId;
}

export async function GET(req: Request) {
    try {
        const userId = await getUserId(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stats = await getUserStats(userId);

        return NextResponse.json({ stats });
    } catch (error) {
        console.error('Fetch user stats error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
