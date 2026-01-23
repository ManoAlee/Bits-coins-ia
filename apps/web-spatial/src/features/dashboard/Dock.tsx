'use client';

import { useState } from 'react';
import {
    LayoutDashboard,
    LineChart,
    Wallet,
    Newspaper,
    Settings,
    Activity
} from 'lucide-react';

interface DockProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function Dock({ activeTab, onTabChange }: DockProps) {
    const items = [
        { id: 'overview', icon: LayoutDashboard, label: 'OVERVIEW' },
        { id: 'market', icon: LineChart, label: 'MARKET' },
        { id: 'wealth', icon: Wallet, label: 'WEALTH' },
        { id: 'news', icon: Newspaper, label: 'INTEL' },
        { id: 'settings', icon: Settings, label: 'SYSTEM' },
    ];

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 p-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ring-1 ring-white/5">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`
                                relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300
                                ${isActive
                                    ? 'bg-cyan-500/20 text-cyan-400 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5 hover:scale-105'
                                }
                            `}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />

                            {/* Tooltip */}
                            <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-black/90 text-white text-[10px] font-mono px-2 py-1 rounded border border-white/10 uppercase tracking-widest pointer-events-none">
                                {item.label}
                            </span>

                            {/* Active Indicator */}
                            {isActive && (
                                <span className="absolute -bottom-1 w-1 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]" />
                            )}
                        </button>
                    );
                })}

                {/* Separator */}
                <div className="w-[1px] h-8 bg-white/10 mx-2" />

                {/* System Status */}
                <div className="flex flex-col items-center justify-center w-12 h-12">
                    <Activity size={16} className="text-emerald-500 animate-pulse" />
                    <span className="text-[8px] text-emerald-500/50 font-mono mt-1">ON</span>
                </div>
            </div>
        </div>
    );
}
