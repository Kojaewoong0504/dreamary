import { NextResponse } from 'next/server';
import { markNotificationsAsRead } from '@/lib/auth-db';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

// Helper to get user ID (duplicating logic for now to be safe/fast)
async function getUserIdFromReq(req: Request): Promise<string | null> {
    try {
        const authHeader = req.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = verifyAccessToken(token) as any;
            if (decoded?.userId) return decoded.userId;
        }
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;
        if (refreshToken) {
            const decoded = verifyRefreshToken(refreshToken) as any;
            if (decoded?.userId) return decoded.userId;
        }
        return null;
    } catch (e) {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getUserIdFromReq(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error } = await markNotificationsAsRead(userId);
        if (error) {
            console.error('Mark Read Error:', error);
            return NextResponse.json({ error: 'Failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
