import { create } from 'zustand';

/**
 * PROMETHEUS-X NEURO-STATE
 * The central nervous system for sensory orchestration.
 * Manages the "mood" of the interface based on data urgency and AI state.
 */

export type NeuroMood = 'CALM' | 'ANALYSING' | 'ALERT' | 'CRITICAL';

interface NeuroState {
    mood: NeuroMood;
    intensity: number; // 0 to 1
    focus: number;     // 0 to 1 (controls blur/depth of field)
    glitchFactor: number; // 0 to 1 (controls visual distortion)

    // Derived colors for CSS/R3F integration
    atmosphereColor: string;

    // Actions
    setMood: (mood: NeuroMood) => void;
    setIntensity: (intensity: number) => void;
    setFocus: (focus: number) => void;
    pulseGlitch: (duration?: number) => void;
}

const moodColors: Record<NeuroMood, string> = {
    CALM: 'hsla(180, 50%, 10%, 1)',      // Soft Teal
    ANALYSING: 'hsla(210, 60%, 15%, 1)',  // Deep Electric Blue
    ALERT: 'hsla(35, 80%, 15%, 1)',       // Tense Amber
    CRITICAL: 'hsla(0, 90%, 15%, 1)',     // Crimson Terror
};

export const useNeuroState = create<NeuroState>((set) => ({
    mood: 'CALM',
    intensity: 0.2,
    focus: 0,
    glitchFactor: 0,
    atmosphereColor: moodColors.CALM,

    setMood: (mood) => set({
        mood,
        atmosphereColor: moodColors[mood],
        intensity: mood === 'CRITICAL' ? 1.0 : mood === 'ALERT' ? 0.7 : 0.3
    }),

    setIntensity: (intensity) => set({ intensity }),

    setFocus: (focus) => set({ focus }),

    pulseGlitch: (duration = 500) => {
        set({ glitchFactor: 1 });
        setTimeout(() => set({ glitchFactor: 0 }), duration);
    }
}));
