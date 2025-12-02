
import { NextResponse } from 'next/server';
import { getDreamById, deleteDream, updateDream, getDreamByIdAdmin } from '@/lib/auth-db';
import { verifyAccessToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { getUserIdFromRequest } from '@/lib/auth-utils';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log(`[Dream API] Fetching dream with ID: ${id}`);

        // 1. Get User ID (Robust check)
        const userId = await getUserIdFromRequest(request);

        // 2. Fetch Dream (using Admin to bypass RLS initially)
        const { data: dream, error } = await getDreamByIdAdmin(id);

        if (error) {
            console.error('[Dream API] Database error:', error);
            return NextResponse.json({ error: 'Failed to fetch dream' }, { status: 500 });
        }

        if (!dream) {
            console.warn(`[Dream API] Dream not found for ID: ${id}`);
            return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
        }

        // 3. Check Permissions
        // Allow if dream is public OR if the requester is the owner
        const isOwner = userId && dream.user_id === userId;
        console.log(`[Dream API] Permission check - DreamID: ${id}, Public: ${dream.is_public}, UserID: ${userId}, OwnerID: ${dream.user_id}, IsOwner: ${isOwner}`);

        if (!dream.is_public && !isOwner) {
            console.warn(`[Dream API] Access denied for dream ${id}. Public: ${dream.is_public}, Owner: ${isOwner}`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json({ dream });
    } catch (error) {
        console.error('[Dream API] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Verify authentication
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded || typeof decoded === 'string') {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = decoded.userId;

        const { error } = await deleteDream(id, userId);

        if (error) {
            console.error('Delete dream error:', error);
            return NextResponse.json({ error: 'Failed to delete dream' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Dream deleted successfully' });
    } catch (error) {
        console.error('Delete dream error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Verify authentication
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded || typeof decoded === 'string') {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = decoded.userId;

        // Filter allowed updates
        const allowedUpdates = ['title', 'content', 'interpretation', 'is_public', 'tags'];
        const updates: any = {};

        Object.keys(body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = body[key];
            }
        });

        const { data, error } = await updateDream(id, userId, updates);

        if (error) {
            console.error('Update dream error:', error);
            return NextResponse.json({ error: 'Failed to update dream' }, { status: 500 });
        }

        return NextResponse.json({ dream: data });
    } catch (error) {
        console.error('Update dream error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
