"use client";

import { Bell } from "lucide-react";

export default function Header() {
    return (
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-14 bg-dream-dark/80 backdrop-blur-md z-50 flex items-center justify-between px-4 safe-pt border-b border-white/5">
            <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-dream-purple to-dream-cyan">
                Dreamary
            </div>
            <button className="text-dream-text/70 hover:text-dream-text transition-colors">
                <Bell size={20} />
            </button>
        </header>
    );
}
