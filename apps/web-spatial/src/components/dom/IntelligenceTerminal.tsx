'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/libs/utils';
import { Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { API_URL } from '@/libs/constants';
import { generateMockResearch } from '@/libs/mock-data';

export default function IntelligenceTerminal() {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<{ answer: string; source: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    async function handleResearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const res = await fetch(`${API_URL}/research`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) throw new Error('Neural Pathway Blocked');

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setResponse(data as { answer: string; source: string });
        } catch (err: any) {
            // Fallback to Mock Data
            console.warn("Using Synthetic Intelligence Fallback");
            setTimeout(() => {
                setResponse(generateMockResearch(query));
                setLoading(false);
            }, 1000);
            return;
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "bg-black/80 border border-cyan-500/30 text-cyan-400 p-3 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-950/50 transition-all",
                    isOpen && "bg-cyan-950/80 border-cyan-400 text-cyan-200"
                )}
            >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            </button>

            {/* Terminal Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-96 bg-black/90 border border-cyan-500/30 rounded-lg overflow-hidden backdrop-blur-xl shadow-2xl"
                    >
                        {/* Header */}
                        <div className="bg-cyan-950/30 p-2 border-b border-cyan-500/20 flex justify-between items-center text-xs font-mono text-cyan-300">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                PERPLEXITY_ORACLE
                            </span>
                            <span>v1.0</span>
                        </div>

                        {/* Content Area */}
                        <div className="p-4 max-h-[60vh] overflow-y-auto font-mono text-sm space-y-4">
                            {error && (
                                <div className="text-red-400 flex gap-2 items-center bg-red-950/20 p-2 rounded border border-red-500/20">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            {response && (
                                <div className="text-gray-200 animate-in fade-in slide-in-from-bottom-2">
                                    <p className="text-xs text-cyan-500 mb-1">&gt; INCOMING TRANSMISSION:</p>
                                    <div className="text-xs leading-relaxed opacity-90">
                                        {response.answer}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-2 text-right">
                                        SRC: {response.source}
                                    </div>
                                </div>
                            )}

                            {!response && !loading && !error && (
                                <div className="text-gray-500 text-center py-4">
                                    Awaiting Intelligence Query...
                                </div>
                            )}

                            {loading && (
                                <div className="space-y-2">
                                    <div className="h-2 bg-cyan-900/30 rounded animate-pulse w-3/4" />
                                    <div className="h-2 bg-cyan-900/30 rounded animate-pulse w-full" />
                                    <div className="h-2 bg-cyan-900/30 rounded animate-pulse w-5/6" />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleResearch} className="p-2 border-t border-cyan-500/20 bg-black/50">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Ask the Oracle..."
                                    className="w-full bg-transparent border border-cyan-900/50 rounded px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500 placeholder-cyan-900/50"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-300 disabled:opacity-50"
                                >
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
