import React from 'react';

interface TooltipProps {
    visible: boolean;
    x: number;
    y: number;
    text: string;
    color: string;
}

export default function Tooltip({ visible, x, y, text, color }: TooltipProps) {
    if (!visible) return null;

    return (
        <div
            className="absolute pointer-events-none px-2 py-1 bg-black/90 backdrop-blur rounded border text-xs font-bold z-50"
            style={{
                left: x,
                top: y,
                borderColor: color,
                color: color
            }}
        >
            {text}
        </div>
    );
}
