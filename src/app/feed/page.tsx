"use client";

import MobileLayout from "@/components/layout/MobileLayout";
import BottomNav from "@/components/layout/BottomNav";
import FeedCard from "@/components/feed/FeedCard";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

// Mock Data Removed

export default function FeedPage() {
    const [dreams, setDreams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDreams = async () => {
            try {
                const res = await fetch('/api/dreams');
                if (res.ok) {
                    const data = await res.json();
                    setDreams(data.dreams);
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
        <MobileLayout>
            <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative">

                {/* Header - Floating */}
                <header className="absolute top-0 left-0 right-0 z-20 px-6 pt-14 pb-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                    <div className="flex items-center justify-between pointer-events-auto">
                        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 drop-shadow-md">
                            커뮤니티 <Sparkles size={16} className="text-dream-cyan" />
                        </h1>
                    </div>
                </header>

                {/* Feed List */}
                {loading ? (
                    <div className="h-screen flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-4 border-dream-cyan border-t-transparent animate-spin" />
                    </div>
                ) : (
                    dreams.map((dream) => (
                        <FeedCard
                            key={dream.id}
                            user={{
                                name: dream.users?.email?.split('@')[0] || 'Unknown',
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
                    ))
                )}

                {/* Bottom Nav Overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-20">
                    <BottomNav />
                </div>
            </div>
        </MobileLayout>
    );
}
