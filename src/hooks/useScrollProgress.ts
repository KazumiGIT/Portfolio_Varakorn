import { useState, useEffect } from 'react';

export interface ScrollProgress {
    progress: number; // 0 to 1
    section: number; // Current section index (0-4)
    sectionProgress: number; // Progress within current section (0 to 1)
}

export const useScrollProgress = () => {
    const [scrollProgress, setScrollProgress] = useState<ScrollProgress>({
        progress: 0,
        section: 0,
        sectionProgress: 0,
    });

    useEffect(() => {
        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target) {
                const scrollTop = target.scrollTop;
                const scrollHeight = target.scrollHeight - target.clientHeight;
                const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

                // Calculate section (0-4 for 5 sections)
                const section = Math.min(Math.floor(progress * 5), 4);
                const sectionProgress = (progress * 5) - section;

                setScrollProgress({
                    progress,
                    section,
                    sectionProgress,
                });
            }
        };

        // Find the overlay div and attach scroll listener
        const overlayDiv = document.querySelector('[data-scroll-container]') as HTMLElement;
        if (overlayDiv) {
            overlayDiv.addEventListener('scroll', handleScroll);
            return () => overlayDiv.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return scrollProgress;
};
