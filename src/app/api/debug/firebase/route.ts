import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const apps = firebaseAdmin.apps.length;
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
            ? "Present (Length: " + process.env.FIREBASE_SERVICE_ACCOUNT_KEY.length + ")"
            : "Missing";

        let parseResult = "Not attempted";
        try {
            if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
                const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
                parseResult = "Success";
                if (parsed.private_key) {
                    parseResult += ` (Key length: ${parsed.private_key.length})`;
                    if (parsed.private_key.includes('\\n')) parseResult += " [Has escaped newlines]";
                    if (parsed.private_key.includes('\n')) parseResult += " [Has real newlines]";
                } else {
                    parseResult += " [Missing private_key]";
                }
            }
        } catch (e: any) {
            parseResult = "Failed: " + e.message;
        }

        return NextResponse.json({
            status: 'ok',
            firebaseApps: apps,
            envVar: serviceAccount,
            jsonParse: parseResult,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message
        }, { status: 500 });
    }
}
