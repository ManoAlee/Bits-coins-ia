'use client';

import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import React, { Suspense, useEffect, useRef } from 'react';
import StockPlanet from '@/entities/stock/StockPlanet';
import StockDetailPanel from '@/features/chart-overlay/StockDetailPanel';
import { useUniverseStore } from '@/shared/store/useUniverseStore';
import { useNeuroState } from '@/shared/store/useNeuroState';
import IntelligenceInput from '@/components/dom/IntelligenceInput';
import ProceduralAudioEngine from '@/shared/audio/ProceduralAudioEngine';
import StaticVoidTerminal from '@/features/terminal/StaticVoidTerminal';

// Camera Controller Component with Parallax
function CameraController() {
    const { camera, controls, mouse } = useThree();
    const targetFocus = useUniverseStore((state) => state.cameraFocus);
    const isFocusMode = useUniverseStore((state) => state.isFocusMode);
    const { intensity } = useNeuroState();

    useFrame((state) => {
        if (isFocusMode) {
            const targetVec = new THREE.Vector3(...targetFocus);
            const offset = new THREE.Vector3(0, 2, 5);
            const finalPos = targetVec.clone().add(offset);
            camera.position.lerp(finalPos, 0.05);
            // @ts-ignore
            controls?.target.lerp(targetVec, 0.05);
        } else {
            // Subtle Parallax when not in focus mode
            const targetX = mouse.x * 2;
            const targetY = mouse.y * 2;
            camera.position.x += (targetX - camera.position.x) * 0.02;
            camera.position.y += (targetY - camera.position.y) * 0.02;
        }
    });

    return null;
}

export default function UniverseCanvas() {
    const { atmosphereColor, intensity, mood, pulseGlitch } = useNeuroState();
    const { universeItems, modality, setModality } = useUniverseStore();

    // Keyboard Shortcut for Void Mode (Ctrl+V)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'v') {
                pulseGlitch(800);
                setTimeout(() => setModality(modality === 'PROMETHEUS' ? 'VOID' : 'PROMETHEUS'), 300);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modality, setModality, pulseGlitch]);

    return (
        <div
            className="w-full h-screen relative overflow-hidden transition-colors duration-[2000ms]"
            style={{ backgroundColor: modality === 'VOID' ? '#000' : atmosphereColor }}
        >
            <ProceduralAudioEngine />
            <StaticVoidTerminal />

            {/* 3D Layer - Persistent but Hidden/Paused in VOID mode to prevent EffectComposer crashes */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${modality === 'PROMETHEUS' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <Canvas
                    dpr={[1, 2]}
                    camera={{ position: [0, 0, 15], fov: 45 }}
                    frameloop={modality === 'PROMETHEUS' ? 'always' : 'never'}
                >
                    <Suspense fallback={null}>
                        <fog attach="fog" args={[atmosphereColor, 10, 50]} />
                        <ambientLight intensity={0.2 + (intensity * 0.3)} />
                        <pointLight position={[10, 10, 10]} intensity={2} color={atmosphereColor} />

                        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                        <Environment preset="city" />

                        {/* The PROMETHEUS-X Financial Galaxy */}
                        {universeItems.map((stock) => (
                            <StockPlanet
                                key={stock.ticker}
                                ticker={stock.ticker}
                                price={stock.price}
                                changePercent={stock.change}
                                position={stock.pos as [number, number, number]}
                            />
                        ))}

                        <OrbitControls
                            enablePan={true}
                            enableZoom={true}
                            maxDistance={30}
                            minDistance={2}
                            makeDefault
                        />
                        <CameraController />

                        {modality === 'PROMETHEUS' && (
                            <EffectComposer>
                                <Bloom
                                    intensity={0.5 + (intensity * 1.5)}
                                    luminanceThreshold={0.2}
                                    luminanceSmoothing={0.9}
                                />
                                <Vignette darkness={0.5 + (intensity * 0.3)} offset={0.5} />
                            </EffectComposer>
                        )}
                    </Suspense>
                </Canvas>
            </div>

            {/* HUD Layer (Diegetic) */}
            {modality === 'PROMETHEUS' && (
                <div className="absolute inset-0 pointer-events-none">
                    {/* Logo / Rebrand */}
                    <div className="absolute top-6 left-8 pointer-events-auto">
                        <h1 className="text-2xl font-black tracking-[0.2em] text-white">
                            PROMETHEUS<span className="text-cyan-400">-X</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${mood === 'CALM' ? 'bg-cyan-500' :
                                mood === 'ANALYSING' ? 'bg-blue-500' :
                                    mood === 'ALERT' ? 'bg-amber-500' : 'bg-red-500'
                                }`} />
                            <p className="text-[10px] text-gray-400 font-mono tracking-widest">
                                {mood} // NEURO-BRIDGE ACTIVE
                            </p>
                        </div>
                    </div>

                    {/* Modality Toggles (Bunker Mode) */}
                    <div className="absolute top-6 right-8 pointer-events-auto">
                        <button
                            onClick={() => { pulseGlitch(800); setTimeout(() => setModality('VOID'), 300); }}
                            className="text-[10px] font-mono p-2 border border-white/10 bg-black/50 hover:bg-white/10 transition-colors text-gray-400 tracking-tighter"
                        >
                            COLLAPSE_TO_VOID [CTRL-V]
                        </button>
                    </div>

                    {/* Intelligence Terminal (Bottom) */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl pointer-events-auto">
                        <IntelligenceInput />
                    </div>

                    {/* Side Panels */}
                    <StockDetailPanel />

                    {/* Visual Stress FX */}
                    {intensity > 0.8 && (
                        <div className="absolute inset-0 pointer-events-none border-[20px] border-red-900/10 animate-pulse" />
                    )}
                </div>
            )}
        </div>
    );
}

