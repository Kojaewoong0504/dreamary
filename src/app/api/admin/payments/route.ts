import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth-admin";
import { getAllPaymentsAdmin } from "@/lib/auth-db";

export async function GET(req: Request) {
    const { isAdmin, error } = await verifyAdminSession();

    if (!isAdmin) {
        return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");

    const result = await getAllPaymentsAdmin(page);
    return NextResponse.json(result);
}
