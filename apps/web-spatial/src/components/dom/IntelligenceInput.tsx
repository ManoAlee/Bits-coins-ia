'use client';

import { useState, useEffect, useCallback } from 'react';
import HolographicChart from './HolographicChart';
import { useUniverseStore } from '@/shared/store/useUniverseStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { API_URL } from '@/libs/constants';

export default function IntelligenceInput() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [chartData, setChartData] = useState<any | null>(null);
    const [materializing, setMaterializing] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setResponse(null);
        setChartData(null);

        try {
            // 1. Check for Chart Intent
            const tickerMatch = query.match(/(?:analyze|chart|price|sentiment)\s+([A-Za-z]+)/i);

            if (tickerMatch && tickerMatch[1]) {
                const ticker = tickerMatch[1];
                fetch(`${API_URL}/quant/chart/${ticker}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.data) setChartData(data);
                    })
                    .catch(err => console.error("Chart Uplink Failed:", err));
            }

            // 2. Direct link to the Brain
            const res = await fetch(`${API_URL}/research`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) throw new Error('Neural Link Severed');
            const data = await res.json();
            const answer = data?.answer || "NEURAL_LINK_QUIET: No response from cortex.";
            setResponse(answer);

            // 3. Check for Materialization Protocol
            const spawnMatch = answer.match(/\[SPAWN:\s*(\w+)\s+([\d\.]+)\s+([-\d\.]+)\s*(\w*)\]/);
            if (spawnMatch) {
                const [_, ticker, price, change, color] = spawnMatch;
                useUniverseStore.getState().spawnPlanet(ticker, parseFloat(price) || 0, parseFloat(change) || 0, color);

                // Visual Alert
                setMaterializing(ticker);
                setTimeout(() => setMaterializing(null), 3000);
            }
        } catch (err: any) {
            console.error(err);
            setResponse(`ERROR: CONNECTION FAILED. DETAILS: ${err.message || JSON.stringify(err)}`);
        } finally {
            setLoading(false);
        }
    };

    const suggestions = [
        "Sentiment: Bitcoin",
        "Chart: NVDA",
        "Macro: FOMC Impact",
        "Risk: MicroStrategy"
    ];

    return (
        <div className="pointer-events-auto w-full max-w-xl mx-auto mt-4 px-4 relative">
            {/* Materialization Overlay */}
            <AnimatePresence>
                {materializing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.5, y: -40 }}
                        className="absolute -top-16 left-0 right-0 flex justify-center z-[100]"
                    >
                        <div className="bg-cyan-500 text-black font-black px-6 py-2 rounded-full flex items-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.8)] border-2 border-white">
                            <Zap className="w-5 h-5 fill-current" />
                            MATERIALIZING ENTITY: {materializing}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex gap-2 relative z-50">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="QUERY THE FINANCIAL MULTIVERSE..."
                    className="flex-1 bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded px-4 py-3 text-white font-mono placeholder:text-cyan-800 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50 transition-all uppercase tracking-wider"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="bg-cyan-900/80 hover:bg-cyan-500 border border-cyan-500 text-cyan-100 rounded px-6 py-2 font-black font-mono transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95"
                    disabled={loading}
                >
                    {loading ? <div className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>WAITING...</span></div> : 'SEND'}
                </button>
            </form>

            <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {suggestions.map((s) => (
                    <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="text-[9px] sm:text-[10px] bg-black/60 hover:bg-cyan-500/20 text-cyan-500 hover:text-cyan-200 border border-cyan-900/50 rounded px-3 py-1 transition-all uppercase tracking-widest backdrop-blur-sm"
                    >
                        {s}
                    </button>
                ))}
            </div>

            {(response || loading) && (
                <div className="mt-6 p-5 bg-black/95 border-l-2 border-l-emerald-500/50 border-y border-y-white/5 rounded-r-lg font-mono text-xs leading-relaxed shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>

                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                        <span className="text-emerald-500 font-bold tracking-[0.2em] flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            NEURAL_LINK_STABLE
                        </span>
                        <span className="text-gray-600 text-[10px]">{new Date().toLocaleTimeString()}</span>
                    </div>

                    <div className="mb-6 opacity-70">
                        <span className="text-cyan-600 font-bold block mb-1 text-[10px] tracking-widest pl-2 border-l border-cyan-900">
                             // UPLINK_HEX
                        </span>
                        <div className="text-cyan-100 pl-4 font-bold">{query}</div>
                    </div>

                    <div className="relative">
                        <span className="text-emerald-600 font-bold block mb-2 text-[10px] tracking-widest pl-2 border-l border-emerald-900">
                             // CORTEX_DECODED
                        </span>

                        {loading ? (
                            <div className="pl-4 text-emerald-500/50 animate-pulse italic">
                                PENETRATING THE NOOSPHERE...
                            </div>
                        ) : (
                            <div className="pl-4 text-emerald-300 whitespace-pre-wrap leading-relaxed">
                                <TypewriterText text={response || ""} />
                            </div>
                        )}
                    </div>

                    {chartData && (
                        <div className="mt-6 border-t border-white/10 pt-4">
                            <span className="text-amber-500 font-bold block mb-2 text-[10px] tracking-widest">
                                // VISUAL_HARMONICS_DETECTED
                            </span>
                            <HolographicChart data={chartData.data as any[]} ticker={chartData.ticker as string} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function TypewriterText({ text }: { text: string }) {
    const [displayed, setDisplayed] = useState("");

    useEffect(() => {
        if (!text) return;
        setDisplayed("");
        let i = 0;
        const speed = (text?.length || 0) > 200 ? 5 : 15; // Dynamic speed based on length

        const timer = setInterval(() => {
            if (text && i < text.length) {
                setDisplayed((prev: string) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text]);

    return (
        <span className="relative">
            {displayed}
            <span className="inline-block w-1.5 h-3.5 bg-emerald-500 ml-1 translate-y-0.5 animate-pulse" />
        </span>
    );
}
