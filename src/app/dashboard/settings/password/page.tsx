"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PasswordChangePage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        if (newPassword.length < 6) {
            alert("비밀번호는 6자 이상이어야 합니다.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
            } else {
                alert(`변경 실패: ${data.error}`);
            }
        } catch (error) {
            console.error("Password change error", error);
            alert("오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/settings" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft size={24} className="text-white" />
                </Link>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Lock className="text-cyan-400" size={28} />
                    비밀번호 변경
                </h1>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">현재 비밀번호</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                        placeholder="현재 비밀번호를 입력하세요"
                    />
                </div>

                <div className="pt-4 border-t border-white/10">
                    <label className="block text-sm font-medium text-white/60 mb-2">새 비밀번호</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                        placeholder="새 비밀번호 (6자 이상)"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">새 비밀번호 확인</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                        placeholder="새 비밀번호를 다시 입력하세요"
                    />
                </div>

                <div className="pt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                변경 중...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                변경하기
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
