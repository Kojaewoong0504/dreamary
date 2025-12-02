import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, ArrowLeft, Send, X, AlertTriangle, Ban } from "lucide-react";
import { useState } from "react";

interface FeedCardProps {
    user: {
        name: string;
        avatar: string;
        time: string;
    };
    dream: {
        id: string;
        title: string;
        content: string;
        image: string;
        scenes?: { imageUrl: string; description: string }[];
        tags: string[];
        likes: number;
        comments: number;
        user_has_liked?: boolean;
    };
}

export default function FeedCard({ user, dream }: FeedCardProps) {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(dream.user_has_liked || false);
    const [likesCount, setLikesCount] = useState(dream.likes);
    const [showComments, setShowComments] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);

    const hasScenes = dream.scenes && dream.scenes.length > 0;
    const currentImage = hasScenes ? dream.scenes![currentSceneIndex].imageUrl : dream.image;
    const isAvatarUrl = user.avatar.startsWith("http") || user.avatar.startsWith("/");

    if (isBlocked) return null;

    // Like Handler
    const handleLike = async () => {
        const previousLiked = isLiked;
        const previousCount = likesCount;

        // Optimistic Update
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            const res = await fetch(`/api/dreams/${dream.id}/like`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to like');
        } catch (error) {
            // Revert on error
            setIsLiked(previousLiked);
            setLikesCount(previousCount);
            console.error(error);
        }
    };

    // Fetch Comments
    const fetchComments = async () => {
        if (showComments) return; // Don't refetch if closing
        setLoadingComments(true);
        try {
            const res = await fetch(`/api/dreams/${dream.id}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data.comments || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingComments(false);
        }
    };

    // Add Comment
    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            const res = await fetch(`/api/dreams/${dream.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            });
            if (res.ok) {
                const data = await res.json();
                setComments(prev => [...prev, data.comment]);
                setNewComment("");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Share Handler
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: dream.title,
                    text: dream.content,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback
            alert("공유 기능이 지원되지 않는 브라우저입니다.");
        }
    };

    // Report Handler
    const handleReport = () => {
        if (confirm("이 게시물을 신고하시겠습니까?")) {
            alert("신고가 접수되었습니다. 검토 후 조치하겠습니다.");
            setShowMoreMenu(false);
        }
    };

    // Block Handler
    const handleBlock = () => {
        if (confirm(`'${user.name}'님의 글을 더 이상 보지 않으시겠습니까?`)) {
            setIsBlocked(true);
            setShowMoreMenu(false);
            // In a real app, save this to API or localStorage
        }
    };

    return (
        <motion.div className="w-full h-screen snap-start relative bg-black overflow-hidden">
            {/* Background Image & Carousel */}
            <div className="absolute inset-0 group">
                {currentImage ? (
                    <img src={currentImage} alt={dream.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
                )}
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Carousel Navigation */}
                {hasScenes && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); setCurrentSceneIndex(prev => Math.max(0, prev - 1)); }}
                            disabled={currentSceneIndex === 0}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-white/80 backdrop-blur-md border border-white/10 disabled:opacity-0 transition-all active:scale-95 z-30 opacity-0 group-hover:opacity-100"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setCurrentSceneIndex(prev => Math.min(dream.scenes!.length - 1, prev + 1)); }}
                            disabled={currentSceneIndex === dream.scenes!.length - 1}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-white/80 backdrop-blur-md border border-white/10 disabled:opacity-0 transition-all active:scale-95 z-30 opacity-0 group-hover:opacity-100"
                        >
                            <ArrowLeft size={24} className="rotate-180" />
                        </button>
                    </>
                )}
            </div>

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-28 flex flex-col items-center gap-6 z-10">
                <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-white/20 transition-colors cursor-pointer overflow-hidden border border-white/20">
                        {isAvatarUrl ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className={`w-full h-full ${user.avatar} flex items-center justify-center text-[10px] font-bold text-white`}>
                                {user.name[0]}
                            </div>
                        )}
                    </div>
                </div>

                <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
                    <div className="p-3 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-white/20 transition-colors">
                        <Heart size={24} className={`transition-transform group-hover:scale-110 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
                    </div>
                    <span className="text-xs font-medium text-white shadow-black drop-shadow-md">{likesCount}</span>
                </button>

                <button onClick={() => { setShowComments(true); fetchComments(); }} className="flex flex-col items-center gap-1 group">
                    <div className="p-3 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-white/20 transition-colors">
                        <MessageCircle size={24} className="text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs font-medium text-white shadow-black drop-shadow-md">{dream.comments}</span>
                </button>

                <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
                    <div className="p-3 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-white/20 transition-colors">
                        <Share2 size={24} className="text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs font-medium text-white shadow-black drop-shadow-md">공유</span>
                </button>

                <button onClick={() => setShowMoreMenu(true)} className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors mt-2">
                    <MoreHorizontal size={24} className="text-white" />
                </button>
            </div>

            {/* Bottom Content */}
            <div className="absolute left-0 right-16 bottom-28 px-5 z-10">
                {hasScenes && (
                    <div className="flex gap-1 mb-2">
                        {dream.scenes!.map((_, idx) => (
                            <div key={idx} className={`h-1 rounded-full transition-all ${idx === currentSceneIndex ? "bg-dream-cyan w-6" : "bg-white/30 w-2"}`} />
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-white drop-shadow-md">@{user.name}</span>
                    <span className="text-xs text-white/60">• {user.time}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 leading-tight drop-shadow-lg">{dream.title}</h3>
                <p className="text-sm text-white/80 line-clamp-3 mb-3 leading-relaxed drop-shadow-md">
                    {hasScenes ? dream.scenes![currentSceneIndex].description : dream.content}
                </p>
                <div className="flex flex-wrap gap-2">
                    {dream.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-dream-cyan border border-white/10 font-medium">#{tag}</span>
                    ))}
                </div>
            </div>

            {/* More Menu Drawer */}
            <AnimatePresence>
                {showMoreMenu && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMoreMenu(false)}
                            className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute bottom-0 left-0 right-0 bg-[#1A1A24] rounded-t-3xl z-50 flex flex-col shadow-2xl border-t border-white/10 overflow-hidden"
                        >
                            <div className="p-4 flex flex-col gap-2 pb-safe">
                                <button
                                    onClick={handleReport}
                                    className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-3 text-white transition-colors"
                                >
                                    <AlertTriangle size={20} className="text-red-500" />
                                    <span className="font-medium">신고하기</span>
                                </button>
                                <button
                                    onClick={handleBlock}
                                    className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-3 text-white transition-colors"
                                >
                                    <Ban size={20} className="text-gray-400" />
                                    <span className="font-medium">이 사용자의 글 보지 않기</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Comment Drawer */}
            <AnimatePresence>
                {showComments && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowComments(false)}
                            className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute bottom-0 left-0 right-0 h-[60vh] bg-[#1A1A24] rounded-t-3xl z-50 flex flex-col shadow-2xl border-t border-white/10"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                                <h3 className="text-white font-bold text-lg">댓글 <span className="text-dream-cyan">{comments.length}</span></h3>
                                <button onClick={() => setShowComments(false)} className="p-2 text-white/50 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {loadingComments ? (
                                    <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-dream-cyan border-t-transparent rounded-full animate-spin" /></div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center text-white/30 py-10 text-sm">첫 번째 댓글을 남겨보세요!</div>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 overflow-hidden">
                                                {comment.users?.avatar_url ? (
                                                    <img src={comment.users.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-purple-500 to-indigo-500">
                                                        {comment.users?.nickname?.[0] || "?"}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="text-sm font-bold text-white/90">{comment.users?.nickname || "Unknown"}</span>
                                                    <span className="text-[10px] text-white/40">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-white/80 leading-relaxed">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t border-white/5 bg-[#1A1A24] pb-safe">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="따뜻한 댓글을 남겨주세요..."
                                        className="w-full bg-black/30 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-dream-cyan/50"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-dream-cyan text-black disabled:opacity-30 disabled:bg-white/10 disabled:text-white/30 transition-all"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
