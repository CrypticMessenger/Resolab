import React, { useState } from 'react';
import { SourceData, EditorState } from '@/types/spaudio';
import SourceList from './SourceList';
import SourceEditor from './SourceEditor';
import GlobalControls from './GlobalControls';
import { Layers, Sliders, Settings, Plus } from 'lucide-react';

interface EditorSidebarProps {
    sources: SourceData[];
    activeSourceId: string | null;
    onSelectSource: (id: string) => void;
    onCreateSource: () => void;
    editorState: EditorState;
    onUpdateSource: (updates: Partial<EditorState>) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTogglePlay: () => void;
    onStopMotion: () => void;
    onAiGenerate: () => void;
    promptInput: string;
    setPromptInput: (val: string) => void;
    aiStatus: string;
    isRecording: boolean;
    isPro: boolean;
    onToggleRecording: () => void;
    onSave: () => any;
    onLoad: (data: any) => void;
    onReverbChange: (val: number) => void;
    onDeleteSource: (id: string) => void;
    onOpenLibrary: () => void;
    onOpenAutoFoley: () => void;

    // Storage Props
    usedBytes: number;
    totalBytes: number;
    fileCount: number;
    maxFiles: number | null;
    onOpenSettings: () => void;
    reverbGain: number;
}

import StorageMeter from './StorageMeter';

export default function EditorSidebar({
    sources,
    activeSourceId,
    onSelectSource,
    onCreateSource,
    editorState,
    onUpdateSource,
    onFileUpload,
    onTogglePlay,
    onStopMotion,
    onAiGenerate,
    promptInput,
    setPromptInput,
    aiStatus,
    isRecording,
    isPro,
    onToggleRecording,
    onSave,
    onLoad,
    onReverbChange,
    onDeleteSource,
    onOpenLibrary,
    onOpenAutoFoley,
    usedBytes,
    totalBytes,
    fileCount,
    maxFiles,
    onOpenSettings,
    reverbGain
}: EditorSidebarProps) {
    const [activeTab, setActiveTab] = useState<'sources' | 'properties' | 'global'>('sources');

    return (
        <div className="absolute top-4 left-4 z-10 w-80 bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-2xl flex flex-col max-h-[calc(100vh-12rem)] shadow-2xl border border-gray-200 dark:border-white/10 text-black dark:text-gray-100 overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-black/5 dark:ring-white/10">
                        <span className="text-white font-bold text-sm">KY</span>
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight leading-tight">KYMATIC</h1>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">Spatial Studio</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center p-1 mx-5 mt-5 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
                <button
                    onClick={() => setActiveTab('sources')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 ${activeTab === 'sources' ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Layers size={12} />
                    SOURCES
                </button>
                <button
                    onClick={() => setActiveTab('properties')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 ${activeTab === 'properties' ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Sliders size={12} />
                    PROPS
                </button>
                <button
                    onClick={() => setActiveTab('global')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 ${activeTab === 'global' ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Settings size={12} />
                    GLOBAL
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                {activeTab === 'sources' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="flex gap-2">
                            <button
                                onClick={onCreateSource}
                                className="flex-1 group relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <div className="relative flex items-center justify-center gap-2">
                                    <Plus size={14} strokeWidth={3} />
                                    <span>Add Source</span>
                                </div>
                            </button>
                            <button
                                onClick={onOpenAutoFoley}
                                className="w-10 flex items-center justify-center bg-gray-100 dark:bg-white/10 hover:bg-pink-50 dark:hover:bg-pink-500/20 text-gray-500 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 rounded-xl transition-all duration-300 border border-transparent hover:border-pink-200 dark:hover:border-pink-500/30"
                                title="Auto-Foley (Video to Audio)"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-film"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 3v18" /><path d="M3 7.5h4" /><path d="M3 12h18" /><path d="M3 16.5h4" /><path d="M17 3v18" /><path d="M17 7.5h4" /><path d="M17 16.5h4" /></svg>
                            </button>
                        </div>

                        <div className="pt-2">
                            <SourceList
                                sources={sources}
                                activeSourceId={activeSourceId}
                                onSelectSource={(id) => {
                                    onSelectSource(id);
                                    setActiveTab('properties');
                                }}
                                onDeleteSource={onDeleteSource}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'properties' && (
                    <div className="h-full">
                        <SourceEditor
                            activeSourceId={activeSourceId}
                            editorState={editorState}
                            onUpdate={onUpdateSource}
                            onFileUpload={onFileUpload}
                            onTogglePlay={onTogglePlay}
                            onStopMotion={onStopMotion}
                            onAiGenerate={onAiGenerate}
                            promptInput={promptInput}
                            setPromptInput={setPromptInput}
                            aiStatus={aiStatus}
                            onOpenLibrary={onOpenLibrary}
                        />
                    </div>
                )}

                {activeTab === 'global' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <GlobalControls
                            isRecording={isRecording}
                            isPro={isPro}
                            onToggleRecording={onToggleRecording}
                            onSave={onSave}
                            onLoad={onLoad}
                            onReverbChange={onReverbChange}
                            onAiGenerate={onAiGenerate}
                            promptInput={promptInput}
                            setPromptInput={setPromptInput}
                            aiStatus={aiStatus}
                            onOpenSettings={onOpenSettings}
                            reverbGain={reverbGain}
                        />
                    </div>
                )}
            </div>



            {/* Footer Status */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/5 text-[10px] text-gray-400 flex justify-between items-center">
                <span>v1.0.0</span>
                <span className={isPro ? "text-yellow-500 font-bold" : "text-gray-500"}>{isPro ? "PRO LICENSE" : "FREE TIER"}</span>
            </div>
        </div>
    );
}
