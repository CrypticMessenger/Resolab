'use client';

import React from 'react';
import AuthButton from './auth/AuthButton';
import SpotlightCard from './SpotlightCard';
import BlurText from './BlurText';
import { Zap, Headphones, Wand2, Radio, Users, Cloud, Mic, Music, Gamepad2, Moon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function LandingPage() {
    const supabase = createClient();

    const handleLogin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            window.location.href = '/dashboard';
            return;
        }

        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-green-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                                <span className="text-white font-bold text-xs">KY</span>
                            </div>
                            <span className="font-bold text-lg tracking-tight">KYMATIC</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#features" className="text-sm text-gray-400 hover:text-white transition">Features</a>
                        <a href="#showcase" className="text-sm text-gray-400 hover:text-white transition">Showcase</a>
                        <AuthButton />
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-green-500/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-green-400">v2.0 Now Available</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                        Spatial Audio <br />
                        <BlurText
                            text="Reimagined"
                            delay={150}
                            animateBy="words"
                            direction="top"
                            className="text-white justify-center"
                        />
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Create immersive 3D soundscapes directly in your browser.
                        No installation required. Professional grade tools at your fingertips.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={handleLogin}
                            className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition hover:scale-105 active:scale-95"
                        >
                            Start Creating for Free
                        </button>
                        <button className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold hover:bg-white/10 transition">
                            View Demo
                        </button>
                    </div>
                </div>

                {/* Abstract UI Mockup */}
                <div className="mt-20 max-w-6xl mx-auto relative">
                    <div className="aspect-video rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-green-900/20">
                        <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-blue-500/10" />
                        <div className="grid grid-cols-12 h-full">
                            <div className="col-span-2 border-r border-white/10 p-4">
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-10 p-8 flex items-center justify-center">
                                <div className="w-32 h-32 rounded-full border border-green-500/30 flex items-center justify-center relative">
                                    <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                                    <div className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,1)]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Showcase / Use Cases Section */}
            <section id="showcase" className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Create Worlds with Sound
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            From immersive storytelling to next-gen game audio, discover what's possible with Kymatic.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-900/20 to-black border border-white/10 hover:border-purple-500/30 transition group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition duration-500" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                                    <Mic size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Immersive Storytelling</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Transform traditional podcasts and audiobooks into 3D experiences. Place characters in specific locations, move sound effects around the listener, and create a true sense of presence.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-900/20 to-black border border-white/10 hover:border-blue-500/30 transition group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition duration-500" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
                                    <Moon size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Wellness & Soundscapes</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Design wrapping environments for meditation and sleep. Layer rain above, ocean waves below, and wind circling around to build deeply relaxing spatial atmospheres.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 rounded-3xl bg-gradient-to-br from-green-900/20 to-black border border-white/10 hover:border-green-500/30 transition group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/20 transition duration-500" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6 text-green-400">
                                    <Gamepad2 size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Game Audio Prototyping</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Rapidly prototype 3D sound for games and VR. Test how assets sound in a spatial environment before implementing them in engines like Unity or Unreal.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 rounded-3xl bg-gradient-to-br from-pink-900/20 to-black border border-white/10 hover:border-pink-500/30 transition group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-pink-500/20 transition duration-500" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6 text-pink-400">
                                    <Music size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Spatial Music</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Break free from stereo. Arrange instruments in 360-degree space to create wide, enveloping mixes that surround the listener.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Features Grid */}
            < section id="features" className="py-24 px-6 bg-white/5" >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Professional Features
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Industry-leading tools designed for creators, sound engineers, and immersive audio professionals
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Real-time 3D Rendering",
                                desc: "Experience zero-latency spatial audio processing with our advanced WebGL-powered 3D visualization engine. Watch sound sources move in real-time as you position them, with instant visual feedback and HRTF (Head-Related Transfer Function) processing for authentic binaural rendering.",
                                icon: Zap,
                                color: "text-yellow-400",
                                spotlightColor: "rgba(250, 204, 21, 0.15)"
                            },
                            {
                                title: "Professional Export",
                                desc: "Export your spatial audio projects in multiple high-fidelity formats including WAV (up to 32-bit/192kHz), WebM, and industry-standard ambisonic formats (FOA/HOA). Perfect for film, VR/AR experiences, podcasts, and immersive installations.",
                                icon: Headphones,
                                color: "text-blue-400",
                                spotlightColor: "rgba(59, 130, 246, 0.15)"
                            },
                            {
                                title: "AI-Powered Director",
                                desc: "Let our advanced AI analyze your audio content and intelligently suggest optimal spatial arrangements. The AI Director considers psychoacoustic principles, content type, and listener engagement to create compelling 3D soundscapes automatically.",
                                icon: Wand2,
                                color: "text-purple-400",
                                spotlightColor: "rgba(168, 85, 247, 0.15)"
                            },
                            {
                                title: "Live Streaming Support",
                                desc: "Stream your spatial audio creations live with ultra-low latency. Perfect for virtual concerts, immersive podcasts, and live performances. Includes real-time monitoring, audience analytics, and adaptive bitrate streaming for seamless delivery.",
                                icon: Radio,
                                color: "text-red-400",
                                spotlightColor: "rgba(239, 68, 68, 0.15)"
                            },
                            {
                                title: "Collaborative Workspace",
                                desc: "Work together in real-time with your team from anywhere in the world. Share projects, iterate on spatial arrangements, and communicate via integrated voice chat. Track changes with version history and role-based permissions for precise workflow control.",
                                icon: Users,
                                color: "text-green-400",
                                spotlightColor: "rgba(34, 197, 94, 0.15)"
                            },
                            {
                                title: "Cloud Project Library",
                                desc: "Access your projects from any device with automatic cloud sync and backup. Store unlimited audio files with intelligent compression, organize with tags and collections, and instantly restore previous versions. Your creative work, always safe and accessible.",
                                icon: Cloud,
                                color: "text-cyan-400",
                                spotlightColor: "rgba(6, 182, 212, 0.15)"
                            }
                        ].map((f, i) => (
                            <SpotlightCard
                                key={i}
                                className="p-8 rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-all duration-300 group"
                                spotlightColor={f.spotlightColor}
                            >
                                <div className={`w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 ${f.color} group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300`}>
                                    <f.icon size={28} strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">
                                    {f.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed text-sm">
                                    {f.desc}
                                </p>
                            </SpotlightCard>
                        ))}
                    </div>
                </div>
            </section >



            {/* Footer */}
            < footer className="py-12 px-6 border-t border-white/5 bg-black" >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-[10px]">KY</span>
                            </div>
                            <span className="font-bold tracking-tight text-gray-400">KYMATIC</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 text-sm text-gray-500">
                        <a href="#" className="hover:text-white transition">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition">Terms of Service</a>
                        <a href="#" className="hover:text-white transition">Contact</a>
                    </div>

                    <div className="text-sm text-gray-600">
                        © 2025 Kymatic Inc.
                    </div>
                </div>
            </footer >
        </div >
    );
}


