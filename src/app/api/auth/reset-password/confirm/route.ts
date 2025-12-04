import { NextResponse } from 'next/server';
import { supabaseAdmin, updateUserPassword, findUserByEmail } from '@/lib/auth-db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, code, newPassword } = await request.json();

        if (!email || !code || !newPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Verify Code Again (Double check before changing password)
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

        // 2. Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 3. Update Password
        const { data: user } = await findUserByEmail(email);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { error: updateError } = await updateUserPassword(user.id, hashedPassword);

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
        }

        // 4. Delete used code (Optional but recommended)
        await supabaseAdmin
            .from('verification_codes')
            .delete()
            .eq('id', record.id);

        return NextResponse.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error("Reset Confirm Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
