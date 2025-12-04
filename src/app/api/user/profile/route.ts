import { NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { getUserProfile } from '@/lib/auth-db';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
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

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Fetching profile for userId:', userId);
        const { profile, error } = await getUserProfile(userId);

        if (error) {
            console.error('getUserProfile Error:', error);
            return NextResponse.json({ error: 'Failed to fetch profile: ' + error.message }, { status: 500 });
        }

        return NextResponse.json({ profile });

    } catch (error: any) {
        console.error('Profile API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
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

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { nickname, avatar_url } = body;

        // Validate input
        if (nickname && nickname.length > 20) {
            return NextResponse.json({ error: 'Nickname must be 20 characters or less' }, { status: 400 });
        }

        // Update profile
        const { updateUserProfile } = await import('@/lib/auth-db');
        const { data, error } = await updateUserProfile(userId, { nickname, avatar_url });

        if (error) {
            return NextResponse.json({ error: 'Failed to update profile: ' + error.message }, { status: 500 });
        }

        return NextResponse.json({ profile: data });

    } catch (error: any) {
        console.error('Profile Update API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
