import { NextResponse } from 'next/server';
import { updateUserProfile } from '@/lib/auth-db';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { userId, nickname, avatarUrl } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const updates: { nickname?: string; avatar_url?: string } = {};
        if (nickname) updates.nickname = nickname;
        if (avatarUrl) updates.avatar_url = avatarUrl;

        const { data, error } = await updateUserProfile(userId, updates);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, user: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
