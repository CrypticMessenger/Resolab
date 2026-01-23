import React from 'react';
import { EditorState } from '@/types/spaudio';
import { Play, Pause, Upload, Wand2, StopCircle, Volume2, Move3d, Sparkles } from 'lucide-react';

interface SourceEditorProps {
    activeSourceId: string | null;
    editorState: EditorState;
    onUpdate: (updates: Partial<EditorState>) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTogglePlay: () => void;
    onStopMotion: () => void;
    onAiGenerate: () => void;
    promptInput: string;
    setPromptInput: (val: string) => void;
    aiStatus: string;
    onOpenLibrary: () => void;
}

export default function SourceEditor({
    activeSourceId,
    editorState,
    onUpdate,
    onFileUpload,
    onTogglePlay,
    onStopMotion,
    onAiGenerate,
    promptInput,
    setPromptInput,
    aiStatus,
    onOpenLibrary
}: SourceEditorProps) {
    if (!activeSourceId) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 space-y-4 opacity-50">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-white/5">
                    <Move3d size={32} strokeWidth={1.5} />
                </div>
                <p className="text-xs font-medium">Select a source to edit properties</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-4">
            {/* Header / Name */}
            <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Source Name</label>
                <input
                    type="text"
                    value={editorState.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-gray-400"
                    placeholder="Enter name..."
                />
            </div>

            {/* Audio Control */}
            <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Audio Control</label>
                <div className="flex gap-2">
                    <button
                        onClick={onOpenLibrary}
                        className="flex-1 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-center py-2.5 rounded-xl text-xs cursor-pointer transition-all border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Upload size={14} />
                        <span>Manage Audio</span>
                    </button>
                    <button
                        onClick={onTogglePlay}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 shadow-sm
                            ${editorState.isPlaying
                                ? 'bg-indigo-500 text-white border-indigo-600 hover:bg-indigo-600'
                                : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'}
                        `}
                    >
                        {editorState.isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                        {editorState.isPlaying ? 'Pause' : 'Play'}
                    </button>
                </div>

                <div className="space-y-2 bg-white dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                    <div className="flex justify-between text-[10px] text-gray-500 items-center">
                        <div className="flex items-center gap-1.5">
                            <Volume2 size={12} />
                            <span>Volume</span>
                        </div>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{Math.round(editorState.vol)}%</span>
                    </div>
                    <input
                        type="range" min="0" max="200"
                        value={editorState.vol}
                        onChange={(e) => onUpdate({ vol: Number(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>
            </div>

            {/* Position Control */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Position</label>
                    <button
                        onClick={onStopMotion}
                        className="text-[10px] text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-500/10 px-2 py-1 rounded-md transition-colors"
                    >
                        <StopCircle size={10} /> Stop Motion
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-2 bg-white dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                    {['x', 'y', 'z'].map((axis) => (
                        <div key={axis} className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold uppercase w-4 flex items-center justify-center h-4 rounded ${axis === 'x' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' :
                                axis === 'y' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' :
                                    'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                }`}>{axis}</span>
                            <input
                                type="range" min="-20" max="20" step="0.1"
                                value={(editorState as any)[axis]}
                                onChange={(e) => onUpdate({ [axis]: Number(e.target.value) })}
                                className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-gray-500 dark:accent-gray-400"
                            />
                            <span className="text-[10px] font-mono text-gray-600 dark:text-gray-400 w-8 text-right">{(editorState as any)[axis].toFixed(1)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Movement Automation */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Movement Automation</label>
                </div>

                <select
                    value={editorState.automationType || 'none'}
                    onChange={(e) => onUpdate({ automationType: e.target.value as any })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
                >
                    <option value="none">Manual (No Automation)</option>
                    <option value="orbit">Orbit (Circle)</option>
                    <option value="linear">Linear (Point to Point)</option>
                    <option value="pulse">Pulse (Oscillate)</option>
                </select>

                {editorState.automationType === 'orbit' && (
                    <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
                        <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 font-bold uppercase">Radius</label>
                            <input
                                type="number" step="0.5"
                                value={editorState.automationParams?.radius || 5}
                                onChange={(e) => onUpdate({ automationParams: { ...editorState.automationParams, radius: Number(e.target.value) } })}
                                className="w-full bg-gray-200 dark:bg-white/10 rounded px-2 py-1 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 font-bold uppercase">Speed</label>
                            <input
                                type="number" step="0.1"
                                value={editorState.automationParams?.speed || 1}
                                onChange={(e) => onUpdate({ automationParams: { ...editorState.automationParams, speed: Number(e.target.value) } })}
                                className="w-full bg-gray-200 dark:bg-white/10 rounded px-2 py-1 text-xs"
                            />
                        </div>
                    </div>
                )}

                {editorState.automationType === 'linear' && (
                    <div className="space-y-2 p-2 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
                        <p className="text-[10px] text-indigo-500 flex gap-2 items-center">
                            <Move3d size={10} />
                            Drag the Ghost Sphere to set target
                        </p>
                        <div className="grid grid-cols-1 gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-xl border border-gray-200 dark:border-white/5">
                            {['x', 'y', 'z'].map((axis) => (
                                <div key={axis} className="flex items-center gap-2">
                                    <span className={`text-[9px] font-bold uppercase w-3 flex items-center justify-center h-3 rounded ${axis === 'x' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' :
                                        axis === 'y' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' :
                                            'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                        }`}>{axis}</span>
                                    <input
                                        type="number" step="0.1"
                                        value={(editorState.automationParams?.targetPos as any)?.[axis] ?? 0}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            const current = editorState.automationParams?.targetPos || { x: 0, y: 0, z: 0 };
                                            const newPos = { ...current, [axis]: val };
                                            onUpdate({ automationParams: { ...editorState.automationParams, targetPos: newPos } });
                                        }}
                                        className="flex-1 bg-gray-200 dark:bg-white/10 rounded px-2 py-1 text-xs"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="text-[9px] text-gray-400">
                            Duration: <span className="text-gray-600 dark:text-gray-300 font-bold">{editorState.timelineDuration || 5}s</span> (Set in timeline)
                        </div>
                    </div>
                )}

                {editorState.automationType === 'pulse' && (
                    <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
                        <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 font-bold uppercase">Freq</label>
                            <input
                                type="number" step="0.1"
                                value={editorState.automationParams?.frequency || 1}
                                onChange={(e) => onUpdate({ automationParams: { ...editorState.automationParams, frequency: Number(e.target.value) } })}
                                className="w-full bg-gray-200 dark:bg-white/10 rounded px-2 py-1 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 font-bold uppercase">Amp</label>
                            <input
                                type="number" step="0.1"
                                value={editorState.automationParams?.amplitude || 2}
                                onChange={(e) => onUpdate({ automationParams: { ...editorState.automationParams, amplitude: Number(e.target.value) } })}
                                className="w-full bg-gray-200 dark:bg-white/10 rounded px-2 py-1 text-xs"
                            />
                        </div>
                    </div>
                )}
            </div>


        </div>
    );
}
