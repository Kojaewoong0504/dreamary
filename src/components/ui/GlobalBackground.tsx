"use client";

export default function GlobalBackground() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
            {/* Vibrant Nebula Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/30 rounded-full blur-[100px] animate-pulse-slow mix-blend-screen" />
            <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse-slow delay-1000 mix-blend-screen" />
            <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-blue-600/20 rounded-full blur-[150px] animate-pulse-slow delay-2000 mix-blend-screen" />

            {/* Center Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-indigo-900/10 rounded-full blur-[200px]" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

            {/* Noise Texture (Optional for more texture) */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}
