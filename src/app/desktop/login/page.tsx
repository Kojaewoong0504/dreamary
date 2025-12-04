"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Mail, Lock, Chrome, ArrowRight, User, Phone, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WireframeOrb from "@/components/ui/WireframeOrb";
import { validatePassword } from "@/lib/validation";
import { formatPhoneNumber } from "@/lib/formatters";
import GlobalBackground from "@/components/ui/GlobalBackground";

import CustomAlert from "@/components/ui/CustomAlert";

export default function DesktopLoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [step, setStep] = useState<'credentials' | 'info'>('credentials');

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nationality, setNationality] = useState("KR");
    const [gender, setGender] = useState("male");
    const [nickname, setNickname] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Social Auth State
    const [socialToken, setSocialToken] = useState<string | null>(null);
    const [isSocialSignup, setIsSocialSignup] = useState(false);

    const [loading, setLoading] = useState(false);
    const [alertState, setAlertState] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: "",
        type: 'error'
    });
    const router = useRouter();

    const showAlert = (message: string, type: 'success' | 'error' = 'error') => {
        setAlertState({ show: true, message, type });
    };

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setNationality("KR");
        setGender("male");
        setNickname("");
        setPhoneNumber("");
        setStep('credentials');
        setSocialToken(null);
        setIsSocialSignup(false);
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        resetForm();
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showAlert("비밀번호가 일치하지 않습니다.");
            return;
        }
        const { isValid, message } = validatePassword(password);
        if (!isValid) {
            showAlert(message || "비밀번호 형식이 올바르지 않습니다.");
            return;
        }
        setStep('info');
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Login
            if (!isSignUp) {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Login failed");
                router.push("/dashboard");
                return;
            }

            // 2. Social Signup (Complete Onboarding)
            if (isSocialSignup && socialToken) {
                const res = await fetch("/api/auth/social-signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        accessToken: socialToken,
                        nickname,
                        phoneNumber,
                        nationality,
                        gender
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Social signup failed");
                router.push("/dashboard");
                return;
            }

            // 3. Email Signup (Final Step)
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    nationality,
                    gender,
                    nickname,
                    phoneNumber
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Authentication failed");
            }

            showAlert("회원가입이 완료되었습니다. 로그인해주세요.", 'success');
            toggleMode(); // Switch to login

        } catch (error: any) {
            showAlert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                try {
                    const res = await fetch("/api/auth/social", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ accessToken: session.access_token }),
                    });
                    const data = await res.json();

                    if (res.ok) {
                        if (data.needsOnboarding) {
                            // User needs to complete profile
                            setIsSignUp(true);
                            setIsSocialSignup(true);
                            setSocialToken(session.access_token);
                            setEmail(data.email || session.user.email || "");
                            setNickname(data.nickname || "");
                            setStep('info'); // Jump to info step
                        } else {
                            // Login Success
                            router.push("/dashboard");
                        }
                    } else {
                        console.error("Social auth error:", data.error);
                    }
                } catch (e) {
                    console.error("Token exchange failed", e);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden text-white">
            <GlobalBackground />

            <CustomAlert
                isOpen={alertState.show}
                onClose={() => setAlertState(prev => ({ ...prev, show: false }))}
                title={alertState.type === 'error' ? '오류' : '성공'}
                message={alertState.message}
                type={alertState.type}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="w-full max-w-md relative z-10"
            >
                {/* Glass Card */}
                <div className="glass-panel p-10 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl bg-black/40">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-3">
                            {isSignUp ? (step === 'info' ? "Profile Info" : "Create Account") : "Dashboard Login"}
                        </h1>
                        <p className="text-dream-text-secondary text-sm">
                            {isSignUp
                                ? (step === 'info' ? "추가 정보를 입력하여 가입을 완료하세요." : "새로운 꿈의 여정을 시작하세요.")
                                : "Dreamary 대시보드에 오신 것을 환영합니다."}
                        </p>
                    </div>

                    <form onSubmit={isSignUp && step === 'credentials' ? handleNextStep : handleAuth} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {(!isSignUp || step === 'credentials') && (
                                <motion.div
                                    key="credentials"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="text-white/40 group-focus-within:text-dream-cyan transition-colors" size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="이메일을 입력하세요"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isSocialSignup}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-dream-cyan/50 focus:bg-white/10 transition-all disabled:opacity-50"
                                            required
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="text-white/40 group-focus-within:text-dream-purple transition-colors" size={20} />
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="비밀번호를 입력하세요"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-dream-purple/50 focus:bg-white/10 transition-all"
                                            required
                                        />
                                    </div>
                                    {isSignUp && (
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="text-white/40 group-focus-within:text-dream-purple transition-colors" size={20} />
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="비밀번호 확인"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-dream-purple/50 focus:bg-white/10 transition-all"
                                                required
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {isSignUp && step === 'info' && (
                                <motion.div
                                    key="info"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="text-white/40 group-focus-within:text-dream-cyan transition-colors" size={20} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="닉네임"
                                                value={nickname}
                                                onChange={(e) => setNickname(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-dream-cyan/50 focus:bg-white/10 transition-all"
                                                required
                                            />
                                        </div>
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
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-white/60 ml-1">국적 / 지역</label>
                                            <select
                                                value={nationality}
                                                onChange={(e) => setNationality(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-dream-cyan/50 appearance-none"
                                            >
                                                <option value="KR" className="bg-dream-dark">대한민국 🇰🇷</option>
                                                <option value="US" className="bg-dream-dark">미국 🇺🇸</option>
                                                <option value="JP" className="bg-dream-dark">일본 🇯🇵</option>
                                                <option value="CN" className="bg-dream-dark">중국 🇨🇳</option>
                                                <option value="EU" className="bg-dream-dark">유럽 🇪🇺</option>
                                                <option value="OTHER" className="bg-dream-dark">기타 🌍</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-white/60 ml-1">성별</label>
                                            <select
                                                value={gender}
                                                onChange={(e) => setGender(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-dream-cyan/50 appearance-none"
                                            >
                                                <option value="male" className="bg-dream-dark">남성 👨</option>
                                                <option value="female" className="bg-dream-dark">여성 👩</option>
                                                <option value="other" className="bg-dream-dark">기타 🧑</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-3">
                            {isSignUp && step === 'info' && !isSocialSignup && (
                                <button
                                    type="button"
                                    onClick={() => setStep('credentials')}
                                    className="w-16 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <ArrowLeft size={24} className="text-white/60" />
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 group relative overflow-hidden bg-gradient-to-r from-dream-purple to-dream-cyan text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? "처리 중..." : (isSignUp ? (step === 'credentials' ? "다음 단계" : "가입 완료") : "로그인")}
                                    {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                                </span>
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </div>
                    </form>

                    {!isSocialSignup && (
                        <>
                            <div className="relative my-10">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                                    <span className="px-3 bg-[#0a0a15] text-white/40">또는</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-4 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
                            >
                                <Chrome size={22} className="text-white/80 group-hover:text-white transition-colors" />
                                <span className="text-white/80 font-medium group-hover:text-white transition-colors">Google로 계속하기</span>
                            </button>
                        </>
                    )}

                    <p className="mt-6 text-center text-sm text-white/40 space-x-4">
                        <button onClick={() => router.push('/desktop/find-id')} className="hover:text-white transition-colors">아이디 찾기</button>
                        <span>|</span>
                        <button onClick={() => router.push('/desktop/reset-password')} className="hover:text-white transition-colors">비밀번호 재설정</button>
                    </p>

                    <p className="mt-4 text-center text-sm text-white/40">
                        {isSignUp ? "이미 계정이 있으신가요? " : "계정이 없으신가요? "}
                        <button
                            onClick={toggleMode}
                            className="text-dream-cyan hover:text-dream-cyan/80 hover:underline transition-colors"
                        >
                            {isSignUp ? "로그인" : "회원가입"}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
