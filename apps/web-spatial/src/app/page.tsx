import dynamic from 'next/dynamic';

// Dynamically import the Scene to avoid SSR issues with R3F
const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false });
const MarketGlobe = dynamic(() => import('@/components/canvas/MarketGlobe'), { ssr: false });
const DataParticles = dynamic(() => import('@/components/canvas/DataParticles'), { ssr: false });
const IntelligenceTerminal = dynamic(() => import('@/components/dom/IntelligenceTerminal'), { ssr: false });
const IntelligenceInput = dynamic(() => import('@/components/dom/IntelligenceInput'), { ssr: false });


export default function Home() {
    return (
        <main className="relative w-full h-screen bg-slate-950 overflow-hidden text-white">

            {/* 3D LAYER (The Spatial Web) */}
            <div className="absolute inset-0 z-0">
                <Scene className="w-full h-full">
                    <ambientLight intensity={1} />
                    <pointLight position={[10, 10, 10]} intensity={2} color="#4f46e5" />
                    <DataParticles count={300} />
                    <MarketGlobe />
                </Scene>
            </div>

            {/* UI LAYER (The HUD) */}
            <div className="absolute inset-0 z-10 pointer-events-none p-8 flex flex-col justify-between">

                {/* Header */}
                <header className="flex justify-between items-start pointer-events-auto">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                            BITS.COINS
                        </h1>
                        <p className="text-sm font-mono text-cyan-200/50 uppercase tracking-widest mt-1">
                            Omni-Protocol Active
                        </p>
                    </div>

                    <div className="bg-black/50 border border-white/10 p-4 rounded-lg backdrop-blur-sm font-mono text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>SYSTEM: ONLINE</span>
                        </div>
                        <div className="text-gray-400 mt-1">
                            LATTICE: STABLE
                        </div>
                    </div>
                </header>

                {/* Footer / Control Panel */}
                <footer className="pointer-events-auto">
                    <div className="bg-black/50 border border-white/10 p-6 rounded-lg backdrop-blur-sm max-w-md">
                        <h2 className="text-sm font-bold border-b border-white/10 pb-2 mb-2">QUANTUM LOG</h2>
                        <ul className="space-y-1 font-mono text-xs text-gray-300">
                            <li className="flex justify-between">
                                <span>&gt; CORE AGENTS</span>
                                <span className="text-emerald-400">CONNECTED</span>
                            </li>
                            <li className="flex justify-between">
                                <span>&gt; UAV PROTOCOL</span>
                                <span className="text-emerald-400">ENFORCING</span>
                            </li>
                            <li className="flex justify-between">
                                <span>&gt; SPATIAL RENDERER</span>
                                <span className="text-emerald-400">R3F INSTANTIATED</span>
                            </li>
                        </ul>
                    </div>
                </footer>

                {/* Intelligence Layer */}
                <div className="absolute bottom-10 left-0 right-0 z-50 flex flex-col items-center">
                    <IntelligenceTerminal />
                    <IntelligenceInput />
                </div>

            </div>
        </main>
    );
}
