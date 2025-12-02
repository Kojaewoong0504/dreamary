"use client";

import MobileLayout from "@/components/layout/MobileLayout";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ArrowLeft, Heart, Bell, MessageCircle, Trash2, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useNotification } from "@/contexts/NotificationContext";
import { useRouter } from "next/navigation";

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
    const { refreshUnreadCount } = useNotification();
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            await fetch('/api/notifications/read', { method: 'POST' });
            refreshUnreadCount();
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.filter(n => n.id !== id));
            await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
            refreshUnreadCount();
        } catch (error) {
            console.error("Failed to delete notification", error);
            fetchNotifications(); // Revert on error
        }
    };

    const handleItemClick = async (noti: Notification) => {
        if (!noti.read) {
            // Mark as read silently
            // We don't need to wait for this to navigate
            fetch('/api/notifications/read', { method: 'POST' }).then(() => refreshUnreadCount());
        }
        router.push(noti.link || '#');
    };

    return (
        <MobileLayout>
            <div className="flex flex-col min-h-screen pb-safe relative overflow-hidden bg-dream-dark">
                {/* Ambient Glows */}
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[60%] bg-dream-purple/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

                {/* Header */}
                <header className="px-6 pt-14 pb-4 flex items-center justify-between z-20 relative">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5">
                            <ArrowLeft size={22} />
                        </Link>
                        <h1 className="text-lg font-bold text-white tracking-tight">알림</h1>
                    </div>
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-medium text-dream-cyan hover:text-white transition-colors flex items-center gap-1 px-3 py-1.5 rounded-full bg-dream-cyan/10 hover:bg-dream-cyan/20"
                        >
                            <CheckCheck size={14} />
                            모두 읽음
                        </button>
                    )}
                </header>

                <div className="flex-1 px-6 z-10 relative overflow-y-auto pb-safe scrollbar-hide">
                    {loading ? (
                        <div className="text-center text-white/50 mt-10">로딩 중...</div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center text-white/50 mt-10">새로운 알림이 없습니다.</div>
                    ) : (
                        <div className="space-y-3 mt-2 pb-20">
                            <AnimatePresence mode="popLayout">
                                {notifications.map((noti) => (
                                    <motion.div
                                        key={noti.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                                        className="relative group"
                                    >
                                        {/* Background for Swipe Action */}
                                        <div className="absolute inset-0 bg-red-500/20 rounded-2xl flex items-center justify-end pr-6 z-0">
                                            <Trash2 size={20} className="text-red-500" />
                                        </div>

                                        {/* Foreground Card */}
                                        <motion.div
                                            drag="x"
                                            dragConstraints={{ left: 0, right: 0 }}
                                            dragElastic={{ left: 0.5, right: 0 }}
                                            onDragEnd={(e, info: PanInfo) => {
                                                if (info.offset.x < -100) {
                                                    handleDelete(noti.id);
                                                }
                                            }}
                                            onClick={() => handleItemClick(noti)}
                                            className={`relative z-10 glass-panel p-4 rounded-2xl flex items-start gap-4 border cursor-pointer active:cursor-grabbing bg-dream-dark/90 backdrop-blur-xl ${noti.read ? "border-white/5 opacity-60" : "border-dream-cyan/30 bg-dream-cyan/5"
                                                }`}
                                            whileTap={{ scale: 0.98 }}
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
                                                <div className="w-2 h-2 rounded-full bg-dream-cyan mt-2 flex-shrink-0" />
                                            )}
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
}
