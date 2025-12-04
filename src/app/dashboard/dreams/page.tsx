"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Heart, MoreVertical, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ui/ConfirmModal";

const filters = ["전체", "자각몽", "악몽", "비행", "우주", "자연"];

export default function DashboardArchivePage() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState("전체");
    const [dreams, setDreams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
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

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Memoize filtered results to prevent unnecessary re-renders
    const filteredDreams = useMemo(() => {
        return dreams.filter(dream => {
            const matchesFilter = activeFilter === "전체" || dream.tags?.includes(activeFilter);
            const matchesSearch = dream.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                dream.content?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [dreams, activeFilter, debouncedSearchQuery]);

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-white">꿈 보관함</h1>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="꿈 검색..."
                                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 w-64 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${activeFilter === filter
                                ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredDreams.map((dream: any) => (
                            <motion.div
                                layout
                                key={dream.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer hover:border-white/30 transition-all"
                            >
                                <Link href={`/dashboard/dreams/${dream.id}`} className="block w-full h-full">
                                    <img src={dream.image_url} alt={dream.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                                {dream.tags?.[0] || 'Dream'}
                                            </span>
                                            <div className="flex items-center gap-1 text-white/60">
                                                <Heart size={12} className="fill-white/60" />
                                                <span className="text-xs">{dream.likes}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-white leading-tight mb-1 truncate">{dream.title}</h3>
                                        <p className="text-xs text-white/40">{new Date(dream.created_at).toLocaleDateString()}</p>
                                    </div>
                                </Link>

                                <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setActiveMenuId(activeMenuId === dream.id ? null : dream.id);
                                        }}
                                        className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                                    >
                                        <MoreVertical size={16} />
                                    </button>

                                    {activeMenuId === dream.id && (
                                        <div className="absolute right-0 top-10 w-32 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-xl z-30">
                                            <button
                                                onClick={() => {
                                                    setActiveMenuId(null);
                                                    router.push(`/dashboard/write?edit=${dream.id}`);
                                                }}
                                                className="w-full px-4 py-3 text-sm text-white/80 hover:bg-white/10 text-left transition-colors"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(dream.id)}
                                                className="w-full px-4 py-3 text-sm text-rose-400 hover:bg-white/10 text-left transition-colors"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!loading && filteredDreams.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <Search size={32} className="text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">꿈을 찾을 수 없습니다</h3>
                    <p className="text-white/40">검색어나 필터를 변경해보세요.</p>
                </div>
            )}

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
