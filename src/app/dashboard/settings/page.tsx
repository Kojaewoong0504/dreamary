"use client";

import { User, Shield, FileText, Info, LogOut, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardSettingsPage() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.profile);
                }
            } catch (e) {
                console.error("Failed to fetch profile", e);
            }
        };
        fetchProfile();
    }, []);

    const settingsGroups = [
        {
            title: "계정",
            items: [
                { icon: User, label: "프로필 수정", href: "/dashboard/settings/profile", desc: "내 정보 및 프로필 사진 변경" },
            ]
        },
        {
            title: "정보 및 지원",
            items: [
                { icon: Shield, label: "개인정보 처리방침", href: "/dashboard/settings/privacy", desc: "개인정보 보호 정책 확인" },
                { icon: FileText, label: "이용약관", href: "/dashboard/settings/terms", desc: "서비스 이용약관" },
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">설정</h1>

            <div className="space-y-8">
                {settingsGroups.map((group, idx) => (
                    <div key={idx}>
                        <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4 px-2">{group.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {group.items.map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white mb-1">{item.label}</h3>
                                        <p className="text-xs text-white/40">{item.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

                <div>
                    <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4 px-2">기타</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {user?.provider === 'email' && (
                            <Link
                                href="/dashboard/settings/password"
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white mb-1">비밀번호 변경</h3>
                                    <p className="text-xs text-white/40">로그인 비밀번호 변경</p>
                                </div>
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all text-left group"
                        >
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                <LogOut size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white mb-1">로그아웃</h3>
                                <p className="text-xs text-white/40 group-hover:text-red-400/60">계정에서 로그아웃합니다</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
