import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/auth-db';

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
        }

        // Verify Code
        const { data: record, error } = await supabaseAdmin
            .from('verification_codes')
            .select('*')
            .eq('email', email)
            .eq('code', code)
            .eq('type', 'RESET_PASSWORD')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !record) {
            return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
        }

        // In a real app, we might issue a temporary "reset token" here.
        // For simplicity, we'll just return success and trust the client to call 'confirm' with the code again,
        // OR we can delete the code here and issue a token. 
        // Let's keep it simple: Client sends code again to 'confirm' endpoint to prove they have it.

        return NextResponse.json({ success: true, message: 'Code verified' });

    } catch (error) {
        console.error("Verify Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
