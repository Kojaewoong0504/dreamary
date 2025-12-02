"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, Check, Star, Crown, Sparkles } from "lucide-react";
import CustomAlert from "@/components/ui/CustomAlert";

const packages = [
    {
        id: "starter",
        name: "Starter Pack",
        credits: 10,
        price: "$0.99",
        priceKrw: "1,400원",
        icon: Zap,
        color: "from-blue-400 to-cyan-300",
        popular: false,
        features: ["가볍게 시작하기", "이미지 10장 생성", "드림 모션 3회 체험"]
    },
    {
        id: "pro",
        name: "Pro Pack",
        credits: 55,
        price: "$4.99",
        priceKrw: "7,000원",
        icon: Star,
        color: "from-purple-400 to-pink-300",
        popular: true,
        bonus: "+10%",
        features: ["가장 인기있는 선택", "이미지 55장 생성", "드림 모션 18회 생성"]
    },
    {
        id: "dreamer",
        name: "Dreamer Pack",
        credits: 120,
        price: "$9.99",
        priceKrw: "14,000원",
        icon: Crown,
        color: "from-amber-300 to-orange-400",
        popular: false,
        bonus: "+20%",
        features: ["최고의 가성비", "이미지 120장 생성", "드림 모션 40회 생성"]
    },
    {
        id: "whale",
        name: "Whale Pack",
        credits: 1000,
        price: "$49.99",
        priceKrw: "69,000원",
        icon: Sparkles,
        color: "from-indigo-400 to-purple-500",
        popular: false,
        bonus: "+50%",
        features: ["초대용량 패키지", "이미지 1,000장 생성", "드림 모션 330회 생성"]
    },
    {
        id: "subscription_monthly",
        name: "Monthly Pass",
        credits: 200,
        price: "$9.99/mo",
        priceKrw: "14,000원/월",
        icon: Crown,
        color: "from-rose-400 to-red-500",
        popular: true,
        bonus: "BEST",
        features: ["매월 200 크레딧 지급", "모든 광고 제거", "프리미엄 전용 테마"]
    }
];

export default function ShopPage() {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [currentCredits, setCurrentCredits] = useState<number | null>(null);

    // Alert State
    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "alert" | "confirm" | "success" | "error";
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "alert",
    });

    const showAlert = (title: string, message: string, type: "alert" | "success" | "error" = "alert") => {
        setAlertState({ isOpen: true, title, message, type });
    };

    const closeAlert = () => {
        setAlertState(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    setCurrentCredits(data.profile.credits);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchCredits();
    }, []);

    const handlePurchase = async (pkg: typeof packages[0]) => {
        setLoading(pkg.id);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const response = await fetch("/api/shop/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageId: pkg.id,
                    credits: pkg.credits,
                    price: pkg.price
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "구매에 실패했습니다.");
            }

            setCurrentCredits(prev => (prev || 0) + pkg.credits);
            showAlert("구매 완료", `${pkg.credits} 크레딧이 충전되었습니다!`, "success");

        } catch (error: any) {
            console.error(error);
            showAlert("구매 실패", error.message, "error");
        } finally {
            setLoading(null);
        }
    };

    const subscription = packages.find(p => p.id === 'subscription_monthly');
    const creditPacks = packages.filter(p => p.id !== 'subscription_monthly');

    return (
        <MobileLayout>
            <div className="flex flex-col h-[100dvh] pb-safe relative overflow-hidden bg-dream-dark">
                <CustomAlert
                    isOpen={alertState.isOpen}
                    onClose={closeAlert}
                    title={alertState.title}
                    message={alertState.message}
                    type={alertState.type}
                />

                {/* Background Effects */}
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[60%] bg-dream-purple/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-dream-cyan/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <header className="px-6 pt-14 pb-4 flex items-center justify-between z-20 relative">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="text-lg font-bold text-white tracking-wide">크레딧 상점</h1>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                        <Zap size={14} className="text-dream-cyan fill-dream-cyan" />
                        <span className="text-sm font-bold text-white">{currentCredits ?? '-'}</span>
                    </div>
                </header>

                <div className="flex-1 px-6 py-4 overflow-y-auto scrollbar-hide z-10 space-y-8">
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold text-white mb-2">꿈을 현실로 만드세요</h2>
                        <p className="text-white/60 text-sm">
                            프리미엄 멤버십으로<br />더 자유롭게 꿈을 기록하세요.
                        </p>
                    </div>

                    {/* Subscription Banner */}
                    {subscription && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative p-6 rounded-3xl border border-dream-purple/30 bg-gradient-to-br from-dream-purple/20 to-black/40 backdrop-blur-xl overflow-hidden shadow-2xl group"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-30 transition-opacity">
                                <Crown size={120} className="text-dream-purple rotate-12" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 rounded-full bg-dream-purple text-white text-[10px] font-bold shadow-lg shadow-dream-purple/30">
                                        BEST CHOICE
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1">{subscription.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-3xl font-black text-white">{subscription.priceKrw}</span>
                                    <span className="text-sm text-white/50">/월</span>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {subscription.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-sm text-white/90">
                                            <div className="w-5 h-5 rounded-full bg-dream-purple/30 flex items-center justify-center">
                                                <Check size={10} className="text-dream-purple" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handlePurchase(subscription)}
                                    disabled={loading !== null}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-dream-purple to-pink-500 text-white font-bold text-sm shadow-lg shadow-dream-purple/30 hover:shadow-dream-purple/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {loading === subscription.id ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Crown size={18} />
                                            멤버십 시작하기
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Credit Packs Grid */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 px-1">크레딧 충전</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {creditPacks.map((pkg) => (
                                <motion.div
                                    key={pkg.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative p-4 rounded-2xl border backdrop-blur-md transition-all flex flex-col ${pkg.popular ? "bg-white/10 border-dream-cyan/30 shadow-lg shadow-dream-cyan/10" : "bg-white/5 border-white/5"}`}
                                >
                                    {pkg.popular && (
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-dream-cyan text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                                            POPULAR
                                        </div>
                                    )}
                                    {pkg.id === 'whale' && (
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                                            MAX VALUE
                                        </div>
                                    )}

                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pkg.color} flex items-center justify-center shadow-lg mb-3 self-center`}>
                                        <pkg.icon className="text-white w-5 h-5" />
                                    </div>

                                    <div className="text-center mb-1">
                                        <h3 className="text-sm font-bold text-white">{pkg.name}</h3>
                                    </div>

                                    <div className="text-center mb-4">
                                        <div className="text-xl font-black text-white">{pkg.credits}</div>
                                        <div className="text-[10px] text-white/40">Credits</div>
                                    </div>

                                    <button
                                        onClick={() => handlePurchase(pkg)}
                                        disabled={loading !== null}
                                        className="mt-auto w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10"
                                    >
                                        {loading === pkg.id ? (
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                        ) : (
                                            pkg.priceKrw
                                        )}
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
