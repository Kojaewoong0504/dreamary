"use client";

import { Bell, Search, User, LogOut, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardHeader() {
    const [user, setUser] = useState<any>(null);
    const [credits, setCredits] = useState<number | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Profile
                const profileRes = await fetch('/api/user/profile');

                if (profileRes.status === 401) {
                    console.log("Session expired, redirecting to login");
                    router.push('/login');
                    return;
                }

                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setUser(data.profile);
                }

                // Fetch Credits
                const fetchCredits = async () => {
                    const creditsRes = await fetch('/api/user/credits');
                    if (creditsRes.ok) {
                        const data = await creditsRes.json();
                        setCredits(data.credits);
                    }
                };
                fetchCredits();

                // Listen for credit updates
                window.addEventListener('credit-update', fetchCredits);
                return () => window.removeEventListener('credit-update', fetchCredits);

            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-black/20 border-b border-white/5">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="전체 꿈 검색..."
                        className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:bg-white/10 focus:border-cyan-500/50 transition-all"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const query = e.currentTarget.value;
                                if (query.trim()) {
                                    router.push(`/dashboard/explore?q=${encodeURIComponent(query)}`);
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {/* Credits Display */}
                <Link
                    href="/dashboard/shop"
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                >
                    <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <span className="text-yellow-400 text-xs">C</span>
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">
                        {credits?.toLocaleString() ?? '-'}
                    </span>
                    <span className="text-xs text-white/40 group-hover:text-white/60">충전</span>
                </Link>

                <div className="h-8 w-[1px] bg-white/10 mx-2" />

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors relative"
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-black" />
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-12 w-80 bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="p-4 border-b border-white/10">
                                <h3 className="text-sm font-bold text-white">알림</h3>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notif, i) => (
                                        <div key={i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <p className="text-sm text-white">{notif.message}</p>
                                            <p className="text-xs text-white/40 mt-1">{notif.time}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-white/40 text-sm">
                                        새로운 알림이 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl transition-colors"
                    >
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-white">{user?.nickname || user?.email?.split('@')[0] || 'Guest'}</p>
                            <p className="text-xs text-white/40">{user?.is_premium ? 'Premium' : 'Free Plan'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 p-[2px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-white/80" />
                                )}
                            </div>
                        </div>
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 top-16 w-48 bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="p-2">
                                <Link
                                    href="/dashboard/profile"
                                    className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <User size={16} />
                                    내 프로필
                                </Link>
                                <Link
                                    href="/dashboard/settings"
                                    className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Settings size={16} />
                                    설정
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                                >
                                    <LogOut size={16} />
                                    로그아웃
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
