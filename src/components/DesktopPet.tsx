import { useState, useEffect, useRef } from 'react';
import { usePet } from '../context/PetContext';
import { PetChat } from './PetChat';

// Image Sources
const IDLE_IMG = '/vbot_idle.png';
const SLEEP_IMG = '/vbot_sleep.png';

export const DesktopPet = () => {
    const { message, isChatOpen, setChatOpen, isPetActive } = usePet();
    const [isSleeping, setIsSleeping] = useState(false);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const wakeUp = () => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        setIsSleeping(false);
    };

    const startSleepTimer = () => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

        // Don't schedule sleep if chat is open
        if (isChatOpen) return;

        idleTimerRef.current = setTimeout(() => {
            setIsSleeping(true);
        }, 10000);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, []);

    // Watch chat state to ensure we wake up when chat opens
    useEffect(() => {
        if (isChatOpen) {
            wakeUp();
        }
    }, [isChatOpen]);

    if (!isPetActive) return null;

    return (
        <div
            className="fixed bottom-4 right-4 z-[10000] cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
            onMouseEnter={wakeUp}
            onMouseLeave={startSleepTimer}
            onClick={(e) => {
                e.stopPropagation();
                wakeUp();
                setChatOpen(!isChatOpen);
            }}
        >
            <div className="relative">
                <PetChat />

                {/* Speech Bubble Hint */}
                {!isChatOpen && message && !isSleeping && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-2 rounded-xl shadow-lg whitespace-nowrap max-w-[200px] text-center animate-bounce">
                        {message}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                    </div>
                )}

                {/* Zzz Animation when sleeping */}
                {isSleeping && (
                    <div className="absolute -top-8 right-0 text-white font-bold text-xl animate-pulse">
                        Zzz...
                    </div>
                )}

                {/* Pet Image */}
                <div className="w-24 h-24 relative drop-shadow-2xl filter hover:brightness-110 transition-all select-none">
                    <img
                        src={isSleeping ? SLEEP_IMG : IDLE_IMG}
                        alt="V-Bot"
                        className="w-full h-full object-contain"
                        style={{ imageRendering: 'pixelated' }}
                    />
                </div>
            </div>
        </div>
    );
};
