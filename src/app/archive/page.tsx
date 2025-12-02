"use client";

import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import BottomNav from "@/components/layout/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Heart, MoreVertical, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ui/ConfirmModal";

const filters = ["전체", "자각몽", "악몽", "비행", "우주", "자연"];

export default function ArchivePage() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState("전체");
    const [dreams, setDreams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedDreamId, setSelectedDreamId] = useState<string | null>(null);

    const handleDeleteClick = (dreamId: string) => {
        setSelectedDreamId(dreamId);
        setDeleteModalOpen(true);
        setActiveMenuId(null);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedDreamId) return;

        try {
            const res = await fetch(`/api/dreams/${selectedDreamId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setDreams(prev => prev.filter(d => d.id !== selectedDreamId));
            } else {
                alert("삭제에 실패했습니다.");
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert("삭제 중 오류가 발생했습니다.");
        } finally {
            setSelectedDreamId(null);
        }
    };

    useEffect(() => {
        const fetchDreams = async () => {
            try {
                const res = await fetch('/api/user/dreams');
                if (res.ok) {
                    const data = await res.json();
                    setDreams(data.dreams || []);
                }
            } catch (error) {
                console.error('Failed to fetch dreams:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDreams();
    }, []);

    const filteredDreams = dreams.filter(dream => {
        const matchesFilter = activeFilter === "전체" || dream.tags?.includes(activeFilter);
        const matchesSearch = dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dream.content?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <MobileLayout>
            <div className="flex flex-col min-h-screen pb-24 relative overflow-hidden bg-dream-bg">
                {/* Ambient Glows */}
                <div className="absolute top-[-10%] right-[-20%] w-[80%] h-[60%] bg-dream-purple/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-dream-cyan/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: "2s" }} />

                {/* Header */}
                <header className="px-6 pt-14 pb-2 z-10 relative">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-bold text-white tracking-tight">꿈 보관함</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className={`p-2 transition-colors rounded-full ${showSearch ? "bg-white text-black" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                            >
                                <Search size={20} />
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 transition-colors rounded-full ${showFilters ? "bg-white text-black" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                            >
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <AnimatePresence>
                        {showSearch && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                                animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
                                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="꿈 제목이나 내용 검색..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-dream-cyan/50 transition-colors"
                                        autoFocus
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Filter Chips */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 mask-linear-fade">
                                    {filters.map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setActiveFilter(filter)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${activeFilter === filter
                                                ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                                                }`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                {/* Dream Grid */}
                <div className="flex-1 px-6 z-10 relative overflow-y-auto pb-safe scrollbar-hide">
                    <motion.div
                        layout
                        className="grid grid-cols-2 gap-4 pb-6"
                    >
                        {loading ? (
                            <div className="col-span-2 flex justify-center py-20">
                                <div className="w-8 h-8 rounded-full border-4 border-dream-cyan border-t-transparent animate-spin" />
                            </div>
                        ) : (
                            filteredDreams.map((dream) => (
                                <Link href={`/dream/${dream.id}`} key={dream.id}>
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer"
                                    >
                                        {/* Image */}
                                        <img src={dream.image_url} alt={dream.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                        {/* Content */}
                                        <div className="absolute top-3 right-3 z-20">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === dream.id ? null : dream.id);
                                                }}
                                                className="p-1.5 rounded-full bg-black/20 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/40 transition-colors"
                                            >
                                                <MoreVertical size={14} />
                                            </button>

                                            <AnimatePresence>
                                                {activeMenuId === dream.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                                        className="absolute right-0 top-8 w-24 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-xl z-30"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() => {
                                                                setActiveMenuId(null);
                                                                router.push(`/dream/${dream.id}/edit`);
                                                            }}
                                                            className="w-full px-3 py-2 text-xs text-white/80 hover:bg-white/10 text-left transition-colors"
                                                        >
                                                            수정
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(dream.id)}
                                                            className="w-full px-3 py-2 text-xs text-rose-400 hover:bg-white/10 text-left transition-colors"
                                                        >
                                                            삭제
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-medium text-dream-cyan uppercase tracking-wider">
                                                    {dream.tags?.[0] || 'Dream'}
                                                </span>
                                                <div className="flex items-center gap-1 text-white/60">
                                                    <Heart size={10} className="fill-white/60" />
                                                    <span className="text-[10px]">{dream.likes}</span>
                                                </div>
                                            </div>
                                            <h3 className="text-sm font-bold text-white leading-tight mb-0.5 truncate">{dream.title}</h3>
                                            <p className="text-[10px] text-white/40">{new Date(dream.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))
                        )}
                    </motion.div>

                    {/* Empty State */}
                    {filteredDreams.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Search size={24} className="text-white/20" />
                            </div>
                            <p className="text-white/40 text-sm">이 카테고리의 꿈이 없습니다.</p>
                        </div>
                    )}
                </div>
                <BottomNav />
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
        </MobileLayout>
    );
}
