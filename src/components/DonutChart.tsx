// src/components/DonutChart.tsx
import React from 'react';
import type { Token } from '../types';

interface DonutChartProps {
    tokens: Token[];
}

interface Segment {
    token: Token;
    value: number;
    percentage: number;
    color: string;
    pathData: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ tokens }) => {
    const total = tokens.reduce(
        (sum, t) => sum + (t.holdings || 0) * (t.current_price || 0),
        0
    );

    // Colors for different segments
    const colors = [
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#f59e0b', // amber
        '#10b981', // emerald
        '#3b82f6', // blue
        '#ef4444', // red
        '#6366f1', // indigo
        '#14b8a6', // teal
    ];

    if (total === 0 || tokens.length === 0) {
        return (
            <div className="flex items-center justify-center">
                <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle
                        cx="100"
                        cy="100"
                        r="70"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="40"
                    />
                    <circle cx="100" cy="100" r="50" fill="white" />
                    <text
                        x="100"
                        y="95"
                        textAnchor="middle"
                        className="text-xs fill-gray-400"
                    >
                        Total Value
                    </text>
                    <text
                        x="100"
                        y="115"
                        textAnchor="middle"
                        className="text-xl font-bold fill-gray-400"
                    >
                        $0.00
                    </text>
                </svg>
            </div>
        );
    }

    // Calculate segments with values > 0
    const validSegments = tokens
        .map((token, i) => {
            const value = (token.holdings || 0) * (token.current_price || 0);
            const percentage = (value / total) * 100;
            return {
                token,
                value,
                percentage,
                color: colors[i % colors.length]
            };
        })
        .filter(s => s.value > 0);

    // Calculate paths
    let currentAngle = -90; // Start at top
    const segments: Segment[] = validSegments.map(segment => {
        const startAngle = currentAngle;
        const angle = (segment.percentage / 100) * 360;
        const endAngle = startAngle + angle;
        currentAngle = endAngle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const innerRadius = 50;
        const outerRadius = 90;

        const x1 = 100 + outerRadius * Math.cos(startRad);
        const y1 = 100 + outerRadius * Math.sin(startRad);
        const x2 = 100 + outerRadius * Math.cos(endRad);
        const y2 = 100 + outerRadius * Math.sin(endRad);

        const x3 = 100 + innerRadius * Math.cos(endRad);
        const y3 = 100 + innerRadius * Math.sin(endRad);
        const x4 = 100 + innerRadius * Math.cos(startRad);
        const y4 = 100 + innerRadius * Math.sin(startRad);

        const largeArc = angle > 180 ? 1 : 0;

        const pathData = [
            `M ${x1} ${y1}`,
            `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${x3} ${y3}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
            `Z`
        ].join(' ');

        return {
            ...segment,
            pathData
        };
    });

    return (
        <div className="flex items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200">
                {segments.map((segment, i) => (
                    <path
                        key={i}
                        d={segment.pathData}
                        fill={segment.color}
                    />
                ))}
                <circle cx="100" cy="100" r="50" fill="hsla(240, 8%, 14%, 1)" />
                <text
                    x="100"
                    y="95"
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                >

                </text>
                <text
                    x="100"
                    y="115"
                    textAnchor="middle"
                    className="text-xl font-bold fill-gray-900"
                >
                </text>
            </svg>
        </div>
    );
};

export default DonutChart;