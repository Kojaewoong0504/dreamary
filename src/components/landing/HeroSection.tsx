"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import WireframeOrb from "@/components/ui/WireframeOrb";
import QRCode from "react-qr-code";
import LandingHeader from "./LandingHeader";

export default function HeroSection() {
    // In a real scenario, this would be the actual app URL or store link.
    // For this PWA, we point to the current domain so users can open it on mobile.
    const [mounted, setMounted] = useState(false);
    const [appUrl, setAppUrl] = useState('https://dreamary.app');

    useEffect(() => {
        setMounted(true);
        setAppUrl(window.location.origin);
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-20">
            <LandingHeader />

            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight mb-6">
                        Your Dream,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
                            Drawn by AI
                        </span>
                    </h1>
                    <p className="text-xl text-white/60 mb-10 max-w-lg leading-relaxed">
                        무의식의 세계를 시각화하고 기록하세요.<br />
                        Dreamary는 당신의 꿈을 예술로 만들어줍니다.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                        {/* QR Code Block */}
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="bg-white p-2 rounded-lg">
                                <div className="w-[48px] h-[48px]">
                                    {mounted && (
                                        <QRCode
                                            value={appUrl}
                                            size={48}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1 group-hover:text-cyan-400 transition-colors">Mobile App</p>
                                <p className="text-sm font-medium text-white">Scan to Start</p>
                            </div>
                        </div>

                        <div className="h-12 w-[1px] bg-white/10 hidden sm:block" />

                        {/* Web CTA */}
                        <Link
                            href="/login"
                            className="group flex items-center gap-3 text-lg font-medium text-white hover:text-cyan-400 transition-colors"
                        >
                            웹에서 시작하기
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>

                {/* Right Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative flex justify-center"
                >
                    <div className="relative w-[500px] h-[500px]">
                        {/* Abstract Orb / Visual */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 rounded-full blur-[60px] animate-spin-slow" />
                        <div className="absolute inset-10 bg-black/80 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
                            <WireframeOrb />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
