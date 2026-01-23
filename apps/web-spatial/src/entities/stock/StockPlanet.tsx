'use client';

import { useRef, useState } from 'react';
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
                    onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
                    onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
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

                {/* Ticker Label (Billboard) */}
                <Text
                    ref={textRef as any}
                    position={[0, 1.5, 0]}
                    fontSize={0.5}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/Inter-Bold.woff" // Ensure font exists or fallback
                >
                    {ticker}
                </Text>

                {/* Price Subtitle */}
                {(hovered || isSelected) && (
                    <Text
                        position={[0, -1.5, 0]}
                        fontSize={0.3}
                        color={isPositive ? '#6ee7b7' : '#fca5a5'}
                        anchorX="center"
                        anchorY="middle"
                    >
                        ${price.toFixed(2)} ({changePercent}%)
                    </Text>
                )}
            </Float>
        </group>
    );
}
