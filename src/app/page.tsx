"use client";

import Link from "next/link";
import HeroSection from "@/components/landing/HeroSection";
import FeatureSection from "@/components/landing/FeatureSection";
import GallerySection from "@/components/landing/GallerySection";
import Footer from "@/components/landing/Footer";

import GlobalBackground from "@/components/ui/GlobalBackground";

export default function DesktopLanding() {
    return (
        <div className="min-h-screen text-white relative selection:bg-cyan-500/30">
            <GlobalBackground />



            <main>
                <HeroSection />
                <FeatureSection />
                <GallerySection />
            </main>

            <Footer />
        </div>
    );
}
