import { motion, useScroll, useSpring } from 'framer-motion';
import { useState, useEffect } from 'react';

export const ScrollProgress: React.FC = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [currentSection, setCurrentSection] = useState('Home');

    useEffect(() => {
        const sections = [
            { id: 'home', name: 'Home', start: 0, end: 0.15 },
            { id: 'about', name: 'About', start: 0.15, end: 0.3 },
            { id: 'experience', name: 'Experience', start: 0.3, end: 0.5 },
            { id: 'portfolio', name: 'Portfolio', start: 0.5, end: 0.7 },
            { id: 'testimonials', name: 'Testimonials', start: 0.7, end: 0.85 },
            { id: 'contact', name: 'Contact', start: 0.85, end: 1 }
        ];

        const unsubscribe = scrollYProgress.on('change', (latest) => {
            const section = sections.find(s => latest >= s.start && latest < s.end);
            if (section) {
                setCurrentSection(section.name);
            }
        });

        return () => unsubscribe();
    }, [scrollYProgress]);

    return (
        <div className="fixed top-0 left-0 right-0 z-[9998] pointer-events-none">
            {/* Progress bar */}
            <motion.div
                className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 origin-left"
                style={{ scaleX }}
            />

            {/* Current section indicator */}
            <motion.div
                className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 pointer-events-auto"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <motion.span
                    key={currentSection}
                    className="text-sm font-medium text-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {currentSection}
                </motion.span>
            </motion.div>
        </div>
    );
};
