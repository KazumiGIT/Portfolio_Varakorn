import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
    onComplete: () => void;
}

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
    const [progress, setProgress] = useState(0);
    const [canEnter, setCanEnter] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setCanEnter(true);
                    return 100;
                }
                return prev + 1;
            });
        }, 20);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="fixed inset-0 z-[9999] loading-screen flex items-center justify-center transition-opacity duration-500 overflow-hidden"
            style={{
                background: 'linear-gradient(to bottom, #0a0a1f, #1a1a3e, #0f0f2e)'
            }}
        >
            {/* Animated stars background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="star"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Glassy Typography Loading Text */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-0">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative"
                >
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/80 to-white/20 blur-sm absolute inset-0 select-none">
                        VARAKORN
                    </h1>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white mix-blend-overlay select-none relative z-10 animate-pulse-slow">
                        VARAKORN
                    </h1>
                </motion.div>
            </div>

            {/* Loading content */}
            <div className="relative z-10 text-center space-y-8 flex flex-col items-center mt-64">
                {/* Loading text and bar */}
                <div className="space-y-4 w-full max-w-xs backdrop-blur-sm bg-black/20 p-6 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center text-xs font-mono text-blue-300/80 mb-2">
                        <span>SYSTEM_INIT</span>
                        <span>{progress}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full mx-auto">
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full box-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Click to enter button */}
                    <AnimatePresence>
                        {canEnter && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-6"
                            >
                                <button
                                    onClick={onComplete}
                                    className="group relative px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 overflow-hidden"
                                >
                                    <span className="relative z-10 text-white/90 font-medium tracking-wide text-sm group-hover:text-white transition-colors">
                                        ENTER PORTFOLIO
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
