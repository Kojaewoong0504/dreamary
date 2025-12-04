"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, CreditCard, Bell, LogOut, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    // const supabase = createClientComponentClient(); // Removed in favor of singleton

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                // Fetch profile from API (which handles custom JWT cookies)
                const res = await fetch('/api/user/profile');

                if (!res.ok) {
                    console.log("Admin Check: Profile fetch failed, redirecting to login");
                    router.replace("/desktop/login");
                    return;
                }

                const data = await res.json();
                const userProfile = data.profile;

                console.log("Admin Check Profile Result:", userProfile);

                if (!userProfile || !userProfile.is_admin) {
                    console.error("Access denied: Not an admin");
                    alert("관리자 권한이 없습니다.");
                    router.replace("/dashboard");
                    return;
                }

                setIsAdmin(true);
            } catch (err: any) {
                console.error("Admin Check Unexpected Error:", err);
                router.replace("/dashboard");
            }
        };

        checkAdmin();
    }, [router]);

    if (isAdmin === null) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    const menuItems = [
        { icon: LayoutDashboard, label: "대시보드", href: "/admin" },
        { icon: Users, label: "유저 관리", href: "/admin/users" },
        { icon: CreditCard, label: "결제 관리", href: "/admin/payments" },
        { icon: Bell, label: "알림 발송", href: "/admin/notifications" },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 flex flex-col fixed h-full bg-black z-50">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2 text-red-500 font-bold text-xl">
                        <ShieldAlert />
                        <span>ADMIN</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-red-500/20 text-red-400 font-bold"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Link
                        href="/dashboard?ignore_admin=true"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all"
                    >
                        <LogOut size={20} />
                        <span>나가기</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
