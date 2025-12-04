"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Camera, Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProfileEditPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [nickname, setNickname] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.profile);
                    setNickname(data.profile.nickname || "");
                    setAvatarUrl(data.profile.avatar_url || "");
                } else if (res.status === 401) {
                    router.push('/login');
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert("파일 크기는 5MB 이하여야 합니다.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.id);

        try {
            const res = await fetch('/api/user/upload-avatar', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setAvatarUrl(data.avatarUrl);
                // Update user object locally as well
                setUser({ ...user, avatar_url: data.avatarUrl });
            } else {
                const errorData = await res.json();
                alert(`업로드 실패: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Upload error", error);
            alert("이미지 업로드 중 오류가 발생했습니다.");
        } finally {
            setUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, avatar_url: avatarUrl })
            });

            if (res.ok) {
                // Force refresh to update sidebar/header
                window.location.href = '/dashboard/settings';
            } else {
                alert("프로필 수정에 실패했습니다.");
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/settings" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft size={24} className="text-white" />
                </Link>
                <h1 className="text-2xl font-bold text-white">프로필 수정</h1>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                    <div
                        onClick={handleAvatarClick}
                        className="relative group cursor-pointer"
                    >
                        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 p-[3px]">
                            <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                                        <User size={48} className="text-white/40" />
                                    </div>
                                )}
                                {/* Overlay for upload hint */}
                                <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    {uploading ? (
                                        <Loader2 size={32} className="text-cyan-400 animate-spin" />
                                    ) : (
                                        <Camera size={24} className="text-white" />
                                    )}
                                </div>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <p className="text-xs text-white/40 text-center mt-3 group-hover:text-cyan-400 transition-colors">
                            프로필 사진 변경
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">닉네임</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                            placeholder="닉네임을 입력하세요"
                            maxLength={20}
                        />
                        <p className="text-xs text-white/40 mt-2 text-right">{nickname.length}/20</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">이메일</label>
                        <input
                            type="text"
                            value={user?.email || ""}
                            disabled
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white/40 cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                저장 중...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                저장하기
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
