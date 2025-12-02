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
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate Tokens
        const accessToken = signAccessToken({ userId: user.id, email: user.email });
        const refreshToken = signRefreshToken({ userId: user.id });

        // Store Refresh Token (RTR)
        storeRefreshToken(user.id, refreshToken);

        // Set Refresh Token in HTTP-only cookie
        const response = NextResponse.json({ accessToken, user: { id: user.id, email: user.email } });
        response.cookies.set('refreshToken', refreshToken, {
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
