'use client';

import { useState, useEffect } from 'react';
import HolographicChart from './HolographicChart';
import { useUniverseStore } from '@/shared/store/useUniverseStore';

export default function IntelligenceInput() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [chartData, setChartData] = useState<any | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setResponse(null);
        setChartData(null);

        try {
            // 1. Check for Chart Intent (Simple Keyword Matching for Demo)
            const tickerMatch = query.match(/(?:analyze|chart|price|sentiment)\s+([A-Za-z]+)/i);

            if (tickerMatch && tickerMatch[1]) {
                const ticker = tickerMatch[1];
                console.log(`[NEURAL] Detecting Chart Request for: ${ticker}`);

                // Fetch Chart Data in Parallel
                fetch(`http://localhost:8081/quant/chart/${ticker}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.data) setChartData(data);
                    })
                    .catch(err => console.error("Chart Uplink Failed:", err));
            }

            // 2. Direct link to the Brain (Port 8081)
            const res = await fetch('http://localhost:8081/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) throw new Error('Neural Link Severed');

            const data = await res.json();
            setResponse(data.answer);

            // 3. Check for Materialization Protocol (Spawn Commands)
            // Regex: [SPAWN: TICKER PRICE CHANGE COLOR]
            const spawnMatch = data.answer.match(/\[SPAWN:\s*(\w+)\s+([\d\.]+)\s+([-\d\.]+)\s*(\w*)\]/);
            if (spawnMatch) {
                const [_, ticker, price, change, color] = spawnMatch;
                useUniverseStore.getState().spawnPlanet(ticker, parseFloat(price), parseFloat(change), color);
                console.log(`[MATERIALIZATION] Spawning Entity: ${ticker}`);
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

    const handleSuggestion = (text: string) => {
        setQuery(text);
        // Optional: trigger submit automatically
        // handleSubmit(new Event('submit') as any); 
    };

    return (
        <div className="pointer-events-auto w-full max-w-xl mx-auto mt-4 px-4">
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
                    {loading ? 'TRANSMITTING...' : 'SEND'}
                </button>
            </form>

            <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {suggestions.map((s) => (
                    <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        className="text-[9px] sm:text-[10px] bg-black/60 hover:bg-cyan-500/20 text-cyan-500 hover:text-cyan-200 border border-cyan-900/50 rounded px-3 py-1 transition-all uppercase tracking-widest backdrop-blur-sm"
                    >
                        {s}
                    </button>
                ))}
            </div>

            {(response || loading) && (
                <div className="mt-6 p-5 bg-black/90 border-l-2 border-l-emerald-500/50 border-y border-y-white/5 rounded-r-lg font-mono text-xs leading-relaxed shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                    {/* Scanline Effect */}
                    <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

                    {/* Header */}
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                        <span className="text-emerald-500 font-bold tracking-[0.2em] flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            SECURE LOG
                        </span>
                        <span className="text-gray-600 text-[10px]">{new Date().toLocaleTimeString()}</span>
                    </div>

                    {/* USER QUERY */}
                    <div className="mb-6 opacity-70 hover:opacity-100 transition-opacity">
                        <span className="text-cyan-600 font-bold block mb-1 text-[10px] tracking-widest pl-2 border-l border-cyan-900">
                             // USER_UPLINK
                        </span>
                        <div className="text-cyan-100 pl-4">{query || "..."}</div>
                    </div>

                    {/* AI RESPONSE */}
                    <div className="relative">
                        <span className="text-emerald-600 font-bold block mb-2 text-[10px] tracking-widest pl-2 border-l border-emerald-900">
                             // CORTEX_RESPONSE
                        </span>

                        {loading ? (
                            <div className="pl-4 text-emerald-500/50 animate-pulse">
                                DECRYPTING NEURAL STREAM...
                                <br />
                                <span className="inline-block mt-2 w-2 h-4 bg-emerald-500/50 animate-ping"></span>
                            </div>
                        ) : (
                            <div className="pl-4 text-emerald-300 whitespace-pre-wrap">
                                <TypewriterText text={response || ""} />
                            </div>
                        )}
                    </div>

                    {chartData && (
                        <div className="mt-6 border-t border-white/10 pt-4">
                            <span className="text-amber-500 font-bold block mb-2 text-[10px] tracking-widest">
                                // VISUAL_DATA_FOUND
                            </span>
                            <HolographicChart data={chartData.data} ticker={chartData.ticker} />
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
        setDisplayed("");
        let i = 0;
        const timer = setInterval(() => {
            setDisplayed((prev) => prev + text.charAt(i));
            i++;
            if (i >= text.length) clearInterval(timer);
        }, 10);
        return () => clearInterval(timer);
    }, [text]);

    return (
        <span>
            {displayed}
            <span className="animate-blink inline-block w-2 h-4 bg-emerald-500 ml-1 align-middle"></span>
        </span>
    );
}
