'use client';

import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Filter } from 'lucide-react';
import { useUniverseStore } from '@/shared/store/useUniverseStore';
import HolographicChart from '@/components/dom/HolographicChart';

export default function MarketGrid() {
    const { universeItems } = useUniverseStore();
    const [filter, setFilter] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

    // Filter items based on search
    const filteredItems = universeItems.filter(item =>
        item.ticker.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="flex h-full gap-6">
            {/* Left Panel: The Grid */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Toolbar */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/50" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH ASSETS..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-10 py-2 text-sm text-white font-mono placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none transition-colors"
                        />
                    </div>
                    <button className="p-2 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Filter size={18} />
                    </button>
                </div>

                {/* Data Table */}
                <div className="flex-1 overflow-auto border border-white/5 rounded-xl bg-black/20">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-white/10">
                            <tr>
                                <th className="p-4 text-[10px] text-gray-500 font-mono text-center">#</th>
                                <th className="p-4 text-[10px] text-gray-500 font-mono">TICKER</th>
                                <th className="p-4 text-[10px] text-gray-500 font-mono text-right">PRICE</th>
                                <th className="p-4 text-[10px] text-gray-500 font-mono text-right">24H %</th>
                                <th className="p-4 text-[10px] text-gray-500 font-mono text-right">VOLUME</th>
                                <th className="p-4 text-[10px] text-gray-500 font-mono text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item, index) => (
                                <tr
                                    key={item.ticker}
                                    onClick={() => setSelectedAsset(item)}
                                    className={`
                                        group border-b border-white/5 cursor-pointer transition-colors
                                        ${selectedAsset?.ticker === item.ticker ? 'bg-cyan-500/10' : 'hover:bg-white/5'}
                                    `}
                                >
                                    <td className="p-4 text-xs font-mono text-gray-600 text-center">{index + 1}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center font-bold text-xs">
                                                {item.ticker[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm tracking-wide text-white group-hover:text-cyan-400 transition-colors">{item.ticker}</div>
                                                <div className="text-[10px] text-gray-500">Global Asset</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-mono text-sm text-white">
                                        R$ {item.price.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${item.change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {item.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                            {Math.abs(item.change).toFixed(2)}%
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-mono text-xs text-gray-500">
                                        {(Math.random() * 100).toFixed(1)}M
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-[10px] border border-white/10 px-3 py-1 rounded hover:bg-cyan-500 hover:text-black transition-colors font-bold">
                                            VIEW
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Panel: Detail View */}
            <div className="w-80 border-l border-white/10 pl-6 flex flex-col gap-6">
                {selectedAsset ? (
                    <>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-white tracking-tighter">{selectedAsset.ticker}</h2>
                            <div className="text-4xl font-light text-cyan-400 font-mono">
                                R$ {selectedAsset.price.toFixed(2)}
                            </div>
                        </div>

                        {/* Mock Chart Area */}
                        <div className="h-40 bg-cyan-900/10 rounded-xl border border-cyan-500/20 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div className="text-cyan-500/50 text-xs font-mono">LIVE CHART FEED</div>
                            {/* In real app, put HolographicChart here */}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase">Analytics</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <StatBox label="VOLATILITY" value="High" color="text-amber-400" />
                                <StatBox label="RSI" value="64.2" color="text-emerald-400" />
                                <StatBox label="SENTIMENT" value="Bullish" color="text-cyan-400" />
                                <StatBox label="MKT CAP" value="1.2T" color="text-white" />
                            </div>
                        </div>

                        <button className="w-full bg-cyan-500 text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                            TRADE {selectedAsset.ticker}
                        </button>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                        <Search size={48} className="mb-4" />
                        <p className="text-sm font-mono">SELECT ASSET TO<br />INITIATE ANALYSIS</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatBox({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="text-[9px] text-gray-500 mb-1">{label}</div>
            <div className={`font-mono text-sm font-bold ${color}`}>{value}</div>
        </div>
    );
}
