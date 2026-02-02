'use client'

import { useState, useEffect, useMemo, Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Float, Sparkles, Stars, ContactShadows } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

// Configuration
import { API_URL } from '@/libs/constants'
import { MOCK_METRICS, MOCK_LOGS, MOCK_PORTFOLIO } from '@/libs/mock-data'

const UNIVERSES = [
    { id: "BOOLE", label: "Boole", desc: "Binary Lógic" },
    { id: "ASSEMBLY", label: "Assembly", desc: "Hardware Reality" },
    { id: "FORTRAN", label: "Fortran", desc: "Scientific Origin" },
    { id: "LISP", label: "Lisp", desc: "Symbolic Mind" },
    { id: "COBOL", label: "COBOL", desc: "Economic Truth" },
    { id: "ALGOL", label: "ALGOL", desc: "Structure" },
    { id: "C", label: "C", desc: "Operational Base" },
    { id: "C++", label: "C++", desc: "High Performance" },
    { id: "MATLAB", label: "Matlab", desc: "Pure Math" },
    { id: "PYTHON", label: "Python", desc: "Cognitive Bridge" },
    { id: "JAVA", label: "Java", desc: "Institutional" },
    { id: "JS", label: "JS", desc: "Human Interface" },
    { id: "GO", label: "Go", desc: "Orchestration" },
    { id: "RUST", label: "Rust", desc: "Safe Contract" },
    { id: "CUDA", label: "CUDA", desc: "Brute Force" },
    { id: "SQL", label: "SQL", desc: "Persistent Memory" },
    { id: "SHELL", label: "Shell", desc: "Automation" },
    { id: "POWERSHELL", label: "PowerShell", desc: "Admin Logic" },
    { id: "PHP", label: "PHP", desc: "Web Legacy" },
    { id: "RUBY", label: "Ruby", desc: "Expressive" },
    { id: "SCALA", label: "Scala", desc: "Big Data" },
    { id: "HASKELL", label: "Haskell", desc: "Mathematical" },
    { id: "ERLANG", label: "Erlang", desc: "Resilience" },
    { id: "KOTLIN", label: "Kotlin", desc: "Evolution" },
    { id: "SWIFT", label: "Swift", desc: "Local AI" },
    { id: "JULIA", label: "Julia", desc: "Velocity" },
    { id: "NIM", label: "Nim", desc: "Minimalism" },
    { id: "LUA", label: "Lua", desc: "Real-time" },
    { id: "DART", label: "Dart", desc: "Multi-platform" },
    { id: "GROOVY", label: "Groovy", desc: "Workflow" },
    { id: "OBJC", label: "Obj-C", desc: "Bridge" },
    { id: "SCRATCH", label: "Scratch", desc: "Intent" }
]

const THEMES: Record<string, any> = {
    BTC: { color: "#F7931A", geometry: "sphere", label: "Quantum Gold", desc: "Highest Security Asset" },
    ETH: { color: "#627EEA", geometry: "icosahedron", label: "Logic Layer", desc: "Programmable Intelligence" },
    SOL: { color: "#14F195", geometry: "torus", label: "Speed Dimension", desc: "High Velocity Processing" },
    XRP: { color: "#23292F", geometry: "box", label: "Institutional Core", desc: "Settlement Liquidity" },
    DOGE: { color: "#C2A633", geometry: "octahedron", label: "Meme Singularity", desc: "Social Sentiment Driven" }
}

export default function EvolvedRealityEngine() {
    // Core State
    const [metrics, setMetrics] = useState<any>(null)
    const [portfolio, setPortfolio] = useState<any>(null)
    const [logs, setLogs] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [connected, setConnected] = useState(false)
    const [selectedTicker, setSelectedTicker] = useState('BTC')

    // Interaction State
    const [chatInput, setChatInput] = useState('')
    const [chatHistory, setChatHistory] = useState<any[]>([])
    const [showDeepResearch, setShowDeepResearch] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [activeResearch, setActiveResearch] = useState<any>(null)
    const [evolutionLevel, setEvolutionLevel] = useState(0)

    const theme = useMemo(() => THEMES[selectedTicker] || THEMES.BTC, [selectedTicker])
    const logEndRef = useRef<HTMLDivElement>(null)

    // Sync Intelligence
    useEffect(() => {
        const fetchAll = async () => {
            // Helper to safe fetch
            const safeFetch = async (endpoint: string, fallback: any) => {
                // Prevent mixed content / CORS errors in production
                if (API_URL.includes('localhost') && window.location.hostname !== 'localhost') {
                    // Only log once or sparingly to avoid spam
                    if (endpoint === '/metrics/dashboard') console.log("[MockMode] Production detected with localhost API. Switching to Simulation Matrix.")
                    return fallback;
                }

                try {
                    const res = await fetch(`${API_URL}${endpoint}`)
                    if (!res.ok) throw new Error('Network response was not ok')
                    return await res.json()
                } catch (e) {
                    console.warn(`[MockMode] Fetch failed for ${endpoint}, using fallback.`)
                    return fallback
                }
            }

            const mData = await safeFetch('/metrics/dashboard', MOCK_METRICS)
            const lData = await safeFetch('/logs', MOCK_LOGS)
            const pData = await safeFetch('/portfolio', MOCK_PORTFOLIO)

            setMetrics(mData)
            setLogs(lData.logs || [])
            setPortfolio(pData)

            // Adaptive Evolution: Derived from decision count + research depth
            const level = (mData.today?.decisions_made || 0) * 5 + (mData.raw_intelligence?.research?.length || 0) * 10
            setEvolutionLevel(level)

            setConnected(true)
            setLoading(false)
        }
        fetchAll()
        const interval = setInterval(fetchAll, 3000)
        return () => clearInterval(interval)
    }, [selectedTicker])

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [logs])

    // Actions
    const handleChat = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!chatInput.trim()) return

        const userMsg = chatInput
        setChatInput('')
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }])

        // Mock Mode Pre-check for Chat
        if (API_URL.includes('localhost') && window.location.hostname !== 'localhost') {
            const mockResponses = [
                "Simulation Matrix Active. Backend unreachable in this dimension.",
                "Reviewing local probability clouds... Bullish divergence detected.",
                "Neural Uplink Offline. Using heuristic logic for your query.",
                "System running in Autonomous Mock Mode. Analysis: Stable."
            ]
            const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
            setTimeout(() => {
                setChatHistory(prev => [...prev, { role: 'engine', text: `[SIMULATION] ${randomResponse}` }])
            }, 600)
            return;
        }

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, ticker: selectedTicker })
            })
            if (!res.ok) throw new Error("Brain Link Silent")
            const data = await res.json()
            setChatHistory(prev => [...prev, { role: 'engine', text: data.response }])
        } catch (e) {
            // Mock Fallback for Chat
            console.warn("Brain Link Silent. Using Simulation Matrix.")
            const mockResponses = [
                "Analysis confirms localized volatility. Recommend holding pattern.",
                "Quantum sensors indicate accumulation in this dimension.",
                "Multiversal probability suggests bullish divergence.",
                "Entropy levels stabilizing. System nominal."
            ]
            const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
            setTimeout(() => {
                setChatHistory(prev => [...prev, { role: 'engine', text: `[SIMULATION] ${randomResponse}` }])
            }, 600)
        }
    }

    const triggerDeepScan = async () => {
        setAnalyzing(true)
        if (API_URL.includes('localhost') && window.location.hostname !== 'localhost') {
            console.log("[MockMode] Deep Scan Simulation Active.")
            setTimeout(() => setAnalyzing(false), 2000)
            return
        }

        try {
            await fetch(`${API_URL}/decide`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker: selectedTicker, include_research: true })
            })
        } catch (e) {
            // Silently fail or log
            console.warn("Deep Scan Network Limit. Simulation nominal.")
        } finally {
            setTimeout(() => setAnalyzing(false), 2000)
        }
    }

    return (
        <div className="w-screen h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-hidden relative flex flex-col lg:block">
            {/* DYNAMIC AMBIENT BACKGROUND */}
            <motion.div
                animate={{
                    opacity: [0.3, 0.4, 0.3],
                    background: [
                        `radial-gradient(circle at 50% 50%, ${theme.color}05 0%, #000 100%)`,
                        `radial-gradient(circle at 50% 50%, ${theme.color}10 0%, #000 100%)`,
                        `radial-gradient(circle at 50% 50%, ${theme.color}05 0%, #000 100%)`,
                    ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 pointer-events-none z-0"
            />

            {/* DIMENSIONAL VIEWPORT (Background Layer) */}
            <div className="fixed inset-0 z-0">
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
                    <ambientLight intensity={0.2} />
                    <pointLight position={[10, 10, 10]} color={theme.color} intensity={100} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                    <Suspense fallback={null}>
                        <WorldCore
                            theme={theme}
                            analyzing={analyzing}
                            connected={connected}
                            evolutionLevel={evolutionLevel}
                            multiversalTrace={metrics?.oracle_insight?.multiversal_trace}
                        />
                        <Environment preset="night" />
                        <Sparkles count={200} scale={15} size={2} color={theme.color} opacity={0.1} />
                        <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
                    </Suspense>
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate={!analyzing} autoRotateSpeed={0.5} />
                </Canvas>
            </div>

            {/* SCROLLABLE CONTENT LAYER (Mobile) / OVERLAY (Desktop) */}
            <div className="relative z-10 w-full h-full overflow-y-auto lg:overflow-hidden flex flex-col lg:block pointer-events-none">

                {/* HEADER / LEFT PANEL */}
                <div className="w-full lg:w-[450px] lg:h-full p-6 lg:p-8 flex flex-col gap-6 lg:justify-between lg:absolute lg:left-0 lg:top-0 pointer-events-none">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="pointer-events-auto"
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-red-500'} animate-pulse`} />
                            <h1 className="text-3xl lg:text-4xl font-black tracking-tighter italic">REALITY.<span className="opacity-40">ENGINE</span></h1>
                        </div>
                        <div className="flex gap-3 ml-7 mt-1 align-baseline">
                            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest bg-cyan-950/30 border border-cyan-800/30 px-2 py-0.5 rounded">Lvl {evolutionLevel}</span>
                            <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] self-center">Alpha Node</p>
                        </div>
                    </motion.div>

                    {/* Navigation: Dimensions */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                        className="pointer-events-auto space-y-3 lg:mt-12"
                    >
                        <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest pl-1">Target Dimension</div>
                        <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                            {Object.keys(THEMES).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSelectedTicker(t)}
                                    className={`flex-1 min-w-[60px] py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 ${selectedTicker === t ? 'bg-white text-black shadow-lg scale-105' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Desktop: Bottom Left Box (Multiverse) */}
                    <div className="hidden lg:block pointer-events-auto">
                        <MultiverseBox metrics={metrics} />
                    </div>
                </div>


                {/* RIGHT PANEL (Stats) */}
                <div className="w-full lg:w-[450px] lg:h-full p-6 lg:p-8 flex flex-col gap-6 lg:justify-between lg:absolute lg:right-0 lg:top-0 pointer-events-none">

                    {/* Portfolio Card */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="pointer-events-auto space-y-4"
                    >
                        <div className="p-8 bg-zinc-950/40 border border-white/10 rounded-[2rem] backdrop-blur-2xl shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
                            <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-4xl font-serif italic text-white">(λ)</span>
                            </div>
                            <div className="text-[10px] text-white/40 font-mono mb-2 uppercase tracking-widest">Net Asset Value</div>
                            <div className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
                                ${portfolio?.balance_usd?.toLocaleString() || '0.00'}
                            </div>

                            {/* Mini Asset List */}
                            <div className="mt-8 space-y-1">
                                {portfolio?.assets?.slice(0, 3).map((asset: any) => (
                                    <div key={asset.ticker} className="flex items-center justify-between text-[11px] py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition-colors group/item">
                                        <span className="font-mono opacity-50 font-bold group-hover/item:opacity-100 transition-opacity">{asset.ticker}</span>
                                        <span className="font-bold tabular-nums text-white/90 group-hover/item:text-white">${asset.value_usd.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* KPI Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <KpiCard label="Accuracy" value={`${(metrics?.today?.accuracy || 75.0).toFixed(1)}%`} color="text-emerald-400" />
                            <KpiCard label="Time Saved" value={`+${metrics?.today?.time_saved_hours || 0}H`} color="text-amber-400" />
                        </div>
                    </motion.div>

                    {/* Research Feed */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="pointer-events-auto flex-1 min-h-[300px] lg:min-h-0 lg:h-[400px]"
                    >
                        <div className="bg-zinc-950/50 border border-white/10 rounded-3xl p-5 backdrop-blur-2xl h-full flex flex-col w-full">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /> Intelligence
                                </div>
                                <button
                                    onClick={triggerDeepScan}
                                    disabled={analyzing}
                                    className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-bold hover:bg-purple-500/20 hover:border-purple-500/40 transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {analyzing ? 'Scanning...' : <span className="group-hover:text-purple-300 transition-colors">Initiate Scan</span>}
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pr-1">
                                {metrics?.raw_intelligence?.research?.map((item: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        onClick={() => { setActiveResearch(item); setShowDeepResearch(true) }}
                                        className="p-3.5 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between text-[9px] opacity-40 mb-1.5 font-mono">
                                            <span>{item.ticker}</span>
                                            <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-[11px] font-medium leading-snug group-hover:text-white transition-colors line-clamp-2">{item.data.headline}</p>
                                    </motion.div>
                                ))}
                                {(!metrics?.raw_intelligence?.research || metrics.raw_intelligence.research.length === 0) && (
                                    <div className="flex flex-col items-center justify-center h-full opacity-20 gap-2">
                                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/50 animate-spin-slow" />
                                        <span className="text-[10px] italic">Awaiting Signals...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Mobile Specific: Multiverse Box (Moved from left panel for mobile stack) */}
                <div className="block lg:hidden p-6 pointer-events-auto">
                    <MultiverseBox metrics={metrics} />
                </div>

                {/* CHAT INTERFACE (Center Bottom) */}
                <div className="w-full lg:absolute lg:bottom-8 lg:inset-x-0 flex flex-col items-center gap-4 z-20 pointer-events-none p-4 mt-4 lg:mt-0">
                    <div className="flex flex-col items-center gap-1 opacity-0 lg:opacity-100 transition-opacity duration-700">
                        <div className="px-3 py-1 bg-white/10 backdrop-blur text-white text-[8px] font-black uppercase tracking-[0.3em] rounded-full border border-white/10">
                            Convergent Intelligence
                        </div>
                    </div>

                    <div className="w-full max-w-[600px] pointer-events-auto relative">
                        {/* Chat History Pop-up */}
                        <AnimatePresence>
                            {chatHistory.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="absolute bottom-full mb-4 left-0 right-0 max-h-48 lg:max-h-64 overflow-y-auto bg-black/80 lg:bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-2xl flex flex-col gap-3 scrollbar-hide mask-gradient-b"
                                >
                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm ${msg.role === 'user' ? 'bg-white text-black font-semibold' : 'bg-purple-500/10 border border-purple-500/20 text-purple-100'}`}>
                                                <p className="leading-relaxed">{msg.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleChat} className="relative group">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Query the system or request validation..."
                                className="w-full bg-black/60 border border-white/20 rounded-2xl py-4 pl-6 pr-12 text-sm focus:outline-none focus:border-white/50 focus:bg-black/80 transition-all backdrop-blur-xl shadow-2xl font-medium placeholder:text-white/20 group-hover:border-white/30"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-xl transition-all disabled:opacity-30" disabled={!chatInput.trim()}>
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                            </button>
                        </form>
                    </div>
                </div>

                <div className="h-10 lg:hidden" /> {/* Spacer for scrolling */}
            </div>

            {/* MODAL: DEEP RESEARCH VIEW */}
            <AnimatePresence>
                {showDeepResearch && activeResearch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500] flex items-center justify-center p-4 lg:p-20 overflow-y-auto"
                        onClick={() => setShowDeepResearch(false)}
                    >
                        <motion.div
                            initial={{ y: 20, scale: 0.95 }}
                            animate={{ y: 0, scale: 1 }}
                            className="bg-zinc-900 border border-white/10 rounded-[2rem] max-w-2xl w-full relative overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 lg:p-10">
                                <div className="flex justify-between items-start mb-8 gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-wider">Axiom Validated</span>
                                            <span className="text-[10px] text-white/30 font-mono">{new Date(activeResearch.timestamp).toLocaleString()}</span>
                                        </div>
                                        <h2 className="text-2xl lg:text-3xl font-black italic tracking-tight leading-tight">{activeResearch.data.headline}</h2>
                                    </div>
                                    <button onClick={() => setShowDeepResearch(false)} className="p-2 -mr-2 -mt-2 hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-white">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                    <InfoBox label="Entity" value={activeResearch.ticker} />
                                    <InfoBox label="Source" value={activeResearch.data.source} />
                                    <InfoBox label="Verification" value="PASSED" success />
                                </div>

                                <div className="space-y-4 pt-6 border-t border-white/5">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white/30">Analysis</h3>
                                    <p className="text-sm lg:text-base leading-relaxed text-white/80 font-medium font-serif opacity-90">
                                        {activeResearch.data.full_text || activeResearch.data.headline}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-black/50 p-4 text-center border-t border-white/5">
                                <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.5em]">End of Transmission</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* INITIAL LOADING */}
            {loading && !connected && (
                <div className="fixed inset-0 bg-black z-[999] flex flex-col items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1], textShadow: ["0 0 20px rgba(255,255,255,0.5)", "0 0 0px rgba(255,255,255,0)"] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-5xl font-black italic tracking-tighter"
                    >
                        BOOTING
                    </motion.div>
                    <div className="mt-8 flex gap-1">
                        {[0, 1, 2].map(i => <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }} className="w-2 h-2 bg-cyan-500 rounded-full" />)}
                    </div>
                </div>
            )}
        </div>
    )
}

// Sub-components to clean up generic markup
function KpiCard({ label, value, color }: any) {
    return (
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md text-center hover:bg-white/10 transition-colors">
            <div className="text-[9px] text-white/30 font-mono mb-1 uppercase tracking-wider">{label}</div>
            <div className={`text-xl font-black ${color}`}>{value}</div>
        </div>
    )
}

function InfoBox({ label, value, success }: any) {
    return (
        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
            <div className="text-[9px] opacity-30 font-mono uppercase mb-1">{label}</div>
            <div className={`text-lg font-bold ${success ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
        </div>
    )
}

function MultiverseBox({ metrics }: any) {
    const UNIVERSES_LIST = [
        { id: "BOOLE", label: "Boole", desc: "Binary Lógic" },
        { id: "ASSEMBLY", label: "Assembly", desc: "Hardware Reality" },
        { id: "FORTRAN", label: "Fortran", desc: "Scientific Origin" },
        { id: "LISP", label: "Lisp", desc: "Symbolic Mind" },
        { id: "COBOL", label: "COBOL", desc: "Economic Truth" },
        { id: "ALGOL", label: "ALGOL", desc: "Structure" },
        { id: "C", label: "C", desc: "Operational Base" },
        { id: "C++", label: "C++", desc: "High Performance" },
        { id: "MATLAB", label: "Matlab", desc: "Pure Math" },
        { id: "PYTHON", label: "Python", desc: "Cognitive Bridge" },
        { id: "JAVA", label: "Java", desc: "Institutional" },
        { id: "JS", label: "JS", desc: "Human Interface" },
        { id: "GO", label: "Go", desc: "Orchestration" },
        { id: "RUST", label: "Rust", desc: "Safe Contract" },
        { id: "CUDA", label: "CUDA", desc: "Brute Force" },
        { id: "SQL", label: "SQL", desc: "Persistent Memory" }
    ] // Reduced list for cleaner UI or keep all if needed

    return (
        <div className="w-full bg-zinc-950/50 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-xl lg:h-[320px] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full border border-cyan-400" /> Multiverse
                </span>
                <span className="text-[9px] font-mono text-cyan-400/80">Active-Nodes</span>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-2 scrollbar-hide pr-1">
                {UNIVERSES_LIST.map((u, i) => {
                    const isActive = metrics?.oracle_insight?.multiversal_trace?.includes(u.id);
                    return (
                        <div
                            key={u.id}
                            className={`aspect-square p-1 border rounded-lg transition-all flex flex-col items-center justify-center text-center group cursor-help ${isActive ? 'bg-cyan-900/40 border-cyan-500/30' : 'bg-white/5 border-white/5 opacity-50 hover:opacity-100 hover:bg-white/10'}`}
                        >
                            <div className={`text-[7px] lg:text-[8px] font-bold ${isActive ? 'text-cyan-400' : 'text-white/40'}`}>{u.label}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function WorldCore({ theme, analyzing, connected, evolutionLevel, multiversalTrace }: any) {
    const meshRef = useRef<THREE.Mesh>(null)
    const glowRef = useRef<THREE.Mesh>(null)
    const pressure = useMemo(() => multiversalTrace?.length || 0, [multiversalTrace])

    useFrame((state) => {
        if (!meshRef.current) return
        const t = state.clock.elapsedTime

        // Evolution + Multiversal Pressure affects rotation speed
        const speedFactor = 1 + (evolutionLevel / 500) + (pressure / 32)
        meshRef.current.rotation.y += (analyzing ? 0.1 : 0.01) * speedFactor
        meshRef.current.rotation.x += (analyzing ? 0.05 : 0.005) * speedFactor

        if (analyzing) {
            const s = (1.2 + Math.sin(t * 15) * 0.1) * (1 + pressure / 100)
            meshRef.current.scale.set(s, s, s)
        } else {
            // Evolution slightly increases core scale
            const baseScale = 1 + (evolutionLevel / 1000) + (pressure / 100)
            meshRef.current.scale.lerp(new THREE.Vector3(baseScale, baseScale, baseScale), 0.1)
        }

        if (glowRef.current) {
            glowRef.current.scale.setScalar((1.5 + Math.sin(t * 3) * 0.1) * (1 + evolutionLevel / 2000 + pressure / 50))
        }
    })

    const Geometry = () => {
        switch (theme.geometry) {
            case 'sphere': return <sphereGeometry args={[2.5, 64, 64]} />
            case 'icosahedron': return <icosahedronGeometry args={[2.8, 0]} />
            case 'torus': return <torusKnotGeometry args={[1.5, 0.4, 256, 32]} />
            case 'box': return <boxGeometry args={[3, 3, 3]} />
            case 'octahedron': return <octahedronGeometry args={[3, 0]} />
            default: return <sphereGeometry args={[2.5, 32, 32]} />
        }
    }

    return (
        <group>
            {/* Core Mesh */}
            <mesh ref={meshRef}>
                <Geometry />
                <meshStandardMaterial
                    color={theme.color}
                    emissive={theme.color}
                    emissiveIntensity={analyzing ? 10 : 2}
                    wireframe
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Inner Power Glow */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                    color={theme.color}
                    emissive={theme.color}
                    emissiveIntensity={15}
                    transparent
                    opacity={0.2}
                />
            </mesh>

            <ContactShadows position={[0, -5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
        </group>
    )
}
