"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import { Mail, Lock, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WireframeOrb from "@/components/ui/WireframeOrb";
import { validatePassword } from "@/lib/validation";
import CustomAlert from "@/components/ui/CustomAlert";

type Step = 'email' | 'code' | 'password' | 'success';

export default function ResetPasswordPage() {
    const [step, setStep] = useState<Step>('email');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();
    const [alertState, setAlertState] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: "",
        type: 'error'
    });

    const showAlert = (message: string, type: 'success' | 'error' = 'error') => {
        setAlertState({ show: true, message, type });
    };

    // Step 1: Request Code
    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "요청 실패");

            if (data.isSocial) {
                showAlert(`${data.provider} 계정으로 가입된 이메일입니다.\n해당 소셜 로그인으로 로그인해주세요.`, 'error');
                // Optional: Redirect after alert close? For now, let user close alert then manually go back or we can add onConfirm to redirect.
                return;
            }

            setStep('code');
        } catch (error: any) {
            showAlert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify Code
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "인증 실패");

            setStep('password');
        } catch (error: any) {
            showAlert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Confirm New Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showAlert("비밀번호가 일치하지 않습니다.");
            return;
        }
        const { isValid, message } = validatePassword(newPassword);
        if (!isValid) {
            showAlert(message || "비밀번호 형식이 올바르지 않습니다.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "비밀번호 변경 실패");

            setStep('success');
        } catch (error: any) {
            showAlert(error.message);
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
                    title={alertState.type === 'error' ? '알림' : '성공'}
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
                            <h1 className="text-2xl font-bold text-white mb-2">비밀번호 재설정</h1>
                            <p className="text-dream-text-secondary text-sm">
                                {step === 'email' && "가입한 이메일 주소를 입력해주세요."}
                                {step === 'code' && "이메일로 전송된 인증번호를 입력해주세요."}
                                {step === 'password' && "새로운 비밀번호를 설정해주세요."}
                                {step === 'success' && "비밀번호가 성공적으로 변경되었습니다."}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 'email' && (
                                <motion.form
                                    key="email"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleRequestCode}
                                    className="space-y-5"
                                >
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="text-white/40 group-focus-within:text-dream-cyan transition-colors" size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="이메일 주소"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-dream-cyan/50 focus:bg-white/10 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => router.back()} className="w-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                            <ArrowLeft size={20} className="text-white/60" />
                                        </button>
                                        <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-dream-purple to-dream-cyan text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-70">
                                            {loading ? "인증번호 받기" : "다음"}
                                        </button>
                                    </div>
                                </motion.form>
                            )}

                            {step === 'code' && (
                                <motion.form
                                    key="code"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleVerifyCode}
                                    className="space-y-5"
                                >
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="인증번호 6자리"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-center text-2xl tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-dream-cyan/50 focus:bg-white/10 transition-all"
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setStep('email')} className="w-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                            <ArrowLeft size={20} className="text-white/60" />
                                        </button>
                                        <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-dream-purple to-dream-cyan text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-70">
                                            {loading ? "확인 중..." : "인증하기"}
                                        </button>
                                    </div>
                                </motion.form>
                            )}

                            {step === 'password' && (
                                <motion.form
                                    key="password"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleResetPassword}
                                    className="space-y-5"
                                >
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="text-white/40 group-focus-within:text-dream-purple transition-colors" size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="새 비밀번호"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-dream-purple/50 focus:bg-white/10 transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="text-white/40 group-focus-within:text-dream-purple transition-colors" size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="새 비밀번호 확인"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-dream-purple/50 focus:bg-white/10 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-dream-purple to-dream-cyan text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-70">
                                        {loading ? "변경 중..." : "비밀번호 변경"}
                                    </button>
                                </motion.form>
                            )}

                            {step === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="text-green-500" size={40} />
                                    </div>
                                    <button
                                        onClick={() => router.push('/login')}
                                        className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-white/90 transition-colors"
                                    >
                                        로그인하러 가기
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </MobileLayout>
    );
}
