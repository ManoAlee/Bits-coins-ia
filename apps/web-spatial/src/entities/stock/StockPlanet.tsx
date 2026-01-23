'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Text, Float, Html } from '@react-three/drei';
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
    const textRef = useRef<THREE.Mesh>(null);

    // State from Store
    const setSelectedTicker = useUniverseStore((state) => state.setSelectedTicker);
    const setCameraFocus = useUniverseStore((state) => state.setCameraFocus);
    const selectedTicker = useUniverseStore((state) => state.selectedTicker);

    // Local interaction state
    const [hovered, setHovered] = useState(false);

    const isSelected = selectedTicker === ticker;
    const isPositive = changePercent >= 0;

    // Visual Logic: Color & Emissive
    const color = isPositive ? '#10b981' : '#ef4444'; // Emerald vs Red
    const emissiveIntensity = hovered || isSelected ? 2 : 0.5;

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Rotation Physics
            meshRef.current.rotation.y += delta * 0.2;

            // Scale Pulse on Select
            const targetScale = hovered || isSelected ? 1.5 : 1.0;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }
    });

    const handleClick = (e: any) => {
        e.stopPropagation();
        setSelectedTicker(ticker);
        setCameraFocus(position);
    };

    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh
                    ref={meshRef}
                    onClick={handleClick}
                    onPointerOver={() => { if (typeof document !== 'undefined') document.body.style.cursor = 'pointer'; setHovered(true); }}
                    onPointerOut={() => { if (typeof document !== 'undefined') document.body.style.cursor = 'auto'; setHovered(false); }}
                >
                    <sphereGeometry args={[1, 32, 32]} />
                    <MeshDistortMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={emissiveIntensity}
                        roughness={0.1}
                        metalness={0.8}
                        distort={0.3}
                        speed={2}
                    />
                </mesh>

                {/* Ticker Label (DOM-based Html) */}
                <Html
                    position={[0, 1.5, 0]}
                    center
                    distanceFactor={10}
                    className="pointer-events-none select-none"
                >
                    <div className="text-white font-bold text-lg whitespace-nowrap bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                        {ticker}
                    </div>
                </Html>

                {/* Price Subtitle */}
                {(hovered || isSelected) && (
                    <Html
                        position={[0, -1.5, 0]}
                        center
                        distanceFactor={10}
                        className="pointer-events-none select-none"
                    >
                        <div className={`text-sm font-mono whitespace-nowrap px-2 py-0.5 rounded bg-black/60 ${isPositive ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                            ${price.toFixed(2)} ({changePercent}%)
                        </div>
                    </Html>
                )}
            </Float>
        </group>
    );
}
