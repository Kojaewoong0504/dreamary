"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import { Mail, Lock, Chrome, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import WireframeOrb from "@/components/ui/WireframeOrb";
import { validatePassword } from "@/lib/validation";

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nationality, setNationality] = useState("KR");
    const [gender, setGender] = useState("male");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";

        if (isSignUp) {
            if (password !== confirmPassword) {
                alert("비밀번호가 일치하지 않습니다.");
                setLoading(false);
                return;
            }

            const { isValid, message } = validatePassword(password);
            if (!isValid) {
                alert(message);
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
                alert("회원가입이 완료되었습니다. 로그인해주세요.");
                setIsSignUp(false);
            } else {
                // Store Access Token (in memory or context - for now just log/alert)
                console.log("Access Token:", data.accessToken);
                // In a real app, you'd set this in a global auth context
                router.push("/");
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`, // You might need a callback page to handle the exchange
                // Or if using popup:
                // skipBrowserRedirect: true 
            },
        });

        // Note: The actual token exchange usually happens in the callback page or 
        // if using onAuthStateChange listener.
        // For this implementation, let's assume we have an AuthProvider or listener.
        // But to keep it simple, we'll add a listener here.
    };

    // Add useEffect to listen for Supabase auth changes and exchange token
    // This is a simplified approach. Ideally, use a dedicated Auth Context.


    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                // Exchange Supabase token for Custom JWT
                try {
                    const res = await fetch("/api/auth/social", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ accessToken: session.access_token }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        console.log("Custom Access Token:", data.accessToken);
                        router.push("/");
                    }
                } catch (e) {
                    console.error("Token exchange failed", e);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    return (
        <MobileLayout>
            <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] pointer-events-none opacity-30">
                    <WireframeOrb />
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-dream-dark/80 to-dream-dark pointer-events-none" />

                {/* Ambient Glows */}
                <div className="absolute top-[10%] right-[-10%] w-[300px] h-[300px] bg-dream-purple/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
                <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] bg-dream-cyan/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: "2s" }} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="w-full max-w-sm relative z-10"
                >
                    {/* Glass Card */}
                    <div className="glass-panel p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2">
                                {isSignUp ? "Create Account" : "Welcome Back"}
                            </h1>
                            <p className="text-dream-text-secondary text-sm">
                                {isSignUp ? "새로운 꿈의 여정을 시작하세요." : "다시 오신 것을 환영합니다."}
                            </p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-5">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="text-white/40 group-focus-within:text-dream-cyan transition-colors" size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="이메일을 입력하세요"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-dream-cyan/50 focus:bg-white/10 transition-all"
                                        required
                                    />
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="text-white/40 group-focus-within:text-dream-purple transition-colors" size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="비밀번호를 입력하세요"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-dream-purple/50 focus:bg-white/10 transition-all"
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
                                                <Lock className="text-white/40 group-focus-within:text-dream-purple transition-colors" size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="비밀번호 확인"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-dream-purple/50 focus:bg-white/10 transition-all"
                                                required
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative overflow-hidden bg-gradient-to-r from-dream-purple to-dream-cyan text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? "처리 중..." : (isSignUp ? "회원가입" : "로그인")}
                                    {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                </span>
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-wider">
                                <span className="px-3 bg-[#0a0a15] text-white/40">또는</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group"
                        >
                            <Chrome size={20} className="text-white/80 group-hover:text-white transition-colors" />
                            <span className="text-white/80 font-medium group-hover:text-white transition-colors">Google로 계속하기</span>
                        </button>

                        <p className="mt-8 text-center text-xs text-white/40">
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
        </MobileLayout>
    );
}
