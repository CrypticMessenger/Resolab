import React from 'react';
import { SourceData } from '@/types/spaudio';
import { Activity, Music, Mic, Trash2, AlertTriangle } from 'lucide-react';

interface SourceListProps {
    sources: SourceData[];
    activeSourceId: string | null;
    onSelectSource: (id: string) => void;
    onDeleteSource: (id: string) => void;
}

export default function SourceList({ sources, activeSourceId, onSelectSource, onDeleteSource }: SourceListProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Active Sources</span>
                <span className="text-[10px] font-mono text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md">{sources.length}</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {sources.length === 0 && (
                    <div className="text-center py-12 text-gray-400 dark:text-gray-600 text-xs italic border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-gray-50/50 dark:bg-white/5">
                        <p>No sources added yet.</p>
                        <p className="text-[10px] mt-1 opacity-70">Click "+ Add New Source" to begin</p>
                    </div>
                )}
                {sources.map(s => (
                    <div
                        key={s.id}
                        onClick={() => onSelectSource(s.id)}
                        className={`
                            group relative p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all duration-200
                            ${s.id === activeSourceId
                                ? 'bg-white dark:bg-white/10 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                                : 'bg-white/50 dark:bg-white/5 border-transparent hover:bg-white dark:hover:bg-white/10 hover:border-gray-200 dark:hover:border-white/10 hover:shadow-sm'}
                        `}
                    >
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                            <div className="relative">
                                <div
                                    className={`w-3 h-3 rounded-full shadow-sm transition-transform duration-300 ${s.id === activeSourceId ? 'scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-indigo-500' : 'group-hover:scale-110'}`}
                                    style={{ backgroundColor: s.color }}
                                />
                                {s.isPlaying && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col min-w-0">
                                <span className={`text-xs font-bold truncate transition-colors ${s.id === activeSourceId ? 'text-indigo-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {s.name}
                                </span>
                                <div className="flex items-center gap-1.5 text-[9px] text-gray-500 dark:text-gray-500">
                                    {s.error ? (
                                        <span className="flex items-center gap-1 text-red-500 font-bold">
                                            <AlertTriangle size={8} />
                                            FILE MISSING
                                        </span>
                                    ) : (
                                        <>
                                            {s.sourceType === 'file' && <Music size={8} />}
                                            <span className="truncate">
                                                {s.sourceType === 'none' ? 'Empty Source' : s.sourceType === 'file' ? 'Audio File' : 'AI Generated'}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {s.hasTrajectory && (
                                <div className="flex items-center gap-1 text-[9px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-500/20">
                                    <Activity size={8} />
                                    <span>MOTION</span>
                                </div>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSource(s.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all duration-200"
                                title="Delete Source"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
