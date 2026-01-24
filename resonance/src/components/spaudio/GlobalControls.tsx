
import React from 'react';
import { Mic, Save, FolderOpen, Waves, Download } from 'lucide-react';

interface GlobalControlsProps {
    isRecording: boolean;
    isPro: boolean;
    onToggleRecording: () => void;
    onSave: () => any;
    onLoad: (data: any) => void;
    onReverbChange: (val: number) => void;

    // AI Director Props
    onAiGenerate: () => void;
    promptInput: string;
    setPromptInput: (val: string) => void;
    aiStatus: string;
}

import { Sparkles } from 'lucide-react';

export default function GlobalControls({
    isRecording,
    isPro,
    onToggleRecording,
    onSave,
    onLoad,
    onReverbChange,
    onAiGenerate,
    promptInput,
    setPromptInput,
    aiStatus
}: GlobalControlsProps) {
    const [reverbLevel, setReverbLevel] = React.useState(10); // Default to 10%

    const handleReverbChange = (val: number) => {
        setReverbLevel(val);
        onReverbChange(val);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Environment</label>
                {/* Reverb Control */}
                <div className="space-y-2 bg-white dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                    <div className="flex justify-between text-[10px] text-gray-500 items-center">
                        <div className="flex items-center gap-1.5">
                            <Waves size={12} />
                            <span>Reverb</span>
                        </div>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{reverbLevel}%</span>
                    </div>
                    <input
                        type="range" min="0" max="100"
                        value={reverbLevel}
                        onChange={(e) => handleReverbChange(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>
            </div>

            {/* AI Director */}
            <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Sparkles size={14} />
                    <span className="text-xs font-bold">AI Director</span>
                </div>
                <div className="space-y-2">
                    <textarea
                        rows={3}
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        className="w-full bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-3 text-xs text-gray-900 dark:text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all placeholder:text-indigo-300 dark:placeholder:text-indigo-500/50"
                        placeholder="Describe the entire scene..."
                    />
                    <button
                        onClick={onAiGenerate}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                    >
                        Generate Scene
                    </button>
                </div>
                {aiStatus && <div className="text-[10px] text-center text-indigo-400 h-4 font-medium animate-pulse">{aiStatus}</div>}
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Actions</label>

                {/* Export Button */}
                <button
                    onClick={onToggleRecording}
                    className={`
                        w-full py-3 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden shadow-sm
                        ${isRecording
                            ? 'bg-indigo-500 text-white border-indigo-600 shadow-indigo-500/30 animate-pulse'
                            : 'bg-white dark:bg-white/5 text-indigo-600 dark:text-indigo-400 border-gray-200 dark:border-white/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-900/30'
                        }
                    `}
                >
                    {isRecording ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={14} />}
                    <span>{isRecording ? "Rendering..." : "Export Audio"}</span>
                </button>

                {/* Project Management */}
                <div className="grid grid-cols-1 gap-2">
                    <button
                        onClick={onSave}
                        className="bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Save size={14} />
                        Save Project
                    </button>
                </div>
            </div>
        </div>
    );
}
