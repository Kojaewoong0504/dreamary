"use client";

import MobileLayout from "@/components/layout/MobileLayout";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Trash2, Calendar, Sparkles, Tag } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function DreamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dreamId = params.id as string;

    const [dream, setDream] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

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

    if (loading) {
        return (
            <MobileLayout>
                <div className="flex items-center justify-center min-h-screen bg-dream-dark text-white">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-dream-cyan rounded-full animate-spin"></div>
                </div>
            </MobileLayout>
        );
    }

    if (!dream) {
        return (
            <MobileLayout>
                <div className="flex flex-col items-center justify-center min-h-screen bg-dream-dark text-white gap-4">
                    <p className="text-white/50">꿈을 찾을 수 없습니다.</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-white/10 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors"
                    >
                        돌아가기
                    </button>
                </div>
            </MobileLayout>
        );
    }

    const hasScenes = dream.scenes && dream.scenes.length > 0;
    const currentImage = hasScenes ? dream.scenes[currentSceneIndex].imageUrl : dream.image_url;
    const currentDescription = hasScenes ? dream.scenes[currentSceneIndex].description : (dream.interpretation || dream.content);

    return (
        <MobileLayout>
            <div className="flex flex-col h-[100dvh] pb-safe relative overflow-hidden bg-dream-dark">
                {/* Hero Image / Carousel Background */}
                <div className="absolute top-0 left-0 w-full h-[55vh]">
                    <div className="relative w-full h-full group">
                        <motion.img
                            key={currentSceneIndex}
                            src={currentImage}
                            alt={dream.title}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dream-dark/60 to-dream-dark" />

                        {/* Navigation Buttons (Only if scenes exist) */}
                        {hasScenes && (
                            <>
                                <button
                                    onClick={() => setCurrentSceneIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentSceneIndex === 0}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white/90 backdrop-blur-md border border-white/20 disabled:opacity-0 transition-all active:scale-95 z-30 shadow-lg"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <button
                                    onClick={() => setCurrentSceneIndex(prev => Math.min(dream.scenes.length - 1, prev + 1))}
                                    disabled={currentSceneIndex === dream.scenes.length - 1}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white/90 backdrop-blur-md border border-white/20 disabled:opacity-0 transition-all active:scale-95 z-30 shadow-lg"
                                >
                                    <ArrowLeft size={24} className="rotate-180" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Header */}
                <header className="px-6 pt-14 pb-4 flex items-center justify-between z-20 relative">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10 backdrop-blur-md"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div className="flex gap-2">
                        <button className="p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10 backdrop-blur-md">
                            <Share2 size={20} />
                        </button>
                    </div>
                </header>

                {/* Content Sheet */}
                <div className="flex-1 z-10 relative mt-[45vh] bg-dream-dark rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
                    {/* Drag Handle Indicator */}
                    <div className="w-full flex justify-center pt-3 pb-1">
                        <div className="w-12 h-1.5 rounded-full bg-white/10" />
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="pt-4"
                        >
                            {/* Scene Navigation Dots */}
                            {hasScenes && (
                                <div className="flex justify-center gap-2 mb-6">
                                    {dream.scenes.map((_: any, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentSceneIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-all shadow-sm ${idx === currentSceneIndex ? "bg-dream-cyan w-6" : "bg-white/10 hover:bg-white/20"}`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Meta Info */}
                            <div className="flex items-center gap-3 mb-4">
                                {hasScenes && (
                                    <span className="px-3 py-1 rounded-full bg-dream-cyan/10 border border-dream-cyan/20 text-[10px] text-dream-cyan font-bold">
                                        SCENE {currentSceneIndex + 1}/4
                                    </span>
                                )}
                                {dream.style && (
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-dream-purple font-medium">
                                        {dream.style}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl font-bold text-white leading-tight mb-2">
                                {dream.title}
                            </h1>
                            <div className="flex items-center gap-2 text-white/40 text-xs mb-8">
                                <Calendar size={12} />
                                <span>{new Date(dream.created_at).toLocaleDateString()}</span>
                            </div>

                            {/* Text Content */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-white/50 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles size={14} />
                                    {hasScenes ? `장면 ${currentSceneIndex + 1} 이야기` : "꿈 내용 / 해몽"}
                                </h3>
                                <motion.p
                                    key={currentSceneIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-white/90 leading-relaxed font-light whitespace-pre-wrap text-base"
                                >
                                    {currentDescription}
                                </motion.p>
                            </div>

                            {/* Full Interpretation (if available and using scenes) */}
                            {hasScenes && dream.interpretation && (
                                <div className="mb-8 pt-8 border-t border-white/5">
                                    <h3 className="text-sm font-bold text-dream-purple mb-3 uppercase tracking-wider flex items-center gap-2">
                                        <Sparkles size={14} />
                                        전체 해몽
                                    </h3>
                                    <p className="text-white/80 leading-relaxed font-light whitespace-pre-wrap text-sm">
                                        {dream.interpretation}
                                    </p>
                                </div>
                            )}

                            {/* Tags */}
                            {dream.tags && dream.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-4">
                                    {dream.tags.map((tag: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-white/50 flex items-center gap-1">
                                            <Tag size={10} /> #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
