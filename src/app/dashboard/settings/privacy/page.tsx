"use client";

import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/settings" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft size={24} className="text-white" />
                </Link>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Shield className="text-cyan-400" size={28} />
                    개인정보 처리방침
                </h1>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-white/80 leading-relaxed space-y-6">
                <p>
                    Dreamary(이하 '서비스')는 이용자의 개인정보를 중요시하며, "정보통신망 이용촉진 및 정보보호"에 관한 법률을 준수하고 있습니다.
                </p>

                <section>
                    <h3 className="text-lg font-bold text-white mb-2">1. 수집하는 개인정보 항목</h3>
                    <p>회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
                    <ul className="list-disc list-inside mt-2 ml-4 text-white/60">
                        <li>수집항목: 이메일, 비밀번호, 닉네임, 프로필 사진</li>
                        <li>개인정보 수집방법: 홈페이지(회원가입)</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-lg font-bold text-white mb-2">2. 개인정보의 수집 및 이용목적</h3>
                    <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
                    <ul className="list-disc list-inside mt-2 ml-4 text-white/60">
                        <li>서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산</li>
                        <li>회원 관리: 회원제 서비스 이용에 따른 본인확인, 개인식별, 불량회원의 부정 이용 방지와 비인가 사용 방지</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-lg font-bold text-white mb-2">3. 개인정보의 보유 및 이용기간</h3>
                    <p>원칙적으로, 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</p>
                </section>

                <p className="text-sm text-white/40 mt-8 pt-8 border-t border-white/10">
                    본 방침은 2024년 1월 1일부터 시행됩니다.
                </p>
            </div>
        </div>
    );
}
