"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function GallerySection() {
    return (
        <section id="gallery" className="py-32 px-6 relative overflow-hidden">
            <div className="container mx-auto relative z-10">
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <h2 className="text-4xl font-bold mb-4">Dream Gallery</h2>
                        <p className="text-white/60">다른 사람들의 꿈을 탐험해보세요.</p>
                    </div>
                    <Link href="/gallery" className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                        View All <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { id: 1, title: "Flying Whales", color: "from-blue-500 to-cyan-500", img: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80" },
                        { id: 2, title: "Neon Forest", color: "from-purple-500 to-pink-500", img: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800&q=80" },
                        { id: 3, title: "Underwater City", color: "from-cyan-500 to-emerald-500", img: "https://images.unsplash.com/photo-1504333638930-c8787321eee0?w=800&q=80" },
                        { id: 4, title: "Desert Moon", color: "from-orange-500 to-red-500", img: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&q=80" },
                        { id: 5, title: "Cyberpunk Street", color: "from-pink-500 to-rose-500", img: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80" },
                        { id: 6, title: "Crystal Cave", color: "from-indigo-500 to-violet-500", img: "https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=800&q=80" },
                        { id: 7, title: "Cloud Castle", color: "from-sky-500 to-blue-500", img: "https://images.unsplash.com/photo-1516663713099-37eb6d60c825?w=800&q=80" },
                        { id: 8, title: "Time Travel", color: "from-amber-500 to-yellow-500", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80" },
                    ].map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer ${i === 0 || i === 7 ? 'lg:col-span-2 lg:row-span-2 aspect-square' : 'aspect-[4/5]'
                                }`}
                        >
                            <div className="absolute inset-0 bg-black/50 z-0" />
                            <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 z-10">
                                <p className="text-xs text-cyan-400 font-medium mb-1 tracking-wider uppercase">Dream #{item.id}</p>
                                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
