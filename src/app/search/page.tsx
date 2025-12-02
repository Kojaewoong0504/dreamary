"use client";

import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import BottomNav from "@/components/layout/BottomNav";
import { motion } from "framer-motion";
import { Search, TrendingUp, Clock, ArrowRight, Sparkles } from "lucide-react";

const trendingTags = [
    { id: 1, name: "Lucid Dream", count: "2.4k" },
    { id: 2, name: "Flying", count: "1.8k" },
    { id: 3, name: "Space", count: "1.2k" },
    { id: 4, name: "Ocean", count: "980" },
    { id: 5, name: "Nightmare", count: "850" },
    { id: 6, name: "Future", count: "720" },
];

const recentSearches = ["Falling", "Teeth falling out", "Late for exam"];

const recommendedDreams = [
    { id: 1, title: "Cyberpunk City", author: "Neo", image: "bg-fuchsia-600" },
    { id: 2, title: "Underwater Tea Party", author: "Alice", image: "bg-cyan-600" },
    { id: 3, title: "Mars Colony", author: "Elon", image: "bg-orange-600" },
];

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    return (
        <MobileLayout>
            <div className="flex flex-col min-h-screen pb-24 relative overflow-hidden bg-dream-dark">
                {/* Ambient Glows */}
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[60%] bg-dream-cyan/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
                <div className="absolute bottom-[10%] right-[-20%] w-[60%] h-[40%] bg-dream-purple/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: "2s" }} />

                {/* Search Header */}
                <header className="px-6 pt-14 pb-4 z-20 relative">
                    <h1 className="text-xl font-bold text-white mb-6 tracking-tight">탐색</h1>

                    <div className={`relative transition-all duration-300 ${isFocused ? "scale-[1.02]" : "scale-100"}`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-dream-cyan/20 to-dream-purple/20 rounded-2xl blur-md opacity-50" />
                        <div className="glass-panel p-1 rounded-2xl flex items-center bg-white/5 border border-white/10 relative z-10">
                            <Search className="ml-3 text-white/40" size={20} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="꿈, 감정, 상징을 검색해보세요..."
                                className="w-full bg-transparent border-none text-white placeholder:text-white/30 focus:ring-0 py-3 px-3"
                            />
                        </div>
                    </div>
                </header>

                <div className="flex-1 px-6 z-10 relative overflow-y-auto pb-safe scrollbar-hide">
                    {/* Trending Tags */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={16} className="text-dream-cyan" />
                            <h2 className="text-sm font-bold text-white">실시간 트렌드</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {trendingTags.map((tag) => (
                                <button
                                    key={tag.id}
                                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 group"
                                >
                                    <span className="text-xs text-white/80 group-hover:text-white">#{tag.name}</span>
                                    <span className="text-[10px] text-white/30 group-hover:text-white/50">{tag.count}</span>
                                </button>
                            ))}
                        </div>
                    </motion.section>

                    {/* Recommended Dreams */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-dream-purple" />
                                <h2 className="text-sm font-bold text-white">추천 꿈</h2>
                            </div>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                            {recommendedDreams.map((dream) => (
                                <div key={dream.id} className="min-w-[140px] aspect-[3/4] rounded-xl relative overflow-hidden group cursor-pointer">
                                    <div className={`absolute inset-0 ${dream.image} opacity-60 group-hover:opacity-80 transition-opacity`} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute bottom-3 left-3">
                                        <h3 className="text-xs font-bold text-white mb-0.5">{dream.title}</h3>
                                        <p className="text-[10px] text-white/60">by {dream.author}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Recent Searches */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={16} className="text-white/60" />
                            <h2 className="text-sm font-bold text-white/80">최근 검색어</h2>
                        </div>
                        <div className="space-y-1">
                            {recentSearches.map((search, index) => (
                                <button key={index} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group text-left">
                                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">{search}</span>
                                    <ArrowRight size={14} className="text-white/20 group-hover:text-white/60 -translate-x-2 group-hover:translate-x-0 transition-all opacity-0 group-hover:opacity-100" />
                                </button>
                            ))}
                        </div>
                    </motion.section>
                </div>
                <BottomNav />
            </div>
        </MobileLayout>
    );
}
