"use client";

import MobileLayout from "@/components/layout/MobileLayout";
import { ChevronLeft, Info } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VersionPage() {
    const router = useRouter();

    return (
        <MobileLayout>
            <div className="flex flex-col min-h-screen bg-dream-dark text-white">
                {/* Header */}
                <header className="px-6 py-4 flex items-center gap-4 border-b border-white/5">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold">버전 정보</h1>
                </header>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32">
                    <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-lg">
                        <Info size={48} className="text-dream-cyan" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Dreamary</h2>
                    <p className="text-dream-text-secondary mb-8">v1.0.0</p>

                    <div className="w-full max-w-xs space-y-4">
                        <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-sm text-white/70">현재 버전</span>
                            <span className="text-sm font-medium text-dream-cyan">1.0.0</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-sm text-white/70">최신 버전</span>
                            <span className="text-sm font-medium text-white/90">1.0.0</span>
                        </div>

                        <button
                            onClick={async () => {
                                try {
                                    alert("5초 뒤에 알림이 발송됩니다!\n확인을 누르고 즉시 앱을 닫아보세요 (홈 화면으로 이동).");
                                    const res = await fetch('/api/test-notification', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ delay: 5 })
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                        if (data.fcmResult?.success) {
                                            console.log(`성공! FCM ID: ${data.fcmResult.messageId}`);
                                        } else {
                                            console.error(`FCM 실패: ${JSON.stringify(data.fcmResult?.error)}`);
                                        }
                                    }
                                } catch (e) {
                                    alert('오류가 발생했습니다: ' + e);
                                }
                            }}
                            className="w-full py-3 rounded-xl bg-dream-cyan/10 text-dream-cyan font-medium text-sm hover:bg-dream-cyan/20 transition-colors"
                        >
                            🔔 5초 후 알림 발송 (백그라운드 테스트)
                        </button>

                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch('/api/debug/firebase');
                                    const data = await res.json();
                                    alert(JSON.stringify(data, null, 2));
                                } catch (e) {
                                    alert('Error: ' + e);
                                }
                            }}
                            className="w-full py-3 rounded-xl bg-white/5 text-white/70 font-medium text-sm hover:bg-white/10 transition-colors"
                        >
                            🛠️ 서버 설정 확인
                        </button>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
