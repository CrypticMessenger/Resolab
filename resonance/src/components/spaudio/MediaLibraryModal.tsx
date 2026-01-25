
import React, { useEffect, useState } from 'react';
import { X, Upload, Trash2, Music, Loader2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { listAudioFiles, deleteAudioFile, AudioFileRecord, getFileUrl } from '@/utils/indexedDB';
import { getAllAssets, AudioAsset } from '@/lib/assetLibrary';

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSelectFile: (url: string, fileSize: number, fileName: string, id: string) => void;
    onUploadNew: (file: File) => Promise<{ url: string, size: number, name: string, id: string } | null | void>;
    onStorageUpdate?: () => void;
}

export default function MediaLibraryModal({
    isOpen,
    onClose,
    userId,
    onSelectFile,
    onUploadNew,
    onStorageUpdate
}: MediaLibraryModalProps) {
    const [files, setFiles] = useState<AudioFileRecord[]>([]);
    const [globalAssets, setGlobalAssets] = useState<AudioAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setGlobalAssets(getAllAssets());
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchFiles();
        }
    }, [isOpen]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const records = await listAudioFiles();
            setFiles(records);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (file: AudioFileRecord) => {
        // Create a blob URL for the file
        const url = getFileUrl(file.blob);
        onSelectFile(url, file.size, file.name, file.id);
        onClose();
    };

    const handleDelete = async (file: AudioFileRecord, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this file from local storage?')) return;

        try {
            await deleteAudioFile(file.id);
            setFiles(prev => prev.filter(f => f.id !== file.id));
            if (onStorageUpdate) onStorageUpdate();
        } catch (error) {
            console.error("Delete failed:", error);
            alert('Failed to delete file.');
        }
    };

    const handleGlobalSelect = (asset: AudioAsset) => {
        // Use the first tag as name if available, else 'Preset'
        const name = asset.tags[0] ? asset.tags[0].charAt(0).toUpperCase() + asset.tags[0].slice(1) : 'Preset';
        onSelectFile(asset.url, 0, name, 'global-' + Math.random());
        onClose();
    };

    const handleUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const uploadedFile = await onUploadNew(file);

            await fetchFiles(); // Refresh list

            // Auto-Select the new file
            if (uploadedFile) {
                onSelectFile(uploadedFile.url, uploadedFile.size, uploadedFile.name, uploadedFile.id);
                onClose();
            }

            if (onStorageUpdate) onStorageUpdate();
        } catch (error: any) {
            console.error("Upload process failed in modal:", error);
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[80vh]"
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Local Audio Library</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Files stored in your browser (IndexedDB)</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
                    {/* Global Presets */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Global Presets</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {globalAssets.map((asset, idx) => (
                                <div
                                    key={`global-${idx}`}
                                    onClick={() => handleGlobalSelect(asset)}
                                    className="group relative flex items-center gap-3 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:border-indigo-500/40 transition cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-indigo-200 dark:bg-indigo-500/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300">
                                        <Globe size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100 capitalize">
                                            {asset.tags[0] || 'Unknown'} <span className="text-xs opacity-50 ml-1">({asset.category})</span>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {asset.tags.join(', ')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Local Files */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">My Uploads</h3>
                        {loading ? (
                            <div className="flex justify-center items-center h-20">
                                <Loader2 className="animate-spin text-indigo-500" size={24} />
                            </div>
                        ) : files.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-20 text-gray-400 gap-2 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-xl">
                                <p className="text-xs">No local files yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {files.map((file) => (
                                    <div
                                        key={file.id}
                                        onClick={() => handleFileSelect(file)}
                                        className="group relative flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-500/30 transition cursor-pointer"
                                        title="Click to select"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400">
                                            <Music size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{file.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(file, e)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                                            title="Delete from local storage"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                    <label className={`
                        flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 
                        hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 
                        transition cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-300
                        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}>
                        {uploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span className="animate-pulse">Saving to Browser...</span>
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                <span className="font-bold">Import Audio File</span>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    className="hidden"
                                    onChange={handleUploadChange}
                                    disabled={uploading}
                                />
                            </>
                        )}
                    </label>
                </div>
            </motion.div>
        </div>
    );
}
