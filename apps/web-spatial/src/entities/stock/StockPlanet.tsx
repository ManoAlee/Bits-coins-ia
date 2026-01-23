'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Html, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useUniverseStore } from '@/shared/store/useUniverseStore';

interface StockPlanetProps {
    ticker: string;
    price: number;
    changePercent: number;
    position: [number, number, number];
}

export default function StockPlanet({ ticker, price, changePercent, position }: StockPlanetProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    // State from Store
    const setSelectedTicker = useUniverseStore((state) => state.setSelectedTicker);
    const setCameraFocus = useUniverseStore((state) => state.setCameraFocus);
    const selectedTicker = useUniverseStore((state) => state.selectedTicker);

    // Local interaction state
    const [hovered, setHovered] = useState(false);

    const isSelected = selectedTicker === ticker;
    const isPositive = changePercent >= 0;

    // Visual Logic: Color & Emissive
    const baseColor = isPositive ? '#10b981' : '#ef4444'; // Emerald vs Red
    const secondaryColor = isPositive ? '#34d399' : '#f87171';

    // Volatility calculation (Absolute change determines "stress")
    const stress = Math.min(Math.abs(changePercent) / 10, 1);

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();

        if (meshRef.current) {
            // Rotation Physics influenced by stress
            meshRef.current.rotation.y += delta * (0.2 + stress * 0.5);
            meshRef.current.rotation.z += delta * (stress * 0.1);

            // Scale Pulse on Select
            const targetScale = hovered || isSelected ? 1.5 : 1.0;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }

        if (ringRef.current) {
            ringRef.current.rotation.z += delta * 0.5;
            // Subtle tilt pulse
            ringRef.current.rotation.x = (Math.PI / 2) + Math.sin(time) * 0.1;
        }

        if (glowRef.current) {
            // Subtle outer pulse
            const pulse = 1.2 + Math.sin(time * 2) * 0.05;
            glowRef.current.scale.set(pulse, pulse, pulse);
        }
    });

    const handleClick = (e: any) => {
        e.stopPropagation();
        setSelectedTicker(ticker);
        setCameraFocus(position);
    };

    return (
        <group position={position}>
            <Float speed={2 + stress} rotationIntensity={0.5 + stress} floatIntensity={0.5 + stress}>
                {/* 1. CORE ENTITY */}
                <mesh
                    ref={meshRef}
                    onClick={handleClick}
                    onPointerOver={() => { if (typeof document !== 'undefined') document.body.style.cursor = 'pointer'; setHovered(true); }}
                    onPointerOut={() => { if (typeof document !== 'undefined') document.body.style.cursor = 'auto'; setHovered(false); }}
                >
                    <sphereGeometry args={[1, 64, 64]} />
                    <MeshDistortMaterial
                        color={baseColor}
                        emissive={baseColor}
                        emissiveIntensity={hovered || isSelected ? 1.5 : 0.4}
                        roughness={0.1}
                        metalness={0.9}
                        distort={0.2 + stress * 0.4}
                        speed={2 + stress * 2}
                    />
                </mesh>

                {/* 2. ATMOSPHERIC GLOW (Fresnel Effect Simulation) */}
                <mesh ref={glowRef}>
                    <sphereGeometry args={[1.1, 32, 32]} />
                    <meshBasicMaterial
                        color={secondaryColor}
                        transparent
                        opacity={0.15}
                        side={THREE.BackSide}
                    />
                </mesh>

                {/* 3. ORBITAL RING (Active on Hover/Select) */}
                {(hovered || isSelected) && (
                    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[1.6, 0.015, 16, 100]} />
                        <meshBasicMaterial color={baseColor} transparent opacity={0.6} />
                    </mesh>
                )}

                {/* 4. DATA LABELS (DOM-based Html) */}
                <Html
                    position={[0, 2, 0]}
                    center
                    distanceFactor={10}
                    className="pointer-events-none select-none"
                >
                    <div className="flex flex-col items-center">
                        <div className="text-white font-black text-xl tracking-tighter whitespace-nowrap bg-black/60 px-3 py-1 rounded-sm border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                            {ticker}
                        </div>
                        <div className={`mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/80 border ${isPositive ? 'text-emerald-400 border-emerald-500/30' : 'text-red-400 border-red-500/30'}`}>
                            {isPositive ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
                        </div>
                    </div>
                </Html>

                {/* Detailed Price Overlay */}
                {(hovered || isSelected) && (
                    <Html
                        position={[0, -2, 0]}
                        center
                        distanceFactor={10}
                        className="pointer-events-none select-none"
                    >
                        <div className="text-[12px] font-mono whitespace-nowrap px-3 py-1 rounded bg-black/80 border border-white/5 text-gray-300 backdrop-blur-md">
                            PRICE_STK: <span className="text-white">${price.toLocaleString()}</span>
                        </div>
                    </Html>
                )}
            </Float>
        </group>
    );
}
