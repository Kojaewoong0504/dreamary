"use client";

import MobileLayout from "@/components/layout/MobileLayout";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Bell, Star, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Notification {
    id: number;
    type: string;
    message: string;
    created_at: string;
    read: boolean;
    link: string;
    sender: {
        nickname: string;
        avatar_url: string | null;
    } | null;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);

                    // Mark as read immediately when viewing the list
                    if (data.notifications?.some((n: any) => !n.read)) {
                        await fetch('/api/notifications/read', { method: 'POST' });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <MobileLayout>
            <div className="flex flex-col min-h-screen pb-safe relative overflow-hidden bg-dream-dark">
                {/* Ambient Glows */}
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[60%] bg-dream-purple/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

                {/* Header */}
                <header className="px-6 pt-14 pb-4 flex items-center gap-4 z-20 relative">
                    <Link href="/" className="p-2 -ml-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5">
                        <ArrowLeft size={22} />
                    </Link>
                    <h1 className="text-lg font-bold text-white tracking-tight">알림</h1>
                </header>

                <div className="flex-1 px-6 z-10 relative overflow-y-auto pb-safe scrollbar-hide">
                    {loading ? (
                        <div className="text-center text-white/50 mt-10">로딩 중...</div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center text-white/50 mt-10">새로운 알림이 없습니다.</div>
                    ) : (
                        <div className="space-y-3 mt-2">
                            {notifications.map((noti, index) => (
                                <Link href={noti.link || '#'} key={noti.id}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`glass-panel p-4 rounded-2xl flex items-start gap-4 border mb-3 ${noti.read ? "border-white/5 bg-white/5" : "border-dream-cyan/30 bg-dream-cyan/5"
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${noti.type === "like" ? "bg-rose-500/20 text-rose-400" :
                                            noti.type === "comment" ? "bg-blue-500/20 text-blue-400" :
                                                "bg-dream-purple/20 text-dream-purple"
                                            }`}>
                                            {noti.type === "like" && <Heart size={18} fill="currentColor" />}
                                            {noti.type === "comment" && <MessageCircle size={18} />}
                                            {noti.type === "system" && <Bell size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white/90 leading-snug">
                                                {noti.sender && <span className="font-bold mr-1">{noti.sender.nickname}</span>}
                                                {noti.message}
                                            </p>
                                            <p className="text-[10px] text-white/40 mt-1">
                                                {formatDistanceToNow(new Date(noti.created_at), { addSuffix: true, locale: ko })}
                                            </p>
                                        </div>
                                        {!noti.read && (
                                            <div className="w-2 h-2 rounded-full bg-dream-cyan mt-2" />
                                        )}
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
}
