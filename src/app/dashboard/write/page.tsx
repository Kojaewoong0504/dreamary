"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Zap, Palette, X, Lock, Globe, PlayCircle, Coins, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { styles, models } from "@/lib/constants";
import CustomAlert from "@/components/ui/CustomAlert";

import { Suspense } from "react";

function WriteContent() {
    const [step, setStep] = useState(1);
    const [dreamText, setDreamText] = useState("");
    const [selectedStyle, setSelectedStyle] = useState(styles[0].id);
    const [selectedModel, setSelectedModel] = useState(models[0].id);
    const [loading, setLoading] = useState(false);
    const [generatedScenes, setGeneratedScenes] = useState<any[]>([]);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [credits, setCredits] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [interpretation, setInterpretation] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [generatingVideo, setGeneratingVideo] = useState(false);
    const [userProfile, setUserProfile] = useState<{ nationality: string; gender: string; is_premium?: boolean } | null>(null);

    // Alert State
    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "alert" | "confirm" | "success" | "error";
        onConfirm?: () => void;
        onCancel?: () => void;
        confirmText?: string;
        cancelText?: string;
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "alert",
    });

    const router = useRouter();
    const searchParams = useSearchParams();
    const editDreamId = searchParams.get("edit");

    const showAlert = (title: string, message: string, type: "alert" | "success" | "error" = "alert") => {
        setAlertState({ isOpen: true, title, message, type });
    };

    const closeAlert = () => {
        setAlertState(prev => ({ ...prev, isOpen: false }));
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const addCustomTag = () => {
        const tagToAdd = customTag.trim().replace(/^#/, '');
        if (tagToAdd && !selectedTags.includes(tagToAdd)) {
            setSelectedTags(prev => [...prev, tagToAdd]);
            setCustomTag("");
        }
    };

    // Fetch User Profile on Mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    setUserProfile(data.profile);
                    if (data.profile.credits !== undefined) {
                        setCredits(data.profile.credits);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch profile", e);
            }
        };
        fetchProfile();
    }, []);

    // Fetch Dream for Editing
    useEffect(() => {
        if (!editDreamId) return;

        const fetchDreamToEdit = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/dreams/${editDreamId}`);
                if (res.ok) {
                    const data = await res.json();
                    const dream = data.dream;

                    setDreamText(dream.content || "");
                    setGeneratedScenes(dream.scenes || []);
                    setInterpretation(dream.interpretation || null);
                    setSelectedTags(dream.tags || []);
                    setIsPublic(dream.is_public);
                    if (dream.style) setSelectedStyle(dream.style);
                    if (dream.model) setSelectedModel(dream.model); // Assuming model is saved, if not it defaults

                    // If scenes exist, go to step 2 (Detail view), otherwise step 1
                    if (dream.scenes && dream.scenes.length > 0) {
                        setStep(2);
                    } else {
                        setStep(1);
                    }
                } else {
                    showAlert("오류", "꿈 정보를 불러오는데 실패했습니다.", "error");
                }
            } catch (error) {
                console.error("Failed to fetch dream for edit:", error);
                showAlert("오류", "꿈 정보를 불러오는 중 문제가 발생했습니다.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchDreamToEdit();
    }, [editDreamId]);

    const handleGenerate = async () => {
        setLoading(true);
        setGeneratedScenes([]);
        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: dreamText,
                    style: selectedStyle,
                    model: selectedModel,
                    userContext: userProfile || { gender: "male", nationality: "KR" }
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "이미지 생성에 실패했습니다.");
            }

            setGeneratedScenes(data.scenes);
            setInterpretation(data.interpretation);

            if (data.remainingCredits !== undefined) {
                setCredits(data.remainingCredits);
                // Dispatch event to update global header
                window.dispatchEvent(new Event('credit-update'));
            }
            setStep(2);

        } catch (error: any) {
            console.error(error);
            showAlert("오류 발생", error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateVideo = async () => {
        if (!credits || credits < 3) {
            showAlert("크레딧 부족", "드림 모션 생성에는 3 크레딧이 필요합니다.", "alert");
            return;
        }

        setGeneratingVideo(true);
        // Mock Video Generation
        setTimeout(() => {
            setVideoUrl("https://media.istockphoto.com/id/1460656789/video/abstract-purple-blue-pink-gradient-background.mp4?s=mp4-640x640-is&k=20&c=123");
            setGeneratingVideo(false);
            setCredits(prev => (prev || 0) - 3);
            showAlert("생성 완료", "드림 모션이 생성되었습니다!", "success");
        }, 3000);
    };

    const handlePost = async (retryCount = 0) => {
        if (generatedScenes.length === 0) return;

        setLoading(true);
        try {
            const url = editDreamId ? `/api/dreams/${editDreamId}` : "/api/dreams";
            const method = editDreamId ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: editDreamId ? undefined : "새로운 꿈", // Don't overwrite title on edit unless we add title editing
                    content: dreamText,
                    image_url: generatedScenes[0]?.imageUrl,
                    scenes: generatedScenes,
                    style: selectedStyle,
                    tags: [...selectedTags, selectedStyle, selectedModel], // Re-eval tags
                    is_public: isPublic,
                    interpretation,
                    video_url: videoUrl
                }),
            });

            // Handle 401 Unauthorized (Token Expired)
            if (response.status === 401 && retryCount < 1) {
                console.log("Access token expired. Attempting refresh...");
                const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });

                if (refreshRes.ok) {
                    console.log("Token refreshed. Retrying request...");
                    // Retry the request once
                    await handlePost(retryCount + 1);
                    return;
                } else {
                    throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
                }
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.details || "꿈 저장에 실패했습니다.");
            }

            showAlert("저장 완료", editDreamId ? "꿈이 성공적으로 수정되었습니다!" : "꿈이 성공적으로 기록되었습니다!", "success");
            setTimeout(() => router.push(editDreamId ? `/dashboard/dreams/${editDreamId}` : "/dashboard/dreams"), 1500);
        } catch (error: any) {
            console.error(error);
            showAlert("저장 실패", error.message, "error");
        } finally {
            if (retryCount === 0) setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto h-full flex flex-col">
            <CustomAlert
                isOpen={alertState.isOpen}
                onClose={closeAlert}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                onConfirm={alertState.onConfirm}
                onCancel={alertState.onCancel}
                confirmText={alertState.confirmText}
                cancelText={alertState.cancelText}
            />

            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h1 className="text-2xl font-bold text-white">
                        {step === 1 ? (editDreamId ? "꿈 수정하기" : "꿈 기록하기") : step === 2 ? "디테일 추가" : "공유하기"}
                    </h1>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <Coins size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-white">{credits ?? '-'}</span>
                </div>
            </header>

            {/* Step Progress */}
            <div className="flex gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${s <= step ? "bg-cyan-500" : "bg-white/10"}`}
                    />
                ))}
            </div>

            <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {/* STEP 1: Visualize */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full flex flex-col"
                        >
                            <textarea
                                value={dreamText}
                                onChange={(e) => setDreamText(e.target.value)}
                                placeholder="어젯밤, 어떤 꿈을 꾸셨나요?&#13;&#10;자유롭게 이야기해주세요..."
                                className="flex-1 w-full bg-transparent border-none text-xl leading-relaxed placeholder:text-white/20 focus:ring-0 resize-none p-0 text-white/90 selection:bg-purple-500/30 font-light"
                            />

                            <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider">AI 모델</label>
                                    <div className="flex gap-2">
                                        {models.map((model: { id: string; name: string; icon: any }) => (
                                            <button
                                                key={model.id}
                                                onClick={() => setSelectedModel(model.id)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all border ${selectedModel === model.id ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/5 text-white/40 hover:bg-white/5"}`}
                                            >
                                                <model.icon size={16} />
                                                <span className="text-sm font-medium">{model.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider">화풍</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {styles.map((style: { id: string; name: string; emoji: string }) => (
                                            <button
                                                key={style.id}
                                                onClick={() => setSelectedStyle(style.id)}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all whitespace-nowrap text-sm ${selectedStyle === style.id ? "bg-purple-500/20 border-purple-500/50 text-white" : "bg-transparent border-white/5 text-white/40 hover:bg-white/5"}`}
                                            >
                                                <span>{style.emoji}</span>
                                                <span>{style.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !dreamText.trim()}
                                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>생성 중...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Palette size={20} />
                                            <span>{editDreamId ? "다시 시각화하기 (-1)" : "꿈 시각화하기 (-1)"}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Details */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full flex flex-col md:flex-row gap-8"
                        >
                            <div className="flex-1 relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 group">
                                <img src={generatedScenes[currentSceneIndex]?.imageUrl} alt="Generated Scene" className="w-full h-full object-contain" />

                                {/* Navigation Arrows */}
                                <button
                                    onClick={() => setCurrentSceneIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentSceneIndex === 0}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white disabled:opacity-0 transition-all"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => setCurrentSceneIndex(prev => Math.min(generatedScenes.length - 1, prev + 1))}
                                    disabled={currentSceneIndex === generatedScenes.length - 1}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white disabled:opacity-0 transition-all"
                                >
                                    <ChevronRight size={24} />
                                </button>

                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                    {generatedScenes.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentSceneIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-colors ${idx === currentSceneIndex ? "bg-cyan-400" : "bg-white/20"}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="w-full md:w-96 flex flex-col gap-6 overflow-y-auto pr-2">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Sparkles className="text-purple-400" size={20} />
                                        AI 꿈 해몽
                                    </h3>
                                    <p className="text-sm text-white/80 leading-relaxed">
                                        {interpretation}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider">태그</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["자각몽", "악몽", "비행", "우주", "자연"].map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedTags.includes(tag) ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}`}
                                            >
                                                #{tag}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={customTag}
                                            onChange={(e) => setCustomTag(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    addCustomTag();
                                                }
                                            }}
                                            placeholder="태그 입력 (Space/Enter)"
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                                        />
                                        <button type="button" onClick={addCustomTag} disabled={!customTag.trim()} className="px-3 py-2 bg-white/10 rounded-lg text-xs text-white hover:bg-white/20">추가</button>
                                    </div>

                                    {/* Selected Tags Display */}
                                    {selectedTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2 p-3 rounded-xl bg-black/20 border border-white/5">
                                            {selectedTags.map((tag) => (
                                                <button
                                                    key={tag}
                                                    onClick={() => toggleTag(tag)}
                                                    className="px-2 py-1 rounded-md bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 text-xs flex items-center gap-1 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all group"
                                                >
                                                    <span>#{tag}</span>
                                                    <X size={12} className="opacity-50 group-hover:opacity-100" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-6 border-t border-white/10 flex gap-4">
                                    <button
                                        onClick={handleGenerateVideo}
                                        disabled={generatingVideo || !!videoUrl}
                                        className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white/80 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        {generatingVideo ? "생성 중..." : videoUrl ? "영상 생성됨" : "드림 모션 (3C)"}
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        className="flex-1 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors"
                                    >
                                        다음 단계
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Share */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center"
                        >
                            <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden relative shadow-2xl border border-white/10 bg-black/40 mb-8">
                                <img src={generatedScenes[0]?.imageUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-8 text-left">
                                    <h3 className="text-2xl font-bold text-white mb-2">꿈 이야기</h3>
                                    <p className="text-white/80 text-sm line-clamp-3">{generatedScenes[0]?.description}</p>
                                </div>
                            </div>

                            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-8 w-full">
                                <button
                                    onClick={() => setIsPublic(true)}
                                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${isPublic ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
                                >
                                    전체 공개
                                </button>
                                <button
                                    onClick={() => setIsPublic(false)}
                                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${!isPublic ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
                                >
                                    나만 보기
                                </button>
                            </div>

                            <button
                                onClick={() => handlePost()}
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold shadow-lg hover:shadow-purple-500/20 transition-all"
                            >
                                {loading ? "저장 중..." : (editDreamId ? "수정 완료" : "꿈 게시하기")}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function DashboardWritePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-full">
                <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
            </div>
        }>
            <WriteContent />
        </Suspense>
    );
}
