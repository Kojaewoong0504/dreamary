import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        // Clear the refresh token cookie
        const cookieStore = await cookies();
        cookieStore.delete('refreshToken');

        return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}
