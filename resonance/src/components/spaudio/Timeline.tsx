import React, { useRef, useState, useEffect } from 'react';
import { SourceData } from '@/types/spaudio';
import { Play, Pause, Square, ZoomIn, ZoomOut } from 'lucide-react';

interface TimelineProps {
    sources: SourceData[];
    currentTime: number;
    totalDuration: number;
    isPlaying: boolean;
    onSeek: (time: number) => void;
    onTogglePlay: () => void;
    onStop: () => void;
    onUpdateSource: (id: string, updates: { timelineStart?: number; timelineDuration?: number }) => void;
}

export default function Timeline({
    sources,
    currentTime,
    totalDuration,
    isPlaying,
    onSeek,
    onTogglePlay,
    onStop,
    onUpdateSource
}: TimelineProps) {
    const [zoom, setZoom] = useState(50); // pixels per second
    const containerRef = useRef<HTMLDivElement>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [resizingId, setResizingId] = useState<string | null>(null);
    const [dragStartX, setDragStartX] = useState(0);
    const [initialStart, setInitialStart] = useState(0);
    const [initialDuration, setInitialDuration] = useState(0);

    // Handle Mouse Move for Drag/Resize
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (draggingId) {
                const deltaX = e.clientX - dragStartX;
                const deltaTime = deltaX / zoom;
                let newStart = Math.max(0, initialStart + deltaTime);
                onUpdateSource(draggingId, { timelineStart: newStart });
            } else if (resizingId) {
                const deltaX = e.clientX - dragStartX;
                const deltaTime = deltaX / zoom;
                let newDuration = Math.max(0.5, initialDuration + deltaTime); // Min 0.5s
                onUpdateSource(resizingId, { timelineDuration: newDuration });
            }
        };

        const handleMouseUp = () => {
            setDraggingId(null);
            setResizingId(null);
        };

        if (draggingId || resizingId) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingId, resizingId, dragStartX, initialStart, initialDuration, zoom, onUpdateSource]);

    const handleTrackClick = (e: React.MouseEvent, time: number) => {
        // Only seek if not dragging
        if (!draggingId && !resizingId) {
            // Logic to seek could go here, but usually clicking on ruler does seek
        }
    };

    const handleRulerClick = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - 200; // 200px sidebar offset
        const time = Math.max(0, x / zoom);
        onSeek(time);
    };

    const headerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (headerRef.current) {
            headerRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    };

    return (
        <div className="w-full h-64 bg-gray-900 border-t border-gray-800 flex flex-col select-none">
            {/* Toolbar */}
            <div className="h-10 border-b border-gray-800 flex items-center px-4 gap-4 bg-gray-950">
                <div className="flex items-center gap-2">
                    <button onClick={onTogglePlay} className="p-1.5 rounded hover:bg-gray-800 text-white">
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button onClick={onStop} className="p-1.5 rounded hover:bg-gray-800 text-white">
                        <Square size={16} />
                    </button>
                </div>
                <div className="text-xs font-mono text-gray-400">
                    {currentTime.toFixed(2)}s / {totalDuration.toFixed(2)}s
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                    <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="p-1 hover:bg-gray-800 rounded text-gray-400">
                        <ZoomOut size={14} />
                    </button>
                    <input
                        type="range" min="10" max="200" value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 hover:bg-gray-800 rounded text-gray-400">
                        <ZoomIn size={14} />
                    </button>
                </div>
            </div>

            {/* Timeline Area */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Track Headers (Left Sidebar) */}
                <div
                    ref={headerRef}
                    className="w-[200px] flex-shrink-0 border-r border-gray-800 bg-gray-950 z-20 overflow-hidden"
                >
                    <div className="h-8 border-b border-gray-800 bg-gray-900/50" /> {/* Ruler Spacer */}
                    {sources.map(source => (
                        <div key={source.id} className="h-12 border-b border-gray-800 flex items-center px-3 gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                            <span className="text-xs text-gray-300 truncate font-medium">{source.name}</span>
                        </div>
                    ))}
                </div>

                {/* Tracks & Ruler (Scrollable) */}
                <div
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-auto relative custom-scrollbar bg-gray-900"
                >
                    <div style={{ width: Math.max(totalDuration * zoom + 500, typeof window !== 'undefined' ? window.innerWidth : 1000) }} className="relative h-full">

                        {/* Ruler */}
                        <div
                            className="h-8 border-b border-gray-800 bg-gray-900/80 sticky top-0 z-10 cursor-pointer"
                            onClick={handleRulerClick}
                        >
                            {Array.from({ length: Math.ceil(totalDuration + 10) }).map((_, i) => (
                                <div key={i} className="absolute bottom-0 border-l border-gray-700 h-3 text-[9px] text-gray-500 pl-1" style={{ left: i * zoom }}>
                                    {i}s
                                </div>
                            ))}
                        </div>

                        {/* Tracks */}
                        <div className="relative">
                            {/* Playhead Line */}
                            <div
                                className="absolute top-0 bottom-0 w-px bg-red-500 z-30 pointer-events-none"
                                style={{ left: currentTime * zoom, height: sources.length * 48 }} // 48px per track
                            >
                                <div className="w-3 h-3 bg-red-500 transform -translate-x-1.5 rotate-45 -mt-1.5" />
                            </div>

                            {sources.map((source, index) => {
                                const width = (source.timelineDuration || 10) * zoom;
                                const left = source.timelineStart * zoom;

                                return (
                                    <div key={source.id} className="h-12 border-b border-gray-800 relative group bg-gray-900/30">
                                        {/* Grid Lines */}
                                        {Array.from({ length: Math.ceil(totalDuration + 10) }).map((_, i) => (
                                            <div key={i} className="absolute top-0 bottom-0 border-l border-gray-800/30 pointer-events-none" style={{ left: i * zoom }} />
                                        ))}

                                        {/* Clip */}
                                        <div
                                            className="absolute top-2 bottom-2 rounded-md overflow-hidden cursor-move border border-white/10 group-hover:border-white/30 transition-colors"
                                            style={{
                                                left,
                                                width,
                                                backgroundColor: source.color + '40', // 25% opacity
                                            }}
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                setDraggingId(source.id);
                                                setDragStartX(e.clientX);
                                                setInitialStart(source.timelineStart);
                                            }}
                                        >
                                            <div className="w-full h-full flex items-center px-2">
                                                <span className="text-[10px] font-bold text-white/90 truncate drop-shadow-md select-none pointer-events-none">
                                                    {source.name}
                                                </span>
                                            </div>

                                            {/* Resize Handle (Right) */}
                                            <div
                                                className="absolute top-0 bottom-0 right-0 w-2 cursor-e-resize hover:bg-white/20 active:bg-white/40 z-10"
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    setResizingId(source.id);
                                                    setDragStartX(e.clientX);
                                                    setInitialDuration(source.timelineDuration || 10);
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
