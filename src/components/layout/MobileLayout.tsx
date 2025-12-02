"use client";

import { ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface MobileLayoutProps {
    children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                // Check if we already have the refreshToken cookie? 
                // Client can't check HTTP-only cookie easily.
                // We'll just hit the endpoint. It's safe to be idempotent.
                try {
                    await fetch("/api/auth/social", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ accessToken: session.access_token }),
                    });
                } catch (e) {
                    console.error("Token exchange failed", e);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="min-h-screen w-full bg-black/50 flex justify-center">
            <div className="w-full max-w-[430px] min-h-[100dvh] bg-dream-dark relative shadow-2xl overflow-hidden">
                {children}
            </div>
        </div>
    );
}
