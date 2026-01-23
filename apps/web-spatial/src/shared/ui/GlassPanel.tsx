import { ReactNode } from 'react';

export function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`
      backdrop-blur-xl bg-black/60 border border-white/10 
      rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.5)] 
      text-white p-4 transition-all duration-300
      ${className}
    `}>
            {children}
        </div>
    );
}
