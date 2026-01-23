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
        <div className="pointer-events-auto w-full max-w-xl mx-auto mt-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="QUERY THE FINANCIAL MULTIVERSE..."
                    className="flex-1 bg-black/50 border border-cyan-500/30 rounded px-4 py-2 text-white font-mono placeholder:text-cyan-800 focus:outline-none focus:border-cyan-500 transition-colors"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="bg-cyan-900/50 hover:bg-cyan-500/50 border border-cyan-500/50 text-cyan-300 rounded px-6 py-2 font-bold transition-all disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'PULSING...' : 'SEND'}
                </button>
            </form>

            {/* Quick Suggestions */}
            <div className="flex gap-2 mt-2 justify-center">
                {suggestions.map((s) => (
                    <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        className="text-[10px] bg-cyan-950/40 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-800/50 rounded px-3 py-1 transition-all uppercase tracking-wider"
                    >
                        {s}
                    </button>
                ))}
            </div>

            {response && (
                <div className="mt-4 p-4 bg-black/80 border border-emerald-500/30 rounded text-xs font-mono text-emerald-300 leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                    <span className="text-emerald-500 block mb-2">&gt; INCOMING TRANSMISSION:</span>
                    <div className="whitespace-pre-wrap">{response}</div>
                    {chartData && (
                        <HolographicChart data={chartData.data} ticker={chartData.ticker} />
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
