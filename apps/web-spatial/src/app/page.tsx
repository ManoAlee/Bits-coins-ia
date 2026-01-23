import dynamic from 'next/dynamic';

const UniverseCanvas = dynamic(() => import('@/widgets/universe/UniverseCanvas'), { ssr: false });

/**
 * PROMETHEUS-X ENTRY POINT
 * The gateway to the Financial Singularity.
 */
export default function Home() {
    return (
        <main className="w-full h-screen bg-black">
            <UniverseCanvas />
        </main>
    );
}
