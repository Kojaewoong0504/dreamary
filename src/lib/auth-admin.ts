import { cookies } from "next/headers";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/jwt";
import { supabaseAdmin } from "@/lib/auth-db";

export async function verifyAdminSession() {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get("accessToken")?.value;
    let userId: string | null = null;

    // 1. Try Access Token
    if (accessToken) {
        const payload = verifyAccessToken(accessToken) as any;
        if (payload?.userId) {
            userId = payload.userId;
        }
    }

    // 2. Try Refresh Token if Access Token failed
    if (!userId) {
        const refreshToken = cookieStore.get("refreshToken")?.value;
        if (refreshToken) {
            const payload = verifyRefreshToken(refreshToken) as any;
            if (payload?.userId) {
                userId = payload.userId;
                // Note: In a full implementation, we should issue a new access token here
                // and set it in the response cookies. However, Next.js App Router API routes
                // make setting cookies in the middle of logic a bit complex (requires NextResponse).
                // For now, verifying identity via refresh token is sufficient for access control.
            }
        }
    }

    if (!userId) {
        return { isAdmin: false, error: "Invalid session" };
    }

    // Check is_admin in DB using Service Role
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('is_admin')
        .eq('id', userId)
        .single();

    if (error || !data?.is_admin) {
        return { isAdmin: false, error: "Not an admin" };
    }

    return { isAdmin: true, userId: userId };
}
