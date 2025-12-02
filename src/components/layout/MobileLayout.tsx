"use client";

import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";

interface MobileLayoutProps {
    children: ReactNode;
}

import { useNotification } from "@/contexts/NotificationContext";

export default function MobileLayout({ children }: MobileLayoutProps) {
    const [toast, setToast] = useState<{ title: string; body: string; visible: boolean }>({ title: '', body: '', visible: false });
    const { refreshUnreadCount } = useNotification();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                if (event === 'SIGNED_IN') {
                    refreshUnreadCount(); // Refresh on sign in
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

                try {
                    // 1. Request Permission & Save Token
                    const { requestNotificationPermission } = await import("@/lib/firebase");
                    const token = await requestNotificationPermission();
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

                            // Show Toast
                            setToast({
                                title: payload.notification?.title || '알림',
                                body: payload.notification?.body || '',
                                visible: true
                            });

                            // Refresh Badge
                            refreshUnreadCount();

                            // Hide after 5 seconds (Increased duration)
                            setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 5000);
                        });
                        console.log("✅ Foreground listener attached!");
                    }
                } catch (e) {
                    console.error("🔥 Token exchange or FCM failed", e);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [refreshUnreadCount]);

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
                            onClick={() => setToast(prev => ({ ...prev, visible: false }))}
                        >
                            <div className="w-10 h-10 rounded-full bg-dream-cyan/20 flex items-center justify-center text-dream-cyan flex-shrink-0">
                                <Bell size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-white truncate">{toast.title}</h4>
                                <p className="text-xs text-white/80 line-clamp-2">{toast.body}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
