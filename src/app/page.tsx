"use client";

import MobileLayout from "@/components/layout/MobileLayout";
import BottomNav from "@/components/layout/BottomNav";
import WireframeOrb from "@/components/ui/WireframeOrb"; // Import Orb
import { motion } from "framer-motion";
import { ChevronRight, Bell, Search } from "lucide-react"; // Removed Sparkles

import Link from "next/link";

import { useState, useEffect } from "react";

import { useNotification } from "@/contexts/NotificationContext";

export default function Home() {
    const [recentDreams, setRecentDreams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { hasUnread } = useNotification(); // Use global state

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Recent Dreams
                const dreamsRes = await fetch('/api/user/dreams');
                if (dreamsRes.ok) {
                    const data = await dreamsRes.json();
                    setRecentDreams(data.dreams?.slice(0, 2) || []);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    return (
        <MobileLayout>
            <div className="flex flex-col min-h-screen pb-24 relative overflow-hidden">
                {/* Ambient Glows (Enhanced & Purified) */}
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[80%] bg-cyan-400/30 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[80%] bg-blue-500/20 rounded-full blur-[130px] pointer-events-none mix-blend-screen" />
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80%] h-[60%] bg-white/10 rounded-full blur-[100px] pointer-events-none mix-blend-overlay" />

                {/* Header Area */}
                <header className="px-6 pt-14 pb-6 flex justify-between items-center z-10">
                    <h1 className="text-xl font-medium tracking-tight text-white/90">
                        Dreamary
                    </h1>
                    <div className="flex items-center gap-3">
                        <Link href="/search" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                            <Search size={16} className="text-white/70" />
                        </Link>
                        <Link href="/notifications" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md relative">
                            <Bell size={16} className="text-white/70" />
                            {hasUnread && (
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            )}
                        </Link>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="px-6 py-10 z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, type: "spring" }}
                        className="relative mb-6"
                    >
                        <WireframeOrb />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        <h2 className="text-3xl font-light text-white mb-3 leading-tight">
                            꿈을 기록하고<br />
                            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                                시각화하세요
                            </span>
                        </h2>
                        <p className="text-sm text-dream-text-secondary font-light tracking-wide">
                            당신의 무의식이 들려주는 이야기에 귀 기울여보세요.
                        </p>
                    </motion.div>
                </section>

                {/* Recent Dreams */}
                <section className="px-6 mt-auto z-10">
                    <div className="flex justify-between items-end mb-5">
                        <h3 className="text-sm font-medium text-white/80">최근 기록</h3>
                        <Link href="/archive" className="text-xs text-dream-text-muted hover:text-white transition-colors flex items-center gap-1">
                            전체보기 <ChevronRight size={12} />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
                            </div>
                        ) : recentDreams.length > 0 ? (
                            recentDreams.map((dream) => (
                                <motion.div
                                    key={dream.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                                    className="glass-panel p-4 rounded-2xl group cursor-pointer transition-all"
                                >
                                    <Link href={`/dream/${dream.id}`} className="flex gap-4 items-center w-full">
                                        <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex-shrink-0 overflow-hidden relative shadow-inner">
                                            <img src={dream.image_url} alt={dream.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-dream-text-muted mb-1 font-medium tracking-wider">
                                                {new Date(dream.created_at).toLocaleDateString()}
                                            </p>
                                            <h4 className="text-sm font-medium text-white/95 truncate">
                                                {dream.title}
                                            </h4>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-dream-text-secondary border border-white/10">
                                                    {dream.style}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-sm text-white/40 mb-2">아직 기록된 꿈이 없습니다.</p>
                                <Link href="/write" className="text-xs text-dream-cyan hover:underline">
                                    첫 번째 꿈 기록하기
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            </div >
            <BottomNav />
        </MobileLayout >
    );
}
