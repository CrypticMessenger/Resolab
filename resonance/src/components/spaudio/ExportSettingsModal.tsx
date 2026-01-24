import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, MonitorSpeaker, FileAudio } from 'lucide-react';

interface ExportSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (settings: { sampleRate: number; bitDepth: 16 | 24 | 32 }) => void;
}

export default function ExportSettingsModal({ isOpen, onClose, onExport }: ExportSettingsModalProps) {
    const [sampleRate, setSampleRate] = useState<number>(44100);
    const [bitDepth, setBitDepth] = useState<16 | 24 | 32>(16);

    const handleExport = () => {
        onExport({ sampleRate, bitDepth });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
                >
                    <div className="p-5 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Download size={20} className="text-indigo-500" />
                            Export Audio
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Sample Rate */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <MonitorSpeaker size={16} />
                                Sample Rate
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[44100, 48000, 88200, 96000].map((rate) => (
                                    <button
                                        key={rate}
                                        onClick={() => setSampleRate(rate)}
                                        className={`
                                            px-4 py-3 rounded-lg text-sm font-medium border transition-all relative overflow-hidden
                                            ${sampleRate === rate
                                                ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/25'
                                                : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-indigo-500/50'
                                            }
                                        `}
                                    >
                                        {(rate / 1000).toFixed(1)} kHz
                                        {sampleRate === rate && (
                                            <motion.div
                                                layoutId="selected-sr"
                                                className="absolute inset-0 bg-white/20"
                                                initial={false}
                                                transition={{ duration: 0.2 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bit Depth */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <FileAudio size={16} />
                                Bit Depth
                            </label>
                            <div className="space-y-2">
                                {([16, 24, 32] as const).map((depth) => (
                                    <button
                                        key={depth}
                                        onClick={() => setBitDepth(depth)}
                                        className={`
                                            w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium border transition-all
                                            ${bitDepth === depth
                                                ? 'bg-indigo-500 text-white border-indigo-500 shadow-md transform scale-[1.02]'
                                                : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
                                            }
                                        `}
                                    >
                                        <span>{depth}-bit {depth === 32 ? 'Float' : 'PCM'}</span>
                                        {depth === 32 && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">DAW Standard</span>}
                                        {depth === 16 && <span className="text-[10px] opacity-60">CD Quality</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-t border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            className="px-6 py-2 text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                        >
                            Export Audio
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
