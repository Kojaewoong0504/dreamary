import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { findUserByEmail, createUser } from '@/lib/auth-db';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { storeRefreshToken } from '@/lib/tokenStore';

export async function POST(request: Request) {
    try {
        const { accessToken } = await request.json();

        if (!accessToken) {
            return NextResponse.json({ error: 'Access token required' }, { status: 400 });
        }

        // Verify Supabase Token
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(accessToken);

        if (error || !supabaseUser || !supabaseUser.email) {
            return NextResponse.json({ error: 'Invalid Supabase token' }, { status: 401 });
        }

        const email = supabaseUser.email;

        // Find or Create User in our DB
        let { data: user } = await findUserByEmail(email);

        if (!user) {
            // Create new user with null password for social login
            const avatarUrl = supabaseUser.user_metadata?.avatar_url || null;
            const nickname = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || "Dreamer";
            const { data: newUser, error: createError } = await createUser(email, null, 'google', avatarUrl, null, null, nickname);

            if (createError) {
                return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
            }
            user = newUser;
        }

        // Generate Custom Tokens
        const newAccessToken = signAccessToken({ userId: user.id, email: user.email });
        const newRefreshToken = signRefreshToken({ userId: user.id });

        // Store Refresh Token (RTR)
        await storeRefreshToken(user.id, newRefreshToken);

        // Set Cookies
        const response = NextResponse.json({ accessToken: newAccessToken, user: { id: user.id, email: user.email } });

        // 1. Access Token (Short-lived)
        response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 15 * 60, // 15 minutes
        });

        // 2. Refresh Token (Long-lived)
        response.cookies.set('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
