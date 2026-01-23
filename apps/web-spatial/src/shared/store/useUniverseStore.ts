import { create } from 'zustand';

interface PlanetData {
    ticker: string;
    price: number;
    change: number;
    pos: [number, number, number];
    color?: string;
}

interface UniverseState {
    selectedTicker: string | null;
    hoveredTicker: string | null;
    cameraFocus: [number, number, number]; // x, y, z
    isFocusMode: boolean;
    universeItems: PlanetData[];

    // Actions
    setSelectedTicker: (ticker: string | null) => void;
    setHoveredTicker: (ticker: string | null) => void;
    setCameraFocus: (position: [number, number, number]) => void;
    exitFocusMode: () => void;
    spawnPlanet: (ticker: string, price: number, change: number, color?: string) => void;
}

export const useUniverseStore = create<UniverseState>((set) => ({
    selectedTicker: null,
    hoveredTicker: null,
    cameraFocus: [0, 0, 0],
    isFocusMode: false,
    universeItems: [
        { ticker: 'BTC', price: 65000, change: 5.2, pos: [0, 0, 0] },
        { ticker: 'ETH', price: 3500, change: 2.1, pos: [5, 2, -5] },
        { ticker: 'NVDA', price: 950, change: 12.5, pos: [-5, -2, -5] },
    ],

    setSelectedTicker: (ticker) => set({ selectedTicker: ticker, isFocusMode: !!ticker }),
    setHoveredTicker: (ticker) => set({ hoveredTicker: ticker }),
    setCameraFocus: (position) => set({ cameraFocus: position }),
    exitFocusMode: () => set({ selectedTicker: null, isFocusMode: false, cameraFocus: [0, 0, 0] }),

    spawnPlanet: (ticker, price, change, color) => set((state) => {
        if (state.universeItems.find(p => p.ticker === ticker)) return state;
        const r = () => (Math.random() - 0.5) * 20;
        const newPlanet: PlanetData = {
            ticker, price, change, pos: [r(), r(), r()], color
        };
        return { universeItems: [...state.universeItems, newPlanet] };
    }),
}));
