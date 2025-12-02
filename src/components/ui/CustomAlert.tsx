"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, X } from "lucide-react";

interface CustomAlertProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: "alert" | "confirm" | "success" | "error";
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export default function CustomAlert({
    isOpen,
    onClose,
    title,
    message,
    type = "alert",
    onConfirm,
    onCancel,
    confirmText = "확인",
    cancelText = "취소",
}: CustomAlertProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-[#1a1a2e]/90 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md overflow-hidden"
                    >
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-dream-purple/20 rounded-full blur-[50px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-dream-cyan/10 rounded-full blur-[40px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${type === 'error' ? 'bg-red-500/20 text-red-400' :
                                type === 'success' ? 'bg-green-500/20 text-green-400' :
                                    'bg-dream-cyan/20 text-dream-cyan'
                                }`}>
                                {type === 'error' ? <AlertCircle size={24} /> :
                                    type === 'success' ? <CheckCircle size={24} /> :
                                        <AlertCircle size={24} />}
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                            <p className="text-sm text-white/70 leading-relaxed mb-6 whitespace-pre-wrap">
                                {message}
                            </p>

                            <div className="flex gap-3 w-full">
                                {type === "confirm" && (
                                    <button
                                        onClick={() => {
                                            if (onCancel) onCancel();
                                            onClose();
                                        }}
                                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors"
                                    >
                                        {cancelText}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (onConfirm) onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-1 py-3 rounded-xl text-black text-sm font-bold transition-transform active:scale-95 ${type === 'error' ? 'bg-red-400 hover:bg-red-300' :
                                        type === 'success' ? 'bg-green-400 hover:bg-green-300' :
                                            'bg-dream-cyan hover:bg-dream-cyan/90'
                                        }`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
