import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, Upload, Trash2, Music, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSelectFile: (url: string, fileSize: number, fileName: string) => void;
    onUploadNew: (file: File) => Promise<void>;
    onStorageUpdate?: () => void;
}

interface StorageFile {
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: {
        eTag: string;
        size: number;
        mimetype: string;
        cacheControl: string;
        contentLength: number;
        httpStatusCode: number;
    };
}

export default function MediaLibraryModal({
    isOpen,
    onClose,
    userId,
    onSelectFile,
    onUploadNew,
    onStorageUpdate
}: MediaLibraryModalProps) {
    const supabase = createClient();
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            fetchFiles();
        }
    }, [isOpen, userId]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .storage
                .from('audio-files')
                .list(userId + '/', {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'name', order: 'asc' },
                });

            if (error) {
                console.error('Error fetching files:', error);
            } else {
                setFiles(data as unknown as StorageFile[] || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (file: StorageFile) => {
        // Get public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('audio-files')
            .getPublicUrl(`${userId}/${file.name}`);

        onSelectFile(publicUrl, file.metadata.size, file.name);
        onClose();
    };

    const handleDelete = async (file: StorageFile, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('⚠️ WARNING: This file may be used in other projects.\n\nDeleting it will cause those projects to report missing files. Are you sure you want to permanently delete this file?')) return;

        const path = `${userId}/${file.name}`;

        const { data, error } = await supabase
            .storage
            .from('audio-files')
            .remove([path]);

        if (!error && data && data.length > 0) {
            // Decrement Storage
            await supabase.rpc('decrement_storage', {
                bytes: file.metadata.size,
                file_count: 1
            });
            if (onStorageUpdate) onStorageUpdate();

            setFiles(prev => prev.filter(f => f.name !== file.name));
        } else {
            console.error("Delete failed or returned empty data:", error, data);
            alert('Failed to delete file from server. (Check console for details)');
        }
    };

    const handleUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await onUploadNew(file);
            // Increment is done in onUploadNew logic (which is passed from parent) OR here? 
            // Wait, handleLibraryUploadNew in Editor is what is passed as onUploadNew.
            // Let's check Editor logic for handleLibraryUploadNew. 
            // It currently only does storage.upload. It needs to do increment too.
            // BETTER: Do the increment HERE if onUploadNew is just the storage upload wrapper. 
            // BUT onUploadNew in Editor is cleaner to keep logic centrally? 
            // Actually, let's update handleLibraryUploadNew in Editor to do the increment as well.
            // So we just need to call onStorageUpdate here.

            await fetchFiles(); // Refresh list
            if (onStorageUpdate) onStorageUpdate();
        } catch (error: any) {
            // Ignore limit errors (handled by modal)
            if (error.message === "LIMIT_REACHED") return;

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
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Media Library</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Manage audio files for this project</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-3">
                            <Music size={40} className="opacity-20" />
                            <p>No files uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    onClick={() => handleFileSelect(file)}
                                    className="group relative flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-500/30 transition cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <Music size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{file.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{(file.metadata.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(file, e)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                                        title="Delete file"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                <span>Upload New Audio File</span>
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
