import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Section {
    id: string;
    name: string;
    icon?: string;
}

export const SectionSelector: React.FC = () => {
    const [currentSection, setCurrentSection] = useState('Home');
    const [isOpen, setIsOpen] = useState(false);

    const sections: Section[] = [
        { id: 'hero', name: 'Home', icon: '🏠' },
        { id: 'timeline', name: 'Timeline', icon: '📅' },
        { id: 'hygr', name: 'HYGR', icon: '🎬' },
        { id: 'ai-agency', name: 'AI Agency', icon: '🤖' },
        { id: 'testimonials', name: 'Contact', icon: '📧' }
    ];

    const handleSectionClick = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsOpen(false);
        }
    };

    useEffect(() => {
        const scrollContainer = document.querySelector('[data-scroll-container]');
        if (!scrollContainer) return;

        const handleScroll = () => {
            const scrollTop = scrollContainer.scrollTop;
            const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            const scrollProgress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

            // Determine current section based on scroll progress
            if (scrollProgress < 0.2) {
                setCurrentSection('Home');
            } else if (scrollProgress < 0.4) {
                setCurrentSection('Timeline');
            } else if (scrollProgress < 0.6) {
                setCurrentSection('HYGR');
            } else if (scrollProgress < 0.8) {
                setCurrentSection('AI Agency');
            } else {
                setCurrentSection('Contact');
            }
        };

        // Swipe gesture support
        let touchStartY = 0;
        let touchEndY = 0;

        const handleTouchStart = (e: Event) => {
            const touchEvent = e as unknown as TouchEvent;
            touchStartY = touchEvent.changedTouches[0].screenY;
        };

        const handleTouchEnd = (e: Event) => {
            const touchEvent = e as unknown as TouchEvent;
            touchEndY = touchEvent.changedTouches[0].screenY;
            handleSwipe();
        };

        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartY - touchEndY;

            if (Math.abs(diff) > swipeThreshold) {
                const currentIndex = sections.findIndex(s => s.name === currentSection);

                if (diff > 0 && currentIndex < sections.length - 1) {
                    // Swipe Up (Next Section)
                    handleSectionClick(sections[currentIndex + 1].id);
                } else if (diff < 0 && currentIndex > 0) {
                    // Swipe Down (Previous Section)
                    handleSectionClick(sections[currentIndex - 1].id);
                }
            }
        };

        scrollContainer.addEventListener('scroll', handleScroll);
        scrollContainer.addEventListener('touchstart', handleTouchStart);
        scrollContainer.addEventListener('touchend', handleTouchEnd);

        handleScroll(); // Initial check

        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
            scrollContainer.removeEventListener('touchstart', handleTouchStart);
            scrollContainer.removeEventListener('touchend', handleTouchEnd);
        };
    }, [currentSection]);

    const getSectionIcon = (sectionName: string) => {
        const section = sections.find(s => s.name === sectionName);
        return section?.icon || '📍';
    };

    return (
        <div className="fixed top-6 left-6 z-[9998]">
            <motion.div
                className="relative"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                {/* Current Section Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-300 button-magnetic"
                >
                    <span className="text-2xl">{getSectionIcon(currentSection)}</span>
                    <span className="text-sm font-medium text-white">{currentSection}</span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ChevronDown className="w-4 h-4 text-white" />
                    </motion.div>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full mt-2 left-0 w-64 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 overflow-hidden shadow-2xl"
                        >
                            {sections.map((section, index) => (
                                <motion.button
                                    key={section.id}
                                    onClick={() => handleSectionClick(section.id)}
                                    className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-200 ${currentSection === section.name
                                        ? 'bg-white/20 text-white'
                                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ x: 4 }}
                                >
                                    <span className="text-xl">{section.icon}</span>
                                    <span className="text-sm font-medium">{section.name}</span>
                                    {currentSection === section.name && (
                                        <motion.div
                                            layoutId="activeSection"
                                            className="ml-auto w-2 h-2 rounded-full bg-purple-500"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 -z-10"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};
