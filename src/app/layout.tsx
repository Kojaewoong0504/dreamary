import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Dreamary - 꿈 기록 및 AI 시각화",
    description: "당신의 꿈을 AI로 그려드립니다",
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    themeColor: "#0f172a",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
};

import Script from "next/script";
import GoogleAdSense from "@/components/ads/GoogleAdSense";

import { NotificationProvider } from "@/contexts/NotificationContext";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">

            <body className={`${inter.className} bg-black text-white antialiased`} suppressHydrationWarning>
                <GoogleAdSense pId={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ""} />
                <Script src="https://cdn.portone.io/v2/browser-sdk.js" strategy="lazyOnload" />
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </body>
        </html>
    );
}
