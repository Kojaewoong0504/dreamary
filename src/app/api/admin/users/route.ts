
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth-admin";
import { getAllUsersAdmin, updateUserCredits } from "@/lib/auth-db";

export async function GET(req: Request) {
    const { isAdmin, error } = await verifyAdminSession();

    if (!isAdmin) {
        return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");

    const result = await getAllUsersAdmin(page);
    return NextResponse.json(result);
}

export async function POST(req: Request) {
    const { isAdmin, error } = await verifyAdminSession();

    if (!isAdmin) {
        return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, credits } = body;

    if (!userId || credits === undefined) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error: updateError } = await updateUserCredits(userId, credits);
    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}
