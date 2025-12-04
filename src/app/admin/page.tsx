"use client";

import { useEffect, useState } from "react";
import { Users, FileImage, CreditCard, Activity } from "lucide-react";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading...</div>;

    const cards = [
        { label: "총 가입 유저", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-400" },
        { label: "생성된 꿈", value: stats?.totalDreams || 0, icon: FileImage, color: "text-purple-400" },
        { label: "결제 건수", value: stats?.successfulPayments || 0, icon: CreditCard, color: "text-green-400" },
        { label: "시스템 상태", value: "정상", icon: Activity, color: "text-red-400" },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">대시보드 개요</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                        <div className={`p-4 rounded-xl bg-white/5 ${card.color}`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <p className="text-white/40 text-sm font-medium">{card.label}</p>
                            <p className="text-2xl font-bold text-white">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder for charts or recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-64 flex items-center justify-center text-white/20">
                    최근 가입 유저 차트 (준비 중)
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-64 flex items-center justify-center text-white/20">
                    매출 추이 차트 (준비 중)
                </div>
            </div>
        </div>
    );
}
