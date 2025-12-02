import { NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { toggleLike, getLikeStatus } from '@/lib/auth-db';
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

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const { liked, error } = await toggleLike(userId, id);
        if (error) throw error;

        // Send Notification if Liked
        if (liked) {
            // We need to fetch the dream owner to notify them
            // Importing getDreamById here might be circular or heavy, let's just use a quick query or helper
            // Actually, let's use getDreamById from auth-db
            const { getDreamById } = await import('@/lib/auth-db');
            const { data: dream } = await getDreamById(id);

            if (dream && dream.user_id !== userId) { // Don't notify self
                // 1. Save to Database
                const { createNotification } = await import('@/lib/auth-db');
                await createNotification(
                    dream.user_id,
                    'like',
                    `"${dream.title}" 꿈에 좋아요가 눌렸습니다.`,
                    `/dream/${id}`,
                    userId
                );

                // 2. Send Push Notification
                const { sendNotification } = await import('@/lib/notification');
                await sendNotification(
                    dream.user_id,
                    '누군가 당신의 꿈을 좋아합니다! ❤️',
                    `"${dream.title}" 꿈에 좋아요가 눌렸습니다.`,
                    `/dream/${id}`
                );
            }
        }

        return NextResponse.json({ liked });
    } catch (error) {
        console.error('Toggle like error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ liked: false }); // Not logged in

        const { id } = await params;
        const { liked, error } = await getLikeStatus(userId, id);
        if (error) throw error;

        return NextResponse.json({ liked });
    } catch (error) {
        console.error('Get like status error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
