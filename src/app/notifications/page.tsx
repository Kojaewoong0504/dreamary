"use client";

import MobileLayout from "@/components/layout/MobileLayout";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Bell, Star } from "lucide-react";
import Link from "next/link";

const notifications = [
    { id: 1, type: "like", user: "Alice", message: "님이 당신의 꿈을 좋아합니다.", time: "방금 전", read: false },
    { id: 2, type: "system", user: "Dreamary", message: "새로운 화풍 '사이버펑크'가 추가되었습니다!", time: "1시간 전", read: false },
    { id: 3, type: "like", user: "Bob", message: "님이 '하늘을 나는 거북이'를 좋아합니다.", time: "3시간 전", read: true },
    { id: 4, type: "star", user: "Charlie", message: "님이 당신을 팔로우하기 시작했습니다.", time: "어제", read: true },
];

export default function NotificationsPage() {
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
                    <div className="space-y-3 mt-2">
                        {notifications.map((noti, index) => (
                            <motion.div
                                key={noti.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`glass-panel p-4 rounded-2xl flex items-start gap-4 border ${noti.read ? "border-white/5 bg-white/5" : "border-dream-cyan/30 bg-dream-cyan/5"
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${noti.type === "like" ? "bg-rose-500/20 text-rose-400" :
                                        noti.type === "system" ? "bg-dream-purple/20 text-dream-purple" :
                                            "bg-amber-500/20 text-amber-400"
                                    }`}>
                                    {noti.type === "like" && <Heart size={18} fill="currentColor" />}
                                    {noti.type === "system" && <Bell size={18} />}
                                    {noti.type === "star" && <Star size={18} fill="currentColor" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white/90 leading-snug">
                                        <span className="font-bold">{noti.user}</span>{noti.message}
                                    </p>
                                    <p className="text-[10px] text-white/40 mt-1">{noti.time}</p>
                                </div>
                                {!noti.read && (
                                    <div className="w-2 h-2 rounded-full bg-dream-cyan mt-2" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
