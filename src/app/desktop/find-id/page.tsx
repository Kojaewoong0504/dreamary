"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowLeft, Mail } from "lucide-react";
import { motion } from "framer-motion";
import GlobalBackground from "@/components/ui/GlobalBackground";
import { formatPhoneNumber } from "@/lib/formatters";
import CustomAlert from "@/components/ui/CustomAlert";

export default function DesktopFindIdPage() {
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
        <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden text-white">
            <GlobalBackground />

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
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-panel p-10 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl bg-black/40">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-3">
                            아이디 찾기
                        </h1>
                        <p className="text-dream-text-secondary text-sm">
                            가입 시 등록한 전화번호를 입력해주세요.
                        </p>
                    </div>

                    {!result ? (
                        <form onSubmit={handleFindId} className="space-y-6">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="text-white/40 group-focus-within:text-dream-cyan transition-colors" size={20} />
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
                                    className="w-16 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <ArrowLeft size={24} className="text-white/60" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-dream-purple to-dream-cyan text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all disabled:opacity-70"
                                >
                                    {loading ? "검색 중..." : "아이디 찾기"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-8"
                        >
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                                <div className="w-16 h-16 bg-dream-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Mail className="text-dream-cyan" size={32} />
                                </div>
                                <p className="text-sm text-white/60 mb-2">회원님의 아이디(이메일)</p>
                                <p className="text-2xl font-bold text-white">{result.email}</p>
                                {result.provider !== 'email' && (
                                    <p className="text-sm text-dream-purple mt-3">
                                        ({result.provider} 소셜 로그인 사용자)
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={() => router.push('/desktop/login')}
                                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-colors"
                            >
                                로그인하러 가기
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
