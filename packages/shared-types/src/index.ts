export interface UniverseState {
    timestamp: number;
    entropy: number;
    status: 'STABLE' | 'UNSTABLE' | 'SINGULARITY';
}

export interface MarketAsset {
    ticker: string;
    price: number;
    coordinates: { x: number; y: number; z: number };
}
