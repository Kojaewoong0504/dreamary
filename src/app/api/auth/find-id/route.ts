import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/auth-db';
import { formatPhoneNumber } from '@/lib/formatters';

export async function POST(request: Request) {
    try {
        const { phoneNumber } = await request.json();

        if (!phoneNumber) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        const formattedPhone = formatPhoneNumber(phoneNumber);

        // Find user by phone number
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('email, provider')
            .eq('phone_number', formattedPhone)
            .single();

        if (error || !user) {
            // For security, we might want to return a generic message or same response
            // but for UX, we usually tell them "User not found".
            return NextResponse.json({ error: 'User not found with this phone number' }, { status: 404 });
        }

        // Mask Email (e.g., te**@gmail.com)
        const [local, domain] = user.email.split('@');
        const maskedLocal = local.length > 2
            ? local.slice(0, 2) + '*'.repeat(local.length - 2)
            : local.slice(0, 1) + '*';

        const maskedEmail = `${maskedLocal}@${domain}`;

        return NextResponse.json({
            email: maskedEmail,
            provider: user.provider
        });

    } catch (error) {
        console.error("Find ID Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
