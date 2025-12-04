"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingHeader() {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6"
        >
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500" />
                <span className="text-xl font-bold tracking-tight text-white">Dreamary</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
                <Link href="#intro" className="text-sm text-white/60 hover:text-white transition-colors">
                    소개
                </Link>
                <Link href="#gallery" className="text-sm text-white/60 hover:text-white transition-colors">
                    갤러리
                </Link>
                <Link href="/desktop/login" className="text-sm px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/5">
                    로그인
                </Link>
            </nav>
        </motion.header>
    );
}
