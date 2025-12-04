"use client";

import { useEffect, useState } from "react";
import { Search, Coins, MoreVertical } from "lucide-react";
import CustomAlert from "@/components/ui/CustomAlert";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Alert State
    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "alert" | "confirm" | "success" | "error";
        onConfirm?: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "alert",
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?page=${page}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setTotal(data.count || 0);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const handleGiveCredits = (userId: string, currentCredits: number) => {
        const amountStr = prompt("지급할 크레딧 양을 입력하세요 (음수 입력 시 차감):", "10");
        if (!amountStr) return;

        const amount = parseInt(amountStr);
        if (isNaN(amount)) {
            setAlertState({ isOpen: true, title: "오류", message: "유효한 숫자를 입력해주세요.", type: "error" });
            return;
        }

        setAlertState({
            isOpen: true,
            title: "크레딧 지급 확인",
            message: `정말 ${amount} 크레딧을 지급하시겠습니까?`,
            type: "confirm",
            onConfirm: async () => {
                try {
                    const res = await fetch("/api/admin/users", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId, credits: amount })
                    });

                    if (res.ok) {
                        setAlertState({ isOpen: true, title: "성공", message: "크레딧이 지급되었습니다.", type: "success" });
                        fetchUsers(); // Refresh list
                    } else {
                        throw new Error("Failed to update credits");
                    }
                } catch (e) {
                    setAlertState({ isOpen: true, title: "오류", message: "크레딧 지급 중 오류가 발생했습니다.", type: "error" });
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            <CustomAlert
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                onConfirm={alertState.onConfirm}
            />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">유저 관리</h1>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2">
                    <Search size={16} className="text-white/40" />
                    <input
                        type="text"
                        placeholder="이메일 검색..."
                        className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-white/20 w-64"
                    />
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-white/80">
                    <thead className="bg-white/5 text-white/40 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">유저 정보</th>
                            <th className="px-6 py-4">가입일</th>
                            <th className="px-6 py-4">크레딧</th>
                            <th className="px-6 py-4">상태</th>
                            <th className="px-6 py-4 text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-white/40">로딩 중...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-white/40">유저가 없습니다.</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                                                {user.avatar_url && <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-white">{user.nickname || "Unknown"}</p>
                                                    {user.is_admin && (
                                                        <span className="px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[10px] font-bold text-red-400">
                                                            ADMIN
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-white/40">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white/60">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-yellow-400 font-bold">
                                            <Coins size={14} />
                                            {user.credits}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.is_premium ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-white/40"}`}>
                                            {user.is_premium ? "PREMIUM" : "FREE"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleGiveCredits(user.id, user.credits)}
                                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                            title="크레딧 지급"
                                        >
                                            <Coins size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination (Simple) */}
            <div className="flex justify-center gap-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 rounded-lg bg-white/5 disabled:opacity-50 text-sm"
                >
                    이전
                </button>
                <span className="px-4 py-2 text-sm text-white/60">{page}</span>
                <button
                    disabled={users.length < 20}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 rounded-lg bg-white/5 disabled:opacity-50 text-sm"
                >
                    다음
                </button>
            </div>
        </div>
    );
}
