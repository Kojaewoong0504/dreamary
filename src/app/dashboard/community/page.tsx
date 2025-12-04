"use client";

import { useState, useEffect } from "react";
import FeedCard from "@/components/feed/FeedCard";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";


export default function DashboardCommunityPage() {
    const [dreams, setDreams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDreams = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/dreams');
                if (res.ok) {
                    const data = await res.json();
                    let fetchedDreams = data.dreams || [];

                    setDreams(fetchedDreams);
                }
            } catch (error) {
                console.error('Failed to fetch dreams:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDreams();
    }, []);

    return (
        <div className="h-full w-full bg-[#000] flex items-center justify-center overflow-hidden py-4">
            {/* Main Feed Container - Web Reels Style */}
            <div className="w-full max-w-[400px] h-full max-h-[calc(100vh-40px)] aspect-[9/16] relative bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[20px] overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border border-white/10 flex flex-col">

                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
                    </div>
                ) : dreams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/50">
                        <p>게시물이 없습니다.</p>
                        <p className="text-sm mt-2">첫 번째 꿈을 공유해보세요!</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        {dreams.map((dream, index) => (
                            <FeedCard
                                key={dream.id}
                                className="h-full w-full snap-start snap-always"
                                user={{
                                    name: dream.users?.nickname || dream.users?.email?.split('@')[0] || 'Unknown',
                                    avatar: dream.users?.avatar_url || "bg-gradient-to-br from-purple-500 to-indigo-500",
                                    time: new Date(dream.created_at).toLocaleDateString()
                                }}
                                dream={{
                                    title: dream.title,
                                    content: dream.content,
                                    image: dream.image_url,
                                    scenes: dream.scenes,
                                    tags: dream.tags,
                                    likes: dream.likes,
                                    comments: dream.comments,
                                    id: dream.id,
                                    user_has_liked: dream.user_has_liked
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
