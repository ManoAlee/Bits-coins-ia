'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { Html, Ring, Sphere, MeshDistortMaterial } from '@react-three/drei';

export default function MarketGlobe() {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Rotation Animation
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime / 2) * 0.1;
        }
    });

    return (
        <group>
            {/* The Singularity Core */}
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                scale={hovered ? 1.5 : 1.2}
            >
                {/* Distorted Liquid Metal Look */}
                <sphereGeometry args={[1.5, 64, 64]} />
                <MeshDistortMaterial
                    color={hovered ? '#4f46e5' : '#1e1b4b'} // Deep Indigo -> Bright Indigo
                    envMapIntensity={1}
                    clearcoat={1}
                    clearcoatRoughness={0}
                    metalness={0.9}
                    roughness={0.1}
                    distort={0.4} // Warping effect
                    speed={2}     // Fast liquid movement
                />

                {hovered && (
                    <Html distanceFactor={10} center>
                        <div className="bg-black/80 text-cyan-400 p-3 rounded backdrop-blur-md border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)] whitespace-nowrap">
                            <h3 className="font-bold text-sm tracking-widest">SINGULARITY</h3>
                            <p className="text-[10px] text-gray-400 font-mono">STATUS: EXPANDING</p>
                        </div>
                    </Html>
                )}
            </mesh>

            {/* Orbital Rings representing Data Streams */}
            <Ring args={[2.5, 2.55, 64]} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} side={THREE.DoubleSide} />
            </Ring>
            <Ring args={[3.2, 3.22, 64]} rotation={[Math.PI / 1.5, 0, 0]}>
                <meshBasicMaterial color="#ec4899" transparent opacity={0.2} side={THREE.DoubleSide} />
            </Ring>


        </group>
    );
}

