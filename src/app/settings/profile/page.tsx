"use client";

import MobileLayout from "@/components/layout/MobileLayout";
import { ChevronLeft, User, Camera, Lock, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import CustomAlert from "@/components/ui/CustomAlert";

export default function ProfileSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [nickname, setNickname] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [provider, setProvider] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Alert State
    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "alert" | "confirm" | "success" | "error";
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "alert",
    });

    const showAlert = (title: string, message: string, type: "alert" | "success" | "error" = "alert") => {
        setAlertState({ isOpen: true, title, message, type });
    };

    const closeAlert = () => {
        setAlertState(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                console.log('Fetching profile...');
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    console.log('Profile Data loaded:', data.profile);
                    if (data.profile?.id) {
                        setUserId(data.profile.id);
                        setNickname(data.profile.nickname || "");
                        setSelectedAvatar(data.profile.avatar_url);
                        setProvider(data.profile.provider);
                    } else {
                        console.error('Profile data missing ID:', data);
                    }
                } else {
                    console.error('Failed to fetch profile:', res.status, res.statusText);
                    const errorData = await res.json();
                    console.error('Error details:', errorData);
                }
            } catch (e) {
                console.error('Profile fetch error:', e);
            }
        };
        fetchProfile();
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!userId) {
            console.error('User ID is missing, cannot upload');
            showAlert("오류", "사용자 정보를 불러오지 못했습니다. 페이지를 새로고침 해주세요.", "error");
            return;
        }

        if (!file) return;

        const previousAvatar = selectedAvatar;

        // 1. Immediate Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);

        // 2. Upload
        setLoading(true); // Show loading state
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);

        try {
            const res = await fetch('/api/user/upload-avatar', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await res.json();
            console.log('Upload success:', data);
            setSelectedAvatar(data.avatarUrl); // Update with server URL

            // Refetch profile to ensure consistency
            const profileRes = await fetch("/api/user/profile");
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setSelectedAvatar(profileData.profile.avatar_url);
            }

            showAlert("업로드 성공", "프로필 이미지가 변경되었습니다.", "success");
        } catch (error: any) {
            console.error('Upload Error:', error);
            showAlert("업로드 실패", error.message || "이미지 업로드 중 오류가 발생했습니다.", "error");
            setSelectedAvatar(previousAvatar); // Revert to previous avatar
        } finally {
            setLoading(false);
            // Reset input to allow selecting same file again
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSaveProfile = async () => {
        if (!userId) return;
        setLoading(true);

        try {
            const res = await fetch("/api/user/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    nickname,
                    // Avatar is already updated via upload API, but we send it just in case logic changes
                    avatarUrl: selectedAvatar
                })
            });

            if (res.ok) {
                showAlert("저장 완료", "프로필이 성공적으로 업데이트되었습니다.", "success");
            } else {
                throw new Error("Failed to update profile");
            }
        } catch (e) {
            console.error(e);
            showAlert("저장 실패", "프로필 업데이트 중 오류가 발생했습니다.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!userId) return;
        if (newPassword !== confirmPassword) {
            showAlert("오류", "새 비밀번호가 일치하지 않습니다.", "error");
            return;
        }
        if (newPassword.length < 6) {
            showAlert("오류", "비밀번호는 6자 이상이어야 합니다.", "error");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/user/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    newPassword
                })
            });

            if (res.ok) {
                showAlert("변경 완료", "비밀번호가 변경되었습니다. 다시 로그인해주세요.", "success");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                const data = await res.json();
                throw new Error(data.error || "Failed to change password");
            }
        } catch (e: any) {
            console.error(e);
            showAlert("변경 실패", e.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileLayout>
            <div className="flex flex-col min-h-screen bg-dream-dark text-white">
                <CustomAlert
                    isOpen={alertState.isOpen}
                    onClose={closeAlert}
                    title={alertState.title}
                    message={alertState.message}
                    type={alertState.type}
                />

                {/* Header */}
                <header className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-lg font-bold">프로필 설정</h1>
                    </div>
                </header>

                <div className="flex-1 p-6 overflow-y-auto pb-safe">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative w-32 h-32 mb-4 group">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/20 bg-white/5 shadow-2xl relative">
                                {loading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                        <div className="w-8 h-8 border-2 border-white/30 border-t-dream-cyan rounded-full animate-spin"></div>
                                    </div>
                                )}
                                {selectedAvatar ? (
                                    <img src={selectedAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User size={48} className="text-white/30" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-3 rounded-full bg-[#22D3EE] text-black shadow-lg hover:bg-white transition-colors z-10"
                                style={{ backgroundColor: '#22D3EE', color: '#000000' }} // Force styles
                            >
                                <Camera size={20} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        <p className="text-sm text-white/50">프로필 사진 변경</p>
                    </div>

                    {/* Basic Info Section */}
                    <div className="space-y-6 mb-10">
                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider px-1">기본 정보</h3>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">닉네임</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-dream-cyan transition-colors"
                                    placeholder="닉네임을 입력하세요"
                                />
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
                                >
                                    저장
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Password Section (Email Users Only) */}
                    {(provider === 'email' || !provider) && (
                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider px-1 flex items-center gap-2">
                                <Lock size={14} /> 비밀번호 변경
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">새 비밀번호</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-dream-cyan transition-colors"
                                        placeholder="6자 이상 입력"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">새 비밀번호 확인</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-dream-cyan transition-colors"
                                        placeholder="비밀번호를 다시 입력하세요"
                                    />
                                </div>

                                <button
                                    onClick={handleChangePassword}
                                    disabled={loading || !newPassword || !confirmPassword}
                                    className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    비밀번호 변경하기
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
}
