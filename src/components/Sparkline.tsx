// src/components/Sparkline.tsx
import React from 'react';

interface SparklineProps {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({
    data,
    color = '#10b981',
    width = 96,
    height = 32
}) => {
    if (!data || data.length === 0) {
        return <div className="w-24 h-8" />;
    }

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="inline-block">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default Sparkline;