"use client";

import MobileLayout from "@/components/layout/MobileLayout";
import { motion } from "framer-motion";
import { ArrowLeft, Coins, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

declare global {
    interface Window {
        PortOne: any;
    }
}

const PACKAGES = [
    { id: 'credit_10', credits: 10, price: 1000, name: '스타터 팩', popular: false },
    { id: 'credit_33', credits: 33, price: 3000, name: '드림 팩', popular: true, bonus: '+10%' },
    { id: 'credit_55', credits: 55, price: 5000, name: '프로 팩', popular: false, bonus: '+10%' },
];

export default function ShopPage() {
    const [currentCredits, setCurrentCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<typeof PACKAGES[0] | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Fetch current credits
        const fetchCredits = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const res = await fetch('/api/user/credits');
                const data = await res.json();
                setCurrentCredits(data.credits);
            }
        };
        fetchCredits();
    }, []);

    const handlePayment = async (method: 'KAKAO' | 'TOSS') => {
        if (!selectedPackage) return;
        if (!window.PortOne) {
            alert("결제 모듈을 불러오지 못했습니다. 새로고침 해주세요.");
            return;
        }

        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            alert("로그인이 필요합니다.");
            router.push('/login');
            return;
        }

        const paymentId = `pay_${crypto.randomUUID()}`;
        const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;

        // Select Channel Key based on method
        const channelKey = method === 'KAKAO'
            ? process.env.NEXT_PUBLIC_PORTONE_KAKAO_CHANNEL_KEY
            : process.env.NEXT_PUBLIC_PORTONE_TOSS_CHANNEL_KEY;

        console.log("💳 Payment Debug:", { storeId, paymentId, channelKey, method });

        if (!storeId) {
            alert("상점 ID(Store ID)가 설정되지 않았습니다.");
            setLoading(false);
            return;
        }
        if (!channelKey) {
            alert(`${method === 'KAKAO' ? '카카오페이' : '토스페이'} 채널 키가 설정되지 않았습니다.`);
            setLoading(false);
            return;
        }

        try {
            const response = await window.PortOne.requestPayment({
                storeId: storeId,
                channelKey: channelKey,
                paymentId: paymentId,
                orderName: `Dreamary ${selectedPackage.credits} 크레딧`,
                totalAmount: selectedPackage.price,
                currency: "CURRENCY_KRW",
                payMethod: "EASY_PAY",
                customer: {
                    fullName: session.user.user_metadata.nickname || 'Dreamer',
                    email: session.user.email,
                    phoneNumber: "010-0000-0000", // Required field often
                }
            });

            if (response.code != null) {
                // Error occurred
                alert(`결제 실패: ${response.message}`);
            } else {
                // Success
                const verifyRes = await fetch('/api/shop/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentId: response.paymentId, // or paymentId I generated
                        amount: selectedPackage.price,
                        packageId: selectedPackage.id
                    })
                });

                const verifyData = await verifyRes.json();

                if (verifyRes.ok && verifyData.success) {
                    alert(`결제가 완료되었습니다! ${selectedPackage.credits} 크레딧이 충전되었습니다.`);
                    setCurrentCredits(prev => (prev || 0) + selectedPackage.credits);
                    setSelectedPackage(null); // Close modal
                    router.refresh();
                } else {
                    alert(`결제 검증 실패: ${verifyData.message}`);
                }
            }
        } catch (e) {
            console.error(e);
            alert("결제 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileLayout>
            <div className="flex flex-col min-h-screen pb-safe relative overflow-hidden bg-dream-dark">
                {/* Ambient Glows - Reverted to Original Theme */}
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[60%] bg-dream-purple/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-dream-cyan/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: "2s" }} />

                {/* Header */}
                <header className="px-6 pt-14 pb-4 flex items-center justify-between z-20 relative">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5">
                            <ArrowLeft size={22} />
                        </Link>
                        <h1 className="text-lg font-bold text-white tracking-tight">상점</h1>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                        <Coins size={14} className="text-yellow-400" />
                        <span className="text-sm font-bold text-white">{currentCredits ?? '-'}</span>
                    </div>
                </header>

                <div className="flex-1 px-6 z-10 relative overflow-y-auto pb-safe scrollbar-hide">
                    <div className="text-center mb-8 mt-4">
                        <h2 className="text-2xl font-light text-white mb-2">
                            꿈을 현실로<br />
                            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-dream-purple to-dream-cyan">
                                더 생생하게
                            </span>
                        </h2>
                        <p className="text-sm text-white/60">
                            크레딧을 충전하여 AI 꿈 이미지를 생성하세요.
                        </p>
                    </div>

                    <div className="space-y-4 pb-20">
                        {PACKAGES.map((pkg, index) => (
                            <motion.div
                                key={pkg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative glass-panel p-5 rounded-2xl border ${pkg.popular ? 'border-dream-cyan/50 bg-dream-cyan/5' : 'border-white/10'}`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-dream-purple to-dream-cyan text-white font-bold text-[10px] px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                        <Sparkles size={10} fill="currentColor" />
                                        BEST VALUE
                                    </div>
                                )}

                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            {pkg.name}
                                            {pkg.bonus && <span className="text-xs font-normal text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">{pkg.bonus}</span>}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-1 text-yellow-400">
                                            <Coins size={16} fill="currentColor" />
                                            <span className="text-xl font-bold">{pkg.credits}</span>
                                            <span className="text-xs text-white/50 font-normal">크레딧</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-white">₩{pkg.price.toLocaleString()}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedPackage(pkg)}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${pkg.popular
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:shadow-lg hover:shadow-orange-500/20'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                >
                                    구매하기
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center text-xs text-white/30 pb-10">
                        <p>테스트 모드입니다. 실제 결제되지 않습니다.</p>
                        <p>매일 자정에 자동 취소됩니다.</p>
                    </div>
                </div>

                {/* Payment Method Bottom Sheet */}
                {selectedPackage && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedPackage(null)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative w-full max-w-md bg-[#1A1A1A] rounded-t-3xl p-6 pb-safe border-t border-white/10"
                        >
                            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                            <h3 className="text-xl font-bold text-white mb-2">결제 수단 선택</h3>
                            <p className="text-white/50 text-sm mb-6">
                                {selectedPackage.name} ({selectedPackage.credits} 크레딧) - ₩{selectedPackage.price.toLocaleString()}
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handlePayment('KAKAO')}
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl bg-[#FEE500] text-black font-bold text-lg flex items-center justify-center gap-3 hover:brightness-95 transition-all"
                                >
                                    <span className="text-xl">💬</span> 카카오페이로 결제
                                </button>
                                <button
                                    onClick={() => handlePayment('TOSS')}
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl bg-[#0064FF] text-white font-bold text-lg flex items-center justify-center gap-3 hover:brightness-95 transition-all"
                                >
                                    <span className="text-xl">💸</span> 토스페이로 결제
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}
