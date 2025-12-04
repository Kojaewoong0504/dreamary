import { NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { createPaymentRecord, updateUserCredits } from '@/lib/auth-db';
import { cookies } from 'next/headers';

const CREDITS_MAP: Record<string, number> = {
    'credit_10': 10,
    'credit_33': 33,
    'credit_55': 55
};

async function getUserId(req: Request) {
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token) as any;
        if (decoded?.userId) userId = decoded.userId;
    }
    if (!userId) {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;
        if (refreshToken) {
            const decoded = verifyRefreshToken(refreshToken) as any;
            if (decoded?.userId) userId = decoded.userId;
        }
    }
    return userId;
}

export async function POST(req: Request) {
    try {
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { paymentId, amount, packageId } = await req.json();

        // 1. Verify Payment with PortOne V2 API
        const secret = process.env.PORTONE_API_SECRET;
        if (!secret) {
            return NextResponse.json({ success: false, message: 'Server configuration error (PortOne Secret)' });
        }

        const paymentRes = await fetch(`https://api.portone.io/payments/${paymentId}`, {
            headers: { 'Authorization': `PortOne ${secret}` }
        });

        if (!paymentRes.ok) {
            return NextResponse.json({ success: false, message: 'Failed to fetch payment info' });
        }

        const paymentData = await paymentRes.json();
        // V2 Response structure: { id, status, amount: { total }, ... }

        // 2. Check Amount & Status
        if (paymentData.status !== 'PAID') {
            return NextResponse.json({ success: false, message: 'Payment not paid' });
        }
        if (paymentData.amount.total !== amount) {
            return NextResponse.json({ success: false, message: 'Amount mismatch' });
        }

        // 3. Record Payment
        // We use paymentId for both imp_uid and merchant_uid fields for compatibility
        await createPaymentRecord(userId, paymentId, paymentId, amount, 'paid');

        // 4. Add Credits
        const creditsToAdd = CREDITS_MAP[packageId] || 0;
        if (creditsToAdd > 0) {
            await updateUserCredits(userId, creditsToAdd);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
