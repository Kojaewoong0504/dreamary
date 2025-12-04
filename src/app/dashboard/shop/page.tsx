"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Coins, Sparkles, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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

export default function DashboardShopPage() {
    const [currentCredits, setCurrentCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<typeof PACKAGES[0] | null>(null);
    const router = useRouter();
    const supabase = createClientComponentClient();

    const [showAdModal, setShowAdModal] = useState(false);
    const [adTimer, setAdTimer] = useState(5);
    const [isAdPlaying, setIsAdPlaying] = useState(false);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const res = await fetch('/api/user/credits');
                if (res.ok) {
                    const data = await res.json();
                    setCurrentCredits(data.credits);
                }
            } catch (e) {
                console.error("Failed to fetch credits", e);
            }
        };
        fetchCredits();

        // Listen for credit updates from other components (e.g. Header)
        const handleCreditUpdate = () => fetchCredits();
        window.addEventListener('credit-update', handleCreditUpdate);
        return () => window.removeEventListener('credit-update', handleCreditUpdate);
    }, []);

    const handlePayment = async (method: 'KAKAO' | 'TOSS') => {
        if (!selectedPackage) return;
        if (!window.PortOne) {
            alert("결제 모듈을 불러오지 못했습니다. 새로고침 해주세요.");
            return;
        }

        setLoading(true);

        // Use API to get user info (more reliable than client-side session)
        let userProfile = null;
        try {
            const res = await fetch('/api/user/profile');
            if (res.ok) {
                const data = await res.json();
                userProfile = data.profile;
            }
        } catch (e) {
            console.error("Failed to fetch user profile", e);
        }

        if (!userProfile) {
            console.error("No user profile found during payment");
            alert("로그인이 필요합니다.");
            router.push('/login');
            return;
        }

        const paymentId = `pay_${crypto.randomUUID()}`;
        const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
        const channelKey = method === 'KAKAO'
            ? process.env.NEXT_PUBLIC_PORTONE_KAKAO_CHANNEL_KEY
            : process.env.NEXT_PUBLIC_PORTONE_TOSS_CHANNEL_KEY;

        if (!storeId || !channelKey) {
            alert("결제 설정이 올바르지 않습니다. 관리자에게 문의하세요.");
            setLoading(false);
            return;
        }

        try {
            const response = await window.PortOne.requestPayment({
                storeId,
                channelKey,
                paymentId,
                orderName: `Dreamary ${selectedPackage.credits} 크레딧`,
                totalAmount: selectedPackage.price,
                currency: "CURRENCY_KRW",
                payMethod: "EASY_PAY",
                customer: {
                    fullName: userProfile.nickname || 'Dreamer',
                    email: userProfile.email,
                    phoneNumber: "010-0000-0000",
                }
            });

            if (response.code != null) {
                alert(`결제 실패: ${response.message}`);
            } else {
                const verifyRes = await fetch('/api/shop/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentId: response.paymentId,
                        amount: selectedPackage.price,
                        packageId: selectedPackage.id
                    })
                });

                const verifyData = await verifyRes.json();

                if (verifyRes.ok && verifyData.success) {
                    alert(`결제가 완료되었습니다! ${selectedPackage.credits} 크레딧이 충전되었습니다.`);
                    setCurrentCredits(prev => (prev || 0) + selectedPackage.credits);
                    window.dispatchEvent(new Event('credit-update')); // Sync Header
                    setSelectedPackage(null);
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

    const handleWatchAd = () => {
        setShowAdModal(true);
        setIsAdPlaying(true);
        setAdTimer(5);

        const interval = setInterval(() => {
            setAdTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsAdPlaying(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAdComplete = async () => {
        try {
            const res = await fetch('/api/shop/ad-reward', { method: 'POST' });
            const data = await res.json();

            if (res.ok && data.success) {
                alert(data.message);
                setCurrentCredits(data.credits);
                window.dispatchEvent(new Event('credit-update')); // Sync Header
                setShowAdModal(false);
            } else {
                alert("보상 지급에 실패했습니다.");
            }
        } catch (error) {
            console.error("Ad reward failed", error);
            alert("오류가 발생했습니다.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">크레딧 상점</h1>
                    <p className="text-white/60">꿈을 더 생생하게 기록하기 위한 크레딧을 충전하세요.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Coins className="text-yellow-400" size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-white/40">보유 크레딧</p>
                        <p className="text-xl font-bold text-white">{currentCredits?.toLocaleString() ?? '-'} C</p>
                    </div>
                </div>
            </div>

            {/* Ad Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-black border border-white/10 p-8 flex flex-col md:flex-row items-center justify-between gap-8"
            >
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px]" />

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                        <Coins className="text-yellow-400" size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-white">무료 크레딧 받기</h3>
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/20">FREE</span>
                        </div>
                        <p className="text-white/60">30초 광고를 시청하고 <span className="text-white font-bold">1 크레딧</span>을 무료로 받아가세요.</p>
                    </div>
                </div>

                <button
                    onClick={handleWatchAd}
                    className="relative z-10 px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                    <span>광고 보고 받기</span>
                    <ChevronRight size={18} />
                </button>
            </motion.div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PACKAGES.map((pkg, index) => (
                    <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative group bg-black/40 backdrop-blur-xl border rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col ${pkg.popular
                            ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.1)]'
                            : 'border-white/10 hover:border-white/20'
                            }`}
                    >
                        {pkg.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                                <Sparkles size={12} fill="currentColor" />
                                BEST VALUE
                            </div>
                        )}

                        <div className="text-center mb-8 mt-2">
                            <h3 className="text-lg font-medium text-white/80 mb-1">{pkg.name}</h3>
                            <div className="flex items-center justify-center gap-2 text-3xl font-bold text-white">
                                <Coins className="text-yellow-400" size={28} fill="currentColor" />
                                {pkg.credits}
                            </div>
                            {pkg.bonus ? (
                                <span className="inline-block mt-2 text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-lg">
                                    {pkg.bonus} 보너스
                                </span>
                            ) : (
                                <div className="h-6 mt-2" /> /* Spacer for alignment */
                            )}
                        </div>

                        <div className="mt-auto space-y-4">
                            <div className="flex justify-between items-center py-3 border-t border-white/10">
                                <span className="text-white/60">가격</span>
                                <span className="text-xl font-bold text-white">₩{pkg.price.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={() => setSelectedPackage(pkg)}
                                className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${pkg.popular
                                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-cyan-500/20'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                구매하기
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Payment Modal */}
            {selectedPackage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedPackage(null)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
                    >
                        {/* Background Gradients */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

                        <h3 className="text-xl font-bold text-white mb-2 relative z-10">결제 수단 선택</h3>
                        <p className="text-white/50 text-sm mb-6 relative z-10">
                            {selectedPackage.name} ({selectedPackage.credits} 크레딧) - ₩{selectedPackage.price.toLocaleString()}
                        </p>

                        <div className="space-y-3 relative z-10">
                            <button
                                onClick={() => handlePayment('KAKAO')}
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-[#FEE500] text-black font-bold text-lg flex items-center justify-center gap-3 hover:brightness-95 transition-all"
                            >
                                <span className="text-xl">💬</span> 카카오페이
                            </button>
                            <button
                                onClick={() => handlePayment('TOSS')}
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-[#0064FF] text-white font-bold text-lg flex items-center justify-center gap-3 hover:brightness-95 transition-all"
                            >
                                <span className="text-xl">💸</span> 토스페이
                            </button>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/20 relative z-10">
                            <span>Powered by</span>
                            <span className="font-bold text-white/40">PORTONE</span>
                        </div>

                        <button
                            onClick={() => setSelectedPackage(null)}
                            className="w-full mt-4 py-3 text-white/40 hover:text-white text-sm transition-colors relative z-10"
                        >
                            취소
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Ad Modal */}
            {showAdModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black z-50" />
                    <div className="relative z-50 flex flex-col items-center justify-center w-full max-w-lg text-center p-8">
                        <div className="w-full aspect-video bg-gray-800 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden border border-white/10">
                            {isAdPlaying ? (
                                <>
                                    <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-sm font-bold text-white">
                                        남은 시간: {adTimer}초
                                    </div>
                                    <div className="text-white/50">광고 재생 중... (Mock)</div>
                                    <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 transition-all duration-1000 ease-linear" style={{ width: `${(5 - adTimer) * 20}%` }} />
                                </>
                            ) : (
                                <div className="text-white font-bold text-xl">광고 시청 완료!</div>
                            )}
                        </div>

                        {!isAdPlaying && (
                            <button
                                onClick={handleAdComplete}
                                className="px-8 py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors"
                            >
                                보상 받기
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
