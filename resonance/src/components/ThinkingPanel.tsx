
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

const WITTY_QUOTES = [
    // Tech Humor
    "Spinning up the hamster wheels...",
    "Reticulating splines...",
    "Convincing the server to cooperate...",
    "Downloading more RAM...",
    "Reversing the polarity of the neutron flow...",
    "Debugging the fabric of reality...",
    "Feeding the algorithms...",
    "Searching for the 'Any' key...",
    "Translating binary to English...",
    "Unpacking the emotional baggage of this query...",

    // Humanizing
    "Sipping digital coffee...",
    "Pretending to look busy...",
    "Googling the answer just like you would...",
    "Consulting with my lawyer...",
    "Trying to remember where I put that file...",
    "Staring blankly into the void...",
    "Doing complex math on my fingers...",
    "Asking the other AIs for help...",
    "Just a moment, I'm thinking really hard...",

    // Absurdist
    "Consulting the tea leaves...",
    "Gazing into the crystal ball...",
    "Summoning the spirits of knowledge...",
    "Aligning the chakras...",
    "Counting backwards from infinity...",
    "Asking a magic 8-ball...",
    "Channeling cosmic energy...",
    "Reading the stars...",

    // Sci-Fi
    "Opening the pod bay doors...",
    "Calculating the answer to life, the universe, and everything...",
    "Loading the Matrix...",
    "Initiating warp drive...",
    "Wait, I’m afraid I can’t do that... just kidding.",
    "Assembling the Avengers...",
    "Waiting for the TARDIS to materialize...",
    "Charging the flux capacitor...",

    // Developer & Coding
    "Git pushing to production on Friday...",
    "Console.logging the universe...",
    "Ignoring linter errors...",
    "Compiling spaghetti code...",
    "Looking for the missing semicolon...",
    "Checking Stack Overflow...",
    "Converting caffeine to code...",
    "Testing on production (just kidding)...",

    // AI & Future
    "Training on cat videos...",
    "Hallucinating politely...",
    "Optimizing neural pathways...",
    "Simulating free will...",
    "Syncing with the mothership...",
    "Asking the rubber duck...",
    "Generating witty loading text...",

    // Miscellaneous
    "Buffering reality...",
    "Defragmenting the cloud...",
    "Rebooting the universe...",
    "Calculating the last digit of Pi...",
    "Reading the manual...",
    "Updating the progress bar..."
];

export default function ThinkingPanel({ isVisible, steps, isThinking, onClose }: ThinkingPanelProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isMinimized, setIsMinimized] = useState(false);

    // Witty Quotes Logic
    const [statusText, setStatusText] = useState("Gemini 3 Pro Processing...");

    useEffect(() => {
        if (!isThinking) {
            setStatusText("AI COMPLETED");
            return;
        }

        let interval: NodeJS.Timeout;
        if (isThinking) {
            // Pick random initial
            setStatusText(WITTY_QUOTES[Math.floor(Math.random() * WITTY_QUOTES.length)]);

            interval = setInterval(() => {
                const randomQuote = WITTY_QUOTES[Math.floor(Math.random() * WITTY_QUOTES.length)];
                setStatusText(randomQuote);
            }, 3000); // Change every 3 seconds
        }

        return () => clearInterval(interval);
    }, [isThinking]);

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
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={statusText}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-xs font-mono text-gray-400 uppercase tracking-widest select-none min-w-[200px]"
                        >
                            {statusText}
                        </motion.span>
                    </AnimatePresence>
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
