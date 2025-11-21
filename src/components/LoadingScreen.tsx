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
            className="fixed inset-0 z-[9999] loading-screen flex items-center justify-center transition-opacity duration-500"
            style={{
                background: 'linear-gradient(to bottom, #0a0a1f, #1a1a3e, #0f0f2e)'
            }}
        >
            {/* Animated stars background */}
            <div className="absolute inset-0 overflow-hidden">
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

            {/* Loading content */}
            <div className="relative z-10 text-center space-y-8 flex flex-col items-center">
                {/* Running Cat Animation */}
                <motion.div
                    initial={{ x: -100 }}
                    animate={{
                        x: 100,
                        y: [0, -10, 0],
                    }}
                    transition={{
                        x: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        },
                        y: {
                            duration: 0.4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }
                    }}
                    className="w-32 h-32 relative z-10"
                >
                    <img
                        src="/cat-loading.png"
                        alt="Loading..."
                        className="w-full h-full object-contain"
                    />
                </motion.div>

                {/* Loading text and bar */}
                <div className="space-y-4 w-full max-w-xs">
                    <h2 className="text-4xl font-bold text-white glossy-text">
                        Loading Portfolio
                    </h2>
                    {/* Progress bar */}
                    <div className="w-full mx-auto">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-white/60 text-sm mt-2">{progress}%</p>
                    </div>

                    {/* Click to enter button */}
                    <AnimatePresence>
                        {canEnter && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mt-8"
                            >
                                <p className="text-white/80 text-lg mb-4">Ready to explore!</p>
                                <button
                                    onClick={onComplete}
                                    className="px-8 py-3 glass-morphic text-white font-semibold rounded-full hover:scale-105 transition-all duration-300 animate-pulse-slow border border-white/20 hover:bg-white/10"
                                >
                                    Click to Enter
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
