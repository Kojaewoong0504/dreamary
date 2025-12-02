"use client";

import MobileLayout from "@/components/layout/MobileLayout";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
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
                    <h1 className="text-lg font-bold">개인정보 처리방침</h1>
                </header>

                {/* Content */}
                <div className="p-6 space-y-6 text-sm text-dream-text-secondary leading-relaxed overflow-y-auto pb-24">
                    <div>
                        <p className="mb-2 font-bold text-white/90">1. 수집하는 개인정보 항목</p>
                        <p>서비스는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.<br />- 수집항목: 이메일, 비밀번호, 닉네임, 서비스 이용기록</p>
                    </div>

                    <div>
                        <p className="mb-2 font-bold text-white/90">2. 개인정보의 수집 및 이용목적</p>
                        <p>서비스는 수집한 개인정보를 다음의 목적을 위해 활용합니다.<br />- 서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산<br />- 회원 관리</p>
                    </div>

                    <div>
                        <p className="mb-2 font-bold text-white/90">3. 개인정보의 보유 및 이용기간</p>
                        <p>원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</p>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
