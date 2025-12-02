import { NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { getDreamComments, addComment, deleteComment } from '@/lib/auth-db';
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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { data, error } = await getDreamComments(id);
        if (error) throw error;
        return NextResponse.json({ comments: data });
    } catch (error) {
        console.error('Fetch comments error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const { content } = await req.json();
        if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

        const { data, error } = await addComment(userId, id, content);
        if (error) throw error;

        // Send Notification
        const { getDreamById } = await import('@/lib/auth-db');
        const { data: dream } = await getDreamById(id);

        if (dream && dream.user_id !== userId) {
            // 1. Save to Database
            const { createNotification } = await import('@/lib/auth-db');
            await createNotification(
                dream.user_id,
                'comment',
                `"${dream.title}" 꿈에 댓글이 달렸습니다.`,
                `/dream/${id}`,
                userId
            );

            // 2. Send Push Notification
            const { sendNotification } = await import('@/lib/notification');
            await sendNotification(
                dream.user_id,
                '새로운 댓글이 달렸습니다! 💬',
                `"${dream.title}" 꿈에 댓글이 달렸습니다: "${content.substring(0, 20)}${content.length > 20 ? '...' : ''}"`,
                `/dream/${id}`
            );
        }

        return NextResponse.json({ comment: data });
    } catch (error) {
        console.error('Add comment error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // params.id is not used here but we should still await it if we were to use it.
        // Actually DELETE comment uses commentId from body, but signature needs to match Next.js expectations.
        await params;

        const { commentId } = await req.json();
        const { error } = await deleteComment(commentId, userId);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete comment error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
