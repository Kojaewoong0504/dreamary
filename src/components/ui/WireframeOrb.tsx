"use client";

export default function WireframeOrb() {
    return (
        <div className="relative w-64 h-64 flex items-center justify-center perspective-1000">
            {/* Core Glow (Intense Center) */}
            <div className="absolute inset-0 bg-cyan-300/40 blur-[70px] rounded-full animate-pulse-slow mix-blend-screen" />
            <div className="absolute inset-0 bg-white/20 blur-[35px] rounded-full mix-blend-overlay" />

            {/* Rotating Container (Z-Axis Spin - Wheel) */}
            <div className="relative w-full h-full preserve-3d animate-spin-slow">
                {/* Dense Rings (Spirograph Pattern with Hole) */}
                {[...Array(48)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute inset-0 rounded-full border-[1px] border-transparent"
                        style={{
                            // rotateZ distributes around the center clock-face
                            // rotateY(65deg) tilts them to open the "hole" (torus shape)
                            transform: `rotateZ(${i * 3.75}deg) rotateY(65deg)`,
                            // Sharper, brighter gradient
                            background: `linear-gradient(${i * 10}deg, rgba(34, 211, 238, 0.9) 0%, rgba(168, 85, 247, 0.6) 50%, rgba(34, 211, 238, 0.9) 100%)`,
                            backgroundClip: 'border-box',
                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'xor',
                            maskComposite: 'exclude',
                            boxShadow: "0 0 4px rgba(34, 211, 238, 0.4)", // Stronger glow for sharpness
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
