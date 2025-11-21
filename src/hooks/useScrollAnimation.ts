import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

interface ScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
}

export const useScrollAnimation = (
    ref: RefObject<HTMLElement | null>,
    options: ScrollAnimationOptions = {}
) => {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: options.threshold || 0.3,
                rootMargin: options.rootMargin || '0px',
            }
        );

        observer.observe(element);

        const handleScroll = () => {
            if (!element) return;

            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Calculate progress based on element position in viewport
            // 0 when element enters from bottom, 1 when it reaches center, 0 when it exits from top
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;
            const distance = Math.abs(elementCenter - viewportCenter);
            const maxDistance = windowHeight / 2;

            const progress = Math.max(0, Math.min(1, 1 - distance / maxDistance));
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial calculation

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [ref, options.threshold, options.rootMargin]);

    return { isVisible, scrollProgress };
};
