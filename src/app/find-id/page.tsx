"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import { Phone, ArrowLeft, Search, Mail } from "lucide-react";
import { motion } from "framer-motion";
import WireframeOrb from "@/components/ui/WireframeOrb";
import { formatPhoneNumber } from "@/lib/formatters";
import CustomAlert from "@/components/ui/CustomAlert";

export default function FindIdPage() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ email: string; provider: string } | null>(null);
    const router = useRouter();
    const [alertState, setAlertState] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: "",
        type: 'error'
    });

    const handleFindId = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/auth/find-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "사용자를 찾을 수 없습니다.");

            setResult(data);
        } catch (error: any) {
            setAlertState({ show: true, message: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileLayout>
            <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] pointer-events-none opacity-30">
                    <WireframeOrb />
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-dream-dark/80 to-dream-dark pointer-events-none" />

                <CustomAlert
                    isOpen={alertState.show}
                    onClose={() => setAlertState(prev => ({ ...prev, show: false }))}
                    title="알림"
                    message={alertState.message}
                    type={alertState.type}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm relative z-10"
                >
                    <div className="glass-panel p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-white mb-2">아이디 찾기</h1>
                            <p className="text-dream-text-secondary text-sm">
                                가입 시 등록한 전화번호를 입력해주세요.
                            </p>
                        </div>

                        {!result ? (
                            <form onSubmit={handleFindId} className="space-y-5">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone className="text-white/40 group-focus-within:text-dream-cyan transition-colors" size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="전화번호 (010-0000-0000)"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-dream-cyan/50 focus:bg-white/10 transition-all"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="w-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <ArrowLeft size={20} className="text-white/60" />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-dream-purple to-dream-cyan text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-70"
                                    >
                                        {loading ? "검색 중..." : "아이디 찾기"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-6"
                            >
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <div className="w-12 h-12 bg-dream-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail className="text-dream-cyan" size={24} />
                                    </div>
                                    <p className="text-sm text-white/60 mb-1">회원님의 아이디(이메일)</p>
                                    <p className="text-xl font-bold text-white">{result.email}</p>
                                    {result.provider !== 'email' && (
                                        <p className="text-xs text-dream-purple mt-2">
                                            ({result.provider} 소셜 로그인 사용자)
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={() => router.push('/login')}
                                    className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-white/90 transition-colors"
                                >
                                    로그인하러 가기
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </MobileLayout>
    );
}
