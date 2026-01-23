'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUniverseStore } from '@/shared/store/useUniverseStore';
import { useNeuroState } from '@/shared/store/useNeuroState';

/**
 * STATIC-VOID TERMINAL
 * The brutalist, high-efficiency interface for PROMETHEUS-X.
 * Zero bloom. Zero depth. Total control.
 */
export default function StaticVoidTerminal() {
    const { modality, setModality, universeItems } = useUniverseStore();
    const { pulseGlitch } = useNeuroState();
    const [logs, setLogs] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (modality === 'VOID') {
            const initialLogs = [
                '>> STATIC-VOID KERNEL v4.0.0 LOADED',
                '>> SYSTEM STATUS: STABLE',
                '>> LATENCY: 0.001ms',
                '>> PROTOCOL: BRUTALIST_EFFICIENCY_ACTIVE',
                '>> TYPE "exit" TO RESTORE HYPER-REALITY',
                '----------------------------------------',
                ...universeItems.map(p => `[DATA] ${p.ticker}: $${p.price.toFixed(2)} | CHG: ${p.change}%`)
            ];
            setLogs(initialLogs);
        }
    }, [modality, universeItems]);

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input.trim().toLowerCase();

        if (cmd === 'exit' || cmd === 'prometheus') {
            pulseGlitch(800);
            setTimeout(() => setModality('PROMETHEUS'), 300);
        } else if (cmd === 'clear') {
            setLogs(['>> CONSOLE CLEARED']);
        } else {
            setLogs(prev => [...prev, `> ${input}`, `!! COMMAND NOT RECOGNIZED: "${cmd}"`]);
        }

        setInput('');
    };

    if (modality !== 'VOID') return null;

    return (
        <div className="fixed inset-0 bg-black z-[100] p-8 font-mono text-[#00ff00] overflow-hidden flex flex-col">
            {/* ASCII Header */}
            <pre className="text-[10px] leading-tight mb-8 text-[#008800]">
                {`
   _____ _______       _______ _____ _____     __      ______ _____ _____  
  / ____|__   __|\\   /|__   __|_   _/ ____|    \\ \\    / / __ \\_   _|  __ \\ 
 | (___    | |   \\ \\_/ /   | |    | || |          \\ \\  / / |  | || | | |  | |
  \\___ \\   | |    \\   /    | |    | || |           \\ \\/ /| |  | || | | |  | |
  ____) |  | |     | |     | |   _| || |____        \\  / | |__| || |_| |__| |
 |_____/   |_|     |_|     |_|  |_____\\_____|        \\/   \\____/_____|_____/ 
                                                                               
`}
            </pre>

            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto space-y-1 mb-4 custom-scrollbar"
            >
                {logs.map((log, i) => (
                    <div key={i} className={log.startsWith('!!') ? 'text-red-500' : ''}>
                        {log}
                    </div>
                ))}
                <div className="flex gap-2">
                    <span className="animate-pulse">_</span>
                </div>
            </div>

            <form onSubmit={handleCommand} className="flex gap-4 items-center border-t border-[#004400] pt-4">
                <span className="text-[#00aa00]">PROMETHEUS@VOID:~$</span>
                <input
                    autoFocus
                    className="bg-transparent outline-none flex-1 text-[#00ff00]"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoComplete="off"
                    spellCheck="false"
                />
            </form>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #001100;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #004400;
                }
            `}</style>
        </div>
    );
}
