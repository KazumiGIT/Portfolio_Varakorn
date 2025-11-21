import { useTheme } from '../context/ThemeContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export const SpaceBackground = () => {
    const { theme } = useTheme();
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Parallax transforms
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]); // Slow
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]); // Medium
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -800]); // Fast

    return (
        <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden h-[200vh]">
            {/* Base gradient */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${theme === 'dark'
                ? 'bg-gradient-to-b from-[#0a0a1f] via-[#1a1a3e] to-[#0f0f2e]'
                : 'bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc]'
                }`} />

            {/* Layer 1: Distant Stars (Slow) */}
            <motion.div style={{ y: y1 }} className="absolute inset-0 w-full h-full">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={`l1-${i}`}
                        className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-40"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </motion.div>

            {/* Layer 2: Medium Stars (Medium Speed) */}
            <motion.div style={{ y: y2 }} className="absolute inset-0 w-full h-full">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={`l2-${i}`}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </motion.div>

            {/* Layer 3: Close Stars (Fast Speed) */}
            <motion.div style={{ y: y3 }} className="absolute inset-0 w-full h-full">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={`l3-${i}`}
                        className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-80 shadow-[0_0_4px_rgba(255,255,255,0.8)]"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </motion.div>

            {/* Floating planets/orbs (Independent Animation) */}
            <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-purple-500/20 blur-3xl animate-float" />
            <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-pink-500/20 blur-3xl animate-float-delayed" />
            <div className="absolute bottom-32 left-1/4 w-36 h-36 rounded-full bg-blue-500/20 blur-3xl animate-float-slow" />
            <div className="absolute bottom-20 right-1/3 w-28 h-28 rounded-full bg-teal-500/20 blur-3xl animate-float" />

            {/* Shooting stars */}
            <div className="shooting-star" style={{ top: '20%', animationDelay: '2s' }} />
            <div className="shooting-star" style={{ top: '50%', animationDelay: '5s' }} />
            <div className="shooting-star" style={{ top: '70%', animationDelay: '8s' }} />
        </div>
    );
};
