"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "확인",
    cancelText = "취소",
    isDangerous = false,
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-[#1A1A2E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-6">
                                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                                <p className="text-white/60 text-sm leading-relaxed mb-6">
                                    {description}
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-medium transition-colors text-sm"
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        onClick={() => {
                                            onConfirm();
                                            onClose();
                                        }}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-colors text-sm ${isDangerous
                                                ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/20"
                                                : "bg-dream-cyan/20 text-dream-cyan hover:bg-dream-cyan/30 border border-dream-cyan/20"
                                            }`}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
