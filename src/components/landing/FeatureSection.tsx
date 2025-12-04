"use client";

import { motion } from "framer-motion";
import { Mic, Image as ImageIcon, Sparkles, ScrollText } from "lucide-react";

const features = [
    {
        id: "record",
        title: "Record",
        subtitle: "기억이 사라지기 전에",
        description: "음성이나 텍스트로 꿈을 기록하세요. 생생한 기억을 놓치지 않도록 도와드립니다.",
        icon: Mic,
        color: "from-blue-400 to-cyan-400",
        align: "left"
    },
    {
        id: "visualize",
        title: "Visualize",
        subtitle: "텍스트가 예술이 되는 순간",
        description: "AI가 당신의 꿈을 분석하여 고화질의 이미지로 시각화합니다. 꿈속의 장면을 현실로 가져오세요.",
        icon: Sparkles,
        color: "from-purple-400 to-pink-400",
        align: "right"
    },
    {
        id: "interpret",
        title: "Interpretation",
        subtitle: "꿈의 의미를 찾아서",
        description: "AI가 당신의 꿈을 분석하여 숨겨진 의미와 상징을 풀이해드립니다. 무의식의 메시지를 확인하세요.",
        icon: ScrollText,
        color: "from-amber-400 to-orange-400",
        align: "left"
    }
];

export default function FeatureSection() {
    return (
        <section id="intro" className="py-20 px-6 relative overflow-hidden">
            <div className="container mx-auto space-y-24 relative z-10">
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className={`flex flex-col lg:flex-row gap-12 items-center ${feature.align === 'right' ? 'lg:flex-row-reverse' : ''}`}
                    >
                        {/* Text Content */}
                        <div className="flex-1 space-y-6">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20`}>
                                <feature.icon className="text-white" size={32} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold">{feature.title}</h2>
                            <h3 className="text-2xl text-white/80 font-light">{feature.subtitle}</h3>
                            <p className="text-lg text-white/50 leading-relaxed max-w-md">
                                {feature.description}
                            </p>
                        </div>

                        {/* Visual Content (CSS Enhanced) */}
                        <div className="flex-1 w-full">
                            <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm group hover:border-white/20 transition-colors">
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />

                                {/* Placeholder Content based on feature */}
                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                    {feature.id === 'record' && (
                                        <div className="w-full max-w-sm bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-xs text-white/60 font-mono">REC 00:42</span>
                                                </div>
                                                <span className="text-xs text-white/40">Today, 7:30 AM</span>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-white mb-1">하늘을 나는 고래</h4>
                                                <p className="text-sm text-white/60 leading-relaxed">
                                                    거대한 핑크색 고래가 구름 사이를 헤엄치고 있었다. 나는 그 등 위에 타고...
                                                </p>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <span className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-cyan-400 border border-cyan-500/20">#고래</span>
                                                <span className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-purple-400 border border-purple-500/20">#비행</span>
                                            </div>
                                        </div>
                                    )}
                                    {feature.id === 'visualize' && (
                                        <div className="w-full h-full flex flex-col relative group">
                                            {/* Generated Image Background */}
                                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2994&auto=format&fit=crop')] bg-cover bg-center rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                                            {/* Prompt UI */}
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <div className="bg-black/80 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-lg">
                                                    <p className="text-xs text-cyan-400 font-mono mb-2">Generating...</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                                            <Sparkles size={16} className="text-white" />
                                                        </div>
                                                        <p className="text-sm text-white/90 truncate">
                                                            "A giant pink whale swimming through clouds..."
                                                        </p>
                                                    </div>
                                                    <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 w-[70%] animate-pulse" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {feature.id === 'interpret' && (
                                        <div className="relative w-full max-w-sm bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                    <ScrollText size={20} className="text-amber-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white">AI 꿈 해몽</h4>
                                                    <p className="text-xs text-white/40">Dream Interpretation</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                                    <p className="text-sm text-white/80 leading-relaxed">
                                                        <span className="text-amber-400 font-bold">"고래"</span>는 자유와 거대한 잠재력을 상징합니다. 구름 위를 나는 것은 현재의 제약에서 벗어나고 싶은 욕망을 나타냅니다.
                                                    </p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                                    <p className="text-sm text-white/80 leading-relaxed">
                                                        당신은 곧 <span className="text-purple-400 font-bold">새로운 기회</span>를 맞이하게 될 것입니다.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-500 w-[85%]" />
                                                </div>
                                                <span className="text-xs text-amber-400 font-bold">길몽 85%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
