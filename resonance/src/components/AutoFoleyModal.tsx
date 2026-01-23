
import React, { useState, useRef } from 'react';
import { Upload, Film, FileVideo, CheckCircle2, Loader2, Music, Sparkles } from 'lucide-react';

// Actually, we can reuse the global ThinkingPanel or embed one here. 
// For now, let's just use the global one via callbacks or local state if strictly modal based.

interface AutoFoleyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProcessVideo: (file: File) => Promise<ReadableStream | void>;
    isProcessing: boolean;
    thinkingSteps: any[];
}

export default function AutoFoleyModal({ isOpen, onClose, onProcessVideo, isProcessing, thinkingSteps }: AutoFoleyModalProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (file.type.startsWith('video/')) {
            setSelectedFile(file);
        } else {
            alert("Please upload a video file.");
        }
    };

    const startProcessing = () => {
        if (selectedFile) {
            onProcessVideo(selectedFile);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-[600px] bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg shadow-lg shadow-pink-500/20">
                            <Film className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Auto-Foley Agent</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Video-to-Audio Generation with Gemini 3 Pro</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        Close
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto">

                    {!isProcessing && !thinkingSteps.length ? (
                        <>
                            {/* Upload Area */}
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center gap-4 group cursor-pointer
                                    ${dragActive
                                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10'
                                        : 'border-gray-200 dark:border-white/10 hover:border-pink-500/50 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }
                                `}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="video/*"
                                    onChange={handleChange}
                                />

                                {selectedFile ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <FileVideo size={48} className="text-pink-500" />
                                        <p className="font-bold text-gray-900 dark:text-white">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        <div className="flex items-center gap-1 text-green-500 text-xs font-bold mt-2 bg-green-500/10 px-2 py-1 rounded-full">
                                            <CheckCircle2 size={12} />
                                            Ready to Process
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-300">
                                            <Upload size={32} className="text-gray-400 group-hover:text-pink-500 transition-colors" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="font-bold text-gray-700 dark:text-gray-300">Click to upload or drag video here</p>
                                            <p className="text-xs text-gray-400">MP4, MOV, WebM up to 50MB</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-pink-600 dark:text-pink-400 font-bold text-xs uppercase tracking-wider">
                                        <Sparkles size={12} />
                                        Vision Analysis
                                    </div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Gemini detects actions, materials, and environments (e.g., "footsteps on gravel", "breaking glass").
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                                        <Music size={12} />
                                        Audio Synthesis
                                    </div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Generates or retrieves perfectly synchronized SFX and places them in the 3D scene time-sequentially.
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center gap-4">
                            {/* Re-using the Thinking logic visually here or relies on the parent to show the global panel? 
                                 Let's show a simple "Processing" state here, and let the Global ThinkingPanel handle the detailed logs 
                                 if they are shared. 
                                 Actually, for better UX, let's just show a large spinner here if the logs are global.
                             */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-pink-500 blur-xl opacity-20 animate-pulse" />
                                <Loader2 size={64} className="text-pink-500 animate-spin relative z-10" />
                            </div>
                            <p className="text-gray-500 font-mono text-sm animate-pulse">Analyzing Video Frames...</p>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!selectedFile || isProcessing}
                        onClick={startProcessing}
                        className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg shadow-pink-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing 0%' : 'Generate Audio Track'}
                    </button>
                </div>
            </div>
        </div>
    );
}
