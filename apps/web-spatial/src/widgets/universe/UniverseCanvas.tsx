'use client';

import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Html, PerspectiveCamera, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import StockPlanet from '@/entities/stock/StockPlanet';
import StockDetailPanel from '@/features/chart-overlay/StockDetailPanel';
import { useUniverseStore } from '@/shared/store/useUniverseStore';
import { useNeuroState } from '@/shared/store/useNeuroState';
import IntelligenceInput from '@/components/dom/IntelligenceInput';
import ProceduralAudioEngine from '@/shared/audio/ProceduralAudioEngine';
import StaticVoidTerminal from '@/features/terminal/StaticVoidTerminal';
import DashboardLayout from '@/features/dashboard/DashboardLayout';
import { AnimatePresence, motion } from 'framer-motion';

// Camera Controller Component with Parallax
function CameraController() {
    const { camera, controls, mouse } = useThree();
    const targetFocus = useUniverseStore((state) => state.cameraFocus);
    const isFocusMode = useUniverseStore((state) => state.isFocusMode);
    const { intensity } = useNeuroState();

    useFrame((state) => {
        if (isFocusMode && targetFocus) {
            const targetVec = new THREE.Vector3(...(targetFocus as [number, number, number]));
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
    const [pulseActive, setPulseActive] = useState(false);

    // Keyboard Shortcut for Void Mode (Ctrl+V)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'v') {
                triggerTransition();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modality, setModality, pulseGlitch]);

    const triggerTransition = () => {
        setPulseActive(true);
        pulseGlitch(1000);
        setTimeout(() => {
            setModality(modality === 'PROMETHEUS' ? 'VOID' : 'PROMETHEUS');
        }, 400);
        setTimeout(() => setPulseActive(false), 1200);
    };

    return (
        <div
            className="w-full h-screen relative overflow-hidden transition-colors duration-[2000ms]"
            style={{ backgroundColor: modality === 'VOID' ? '#000' : atmosphereColor }}
        >
            <ProceduralAudioEngine />
            <StaticVoidTerminal />

            {/* Global Transition Pulse */}
            <AnimatePresence>
                {pulseActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, times: [0, 0.2, 0.8, 1] }}
                        className="absolute inset-0 z-[1000] pointer-events-none bg-white/20 backdrop-blur-md"
                    />
                )}
            </AnimatePresence>

            {/* 3D Layer */}
            <div className={`absolute inset-0 transition-opacity duration-700 ${modality === 'PROMETHEUS' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <Canvas
                    dpr={1}
                    camera={{ position: [0, 0, 15], fov: 45 }}
                    frameloop="always"
                    gl={{
                        powerPreference: 'high-performance',
                        antialias: false,
                        stencil: false,
                        depth: true,
                        alpha: true,
                        failIfMajorPerformanceCaveat: true
                    }}
                >
                    <Suspense fallback={null}>
                        <SceneContent intensity={intensity} atmosphereColor={atmosphereColor} universeItems={universeItems} />
                    </Suspense>

                    {/*
                        DEFENSIVE VISION LAYER:
                        Consolidated, memoized post-processing.
                    */}
                    <PostProcessingLayer />
                    <Preload all />
                </Canvas>
            </div>

            {/* FUNCTIONAL COCKPIT LAYER */}
            {modality === 'PROMETHEUS' && (
                <DashboardLayout>
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
                                onClick={triggerTransition}
                                className="text-[10px] font-mono p-2 border border-white/10 bg-black/50 hover:bg-white/10 transition-colors text-gray-400 tracking-tighter"
                            >
                                COLLAPSE_TO_VOID [CTRL-V]
                            </button>
                        </div>

                        {/* Intelligence Terminal - Global Access */}
                        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-2xl pointer-events-auto z-50">
                            <IntelligenceInput />
                        </div>

                        {/* Side Panels - Global Access */}
                        <StockDetailPanel />

                        {/* Visual Stress FX */}
                        {intensity > 0.8 && (
                            <div className="absolute inset-0 pointer-events-none border-[20px] border-red-900/10 animate-pulse" />
                        )}
                    </div>
                </DashboardLayout>
            )}
        </div>
    );
}

/**
 * SCENE CONTENT: Memoized 3D Scene to prevent re-reconciling assets during effect updates.
 */
interface SceneContentProps {
    intensity: number;
    atmosphereColor: string;
    universeItems: any[]; // Kept as any[] for store compatibility
}

const SceneContent = React.memo(({ intensity, atmosphereColor, universeItems }: SceneContentProps) => {
    return (
        <>
            <fog attach="fog" args={[atmosphereColor, 10, 50]} />
            <ambientLight intensity={0.2 + (intensity * 0.3)} />
            <pointLight position={[10, 10, 10]} intensity={2} color={atmosphereColor} />
            <group>
                <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
                <Environment preset="city" />

                {/* The PROMETHEUS-X Financial Galaxy */}
                {Array.isArray(universeItems) && universeItems.filter(Boolean).map((stock: any) => (
                    <StockPlanet
                        key={stock?.ticker || Math.random().toString()}
                        ticker={stock?.ticker}
                        price={stock?.price}
                        changePercent={stock?.change}
                        position={stock?.pos || [0, 0, 0]}
                    />
                ))}
            </group>
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                maxDistance={30}
                minDistance={2}
                makeDefault
            />
            <CameraController />
        </>
    );
});

/**
 * POST PROCESSING LAYER: Prop-less Static Shell.
 * This component tree NEVER changes. Parameters are driven via refs in useFrame.
 */
const PostProcessingLayer = React.memo(() => {
    const bloomRef = useRef<any>(null);
    const noiseRef = useRef<any>(null);
    const vignetteRef = useRef<any>(null);

    useFrame(() => {
        // Pull state directly from stores inside the loop
        const modality = useUniverseStore.getState().modality;
        const items = useUniverseStore.getState().universeItems;
        const neuroIntensity = useNeuroState.getState().intensity;

        const active = modality === 'PROMETHEUS';
        // Calculate a safe average or current intensity
        const combinedIntensity = neuroIntensity;

        if (bloomRef.current) {
            bloomRef.current.intensity = active ? (0.5 + (combinedIntensity * 1.5)) : 0;
        }
        if (noiseRef.current) {
            noiseRef.current.opacity = (active && combinedIntensity > 0.7) ? combinedIntensity * 0.2 : 0;
        }
        if (vignetteRef.current) {
            vignetteRef.current.darkness = active ? 0.5 : 0;
        }
    });

    return (
        <EffectComposer multisampling={0}>
            <Bloom
                ref={bloomRef}
                luminanceThreshold={0.5}
                luminanceSmoothing={0.9}
                mipmapBlur={false}
            />
            <Vignette ref={vignetteRef} eskil={false} offset={0.5} />
        </EffectComposer>
    );
});

