import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth-admin";
import { supabaseAdmin, getAllUsersAdmin } from "@/lib/auth-db";

export async function POST(req: Request) {
    const { isAdmin, error } = await verifyAdminSession();

    if (!isAdmin) {
        return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, message, link, target } = body;

    if (!title || !message) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // For now, we only support 'all' target which sends to all users
    // In a real app, we would use a batch insert or a background job
    // Here we will just fetch all users and insert notifications (inefficient for large scale but fine for MVP)

    if (target === 'all') {
        // Fetch all users (this is dangerous for large user bases, should use pagination or background job)
        // Limiting to 100 for safety in this demo
        const { users } = await getAllUsersAdmin(1, 100);

        if (users) {
            const notifications = users.map(user => ({
                user_id: user.id,
                type: 'system',
                message: `[${title}] ${message} `,
                link: link || '/dashboard',
                read: false,
                created_at: new Date().toISOString()
            }));

            const { error: insertError } = await supabaseAdmin
                .from('notifications')
                .insert(notifications);

            if (insertError) {
                return NextResponse.json({ error: insertError.message }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ success: true });
}
