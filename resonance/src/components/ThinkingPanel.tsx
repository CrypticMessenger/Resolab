
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BrainCircuit, Sparkles, Terminal } from 'lucide-react';

interface ThinkingStep {
    id: string;
    text: string;
    type: 'analysis' | 'decision' | 'action';
    timestamp: number;
}

interface ThinkingPanelProps {
    isVisible: boolean;
    steps: ThinkingStep[];
    isThinking: boolean;
    onClose: () => void;
}

import { X, Minus, Maximize2 } from 'lucide-react';

export default function ThinkingPanel({ isVisible, steps, isThinking, onClose }: ThinkingPanelProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isMinimized, setIsMinimized] = useState(false);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [steps]);

    // Auto-maximize on new thinking start
    useEffect(() => {
        if (isThinking) setIsMinimized(false);
    }, [isThinking]);


    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={`absolute ${isMinimized ? 'bottom-24 right-4 w-[300px]' : 'bottom-32 left-1/2 -translate-x-1/2 w-[600px]'} bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-[100] transition-all duration-300 pointer-events-auto`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setIsMinimized(!isMinimized)}
                >
                    <div className={`relative flex items-center justify-center w-6 h-6 rounded-full ${isThinking ? 'bg-orange-500/20' : 'bg-gray-500/20'}`}>
                        <BrainCircuit size={14} className={isThinking ? 'text-orange-500 animate-pulse' : 'text-gray-400'} />
                        {isThinking && (
                            <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                        )}
                    </div>
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-widest select-none">
                        {isThinking ? 'Gemini 3 Pro Processing...' : isMinimized ? 'AI COMPLETED' : 'Thinking Complete'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        {isMinimized ? <Maximize2 size={14} /> : <Minus size={14} />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="p-1 hover:bg-red-500/20 rounded-full text-gray-400 hover:text-red-400 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Content Stream */}
            {!isMinimized && (
                <div
                    ref={scrollRef}
                    className="max-h-[300px] overflow-y-auto p-4 space-y-3 font-mono text-sm scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                >
                    {steps.length === 0 && isThinking && (
                        <div className="text-gray-500 italic animate-pulse">Initializing context...</div>
                    )}

                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className="flex items-start gap-3"
                        >
                            <div className="mt-1 shrink-0">
                                {step.type === 'analysis' && <Activity size={12} className="text-blue-400" />}
                                {step.type === 'decision' && <BrainCircuit size={12} className="text-purple-400" />}
                                {step.type === 'action' && <Terminal size={12} className="text-green-400" />}
                            </div>
                            <div className="flex-1">
                                <span className={`block ${step.type === 'analysis' ? 'text-blue-200/80' :
                                    step.type === 'decision' ? 'text-purple-200/80' :
                                        'text-green-200/80'
                                    }`}>
                                    {step.text}
                                </span>
                                <span className="text-[10px] text-gray-600">
                                    {new Date(step.timestamp).toLocaleTimeString([], { hour12: false, second: '2-digit', fractionalSecondDigits: 3 })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {isThinking && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className="w-1 h-4 bg-orange-500/50 animate-pulse" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
