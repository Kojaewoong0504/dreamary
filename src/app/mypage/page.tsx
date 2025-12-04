"use client";

import MobileLayout from "@/components/layout/MobileLayout";
import BottomNav from "@/components/layout/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, User, LogOut, ChevronRight, Star, Zap, Calendar, Coins, PlayCircle, Crown, Sparkles, Lock, X, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import SettingsModal from "@/components/profile/SettingsModal";
import Link from "next/link";

export default function MyPage() {
    // State
    const [credits, setCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAd, setShowAd] = useState(false);
    const [adTimer, setAdTimer] = useState(5);
    const [showSettings, setShowSettings] = useState(false);
    const [userDreams, setUserDreams] = useState<any[]>([]);
    const [isPremium, setIsPremium] = useState(false);
    const [profile, setProfile] = useState<{ nickname: string; avatar_url: string | null; level: string }>({
        nickname: "Dreamer",
        avatar_url: null,
        level: "Lucid Dreamer"
    });

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Profile (Credits + Premium + Info)
                const profileRes = await fetch('/api/user/profile');
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setCredits(data.profile.credits);
                    setIsPremium(data.profile.is_premium || false);
                    setProfile(prev => ({
                        ...prev,
                        nickname: data.profile.nickname || "Dreamer",
                        avatar_url: data.profile.avatar_url || null
                    }));
                }

                // Fetch User Dreams
                const dreamsRes = await fetch('/api/user/dreams');
                if (dreamsRes.ok) {
                    const data = await dreamsRes.json();
                    setUserDreams(data.dreams || []);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Ad Logic
    const handleWatchAd = () => {
        setShowAd(true);
        setAdTimer(5);

        const timer = setInterval(() => {
            setAdTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finishAd();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const finishAd = async () => {
        try {
            const res = await fetch('/api/ad/reward', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setCredits(data.remainingCredits);
                // Show success toast or animation here if needed
            }
        } catch (error) {
            console.error('Ad reward failed:', error);
        } finally {
            setTimeout(() => setShowAd(false), 500); // Small delay to show 0s
        }
    };

    const stats = [
        { label: "총 꿈 기록", value: userDreams.length.toString(), icon: Star, color: "text-dream-cyan" },
        { label: "연속 기록", value: "3일", icon: Flame, color: "text-dream-purple" }, // Streak logic needs separate implementation
        { label: "평균 자각도", value: "4.5", icon: Calendar, color: "text-white" },
    ];

    return (
        <MobileLayout>
            <div className="flex flex-col h-[100dvh] pb-24 relative overflow-hidden bg-dream-dark">
                {/* Ambient Glows */}
                <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[50%] bg-dream-purple/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
                <div className="absolute top-[20%] right-[-20%] w-[60%] h-[40%] bg-dream-cyan/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: "1.5s" }} />

                {/* Header */}
                <header className="px-6 pt-14 pb-8 flex items-center justify-between z-10 relative">
                    <h1 className="text-xl font-bold text-white tracking-tight">내 프로필</h1>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 -mr-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5"
                    >
                        <Settings size={20} />
                    </button>
                </header>

                <div className="flex-1 px-6 z-10 relative overflow-y-auto pb-safe scrollbar-hide">
                    {/* Profile Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center mb-8"
                    >
                        <div className="relative mb-4 group">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden backdrop-blur-md shadow-2xl">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-white/50" />
                                )}
                            </div>
                            {/* Glowing Ring */}
                            <div className="absolute inset-0 rounded-full border border-dream-cyan/30 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse-slow" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">{profile.nickname}</h2>
                    </motion.div>

                    {/* Credit Management Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Coins size={100} className="text-white" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-white/70">보유 크레딧</h3>
                                    {isPremium && (
                                        <div className="px-2 py-1 rounded-full bg-dream-purple/20 border border-dream-purple/30 text-[10px] text-dream-purple font-bold flex items-center gap-1">
                                            <Crown size={10} /> PREMIUM
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-end gap-2 mb-6">
                                    <span className="text-4xl font-bold text-white tracking-tight">
                                        {loading ? "..." : credits}
                                    </span>
                                    <span className="text-lg text-white/50 mb-1">credits</span>
                                </div>

                                {!isPremium ? (
                                    <button
                                        onClick={handleWatchAd}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-dream-purple to-dream-cyan text-white font-bold text-sm shadow-lg shadow-dream-purple/20 hover:shadow-dream-purple/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-3"
                                    >
                                        <PlayCircle size={18} />
                                        광고 보고 무료 충전하기
                                    </button>
                                ) : (
                                    <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 font-medium text-sm flex items-center justify-center gap-2 mb-3 cursor-default">
                                        <Sparkles size={16} className="text-dream-purple" />
                                        프리미엄 혜택 적용 중
                                    </div>
                                )}

                                <Link
                                    href="/shop"
                                    className="w-full py-3 rounded-xl bg-white/10 border border-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <Coins size={18} className="text-yellow-400" />
                                    크레딧 상점 바로가기
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-3 gap-3 mb-8"
                    >
                        {stats.map((stat, index) => (
                            <div key={index} className="glass-panel p-3 rounded-2xl flex flex-col items-center justify-center bg-white/5 border border-white/5">
                                <stat.icon size={16} className={`mb-2 ${stat.color} opacity-80`} />
                                <span className="text-lg font-bold text-white leading-none mb-1">{stat.value}</span>
                                <span className="text-[10px] text-white/40 font-medium">{stat.label}</span>
                            </div>
                        ))}
                    </motion.div>

                    {/* Dreams Grid */}
                    <h3 className="text-lg font-bold text-white mb-4 px-1">내 꿈 보관함</h3>
                    <div className="grid grid-cols-2 gap-3 pb-8">
                        {userDreams.map((dream) => (
                            <Link href={`/dream/${dream.id}`} key={dream.id} className="aspect-[3/4] rounded-xl overflow-hidden relative group bg-white/5 border border-white/5 block">
                                <img src={dream.image_url} alt={dream.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60" />

                                {!dream.is_public && (
                                    <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full backdrop-blur-sm border border-white/10">
                                        <Lock size={12} className="text-white/70" />
                                    </div>
                                )}

                                <div className="absolute bottom-3 left-3 right-3">
                                    <p className="text-white text-xs font-medium line-clamp-1 mb-0.5">{dream.title}</p>
                                    <p className="text-white/50 text-[10px] font-mono">{new Date(dream.created_at).toLocaleDateString()}</p>
                                </div>
                            </Link>
                        ))}
                        {userDreams.length === 0 && !loading && (
                            <div className="col-span-2 py-12 flex flex-col items-center justify-center text-white/30 border border-dashed border-white/10 rounded-2xl">
                                <Star size={24} className="mb-2 opacity-50" />
                                <p className="text-sm">아직 기록된 꿈이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
                <BottomNav />

                {/* Ad Overlay */}
                <AnimatePresence>
                    {showAd && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
                        >
                            <div className="w-full max-w-sm bg-[#1A1A2E] border border-white/10 rounded-3xl p-6 text-center relative overflow-hidden shadow-2xl">
                                {/* Progress Bar */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 5, ease: "linear" }}
                                        className="h-full bg-dream-cyan"
                                    />
                                </div>

                                {/* Header */}
                                <div className="mt-4 mb-6">
                                    <h3 className="text-xl font-bold text-white mb-1">광고 시청 중...</h3>
                                    <p className="text-white/60 text-sm">
                                        꿈을 위한 에너지를 충전하고 있습니다.
                                    </p>
                                </div>

                                {/* Ad Placeholder */}
                                <div className="w-full aspect-video bg-black/40 rounded-xl mb-6 flex flex-col items-center justify-center border border-white/5 relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full backdrop-blur-sm border border-white/10">
                                        <Lock size={12} className="text-white/70" />
                                    </div>
                                    <p className="text-xs text-white/30 mb-1">Google AdSense</p>
                                    <p className="text-sm text-white/50 font-medium">광고 영역</p>
                                </div>

                                {/* Timer & Info */}
                                <div className="flex flex-col items-center justify-center">
                                    <div className="relative mb-4">
                                        <svg className="w-16 h-16 transform -rotate-90">
                                            <circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="transparent"
                                                className="text-white/10"
                                            />
                                            <circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="transparent"
                                                strokeDasharray={175.9} // 2 * PI * 28
                                                strokeDashoffset={175.9 * (1 - adTimer / 5)}
                                                className="text-dream-cyan transition-all duration-1000 ease-linear"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xl font-bold text-white">{adTimer}</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-white/40">
                                        광고를 끝까지 시청하시면 <span className="text-dream-cyan font-bold">3 크레딧</span>이 지급됩니다.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Settings Modal */}
                <SettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    avatarUrl={profile.avatar_url}
                />
            </div>
        </MobileLayout>
    );
}
