import { useThree, useFrame, extend } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

extend({ EffectComposer, RenderPass, UnrealBloomPass, OutputPass });

interface ManualEffectsProps {
    intensity: number;
}

export default function ManualEffects({ intensity }: ManualEffectsProps) {
    const { gl, scene, camera, size } = useThree();

    // Create composer once
    const composer = useMemo(() => {
        const cmp = new EffectComposer(gl);
        return cmp;
    }, [gl]);

    // Update size
    useEffect(() => {
        composer.setSize(size.width, size.height);
        composer.setPixelRatio(gl.getPixelRatio());
    }, [composer, size, gl]);

    // Manage Passes
    useEffect(() => {
        // Clear existing passes
        // @ts-ignore - accessing internal array safely
        composer.passes = [];

        const renderPass = new RenderPass(scene, camera);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(size.width, size.height),
            0.5 + (intensity * 1.5), // strength
            0.9, // radius
            0.2 // threshold
        );

        // Ensure proper color management output
        const outputPass = new OutputPass();

        composer.addPass(renderPass);
        composer.addPass(bloomPass);
        composer.addPass(outputPass);

        return () => {
            // @ts-ignore
            composer.passes = [];
        };
    }, [composer, scene, camera, intensity, size]);

    // Render Loop - Priority 1 to run after other updates, taking over the render cycle
    useFrame(() => {
        composer.render();
    }, 1);

    return null;
}
