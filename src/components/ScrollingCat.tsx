import { useEffect, useState } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

export const ScrollingCat = () => {
    const { section } = useScrollProgress();
    const [isJumping, setIsJumping] = useState(false);
    const [prevSection, setPrevSection] = useState(0);

    useEffect(() => {
        if (section !== prevSection) {
            setIsJumping(true);
            setTimeout(() => setIsJumping(false), 600);
            setPrevSection(section);
        }
    }, [section, prevSection]);

    // Position cat based on current section
    const getCatPosition = () => {
        const positions = [
            { bottom: '10%', left: '15%' },  // Hero
            { bottom: '15%', left: '30%' },  // Timeline
            { bottom: '20%', left: '50%' },  // HYGR
            { bottom: '15%', left: '70%' },  // AI Agency
            { bottom: '10%', left: '85%' },  // Contact
        ];
        return positions[section] || positions[0];
    };

    const position = getCatPosition();

    return (
        <div
            className={`fixed z-50 transition-all duration-700 ease-in-out pointer-events-none ${isJumping ? 'animate-cat-jump' : ''
                }`}
            style={{
                bottom: position.bottom,
                left: position.left,
                transform: 'translateX(-50%)',
            }}
        >
            {/* Minimalist cat SVG */}
            <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
            >
                {/* Cat body */}
                <ellipse cx="30" cy="35" rx="15" ry="18" fill="url(#catGradient)" />

                {/* Cat head */}
                <circle cx="30" cy="20" r="12" fill="url(#catGradient)" />

                {/* Ears */}
                <path d="M 20 12 L 18 5 L 25 10 Z" fill="url(#catGradient)" />
                <path d="M 40 12 L 42 5 L 35 10 Z" fill="url(#catGradient)" />

                {/* Eyes */}
                <circle cx="26" cy="19" r="2" fill="#1a1a1a" />
                <circle cx="34" cy="19" r="2" fill="#1a1a1a" />
                <circle cx="26.5" cy="18.5" r="0.8" fill="white" />
                <circle cx="34.5" cy="18.5" r="0.8" fill="white" />

                {/* Nose */}
                <path d="M 30 22 L 28 24 L 32 24 Z" fill="#ff69b4" />

                {/* Whiskers */}
                <line x1="15" y1="21" x2="22" y2="20" stroke="#1a1a1a" strokeWidth="0.5" />
                <line x1="15" y1="23" x2="22" y2="22" stroke="#1a1a1a" strokeWidth="0.5" />
                <line x1="45" y1="21" x2="38" y2="20" stroke="#1a1a1a" strokeWidth="0.5" />
                <line x1="45" y1="23" x2="38" y2="22" stroke="#1a1a1a" strokeWidth="0.5" />

                {/* Tail */}
                <path
                    d="M 42 40 Q 50 35 48 28"
                    stroke="url(#catGradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                />

                <defs>
                    <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};
