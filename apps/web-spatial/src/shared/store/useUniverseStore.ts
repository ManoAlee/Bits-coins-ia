import { create } from 'zustand';

interface UniverseState {
    selectedTicker: string | null;
    hoveredTicker: string | null;
    cameraFocus: [number, number, number]; // x, y, z
    isFocusMode: boolean;

    // Actions
    setSelectedTicker: (ticker: string | null) => void;
    setHoveredTicker: (ticker: string | null) => void;
    setCameraFocus: (position: [number, number, number]) => void;
    exitFocusMode: () => void;
}

export const useUniverseStore = create<UniverseState>((set) => ({
    selectedTicker: null,
    hoveredTicker: null,
    cameraFocus: [0, 0, 0],
    isFocusMode: false,

    setSelectedTicker: (ticker) => set({ selectedTicker: ticker, isFocusMode: !!ticker }),
    setHoveredTicker: (ticker) => set({ hoveredTicker: ticker }),
    setCameraFocus: (position) => set({ cameraFocus: position }),
    exitFocusMode: () => set({ selectedTicker: null, isFocusMode: false, cameraFocus: [0, 0, 0] }),
}));
