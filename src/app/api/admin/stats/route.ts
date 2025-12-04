import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth-admin";
import { getSystemStatsAdmin } from "@/lib/auth-db";

export async function GET() {
    const { isAdmin, error } = await verifyAdminSession();

    if (!isAdmin) {
        return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    const stats = await getSystemStatsAdmin();
    return NextResponse.json(stats);
}
