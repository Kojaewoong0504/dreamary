"use client";

import MobileLayout from "@/components/layout/MobileLayout";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function DreamEditPage() {
    const params = useParams();
    const router = useRouter();
    const dreamId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        interpretation: "",
        is_public: true,
        tags: [] as string[],
    });

    useEffect(() => {
        const fetchDream = async () => {
            try {
                const res = await fetch(`/api/dreams/${dreamId}`);
                if (res.ok) {
                    const data = await res.json();
                    const dream = data.dream;
                    setFormData({
                        title: dream.title,
                        content: dream.content,
                        interpretation: dream.interpretation || "",
                        is_public: dream.is_public,
                        tags: dream.tags || [],
                    });
                } else {
                    alert("꿈 정보를 불러오는데 실패했습니다.");
                    router.back();
                }
            } catch (error) {
                console.error("Error fetching dream:", error);
                alert("오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        if (dreamId) {
            fetchDream();
        }
    }, [dreamId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/dreams/${dreamId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert("수정되었습니다.");
                router.push(`/dream/${dreamId}`);
            } else {
                alert("수정에 실패했습니다.");
            }
        } catch (error) {
            console.error("Error updating dream:", error);
            alert("오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <MobileLayout>
                <div className="flex items-center justify-center min-h-screen bg-dream-dark text-white">
                    <Loader2 className="animate-spin text-dream-cyan" size={32} />
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout>
            <div className="flex flex-col min-h-screen bg-dream-dark text-white pb-safe">
                {/* Header */}
                <header className="px-6 pt-14 pb-4 flex items-center justify-between sticky top-0 bg-dream-dark/80 backdrop-blur-md z-20 border-b border-white/5">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="text-lg font-bold">꿈 수정하기</h1>
                    <div className="w-9" /> {/* Spacer */}
                </header>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">제목</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-dream-cyan/50 transition-colors"
                            placeholder="꿈 제목을 입력하세요"
                            required
                        />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">꿈 내용</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-dream-cyan/50 transition-colors resize-none"
                            placeholder="꿈 내용을 입력하세요"
                            required
                        />
                    </div>

                    {/* Interpretation */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">해몽 (선택)</label>
                        <textarea
                            value={formData.interpretation}
                            onChange={(e) => setFormData({ ...formData, interpretation: e.target.value })}
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-dream-cyan/50 transition-colors resize-none"
                            placeholder="해몽을 입력하세요"
                        />
                    </div>

                    {/* Visibility */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-sm font-medium">공개 설정</span>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${formData.is_public ? 'bg-dream-cyan' : 'bg-white/20'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.is_public ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-dream-cyan to-dream-purple text-white font-bold py-4 rounded-xl shadow-lg shadow-dream-cyan/20 hover:shadow-dream-cyan/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                저장 중...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                저장하기
                            </>
                        )}
                    </button>
                </form>
            </div>
        </MobileLayout>
    );
}
