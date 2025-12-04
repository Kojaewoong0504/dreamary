"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Plus, Sparkles, Moon, Sun, Cloud } from "lucide-react";

export default function DashboardPage() {
    const [recentDreams, setRecentDreams] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalDreams: 0, monthDreams: 0, streak: 0, lucidDreams: 0 });
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("좋은 아침입니다");
        else if (hour < 18) setGreeting("좋은 오후입니다");
        else setGreeting("좋은 저녁입니다");

        const fetchData = async () => {
            try {
                // Fetch User Profile
                const profileRes = await fetch('/api/user/profile');
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setUser(data.profile);

                    // Admin Redirect Logic
                    if (data.profile?.is_admin) {
                        const searchParams = new URLSearchParams(window.location.search);
                        if (!searchParams.get("ignore_admin")) {
                            window.location.href = "/admin";
                            return; // Stop further rendering/fetching if redirecting
                        }
                    }
                }

                // Fetch Dreams
                const dreamsRes = await fetch('/api/user/dreams');
                if (dreamsRes.ok) {
                    const data = await dreamsRes.json();
                    setRecentDreams(data.dreams?.slice(0, 3) || []);
                }

                // Fetch Stats
                const statsRes = await fetch('/api/user/stats');
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats(prev => ({ ...prev, ...data.stats }));
                }

            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            {/* Hero / Greeting Section */}
            <section className="relative py-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">{user?.nickname || '여행자'}님</span>.
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl leading-relaxed mb-8">
                        오늘 밤은 어떤 꿈을 꾸셨나요? 당신의 무의식 속 이야기를 기록하고,<br className="hidden md:block" />
                        AI와 함께 생생한 시각적 경험으로 만들어보세요.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link
                            href="/dashboard/write"
                            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <Sparkles size={20} className="fill-white" />
                            <span>꿈 기록하기</span>
                        </Link>

                        <Link
                            href="/dashboard/community"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors backdrop-blur-sm"
                        >
                            <span>다른 꿈 구경하기</span>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Quick Stats */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                {[
                    { label: "기록된 꿈", value: stats.totalDreams, icon: Cloud, color: "text-cyan-400", bg: "bg-cyan-400/10" },
                    { label: "이번 달", value: stats.monthDreams, icon: Moon, color: "text-purple-400", bg: "bg-purple-400/10" },
                    { label: "자각몽", value: stats.lucidDreams || '-', icon: Sparkles, color: "text-yellow-400", bg: "bg-yellow-400/10" },
                    { label: "연속 기록", value: stats.streak ? `${stats.streak}일` : '-', icon: Sun, color: "text-orange-400", bg: "bg-orange-400/10" },
                ].map((stat, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4 hover:bg-white/10 transition-colors cursor-default">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-white/40 font-medium">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </motion.section>

            {/* Recent Dreams */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-8 rounded-full bg-gradient-to-b from-purple-500 to-cyan-500 block" />
                        최근 기록
                    </h2>
                    <Link href="/dashboard/dreams" className="group flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/5">
                        전체보기
                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
                    </div>
                ) : recentDreams.length > 0 ? (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {recentDreams.map((dream) => (
                            <motion.div variants={item} key={dream.id}>
                                <Link href={`/dashboard/dreams/${dream.id}`} className="group block h-full">
                                    <div className="h-full rounded-3xl overflow-hidden bg-gray-900/40 border border-white/10 hover:border-white/30 transition-all duration-500 relative shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
                                        {/* Image Area */}
                                        <div className="aspect-[4/3] overflow-hidden relative">
                                            <img
                                                src={dream.image_url}
                                                alt={dream.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                            {/* Floating Tag */}
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                                                    {dream.tags?.[0] || 'Dream'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        <div className="p-6 relative">
                                            <div className="absolute -top-10 right-4 w-12 h-12 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center shadow-lg group-hover:bg-white group-hover:text-black transition-colors duration-300">
                                                <ChevronRight size={20} />
                                            </div>

                                            <div className="text-xs text-white/40 mb-2 flex items-center gap-2">
                                                <span>{new Date(dream.created_at).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                                <span>{dream.likes || 0} Likes</span>
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                                                {dream.title}
                                            </h3>
                                            <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
                                                {dream.content}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <Sparkles size={24} className="text-white/20" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">아직 기록된 꿈이 없습니다</h3>
                        <p className="text-white/40 mb-6">오늘 밤 꾼 꿈을 첫 번째로 기록해보세요.</p>
                        <Link href="/dashboard/write" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline">
                            꿈 기록하러 가기 &rarr;
                        </Link>
                    </motion.div>
                )}
            </section>
        </div>
    );
}
