"use client";

import { Home, BookOpen, Users, Settings, LogOut, Sparkles, ChevronLeft, ChevronRight, ShoppingBag, Compass } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardSidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { icon: Home, label: "홈", href: "/dashboard" },
        { icon: Compass, label: "탐색", href: "/dashboard/explore" },
        { icon: BookOpen, label: "꿈 보관함", href: "/dashboard/dreams" },
        { icon: Users, label: "커뮤니티", href: "/dashboard/community" },
        { icon: ShoppingBag, label: "상점", href: "/dashboard/shop" },
        { icon: Settings, label: "설정", href: "/dashboard/settings" },
    ];

    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user/profile');

                if (res.status === 401) {
                    console.log("Session expired, redirecting to login");
                    router.push('/login');
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.profile);
                }
            } catch (e) {
                console.error("Failed to fetch profile", e);
            }
        };
        fetchProfile();
    }, []);

    return (
        <motion.aside
            initial={{ width: 288 }}
            animate={{ width: isCollapsed ? 80 : 288 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-screen sticky top-0 border-r border-white/10 bg-black/40 backdrop-blur-2xl flex flex-col p-4 z-50 relative"
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-cyan-500 border border-white/20 flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform z-50"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Logo */}
            <div className={`flex items-center gap-3 mb-10 px-2 ${isCollapsed ? "justify-center" : ""}`}>
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 min-w-[40px] rounded-xl overflow-hidden shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                        <img src="/logo.png" alt="Dreamary" className="w-full h-full object-cover" />
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="text-2xl font-bold text-white tracking-tight whitespace-nowrap overflow-hidden"
                            >
                                Dreamary
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                                ? "bg-white/10 text-white shadow-lg shadow-white/5 border border-white/10"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                                } ${isCollapsed ? "justify-center" : ""}`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                            )}
                            <item.icon
                                size={20}
                                className={`min-w-[20px] transition-colors ${isActive ? "text-cyan-400" : "group-hover:text-cyan-400"}`}
                            />
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="font-medium whitespace-nowrap overflow-hidden"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}
            </nav>

            {/* Version Info */}
            <div className={`mt-auto pt-6 border-t border-white/10 ${isCollapsed ? "hidden" : "block"}`}>
                <p className="text-xs text-white/20 text-center">
                    Dreamary v1.0.0
                </p>
            </div>
        </motion.aside>
    );
}
