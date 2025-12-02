"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, Info, Shield, FileText, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    avatarUrl?: string | null;
}

export default function SettingsModal({ isOpen, onClose, avatarUrl }: SettingsModalProps) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        className="fixed left-4 right-4 bottom-8 z-50 bg-[#1A1A2E] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-w-md mx-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/5">
                            <h3 className="text-lg font-bold text-white">설정</h3>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-white/50 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-2">
                            <div className="space-y-2 mb-6">
                                <button
                                    onClick={() => router.push('/settings/profile')}
                                    className="w-full flex items-center gap-3 p-4 text-white/80 hover:bg-white/5 rounded-xl transition-colors text-left group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors overflow-hidden">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-dream-cyan" />
                                        )}
                                    </div>
                                    <span className="flex-1 font-medium">프로필 설정</span>
                                </button>

                                <button
                                    onClick={() => router.push('/settings/info')}
                                    className="w-full flex items-center gap-3 p-4 text-white/80 hover:bg-white/5 rounded-xl transition-colors text-left group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <Info size={20} className="text-dream-cyan" />
                                    </div>
                                    <span className="flex-1 font-medium">버전 정보</span>
                                    <span className="text-xs text-white/30">v1.0.0</span>
                                </button>

                                <button
                                    onClick={() => router.push('/settings/terms')}
                                    className="w-full flex items-center gap-3 p-4 text-white/80 hover:bg-white/5 rounded-xl transition-colors text-left group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <FileText size={20} className="text-dream-cyan" />
                                    </div>
                                    <span className="flex-1 font-medium">이용약관</span>
                                </button>

                                <button
                                    onClick={() => router.push('/settings/privacy')}
                                    className="w-full flex items-center gap-3 p-4 text-white/80 hover:bg-white/5 rounded-xl transition-colors text-left group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <Shield size={20} className="text-dream-cyan" />
                                    </div>
                                    <span className="flex-1 font-medium">개인정보 처리방침</span>
                                </button>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="w-full py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium transition-all flex items-center justify-center gap-2 group"
                            >
                                <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                                로그아웃
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
