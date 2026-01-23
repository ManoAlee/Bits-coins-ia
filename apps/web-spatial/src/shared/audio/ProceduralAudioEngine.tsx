'use client';

import { useEffect, useRef } from 'react';
import { useNeuroState } from '../store/useNeuroState';

/**
 * PROMETHEUS-X PROCEDURAL AUDIO ENGINE
 * Generates real-time, data-driven synthesis using Web Audio API.
 * Shielded for SSR and Worker safety.
 */

export default function ProceduralAudioEngine() {
    const { mood, intensity } = useNeuroState();
    const audioContext = useRef<AudioContext | null>(null);
    const mainHum = useRef<OscillatorNode | null>(null);
    const filter = useRef<BiquadFilterNode | null>(null);
    const gainNode = useRef<GainNode | null>(null);

    useEffect(() => {
        // Double shield for SSR
        if (typeof window === 'undefined') return;

        const initAudio = () => {
            if (audioContext.current) return;

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;

            audioContext.current = new AudioContextClass();

            // 1. Setup Gain (Master Volume)
            gainNode.current = audioContext.current.createGain();
            gainNode.current.gain.setValueAtTime(0, audioContext.current.currentTime);
            gainNode.current.connect(audioContext.current.destination);

            // 2. Setup Lowpass Filter (The "Muffled" effect)
            filter.current = audioContext.current.createBiquadFilter();
            filter.current.type = 'lowpass';
            filter.current.frequency.setValueAtTime(200, audioContext.current.currentTime);
            filter.current.connect(gainNode.current);

            // 3. Create Main Background Hum (Drone)
            mainHum.current = audioContext.current.createOscillator();
            mainHum.current.type = 'sawtooth';
            mainHum.current.frequency.setValueAtTime(45, audioContext.current.currentTime); // Low bass hum
            mainHum.current.connect(filter.current);
            mainHum.current.start();

            // Fade in gently
            gainNode.current.gain.exponentialRampToValueAtTime(0.05, audioContext.current.currentTime + 3);
        };

        const handleInteraction = () => {
            initAudio();
            document.removeEventListener('click', handleInteraction);
        };

        document.addEventListener('click', handleInteraction);

        return () => {
            document.removeEventListener('click', handleInteraction);
            if (audioContext.current) audioContext.current.close();
        };
    }, []);

    // React to Mood/Intensity changes
    useEffect(() => {
        // Shield for SSR and context presence
        if (typeof window === 'undefined' || !audioContext.current || !mainHum.current || !filter.current || !gainNode.current) return;

        const now = audioContext.current.currentTime;

        // Map intensity to filter frequency (Analysing/Alert means more "High End" noise)
        const targetFreq = 200 + (intensity * 800);
        filter.current.frequency.exponentialRampToValueAtTime(targetFreq, now + 1);

        // Map intensity to oscillator pitch (Tension increase)
        const targetPitch = 45 + (intensity * 15);
        mainHum.current.frequency.exponentialRampToValueAtTime(targetPitch, now + 1);

        // Map mood to gain (Higher volume for ALERT/CRITICAL)
        const targetGain = mood === 'CALM' ? 0.05 : mood === 'ANALYSING' ? 0.08 : 0.12;
        gainNode.current.gain.linearRampToValueAtTime(targetGain, now + 0.5);

    }, [mood, intensity]);

    return null; // Silent component
}
