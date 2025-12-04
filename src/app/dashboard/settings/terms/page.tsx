"use client";

import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/settings" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft size={24} className="text-white" />
                </Link>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FileText className="text-cyan-400" size={28} />
                    이용약관
                </h1>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-white/80 leading-relaxed space-y-6">
                <section>
                    <h3 className="text-lg font-bold text-white mb-2">제 1 조 (목적)</h3>
                    <p>
                        본 약관은 Dreamary(이하 "회사")가 제공하는 꿈 기록 및 공유 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-bold text-white mb-2">제 2 조 (용어의 정의)</h3>
                    <ul className="list-disc list-inside mt-2 ml-4 text-white/60">
                        <li>"서비스"라 함은 회원이 이용할 수 있는 Dreamary 관련 제반 서비스를 의미합니다.</li>
                        <li>"회원"이라 함은 회사의 "서비스"에 접속하여 이 약관에 따라 "회사"와 이용계약을 체결하고 "회사"가 제공하는 "서비스"를 이용하는 고객을 말합니다.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-lg font-bold text-white mb-2">제 3 조 (약관의 게시와 개정)</h3>
                    <p>
                        회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
                    </p>
                </section>

                <p className="text-sm text-white/40 mt-8 pt-8 border-t border-white/10">
                    본 약관은 2024년 1월 1일부터 시행됩니다.
                </p>
            </div>
        </div>
    );
}
