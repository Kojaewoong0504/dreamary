"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Tag, Sparkles, Share2, MoreVertical, Trash2, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function DashboardDreamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dreamId = params.id as string;

    const [dream, setDream] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        const fetchDream = async () => {
            try {
                const res = await fetch(`/api/dreams/${dreamId}`);
                if (res.ok) {
                    const data = await res.json();
                    setDream(data.dream);
                } else {
                    console.error("Failed to fetch dream");
                }
            } catch (error) {
                console.error("Error fetching dream:", error);
            } finally {
                setLoading(false);
            }
        };

        if (dreamId) {
            fetchDream();
        }
    }, [dreamId]);

    const handleDeleteConfirm = async () => {
        try {
            const res = await fetch(`/api/dreams/${dreamId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.push('/dashboard/dreams');
            } else {
                alert("삭제에 실패했습니다.");
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!dream) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/50 gap-4">
                <p>꿈을 찾을 수 없습니다.</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors"
                >
                    돌아가기
                </button>
            </div>
        );
    }

    const hasScenes = dream.scenes && dream.scenes.length > 0;
    const currentImage = hasScenes ? dream.scenes[currentSceneIndex].imageUrl : dream.image_url;
    const currentDescription = hasScenes ? dream.scenes[currentSceneIndex].description : (dream.interpretation || dream.content);

    return (
        <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>목록으로</span>
                </button>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/dashboard/write?edit=${dreamId}`}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="수정"
                    >
                        <Edit2 size={18} />
                    </Link>
                    <button
                        onClick={() => setDeleteModalOpen(true)}
                        className="p-2 text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="삭제"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
                {/* Left Column: Image */}
                <div className="relative rounded-2xl overflow-hidden bg-black/20 border border-white/10 h-full max-h-[600px] lg:max-h-none flex flex-col group">
                    <div className="flex-1 relative overflow-hidden">
                        <motion.img
                            key={currentSceneIndex}
                            src={currentImage}
                            alt={dream.title}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 w-full h-full object-cover"
                        />

                        {/* Scene Navigation Overlay */}
                        {hasScenes && (
                            <>
                                {/* Prev Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentSceneIndex((prev) => (prev === 0 ? dream.scenes.length - 1 : prev - 1));
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-all backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                {/* Next Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentSceneIndex((prev) => (prev === dream.scenes.length - 1 ? 0 : prev + 1));
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-all backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronRight size={24} />
                                </button>

                                {/* Dots */}
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                                    {dream.scenes.map((_: any, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentSceneIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-all shadow-lg ${idx === currentSceneIndex
                                                ? "bg-cyan-400 w-6"
                                                : "bg-white/50 hover:bg-white"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pr-2">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            {dream.style && (
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-purple-400 font-medium">
                                    {dream.style}
                                </span>
                            )}
                            <div className="flex items-center gap-2 text-white/40 text-xs">
                                <Calendar size={14} />
                                <span>{new Date(dream.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-white leading-tight mb-6">
                            {dream.title}
                        </h1>

                        <div className="space-y-8">
                            {/* Main Content */}
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                <h3 className="text-sm font-bold text-white/50 mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles size={16} className="text-cyan-400" />
                                    {hasScenes ? `장면 ${currentSceneIndex + 1} 이야기` : "꿈 내용"}
                                </h3>
                                <motion.p
                                    key={currentSceneIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-white/90 leading-relaxed whitespace-pre-wrap text-lg font-light"
                                >
                                    {currentDescription}
                                </motion.p>
                            </div>

                            {/* Interpretation */}
                            {dream.interpretation && (
                                <div className="bg-purple-500/5 rounded-2xl p-6 border border-purple-500/20">
                                    <h3 className="text-sm font-bold text-purple-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                        <Sparkles size={16} />
                                        꿈 해몽
                                    </h3>
                                    <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                                        {dream.interpretation}
                                    </p>
                                </div>
                            )}

                            {/* Tags */}
                            {dream.tags && dream.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {dream.tags.map((tag: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-sm text-white/60 flex items-center gap-1">
                                            <Tag size={12} /> #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="꿈 삭제하기"
                description="정말로 이 꿈을 삭제하시겠습니까? 삭제된 꿈은 복구할 수 없습니다."
                confirmText="삭제"
                isDangerous={true}
            />
        </div>
    );
}
