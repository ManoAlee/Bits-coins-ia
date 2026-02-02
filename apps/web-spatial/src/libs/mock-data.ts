// Fallback data when API is unreachable
export const MOCK_METRICS = {
    today: {
        accuracy: 94.2,
        time_saved_hours: 12.5,
        decisions_made: 128
    },
    oracle_insight: {
        multiversal_trace: ["BTC", "ETH", "SOL", "CUDA", "PYTHON"]
    },
    raw_intelligence: {
        research: [
            {
                ticker: "BTC",
                category: "Macro",
                timestamp: new Date().toISOString(),
                data: {
                    headline: "Quantum Resistance Levels Detected",
                    verification: "AXIOM_CONFIRMED",
                    source: "Ledger Prime",
                    full_text: "Bitcoin exhibits strong support at $92k with quantum probability fields stabilizing around the 200-day moving average."
                }
            },
            {
                ticker: "NVDA",
                category: "AI",
                timestamp: new Date().toISOString(),
                data: {
                    headline: "Neural Chip Demand Surge",
                    verification: "HIGH_CONFIDENCE",
                    source: "Silicon Watch",
                    full_text: "Demand for H100 units exceeds supply by 400%, signaling sustained growth vectors for the next 3 quarters."
                }
            }
        ]
    }
};

export const MOCK_PORTFOLIO = {
    balance_usd: 142500.00,
    assets: [
        { ticker: "BTC", value_usd: 85000 },
        { ticker: "ETH", value_usd: 42000 },
        { ticker: "SOL", value_usd: 15500 }
    ]
};

export const MOCK_LOGS = {
    logs: [
        "[SYSTEM] Neural Link Established...",
        "[INFO] Quant module synced with Binance",
        "[INFO] Risk parameters optimized for Volatility",
        "[SUCCESS] Mock Mode Engaged: Reality Synthesized"
    ]
};

export const generateMockResearch = (query: string) => ({
    answer: `Simulated Analysis for "${query}":\n\nThe system has detected strong bullish divergence in the underlying asset classes. Dimensional risk remains low comfortably within the 2-sigma range. \n\nRecommended Action: ACCUMULATE on dips.`,
    source: "Synthetic Cortex v1"
});

export const generateMockChart = (ticker: string) => ({
    ticker: ticker.toUpperCase(),
    data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 100 + Math.random() * 50 + (i * 2), // Upward trend
        volume: 1000 + Math.random() * 5000
    }))
});
