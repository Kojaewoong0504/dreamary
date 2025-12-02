"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Archive, User, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="w-full max-w-[430px] pointer-events-auto">
                <nav className="glass-bar pb-safe px-6 flex justify-between items-center h-16">
                    <Link href="/" className="p-3 text-dream-text-secondary hover:text-white transition-colors">
                        <Home size={24} strokeWidth={isActive("/") ? 2.5 : 1.5} className={isActive("/") ? "text-white" : ""} />
                    </Link>

                    <Link href="/feed" className="p-3 text-dream-text-secondary hover:text-white transition-colors">
                        <Globe size={24} strokeWidth={isActive("/feed") ? 2.5 : 1.5} className={isActive("/feed") ? "text-white" : ""} />
                    </Link>

                    {/* Premium Portal FAB */}
                    <div className="relative -top-6">
                        <Link href="/write">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{
                                    boxShadow: [
                                        "0 0 20px rgba(14, 165, 233, 0.5)",
                                        "0 0 40px rgba(56, 189, 248, 0.7)",
                                        "0 0 20px rgba(14, 165, 233, 0.5)"
                                    ]
                                }}
                                transition={{
                                    boxShadow: {
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }
                                }}
                                className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center border-2 border-white/20 relative group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 blur-xl group-hover:bg-white/30 transition-colors" />
                                <PlusCircle size={28} color="white" strokeWidth={3} className="relative z-10 drop-shadow-md" />
                            </motion.div>
                        </Link>
                    </div>

                    <Link href="/archive" className="p-3 text-dream-text-secondary hover:text-white transition-colors">
                        <Archive size={24} strokeWidth={isActive("/archive") ? 2.5 : 1.5} className={isActive("/archive") ? "text-white" : ""} />
                    </Link>

                    <Link href="/mypage" className="p-3 text-dream-text-secondary hover:text-white transition-colors">
                        <User size={24} strokeWidth={isActive("/mypage") ? 2.5 : 1.5} className={isActive("/mypage") ? "text-white" : ""} />
                    </Link>
                </nav>
            </div>
        </div>
    );
}
