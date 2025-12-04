import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '@/lib/auth-db';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { storeRefreshToken } from '@/lib/tokenStore';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Find user
        const { data: user } = await findUserByEmail(email);
        if (!user) {
            console.log("Login failed: User not found for email", email);
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password
        if (!user.password_hash) {
            console.log("Login failed: No password hash for user", email);
            return NextResponse.json({ error: 'Please log in with your social account' }, { status: 400 });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            console.log("Login failed: Password mismatch for user", email);
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate Tokens
        const accessToken = signAccessToken({ userId: user.id, email: user.email });
        const refreshToken = signRefreshToken({ userId: user.id });

        // Store Refresh Token (RTR)
        await storeRefreshToken(user.id, refreshToken);

        // Set Cookies
        const response = NextResponse.json({ accessToken, user: { id: user.id, email: user.email } });

        // 1. Access Token (Short-lived)
        response.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 15 * 60, // 15 minutes
        });

        // 2. Refresh Token (Long-lived)
        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;

    } catch (error) {
        console.error("Login API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
