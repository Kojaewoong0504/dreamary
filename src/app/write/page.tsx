"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/layout/MobileLayout";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Zap, Palette, X, Lock, Globe, PlayCircle, Coins } from "lucide-react";
import Link from "next/link";

import { styles, models } from "../../lib/constants";
import CustomAlert from "@/components/ui/CustomAlert";

export default function WritePage() {
    const [step, setStep] = useState(1);
    const [dreamText, setDreamText] = useState("");
    const [selectedStyle, setSelectedStyle] = useState(styles[0].id);
    const [selectedModel, setSelectedModel] = useState(models[0].id);
    const [loading, setLoading] = useState(false);
    const [generatedScenes, setGeneratedScenes] = useState<any[]>([]);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [credits, setCredits] = useState<number | null>(null);
    const [showAd, setShowAd] = useState(false);
    const [adTimer, setAdTimer] = useState(5);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [interpretation, setInterpretation] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [generatingVideo, setGeneratingVideo] = useState(false);

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

    const showAlert = (title: string, message: string, type: "alert" | "success" | "error" = "alert") => {
        setAlertState({ isOpen: true, title, message, type });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setAlertState({ isOpen: true, title, message, type: "confirm", onConfirm });
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
        if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
            setSelectedTags(prev => [...prev, customTag.trim()]);
            setCustomTag("");
        }
    };

    // Load draft from localStorage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem("dreamDraft");
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                // Only prompt if there's meaningful content
                if (parsed.dreamText || (parsed.generatedScenes && parsed.generatedScenes.length > 0)) {
                    setAlertState({
                        isOpen: true,
                        title: "이어쓰기",
                        message: "이전에 작성 중인 꿈이 있습니다. 이어서 작성하시겠습니까?",
                        type: "confirm",
                        confirmText: "이어쓰기",
                        cancelText: "새로 쓰기",
                        onConfirm: () => {
                            const hasScenes = parsed.generatedScenes && parsed.generatedScenes.length > 0;
                            // If images exist, jump to at least Step 2 so user doesn't have to regenerate
                            setStep(hasScenes ? Math.max(parsed.step || 2, 2) : (parsed.step || 1));
                            setDreamText(parsed.dreamText || "");
                            setSelectedStyle(parsed.selectedStyle || styles[0].id);
                            setSelectedModel(parsed.selectedModel || models[0].id);
                            setGeneratedScenes(parsed.generatedScenes || []);
                            setSelectedTags(parsed.selectedTags || []);
                            setInterpretation(parsed.interpretation || null);
                        }
                    });
                }
            } catch (e) {
                console.error("Failed to load draft", e);
                localStorage.removeItem("dreamDraft");
            }
        }
    }, []);

    // Save draft to localStorage on change
    useEffect(() => {
        // ... (keep existing save logic)
        const draft = {
            step,
            dreamText,
            selectedStyle,
            selectedModel,
            generatedScenes,
            selectedTags,
            interpretation
        };
        // Only save if there's something to save
        if (dreamText || generatedScenes.length > 0) {
            localStorage.setItem("dreamDraft", JSON.stringify(draft));
        }
    }, [step, dreamText, selectedStyle, selectedModel, generatedScenes, selectedTags, interpretation]);

    // Warning on browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (dreamText || generatedScenes.length > 0) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [dreamText, generatedScenes]);

    const handleBack = () => {
        // Smart Navigation: Only warn when exiting the flow (Step 1 -> Exit)
        if (step > 1) {
            // Internal navigation is frictionless
            setStep(step - 1);
        } else {
            // Exiting the flow
            if (dreamText || generatedScenes.length > 0) {
                showConfirm(
                    "작성 중단",
                    "작성 중인 내용이 있습니다. 정말 나가시겠습니까?\n(작성 중인 내용은 임시 저장됩니다)",
                    () => {
                        router.back();
                    }
                );
            } else {
                router.back();
            }
        }
    };

    const [userProfile, setUserProfile] = useState<{ nationality: string; gender: string; is_premium?: boolean } | null>(null);

    // ... (existing state)

    // Fetch User Profile on Mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    setUserProfile(data.profile);
                    // Also update credits if available in profile
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

    // ... (existing useEffects)

    const handleGenerate = async () => {
        // ... (validation)

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
                    userContext: userProfile || { gender: "male", nationality: "KR" } // Fallback to default if not loaded
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403) {
                    // Check if user is premium (skip ad)
                    if (userProfile?.is_premium) {
                        showAlert("크레딧 부족", "크레딧이 부족합니다. 상점에서 충전해주세요.", "alert");
                    } else {
                        setShowAd(true); // Trigger ad for non-premium
                    }
                    setLoading(false);
                    return;
                }
                throw new Error(data.error || "이미지 생성에 실패했습니다.");
            }

            console.log("Generated Scenes:", data.scenes);
            setGeneratedScenes(data.scenes);
            setInterpretation(data.interpretation); // Set interpretation

            if (data.remainingCredits !== undefined) {
                setCredits(data.remainingCredits);
            }
            setStep(2); // Move to Step 2 on success

        } catch (error: any) {
            console.error(error);
            showAlert("오류 발생", error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleWatchAd = () => {
        // Simulate Ad
        const timer = setInterval(() => {
            setAdTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finishAd();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const finishAd = async () => {
        try {
            const response = await fetch("/api/ad/reward", { method: "POST" });
            const data = await response.json();
            if (response.ok) {
                setCredits(data.credits);
                setShowAd(false);
                setAdTimer(5); // Reset
                showAlert("광고 시청 완료", "1 크레딧이 지급되었습니다.", "success");
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (showAd && adTimer === 5) {
            handleWatchAd();
        }
    }, [showAd, adTimer]); // Added adTimer to dependency array to prevent re-triggering if adTimer changes for other reasons

    const handleGenerateVideo = async () => {
        if (!credits || credits < 3) {
            showAlert("크레딧 부족", "드림 모션 생성에는 3 크레딧이 필요합니다.", "alert");
            return;
        }

        setGeneratingVideo(true);
        // Mock Video Generation
        setTimeout(() => {
            setVideoUrl("https://media.istockphoto.com/id/1460656789/video/abstract-purple-blue-pink-gradient-background.mp4?s=mp4-640x640-is&k=20&c=123"); // Mock Video URL
            setGeneratingVideo(false);
            setCredits(prev => (prev || 0) - 3);
            showAlert("생성 완료", "드림 모션이 생성되었습니다!", "success");
        }, 3000);
    };

    const handlePost = async () => {
        if (generatedScenes.length === 0) return;

        setLoading(true);
        try {
            const response = await fetch("/api/dreams", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: "새로운 꿈", // In a real app, user could input title
                    content: dreamText,
                    image_url: generatedScenes[0]?.imageUrl, // Use first scene as main image
                    scenes: generatedScenes, // Save all scenes
                    style: selectedStyle,
                    tags: [...selectedTags, selectedStyle, selectedModel], // Combine user tags with auto tags
                    is_public: isPublic,
                    interpretation,
                    video_url: videoUrl
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.details || "꿈 저장에 실패했습니다.");
            }

            // Clear draft on success
            localStorage.removeItem("dreamDraft");

            showAlert("저장 완료", "꿈이 성공적으로 기록되었습니다!", "success");
            setTimeout(() => router.push("/mypage"), 1500); // Redirect to My Page to see the new dream
        } catch (error: any) {
            console.error(error);
            showAlert("저장 실패", error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileLayout>
            <div className="flex flex-col h-[100dvh] pb-safe relative overflow-hidden bg-dream-dark">
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

                {/* Ad Overlay */}
                <AnimatePresence>
                    {showAd && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6"
                        >
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 rounded-full border-4 border-dream-cyan border-t-transparent animate-spin mx-auto" />
                                <h2 className="text-2xl font-bold text-white">광고 시청 중...</h2>
                                <p className="text-white/60">꿈을 이루기 위한 에너지를 충전하고 있습니다.</p>
                                <div className="text-4xl font-mono font-bold text-dream-cyan">{adTimer}s</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading Overlay for Generation */}
                <AnimatePresence>
                    {loading && !showAd && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6"
                        >
                            <div className="relative w-24 h-24 mb-8">
                                <motion.div
                                    className="absolute inset-0 border-4 border-dream-purple/30 rounded-full"
                                />
                                <motion.div
                                    className="absolute inset-0 border-4 border-t-dream-cyan border-r-transparent border-b-transparent border-l-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                    className="absolute inset-4 border-4 border-t-dream-purple border-r-transparent border-b-transparent border-l-transparent rounded-full"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">꿈을 시각화하는 중...</h2>
                            <p className="text-white/60 text-center max-w-xs">
                                AI가 당신의 꿈을 분석하고 이미지를 생성하고 있습니다. 잠시만 기다려주세요.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Ambient Glows */}
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[60%] bg-dream-purple/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-dream-cyan/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: "2s" }} />

                {/* Header */}
                <header className="px-6 pt-14 pb-4 flex items-center justify-between z-20 relative">
                    <button
                        onClick={handleBack}
                        className="p-2 -ml-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5 relative z-10"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-white/80 tracking-wide">
                        {step === 1 ? "꿈 기록하기" : step === 2 ? "디테일 추가" : "공유하기"}
                    </h1>
                    <div className="flex items-center gap-2 relative z-10">
                        <Link href="/shop" className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <Coins size={12} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-bold text-white">{credits ?? '-'}</span>
                            <div className="w-4 h-4 rounded-full bg-yellow-400/20 flex items-center justify-center ml-1">
                                <span className="text-[10px] font-bold text-yellow-400">+</span>
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Step Progress */}
                <div className="px-6 mb-6 flex gap-1">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1 flex-1 rounded-full transition-colors duration-500 ${s <= step ? "bg-dream-cyan" : "bg-white/10"}`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: Visualize */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col px-6 z-10 relative overflow-y-auto scrollbar-hide"
                        >
                            <div className="flex-1 relative group mt-4 min-h-[120px]">
                                <textarea
                                    value={dreamText}
                                    onChange={(e) => setDreamText(e.target.value)}
                                    placeholder="어젯밤, 어떤 꿈을 꾸셨나요?&#13;&#10;자유롭게 이야기해주세요..."
                                    className="w-full h-full bg-transparent border-none text-2xl leading-relaxed placeholder:text-white/30 focus:ring-0 resize-none p-0 text-white/90 selection:bg-dream-purple/30 font-light tracking-wide"
                                    style={{ caretColor: '#22d3ee' }}
                                />
                                <div className="absolute bottom-4 right-0 text-[10px] text-white/20 font-mono transition-opacity duration-300 opacity-50 group-hover:opacity-100">
                                    {dreamText.length}자
                                </div>
                            </div>

                            <div className="mt-auto pb-6 space-y-6">
                                {/* Model Selector */}
                                <div className="glass-panel p-1 rounded-xl flex bg-white/5 border border-white/10 backdrop-blur-md">
                                    {models.map((model: { id: string; name: string; icon: any }) => (
                                        <button
                                            key={model.id}
                                            onClick={() => setSelectedModel(model.id)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all relative ${selectedModel === model.id ? "text-white shadow-sm" : "text-white/40 hover:text-white/70"}`}
                                        >
                                            {selectedModel === model.id && (
                                                <motion.div layoutId="model-active-bg" className="absolute inset-0 bg-white/10 rounded-lg border border-white/5" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                                            )}
                                            <model.icon size={14} className="relative z-10" />
                                            <span className="text-[11px] font-medium relative z-10">{model.name}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Style Selector */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider">화풍 선택</label>
                                    </div>
                                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 mask-linear-fade">
                                        {styles.map((style: { id: string; name: string; emoji: string }) => (
                                            <button
                                                key={style.id}
                                                onClick={() => setSelectedStyle(style.id)}
                                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap text-xs backdrop-blur-sm ${selectedStyle === style.id ? "bg-dream-purple/20 border-dream-purple/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10 hover:text-white/70"}`}
                                            >
                                                <span className="text-sm filter grayscale-[0.5]">{style.emoji}</span>
                                                <span>{style.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {generatedScenes.length > 0 && (
                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full mb-3 py-4 rounded-2xl border border-white/10 bg-white/5 text-white/70 font-medium hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>생성된 이미지 보러가기</span>
                                        <div className="bg-white/10 px-2 py-0.5 rounded text-[10px]">{generatedScenes.length}장</div>
                                    </button>
                                )}

                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !dreamText.trim()}
                                    className={`w-full text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_35px_rgba(34,211,238,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group active:scale-[0.98] ${(credits !== null && credits <= 0) ? "bg-gradient-to-r from-gray-700 to-gray-600" : "bg-gradient-to-r from-dream-purple to-dream-cyan"}`}
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    {(credits !== null && credits <= 0) ? (
                                        <>
                                            <Zap className="w-4 h-4 text-yellow-400" />
                                            <span className="text-sm font-medium tracking-wide">광고 보고 충전하기</span>
                                        </>
                                    ) : (
                                        <>
                                            <Palette className="w-4 h-4" />
                                            <span className="text-sm font-medium tracking-wide">꿈 시각화하기 (-1)</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Details */}
                    {step === 2 && generatedScenes.length > 0 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col px-6 z-10 relative overflow-y-auto scrollbar-hide pb-24"
                        >
                            <div className="mb-6 relative aspect-square group flex-shrink-0">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSceneIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative"
                                    >
                                        <img src={generatedScenes[currentSceneIndex].imageUrl} alt={`Scene ${currentSceneIndex + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded bg-dream-cyan/20 border border-dream-cyan/30 text-dream-cyan text-[10px] font-bold">
                                                    SCENE {currentSceneIndex + 1}/4
                                                </span>
                                            </div>
                                            <p className="text-white/90 text-sm leading-relaxed font-light">
                                                {generatedScenes[currentSceneIndex].description}
                                            </p>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation Buttons */}
                                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 pointer-events-none">
                                    <button
                                        onClick={() => setCurrentSceneIndex(prev => Math.max(0, prev - 1))}
                                        disabled={currentSceneIndex === 0}
                                        className="p-2 rounded-full bg-black/40 text-white/80 backdrop-blur-md border border-white/10 pointer-events-auto disabled:opacity-0 transition-opacity hover:bg-black/60"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentSceneIndex(prev => Math.min(generatedScenes.length - 1, prev + 1))}
                                        disabled={currentSceneIndex === generatedScenes.length - 1}
                                        className="p-2 rounded-full bg-black/40 text-white/80 backdrop-blur-md border border-white/10 pointer-events-auto disabled:opacity-0 transition-opacity hover:bg-black/60"
                                    >
                                        <ArrowLeft size={20} className="rotate-180" />
                                    </button>
                                </div>

                                {/* Pagination Dots */}
                                <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-1.5">
                                    {generatedScenes.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentSceneIndex ? "bg-dream-cyan" : "bg-white/20"}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider">태그 선택</label>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {["자각몽", "악몽", "비행", "우주", "자연"].map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedTags.includes(tag) ? "bg-dream-cyan/20 border-dream-cyan text-dream-cyan" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}`}
                                            >
                                                #{tag}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 mt-2">
                                        <input
                                            type="text"
                                            value={customTag}
                                            onChange={(e) => setCustomTag(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                                            placeholder="태그 직접 입력 (#없이 입력)"
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-dream-cyan/50"
                                        />
                                        <button onClick={addCustomTag} disabled={!customTag.trim()} className="px-3 py-2 bg-white/10 rounded-lg text-xs text-white disabled:opacity-30 hover:bg-white/20">추가</button>
                                    </div>

                                    {selectedTags.filter(t => !["자각몽", "악몽", "비행", "우주", "자연"].includes(t)).length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedTags.filter(t => !["자각몽", "악몽", "비행", "우주", "자연"].includes(t)).map((tag) => (
                                                <button key={tag} onClick={() => toggleTag(tag)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-dream-purple/20 border border-dream-purple text-dream-purple flex items-center gap-1">
                                                    #{tag} <X size={10} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Interpretation Card */}
                            {interpretation && (
                                <div className="mt-8 mb-6 p-4 rounded-xl bg-[#0A0A12]/90 border border-white/10 backdrop-blur-md shadow-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={14} className="text-dream-purple" />
                                        <h3 className="text-sm font-bold text-white">AI 꿈 해몽</h3>
                                    </div>
                                    <p className="text-xs text-white/80 leading-relaxed">
                                        {interpretation}
                                    </p>
                                </div>
                            )}

                            {/* Video Generation Button */}
                            {!videoUrl ? (
                                <button
                                    onClick={handleGenerateVideo}
                                    disabled={generatingVideo}
                                    className="w-full mb-4 py-3 rounded-xl border border-dream-cyan/30 bg-dream-cyan/10 text-dream-cyan font-bold text-sm hover:bg-dream-cyan/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {generatingVideo ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            <span>영상 생성 중...</span>
                                        </>
                                    ) : (
                                        <>
                                            <PlayCircle size={16} />
                                            <span>드림 모션 만들기 (3 크레딧)</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-white flex items-center gap-2">
                                            <PlayCircle size={12} className="text-dream-cyan" /> 드림 모션
                                        </span>
                                    </div>
                                    <video src={videoUrl} controls className="w-full rounded-lg" />
                                </div>
                            )}

                            <div className="mt-auto pb-6">
                                <button
                                    onClick={() => setStep(3)}
                                    className="w-full bg-white text-black font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-100 transition-colors"
                                >
                                    다음 단계
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Share */}
                    {step === 3 && generatedScenes.length > 0 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col px-6 z-10 relative overflow-y-auto scrollbar-hide"
                        >
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden relative shadow-2xl border border-white/10 bg-black/40">
                                    <img src={generatedScenes[0].imageUrl} alt="Dream Preview" className="w-full h-full object-cover opacity-80" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {selectedTags.map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/80 backdrop-blur-md">#{tag}</span>
                                            ))}
                                        </div>
                                        <h3 className="text-white font-bold mb-2">꿈 이야기 (4컷)</h3>
                                        <p className="text-white/90 text-sm font-light leading-relaxed line-clamp-4">{generatedScenes[0].description}...</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pb-6 space-y-3">
                                {/* Visibility Toggle */}
                                <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 relative">
                                    <div className={`absolute inset-y-1 w-1/2 bg-white/10 rounded-xl transition-all duration-300 ${isPublic ? "left-1" : "left-[calc(50%-4px)] translate-x-full"}`} />
                                    <button
                                        onClick={() => setIsPublic(true)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors ${isPublic ? "text-white" : "text-white/40 hover:text-white/70"}`}
                                    >
                                        <Globe size={16} />
                                        <span className="text-sm font-medium">전체 공개</span>
                                    </button>
                                    <button
                                        onClick={() => setIsPublic(false)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors ${!isPublic ? "text-white" : "text-white/40 hover:text-white/70"}`}
                                    >
                                        <Lock size={16} />
                                        <span className="text-sm font-medium">나만 보기</span>
                                    </button>
                                </div>

                                <button
                                    onClick={handlePost}
                                    disabled={loading}
                                    className="w-full bg-white text-black font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-gray-100 hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <Sparkles className="animate-spin w-5 h-5 text-black" />
                                    ) : (
                                        <>
                                            <span className="text-base">꿈 게시하기</span>
                                            <div className="bg-black/10 p-1 rounded-full">
                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </div>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MobileLayout>
    );
}
