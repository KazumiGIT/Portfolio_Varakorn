import { useEffect, useState } from 'react';

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
            <div className="relative z-10 text-center space-y-12">
                {/* Running cat animation */}
                <div className="relative h-32 flex items-center justify-center">
                    <div className="running-cat">
                        <svg
                            width="80"
                            height="80"
                            viewBox="0 0 60 60"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="drop-shadow-2xl"
                        >
                            <ellipse cx="30" cy="35" rx="15" ry="18" fill="url(#catGradient)" />
                            <circle cx="30" cy="20" r="12" fill="url(#catGradient)" />
                            <path d="M 20 12 L 18 5 L 25 10 Z" fill="url(#catGradient)" />
                            <path d="M 40 12 L 42 5 L 35 10 Z" fill="url(#catGradient)" />
                            <circle cx="26" cy="19" r="2" fill="#1a1a1a" />
                            <circle cx="34" cy="19" r="2" fill="#1a1a1a" />
                            <circle cx="26.5" cy="18.5" r="0.8" fill="white" />
                            <circle cx="34.5" cy="18.5" r="0.8" fill="white" />
                            <path d="M 30 22 L 28 24 L 32 24 Z" fill="#ff69b4" />
                            <path d="M 42 40 Q 50 35 48 28" stroke="url(#catGradient)" strokeWidth="4" fill="none" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#a78bfa" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    {/* Running trail */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                </div>
                {/* Loading text */}
                <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-white glossy-text">
                        Loading Portfolio
                    </h2>
                    {/* Progress bar */}
                    <div className="w-64 mx-auto">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-white/60 text-sm mt-2">{progress}%</p>
                    </div>
                    {/* Click to enter button */}
                    {canEnter && (
                        <div className="animate-fade-in mt-8">
                            <p className="text-white/80 text-lg mb-2">Ready to explore!</p>
                            <button
                                onClick={onComplete}
                                className="px-8 py-3 glass-morphic text-white font-semibold rounded-full hover:scale-105 transition-all duration-300 animate-pulse-slow"
                            >
                                Click to Enter
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
