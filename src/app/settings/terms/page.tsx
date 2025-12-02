"use client";

import MobileLayout from "@/components/layout/MobileLayout";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
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
                    <h1 className="text-lg font-bold">이용약관</h1>
                </header>

                {/* Content */}
                <div className="p-6 space-y-6 text-sm text-dream-text-secondary leading-relaxed overflow-y-auto pb-24">
                    <div>
                        <p className="mb-2 font-bold text-white/90">제 1 조 (목적)</p>
                        <p>본 약관은 Dreamary(이하 "서비스")가 제공하는 모든 서비스의 이용조건 및 절차, 이용자와 서비스의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
                    </div>

                    <div>
                        <p className="mb-2 font-bold text-white/90">제 2 조 (용어의 정의)</p>
                        <p>"회원"이라 함은 서비스에 접속하여 본 약관에 따라 이용계약을 체결하고 서비스를 이용하는 고객을 말합니다.</p>
                    </div>

                    <div>
                        <p className="mb-2 font-bold text-white/90">제 3 조 (서비스의 제공)</p>
                        <p>서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다. 단, 시스템 점검 등 불가피한 사유가 있는 경우 서비스의 일부 또는 전부가 중단될 수 있습니다.</p>
                    </div>

                    <div>
                        <p className="mb-2 font-bold text-white/90">제 4 조 (개인정보 보호)</p>
                        <p>서비스는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다.</p>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
