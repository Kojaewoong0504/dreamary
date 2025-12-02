import { NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { getNotifications } from '@/lib/auth-db';
import { cookies } from 'next/headers';

async function getUserId(req: Request) {
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token) as any;
        if (decoded?.userId) userId = decoded.userId;
    }
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

        const { data, error } = await getNotifications(userId);
        if (error) throw error;

        return NextResponse.json({ notifications: data });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
