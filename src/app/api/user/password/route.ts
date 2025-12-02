import { NextResponse } from 'next/server';
import { updateUserPassword } from '@/lib/auth-db';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { userId, newPassword } = await request.json();

        if (!userId || !newPassword) {
            return NextResponse.json({ error: 'User ID and new password are required' }, { status: 400 });
        }

        // Hash the new password
        const passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');

        const { data, error } = await updateUserPassword(userId, passwordHash);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
