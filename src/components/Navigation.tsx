import { useState } from 'react';

interface NavigationProps {
    onNavigate: (sectionId: string) => void;
}

export const Navigation = ({ onNavigate }: NavigationProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const sections = [
        { id: 'hero', label: 'Home' },
        { id: 'timeline', label: 'Timeline' },
        { id: 'hygr', label: 'HYGR' },
        { id: 'ai-agency', label: 'AI Agency' },
        { id: 'contact', label: 'Contact' },
    ];

    return (
        <nav className="fixed top-6 left-6 z-40 glass-morphic rounded-full px-6 py-3">
            <div className="flex items-center gap-6">
                <div className="text-lg font-bold text-white glossy-text">
                    Varakorn
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex gap-6">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => onNavigate(section.id)}
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {isOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden mt-4 space-y-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => {
                                onNavigate(section.id);
                                setIsOpen(false);
                            }}
                            className="block w-full text-left py-2 px-4 rounded text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            {section.label}
                        </button>
                    ))}
                </div>
            )}
        </nav>
    );
};
