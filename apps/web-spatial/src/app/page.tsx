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
        <div className="w-screen h-screen bg-black overflow-hidden relative text-white font-sans selection:bg-white/20">
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
                className="absolute inset-0 pointer-events-none"
            />
            {/* DIMENSIONAL VIEWPORT */}
            <div className="absolute inset-0">
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

            {/* EVOLUTIONARY HUD: LEFT PANEL (DIMENSION CONTROL & LOGS) */}
            <div className="absolute left-0 top-0 bottom-0 w-[450px] p-8 flex flex-col justify-between pointer-events-none z-10">
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        mass: 1
                    }}
                    className="pointer-events-auto"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_15px_green]' : 'bg-red-500'} animate-pulse`} />
                        <h1 className="text-4xl font-black tracking-tighter italic">REALITY.<span className="opacity-40">ENGINE</span></h1>
                    </div>
                    <div className="flex gap-2 ml-7 mt-1">
                        <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest bg-cyan-400/10 px-2 py-0.5 rounded">Evolution Lvl {evolutionLevel}</span>
                        <p className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em]">Alpha Adaptive</p>
                    </div>

                    <div className="mt-12 space-y-2">
                        <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest pl-1">Target Dimension</div>
                        <div className="flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                            {Object.keys(THEMES).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSelectedTicker(t)}
                                    className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all ${selectedTicker === t ? 'bg-white text-black shadow-2xl' : 'text-white/40 hover:bg-white/5'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="pointer-events-auto"
                >
                    <div className="w-full bg-black/60 border border-white/10 rounded-3xl p-6 backdrop-blur-3xl shadow-2xl h-80 flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full border border-cyan-400" /> Multiverse Explorer
                            </span>
                            <span className="text-[9px] font-mono text-cyan-400/80">32_DIMENSIONS</span>
                        </div>
                        <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-2 scrollbar-hide pr-2">
                            {UNIVERSES.map((u, i) => {
                                const isActive = metrics?.oracle_insight?.multiversal_trace?.includes(u.id);
                                return (
                                    <div
                                        key={u.id}
                                        className={`p-2 border rounded-lg transition-all flex flex-col items-center justify-center text-center group cursor-help ${isActive ? 'bg-cyan-400/20 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-white/5 border-white/5 opacity-40'}`}
                                    >
                                        <div className={`text-[8px] font-bold ${isActive ? 'text-cyan-400' : 'text-white/40'}`}>{u.label}</div>
                                        <div className="text-[5px] uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity absolute bg-black/90 p-1 rounded z-50 pointer-events-none">
                                            {u.desc}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* EVOLUTIONARY HUD: RIGHT PANEL (STATS & RESEARCH) */}
            <div className="absolute right-0 top-0 bottom-0 w-[450px] p-8 flex flex-col justify-between pointer-events-none z-10">
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="pointer-events-auto space-y-4"
                >
                    <div className="p-8 bg-black/40 border border-white/10 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                            <span className="text-[40px] font-serif italic font-light italic">(λ)</span>
                        </div>
                        <div className="text-[10px] text-white/30 font-mono mb-1 uppercase tracking-widest">Symbolic Wealth Map</div>
                        <div className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
                            ${portfolio?.balance_usd?.toLocaleString() || '0.00'}
                        </div>
                        <div className="mt-8 space-y-2">
                            {portfolio?.assets?.map((asset: any) => (
                                <div key={asset.ticker} className="flex items-center text-[10px] group/item p-2 hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/5">
                                    <span className="w-12 opacity-30 font-mono font-bold">{asset.ticker}</span>
                                    <div className="flex-1 h-[1px] bg-white/5 group-hover/item:bg-white/20 transition-all mx-4" />
                                    <span className="font-bold tabular-nums text-white/80 group-hover/item:text-white">${asset.value_usd.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* METRIC GRIDS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl text-center hover:bg-white/10 transition-all cursor-crosshair">
                            <div className="text-[9px] text-white/30 font-mono mb-1 uppercase">Accuracy</div>
                            <div className="text-2xl font-black text-green-400">{(metrics?.today?.accuracy || 75.0).toFixed(1)}%</div>
                        </div>
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl text-center hover:bg-white/10 transition-all cursor-crosshair">
                            <div className="text-[9px] text-white/30 font-mono mb-1 uppercase">Value Save</div>
                            <div className="text-2xl font-black text-yellow-500">+{metrics?.today?.time_saved_hours || 0}H</div>
                        </div>
                    </div>
                </motion.div>

                {/* ADAPTIVE RESEARCH PANEL */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pointer-events-auto"
                >
                    <div className="bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-3xl overflow-hidden h-[380px] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Research Intelligence</div>
                            <button
                                onClick={triggerDeepScan}
                                className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-bold hover:bg-purple-500/30 transition-all uppercase"
                            >
                                Initiate Scan
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
                            {metrics?.raw_intelligence?.research?.map((item: any, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => { setActiveResearch(item); setShowDeepResearch(true) }}
                                    className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between text-[8px] opacity-40 mb-2 font-mono">
                                        <span>{item.ticker} :: {item.category}</span>
                                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed group-hover:text-white transition-colors">{item.data.headline}</p>
                                    <div className="mt-2 text-[8px] text-purple-400 font-bold uppercase">Axiom Validated: {item.data.verification}</div>
                                </motion.div>
                            ))}
                            {(!metrics?.raw_intelligence?.research || metrics.raw_intelligence.research.length === 0) && (
                                <div className="text-center py-10 opacity-20 text-xs italic">Awaiting Dimensional Inputs...</div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* QUANTUM CHAT (BOTTOM CENTER) */}
            <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-6 pointer-events-none z-20">
                <div className="flex flex-col items-center gap-2">
                    <div className="px-4 py-1 bg-white text-black text-[9px] font-black uppercase tracking-[0.3em] rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        Convergent Intelligence
                    </div>
                    <div className="text-[10px] text-white/30 font-mono italic">"Speak to the Architect"</div>
                </div>

                <div className="w-[600px] flex gap-3 pointer-events-auto">
                    <form onSubmit={handleChat} className="flex-1 relative">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask about dimensional risks, price levels, or system axioms..."
                            className="w-full bg-black/80 border border-white/20 rounded-2xl py-5 px-8 text-sm focus:outline-none focus:border-white/60 transition-all backdrop-blur-3xl shadow-2xl font-medium"
                        />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-xl transition-all">
                            <svg className="w-5 h-5 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                        </button>
                    </form>
                </div>
            </div>

            {/* CHAT OVERLAY */}
            <AnimatePresence>
                {chatHistory.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[700px] max-h-48 overflow-y-auto bg-white/5 border border-white/10 backdrop-blur-3xl rounded-3xl p-6 pointer-events-auto shadow-2xl flex flex-col gap-4 scrollbar-hide"
                    >
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                <div className={`max-w-[80%] p-4 rounded-3xl text-sm ${msg.role === 'user' ? 'bg-white/10 border border-white/10' : 'bg-purple-500/20 border border-purple-500/30'}`}>
                                    <div className="text-[8px] opacity-30 font-black uppercase mb-1 tracking-widest">{msg.role}</div>
                                    <p className="leading-relaxed font-medium">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL: DEEP RESEARCH VIEW */}
            <AnimatePresence>
                {showDeepResearch && activeResearch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-20 cursor-pointer"
                        onClick={() => setShowDeepResearch(false)}
                    >
                        <motion.div
                            initial={{ y: 50, scale: 0.9 }}
                            animate={{ y: 0, scale: 1 }}
                            className="bg-zinc-900/50 border border-white/10 p-16 rounded-[4rem] max-w-4xl w-full max-h-full overflow-y-auto cursor-default pointer-events-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <div className="text-[10px] text-purple-400 font-black uppercase tracking-[0.5em] mb-4">Axiom-Validated Intelligence</div>
                                    <h2 className="text-5xl font-black italic tracking-tighter leading-none">{activeResearch.data.headline}</h2>
                                </div>
                                <button onClick={() => setShowDeepResearch(false)} className="p-4 hover:bg-white/5 rounded-full transition-all opacity-40">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-10 mb-16">
                                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                    <div className="text-[9px] opacity-30 font-mono uppercase mb-1">Entity</div>
                                    <div className="text-xl font-bold">{activeResearch.ticker}</div>
                                </div>
                                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                    <div className="text-[9px] opacity-30 font-mono uppercase mb-1">Source Filter</div>
                                    <div className="text-xl font-bold">{activeResearch.data.source}</div>
                                </div>
                                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                    <div className="text-[9px] opacity-30 font-mono uppercase mb-1">Verification</div>
                                    <div className="text-xl font-bold text-green-400">PASSED</div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h3 className="text-xl font-black uppercase tracking-widest text-white/40">Full Analysis</h3>
                                <p className="text-2xl leading-relaxed text-white/80 font-medium">
                                    {activeResearch.data.full_text || activeResearch.data.headline}
                                </p>
                            </div>

                            <div className="mt-20 pt-12 border-t border-white/5 text-center text-[10px] opacity-20 font-mono uppercase tracking-[1em]">
                                End of Logic Chain Transmission
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* INITIAL LOADING */}
            {loading && !connected && (
                <div className="absolute inset-0 bg-black flex items-center justify-center z-[200]">
                    <div className="text-center">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-4xl font-black italic tracking-tighter"
                        >
                            BOOTING.REALITY
                        </motion.div>
                        <div className="text-[10px] font-mono text-cyan-400/40 uppercase tracking-[1em] mt-4">Synthesizing World Layers...</div>
                    </div>
                </div>
            )}
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
