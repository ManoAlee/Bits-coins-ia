'use client';

import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense, useEffect, useRef } from 'react';
import StockPlanet from '@/entities/stock/StockPlanet';
import StockDetailPanel from '@/features/chart-overlay/StockDetailPanel';
import { useUniverseStore } from '@/shared/store/useUniverseStore';
import IntelligenceInput from '@/components/dom/IntelligenceInput';

// Camera Controller Component
function CameraController() {
    const { camera, controls } = useThree();
    const targetFocus = useUniverseStore((state) => state.cameraFocus);
    const isFocusMode = useUniverseStore((state) => state.isFocusMode);

    useFrame(() => {
        if (isFocusMode) {
            const targetVec = new THREE.Vector3(...targetFocus);
            // Move camera slightly offset from target
            const offset = new THREE.Vector3(0, 2, 5);
            const finalPos = targetVec.clone().add(offset);

            camera.position.lerp(finalPos, 0.05);
            // @ts-ignore
            controls?.target.lerp(targetVec, 0.05);
        }
    });

    return null;
}

// Mock Universe Data
const UNIVERSE_DATA = [
    { ticker: 'BTC', price: 65000, change: 5.2, pos: [0, 0, 0] },
    { ticker: 'ETH', price: 3500, change: 2.1, pos: [5, 2, -5] },
    { ticker: 'NVDA', price: 950, change: 12.5, pos: [-5, -2, -5] },
    { ticker: 'TSLA', price: 175, change: -3.4, pos: [8, -4, 2] },
    { ticker: 'MSTR', price: 1500, change: 15.0, pos: [-8, 4, 3] },
];

export default function UniverseCanvas() {
    return (
        <div className="w-full h-screen bg-black relative overflow-hidden">
            {/* 3D Layer */}
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 15], fov: 45 }}>
                <Suspense fallback={null}>
                    <fog attach="fog" args={['#000', 10, 50]} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={2} color="#4f46e5" />

                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Environment preset="city" />

                    {/* The Financial Galaxy */}
                    {UNIVERSE_DATA.map((stock, idx) => (
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
                </Suspense>
            </Canvas>

            {/* HUD Layer (Diegetic) */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Logo */}
                <div className="absolute top-6 left-8 pointer-events-auto">
                    <h1 className="text-2xl font-black tracking-[0.2em] text-white">
                        BITS<span className="text-cyan-400">.COINS</span>
                    </h1>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest pl-1">
                        SPATIAL INTELLIGENCE // APEX KERNEL
                    </p>
                </div>

                {/* Intelligence Terminal (Bottom) */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl pointer-events-auto">
                    <IntelligenceInput />
                </div>

                {/* Side Panels */}
                <StockDetailPanel />
            </div>
        </div>
    );
}
