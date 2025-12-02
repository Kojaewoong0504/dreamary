"use client";

import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";

interface MobileLayoutProps {
    children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
    const [toast, setToast] = useState<{ title: string; body: string; visible: boolean }>({ title: '', body: '', visible: false });

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                // Check if we already have the refreshToken cookie? 
                // Client can't check HTTP-only cookie easily.
                // We'll just hit the endpoint. It's safe to be idempotent.
                if (event === 'SIGNED_IN') {
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

                // Request Notification Permission & Save Token (Run always if session exists)
                try {
                    // 1. Request Permission & Save Token
                    const { requestNotificationPermission } = await import("@/lib/firebase");
                    const token = await requestNotificationPermission();
                    if (!token) console.log("❌ No FCM Token obtained. Permission denied or insecure context?");
                    if (token) {
                        await fetch('/api/user/fcm-token', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token }),
                        });
                    }

                    // 2. Listen for Foreground Messages
                    console.log("🎧 Setting up foreground listener...");
                    const { messaging } = await import("@/lib/firebase");
                    const msg = await messaging();

                    if (msg) {
                        const { onMessage } = await import('firebase/messaging');
                        onMessage(msg, (payload) => {
                            console.log('🚨 Foreground Message Received:', payload);
                            setToast({
                                title: payload.notification?.title || '알림',
                                body: payload.notification?.body || '',
                                visible: true
                            });
                            setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
                        });
                        console.log("✅ Foreground listener attached!");
                    } else {
                        console.log("❌ Firebase Messaging not supported in this browser.");
                    }
                } catch (e) {
                    console.error("🔥 Token exchange or FCM failed", e);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-dream-dark text-white font-sans selection:bg-dream-cyan/30 selection:text-white">
            <main className="max-w-md mx-auto min-h-screen bg-dream-dark relative shadow-2xl overflow-hidden">
                {children}

                {/* Foreground Notification Toast */}
                <AnimatePresence>
                    {toast.visible && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, y: -50, x: "-50%" }}
                            className="fixed top-4 left-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl z-50 flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-full bg-dream-cyan/20 flex items-center justify-center text-dream-cyan">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-white">{toast.title}</h4>
                                <p className="text-xs text-white/80">{toast.body}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
