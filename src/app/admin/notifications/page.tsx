"use client";

import { useState } from "react";
import { Bell, Send } from "lucide-react";
import CustomAlert from "@/components/ui/CustomAlert";

export default function AdminNotificationsPage() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [link, setLink] = useState("/dashboard");
    const [loading, setLoading] = useState(false);

    // Alert State
    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "alert" | "confirm" | "success" | "error";
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "alert",
    });

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            setAlertState({ isOpen: true, title: "오류", message: "제목과 내용을 입력해주세요.", type: "error" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/admin/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    target: "all",
                    title,
                    message,
                    link
                })
            });

            if (res.ok) {
                setAlertState({ isOpen: true, title: "성공", message: "전체 알림이 발송되었습니다.", type: "success" });
                setTitle("");
                setMessage("");
            } else {
                throw new Error("Failed to send");
            }
        } catch (e) {
            setAlertState({ isOpen: true, title: "오류", message: "알림 발송 실패", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <CustomAlert
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />

            <h1 className="text-3xl font-bold flex items-center gap-3">
                <Bell className="text-red-400" />
                전체 알림 발송
            </h1>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-white/60">알림 제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="예: 긴급 점검 안내"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500/50 focus:outline-none transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-white/60">알림 내용</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="내용을 입력하세요..."
                        rows={4}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500/50 focus:outline-none transition-colors resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-white/60">이동 링크</label>
                    <select
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500/50 focus:outline-none transition-colors appearance-none"
                    >
                        <option value="/dashboard">대시보드 홈 (/dashboard)</option>
                        <option value="/dashboard/shop">상점 (/dashboard/shop)</option>
                        <option value="/dashboard/explore">꿈 탐험 (/dashboard/explore)</option>
                        <option value="/dashboard/profile">프로필 (/dashboard/profile)</option>
                        <option value="/dashboard/settings">설정 (/dashboard/settings)</option>
                        <option value="/community">커뮤니티 (/community)</option>
                    </select>
                </div>

                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? "발송 중..." : (
                        <>
                            <Send size={20} />
                            전체 발송하기
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
