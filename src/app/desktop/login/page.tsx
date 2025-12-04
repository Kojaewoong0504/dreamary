"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Mail, Lock, Chrome, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import WireframeOrb from "@/components/ui/WireframeOrb";
import { validatePassword } from "@/lib/validation";
import GlobalBackground from "@/components/ui/GlobalBackground";

import CustomAlert from "@/components/ui/CustomAlert";

export default function DesktopLoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nationality, setNationality] = useState("KR");
    const [gender, setGender] = useState("male");
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

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";

        if (isSignUp) {
            if (password !== confirmPassword) {
                showAlert("비밀번호가 일치하지 않습니다.");
                setLoading(false);
                return;
            }

            const { isValid, message } = validatePassword(password);
            if (!isValid) {
                showAlert(message || "비밀번호 형식이 올바르지 않습니다.");
                setLoading(false);
                return;
            }
        }

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    ...(isSignUp && { nationality, gender })
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Authentication failed");
            }

            if (isSignUp) {
                showAlert("회원가입이 완료되었습니다. 로그인해주세요.", 'success');
                setIsSignUp(false);
            } else {
                console.log("Access Token:", data.accessToken);
                // Redirect to desktop dashboard
                router.push("/dashboard");
            }
        } catch (error: any) {
            showAlert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
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

                    if (res.ok) {
                        const data = await res.json();
                        console.log("Custom Access Token:", data.accessToken);
                        router.push("/dashboard");
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
                            {isSignUp ? "Create Account" : "Dashboard Login"}
                        </h1>
                        <p className="text-dream-text-secondary text-sm">
                            {isSignUp ? "새로운 꿈의 여정을 시작하세요." : "Dreamary 대시보드에 오신 것을 환영합니다."}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="text-white/40 group-focus-within:text-dream-cyan transition-colors" size={20} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="이메일을 입력하세요"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-dream-cyan/50 focus:bg-white/10 transition-all"
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
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="space-y-4 pt-2"
                                >
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
                                </motion.div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative overflow-hidden bg-gradient-to-r from-dream-purple to-dream-cyan text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? "처리 중..." : (isSignUp ? "회원가입" : "로그인")}
                                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                            </span>
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>
                    </form>

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

                    <p className="mt-10 text-center text-sm text-white/40">
                        {isSignUp ? "이미 계정이 있으신가요? " : "계정이 없으신가요? "}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
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
