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

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const { data, error } = await getDreamComments(params.id);
        if (error) throw error;
        return NextResponse.json({ comments: data });
    } catch (error) {
        console.error('Fetch comments error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { content } = await req.json();
        if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

        const { data, error } = await addComment(userId, params.id, content);
        if (error) throw error;

        return NextResponse.json({ comment: data });
    } catch (error) {
        console.error('Add comment error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { commentId } = await req.json();
        const { error } = await deleteComment(commentId, userId);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete comment error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
