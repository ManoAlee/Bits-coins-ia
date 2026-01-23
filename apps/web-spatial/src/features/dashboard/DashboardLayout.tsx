'use client';

import { useState } from 'react';
import Dock from './Dock';
import MarketGrid from './MarketGrid';
import WealthCore from './WealthCore';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
    children?: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="absolute inset-0 pointer-events-none z-40">
            {/* The Dock is always accessible */}
            <div className="pointer-events-auto">
                <Dock activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* OVERVIEW MODE: Show the HUD passed as children */}
            <AnimatePresence>
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FUNCTIONAL MODES: Glassmorphic Overlay */}
            <AnimatePresence mode="wait">
                {activeTab !== 'overview' && (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute inset-0 pointer-events-none flex items-center justify-center p-8 pb-32"
                    >
                        <div className="pointer-events-auto w-full max-w-7xl h-full bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative group">

                            {/* Cinematic Border Glow */}
                            <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none" />
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

                            {/* Header / Breadcrumb */}
                            <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-black text-white/90 tracking-widest uppercase font-mono">
                                        // {activeTab}
                                    </h2>
                                    <div className="h-4 w-[1px] bg-white/10" />
                                    <span className="text-xs text-cyan-400 font-mono tracking-widest animate-pulse">
                                        LIVE DATA STREAM
                                    </span>
                                </div>
                                <div className="text-[10px] font-mono text-gray-500">
                                    SYS.VER.5.0.0
                                </div>
                            </div>

                            {/* Content Injection Zone */}
                            <div className="flex-1 p-8 overflow-auto scrollbar-hide">
                                {activeTab === 'market' && <MarketGrid />}
                                {activeTab === 'wealth' && <WealthCore />}

                                {/* Fallback for other tabs */}
                                {['market', 'wealth'].indexOf(activeTab) === -1 && (
                                    <div className="flex items-center justify-center h-full text-white/20 font-mono text-sm tracking-widest border border-dashed border-white/10 rounded-xl">
                                        MODULE_UNDER_CONSTRUCTION :: {activeTab.toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
