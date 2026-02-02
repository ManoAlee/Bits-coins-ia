'use client';

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface ChartProps {
    data: any[];
    ticker: string;
}

export default function HolographicChart({ data, ticker }: ChartProps) {
    return (
        <div className="w-full h-64 mt-4 border border-cyan-500/30 bg-black/80 rounded p-4 relative overflow-hidden backdrop-blur-sm">
            {/* Holographic Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-0 opacity-50"></div>

            <div className="absolute top-4 left-4 z-10">
                <div className="text-[10px] text-cyan-500 font-mono tracking-widest uppercase">Entity_Feed: {ticker}</div>
                <div className="text-xl font-black text-white">
                    {data && data.length > 0 ? (data[data.length - 1]?.price || 0).toFixed(2) : '0.00'}
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data || []}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                        dataKey="timestamp"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        tickFormatter={(str) => new Date(str).toLocaleDateString()}
                        hide
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        width={40}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#000', borderColor: '#06b6d4', fontSize: '12px' }}
                        itemStyle={{ color: '#22d3ee' }}
                        labelStyle={{ color: '#94a3b8' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
