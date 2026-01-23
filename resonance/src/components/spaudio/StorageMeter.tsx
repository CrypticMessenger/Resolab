import React from 'react';
import { motion } from 'framer-motion';

interface StorageMeterProps {
    usedBytes: number;
    totalBytes: number;
    fileCount: number;
    maxFiles: number | null;
}

export default function StorageMeter({ usedBytes, totalBytes, fileCount, maxFiles }: StorageMeterProps) {
    const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(0);
    const percentage = Math.min(100, (usedBytes / totalBytes) * 100);

    // File count percentage
    const filePercentage = maxFiles ? Math.min(100, (fileCount / maxFiles) * 100) : 0;

    // Determine color based on usage
    const getUsageColor = (percent: number) => {
        if (percent >= 90) return 'bg-red-500';
        if (percent >= 70) return 'bg-yellow-500';
        return 'bg-green-500/80';
    };

    return (
        <div className="p-3 bg-black/40 backdrop-blur-md border-t border-white/10 text-xs text-white/70 space-y-3">
            {/* Storage Usage */}
            <div className="space-y-1">
                <div className="flex justify-between w-full">
                    <span>Storage</span>
                    <span className={percentage > 90 ? "text-red-400 font-bold" : ""}>
                        {usedMB} / {totalMB} MB
                    </span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`h-full ${getUsageColor(percentage)} rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]`}
                    />
                </div>
            </div>

            {/* File Count Limit */}
            <div className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-500 font-medium">FILES USED</span>
                    <span className="text-gray-900 dark:text-gray-200 font-bold">
                        {fileCount} <span className="text-gray-400 font-normal">/ {maxFiles === null ? '∞' : maxFiles}</span>
                    </span>
                </div>
                {maxFiles !== null && (
                    <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${filePercentage > 90 ? 'bg-red-500' : 'bg-indigo-500'
                                }`}
                            style={{ width: `${filePercentage}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
