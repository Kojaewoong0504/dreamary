"use client";

import { useState, useEffect } from "react";
import { User, Mail, Calendar, Star, TrendingUp, Settings, Edit } from "lucide-react";
import Link from "next/link";

export default function DashboardProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dreams, setDreams] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Profile
                const profileRes = await fetch('/api/user/profile');
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setUser(data.profile);
                }

                // Fetch Stats
                const statsRes = await fetch('/api/user/stats');
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats(data.stats);
                }

                // Fetch Recent Dreams
                const dreamsRes = await fetch('/api/user/dreams');
                if (dreamsRes.ok) {
                    const data = await dreamsRes.json();
                    setDreams(data.dreams || []);
                }
            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-purple-900/20 to-cyan-900/20 rounded-3xl p-8 border border-white/10 overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <Link
                        href="/dashboard/settings/profile"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm text-white/80"
                    >
                        <Edit size={16} />
                        프로필 수정
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 to-cyan-500 shadow-2xl shadow-purple-500/20">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden relative group">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5">
                                    <User size={48} className="text-white/40" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-3xl font-bold text-white">{user?.nickname || "Dreamer"}</h1>
                        <div className="flex flex-col md:flex-row items-center gap-4 text-white/60 text-sm">
                            <div className="flex items-center gap-2">
                                <Mail size={16} />
                                {user?.email}
                            </div>
                            <div className="hidden md:block w-1 h-1 rounded-full bg-white/20" />
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${user?.is_premium
                                        ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                                        : "bg-white/5 border-white/10 text-white/60"
                                    }`}>
                                    {user?.is_premium ? "Premium Plan" : "Free Plan"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3 mb-2 text-purple-400">
                        <Star size={20} />
                        <span className="text-sm font-medium">총 꿈 기록</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.totalDreams || 0}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3 mb-2 text-cyan-400">
                        <Calendar size={20} />
                        <span className="text-sm font-medium">이번 달 기록</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.monthDreams || 0}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3 mb-2 text-yellow-400">
                        <TrendingUp size={20} />
                        <span className="text-sm font-medium">보유 크레딧</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{user?.credits || 0} C</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold text-white">최근 활동</h3>
                    <Link href="/dashboard/dreams" className="text-sm text-cyan-400 hover:text-cyan-300">
                        전체보기
                    </Link>
                </div>

                {dreams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dreams.slice(0, 4).map((dream) => (
                            <Link
                                key={dream.id}
                                href={`/dashboard/dreams/${dream.id}`}
                                className="block group bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                                        {dream.title || "제목 없음"}
                                    </h4>
                                    <span className="text-xs text-white/40 whitespace-nowrap ml-4">
                                        {new Date(dream.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-white/60 line-clamp-2 mb-3">
                                    {dream.content}
                                </p>
                                <div className="flex gap-2">
                                    {dream.tags?.slice(0, 2).map((tag: string, i: number) => (
                                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/40">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                        <p className="text-white/40 text-sm">아직 기록된 꿈이 없습니다.</p>
                        <Link href="/dashboard/write" className="inline-block mt-4 px-6 py-2 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-sm font-medium transition-colors">
                            첫 꿈 기록하기
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
