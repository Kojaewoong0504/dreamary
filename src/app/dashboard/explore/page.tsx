"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Compass } from "lucide-react";
import Link from "next/link";

import { Suspense } from "react";

function ExploreContent() {
    const [dreams, setDreams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const query = searchParams.get('q');

    useEffect(() => {
        const fetchDreams = async () => {
            setLoading(true);
            try {
                // Fetch public dreams (same API as community)
                const res = await fetch('/api/dreams');
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

    // Memoize filtered results
    const filteredDreams = useMemo(() => {
        if (!query) return dreams;

        const lowerQuery = query.toLowerCase();
        return dreams.filter(dream =>
            dream.title?.toLowerCase().includes(lowerQuery) ||
            dream.content?.toLowerCase().includes(lowerQuery) ||
            dream.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
        );
    }, [dreams, query]);

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Compass className="text-cyan-400" size={32} />
                        탐색
                    </h1>
                </div>

                {query && (
                    <div className="mb-6">
                        <p className="text-white/60">
                            <span className="text-cyan-400 font-bold">"{query}"</span> 검색 결과: {filteredDreams.length}개
                        </p>
                    </div>
                )}
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredDreams.map((dream) => (
                            <motion.div
                                layout
                                key={dream.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer hover:border-white/30 transition-all"
                            >
                                {/* Since these are public dreams, we might want to link to a public view or just the same detail view if it supports read-only */}
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
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 p-[1px]">
                                                <div className="w-full h-full rounded-full bg-black overflow-hidden">
                                                    {dream.users?.avatar_url && (
                                                        <img src={dream.users.avatar_url} alt="User" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs text-white/60 truncate">
                                                {dream.users?.nickname || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
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
                    <p className="text-white/40">다른 검색어로 시도해보세요.</p>
                </div>
            )}
        </div>
    );
}

export default function DashboardExplorePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-full">
                <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
            </div>
        }>
            <ExploreContent />
        </Suspense>
    );
}
