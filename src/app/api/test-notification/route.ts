import { NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { sendNotification } from '@/lib/notification';
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

        // Parse body for delay
        let delay = 0;
        try {
            const body = await req.json().catch(() => ({}));
            if (body.delay) delay = body.delay;
        } catch (e) { }

        if (delay > 0) {
            console.log(`Waiting ${delay} seconds before sending...`);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }

        // 1. Save to Database
        const { createNotification } = await import('@/lib/auth-db');
        await createNotification(
            userId,
            'system',
            '🔔 알림 테스트 성공! (목록에도 저장됨)',
            '/',
            null // System notification has no sender
        );

        // 2. Send Push Notification
        const fcmResult = await sendNotification(
            userId,
            '🔔 알림 테스트 성공!',
            '이 알림이 보인다면 설정이 완벽하게 된 것입니다.',
            '/'
        );

        return NextResponse.json({
            success: true,
            message: 'Notification saved to DB',
            fcmResult
        });
    } catch (error) {
        console.error('Test notification error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
