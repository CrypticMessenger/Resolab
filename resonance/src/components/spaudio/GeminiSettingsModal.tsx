import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, Cpu, Save } from 'lucide-react';

interface GeminiSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialConfig: { apiKey: string; modelName: string };
    onSave: (config: { apiKey: string; modelName: string }) => void;
}

const DEFAULT_MODELS = [
    { name: "Gemini 3 Flash (Primary)", id: "gemini-3-flash-preview" },
    { name: "Gemini 2.0 Flash Lite (Fallback)", id: "gemini-2.0-flash-lite" }
];

export default function GeminiSettingsModal({ isOpen, onClose, initialConfig, onSave }: GeminiSettingsModalProps) {
    const [apiKey, setApiKey] = useState(initialConfig.apiKey);
    const [selectedModel, setSelectedModel] = useState(initialConfig.modelName);

    // Sync from props
    useEffect(() => {
        if (isOpen) {
            setApiKey(initialConfig.apiKey);
            setSelectedModel(initialConfig.modelName);
        }
    }, [isOpen, initialConfig]);

    const handleSave = () => {
        onSave({ apiKey, modelName: selectedModel });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-[480px] bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
                            <Sparkles className="text-white" size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Gemini Configuration</h2>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">AI Model Settings</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">

                    {/* API Key Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Key size={14} className="text-indigo-500" />
                            API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={process.env.NEXT_PUBLIC_GEMINI_API_KEY ? "Using default env key..." : "Enter your standard Gemini API key"}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400"
                        />
                        <p className="text-[10px] text-gray-400">
                            Leave empty to use the default environment variable key.
                        </p>
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Cpu size={14} className="text-purple-500" />
                            Model Selection
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {DEFAULT_MODELS.map(model => (
                                <button
                                    key={model.id}
                                    onClick={() => setSelectedModel(model.id)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-medium transition-all
                                        ${selectedModel === model.id
                                            ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
                                        }
                                    `}
                                >
                                    <span>{model.name}</span>
                                    {selectedModel === model.id && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Model Input - Removed as per strict requirement */}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <Save size={14} />
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
