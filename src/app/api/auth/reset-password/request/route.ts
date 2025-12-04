import { NextResponse } from 'next/server';
import { supabaseAdmin, findUserByEmail } from '@/lib/auth-db';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 1. Check if user exists
        const { data: user } = await findUserByEmail(email);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Check if Social User
        if (user.provider !== 'email') {
            return NextResponse.json({
                isSocial: true,
                provider: user.provider
            });
        }

        // 3. Generate 6-digit Code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 4. Save to DB
        const { error: dbError } = await supabaseAdmin
            .from('verification_codes')
            .insert([{
                email,
                code,
                type: 'RESET_PASSWORD',
                expires_at: expiresAt.toISOString()
            }]);

        if (dbError) {
            console.error("DB Error:", dbError);
            return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
        }

        // 5. Send Email
        const result = await sendVerificationEmail(email, code);

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Verification code sent' });

    } catch (error) {
        console.error("Reset Request Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
