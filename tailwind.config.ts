import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                dream: {
                    bg: "#050505", // Deep Matte Black
                    card: "rgba(255, 255, 255, 0.03)", // Very subtle glass
                    border: "rgba(255, 255, 255, 0.08)",
                    text: {
                        primary: "#FFFFFF",
                        secondary: "rgba(255, 255, 255, 0.6)",
                        muted: "rgba(255, 255, 255, 0.4)",
                    },
                    accent: {
                        violet: "#4F46E5", // Shifted to Indigo (less purple)
                        blue: "#0EA5E9",   // Sky Blue for highlights
                        glow: "rgba(14, 165, 233, 0.3)", // Cyan glow
                    },
                    cyan: "#22D3EE", // Added for profile elements
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'subtle-glow': 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.15) 0%, transparent 70%)', // Blue/Cyan glow
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 8s linear infinite',
                'gradient-x': 'gradient-x 3s ease infinite',
            },
            keyframes: {
                'gradient-x': {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center',
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center',
                    },
                },
            },
        },
    },
    plugins: [],
};
export default config;
