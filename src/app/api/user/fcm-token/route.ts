import { NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { updateUserFcmToken } from '@/lib/auth-db';
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

export async function POST(req: Request) {
    try {
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { token } = await req.json();
        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const { error } = await updateUserFcmToken(userId, token);
        if (error) {
            console.error('Update FCM Token Error:', error);
            return NextResponse.json({ error: 'Failed to update token' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('FCM Token API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
