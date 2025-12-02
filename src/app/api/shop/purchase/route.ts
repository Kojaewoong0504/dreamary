import { NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { updateUserCredits } from '@/lib/auth-db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        let userId: string | null = null;

        // 1. Try Authorization Header
        const authHeader = req.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = verifyAccessToken(token) as any;
            if (decoded?.userId) userId = decoded.userId;
        }

        // 2. Try Cookie if Header failed
        if (!userId) {
            const cookieStore = await cookies();
            const refreshToken = cookieStore.get('refreshToken')?.value;
            if (refreshToken) {
                const decoded = verifyRefreshToken(refreshToken) as any;
                if (decoded?.userId) userId = decoded.userId;
            }
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { packageId, credits, price } = await req.json();

        if (!credits || credits <= 0) {
            return NextResponse.json({ error: "Invalid credit amount" }, { status: 400 });
        }

        // --- MOCK PAYMENT VERIFICATION ---
        // In a real app, we would verify the payment with Stripe/Toss here.
        // For now, we assume success if the request reaches here.
        const isPaymentSuccessful = true;

        if (!isPaymentSuccessful) {
            return NextResponse.json({ error: "Payment failed" }, { status: 402 });
        }
        // ---------------------------------

        // Handle Subscription Logic
        if (packageId === 'subscription_monthly') {
            const { updateUserPremium } = await import('@/lib/auth-db');
            const { error: premiumError } = await updateUserPremium(userId, true);

            if (premiumError) {
                console.error("Failed to update premium status", premiumError);
                return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 });
            }
        }

        // Add Credits
        const { error: updateError } = await updateUserCredits(userId, credits);

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully purchased ${credits} credits`,
            addedCredits: credits,
            isPremium: packageId === 'subscription_monthly'
        });

    } catch (error) {
        console.error('Purchase error:', error);
        return NextResponse.json(
            { error: 'Failed to process purchase' },
            { status: 500 }
        );
    }
}
