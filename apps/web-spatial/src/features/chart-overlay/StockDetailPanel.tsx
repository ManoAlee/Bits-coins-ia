'use client';

import { useUniverseStore } from '@/shared/store/useUniverseStore';
import { GlassPanel } from '@/shared/ui/GlassPanel';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

// Mock Data Generator (Replace with Real Data later)
const generateMockData = () => {
    return Array.from({ length: 30 }, (_, i) => ({
        time: i,
        price: 100 + Math.random() * 50
    }));
};

export default function StockDetailPanel() {
    const selectedTicker = useUniverseStore((state) => state.selectedTicker);
    const exitFocusMode = useUniverseStore((state) => state.exitFocusMode);

    const data = useMemo(() => generateMockData(), [selectedTicker]);

    if (!selectedTicker) return null;

    return (
        <div className="absolute top-20 right-10 w-96 z-50 animate-in slide-in-from-right-10 fade-in duration-500">
            <GlassPanel>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                            {selectedTicker}
                        </h1>
                        <p className="text-xs text-gray-400 font-mono">SECTOR: TECHNOLOGY // NASDAQ</p>
                    </div>
                    <button
                        onClick={exitFocusMode}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="h-40 w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', border: 'none' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#8b5cf6"
                                fillOpacity={1}
                                fill="url(#chartGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    <div className="bg-white/5 p-2 rounded">
                        <span className="text-gray-400 block text-[10px]">VOLATILITY</span>
                        <span className="text-emerald-400">LOW (0.45)</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded">
                        <span className="text-gray-400 block text-[10px]">PREDICTION</span>
                        <span className="text-cyan-400">BULLISH (+12%)</span>
                    </div>
                </div>
            </GlassPanel>
        </div>
    );
}
