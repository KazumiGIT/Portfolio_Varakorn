import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    company: string;
    content: string;
    avatar: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Sarah Chen",
        role: "Marketing Director",
        company: "TechFlow",
        content: "Varakorn's ability to blend AI with creative storytelling is unmatched. Our engagement rates tripled within the first month of working together.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
        id: 2,
        name: "Marcus Johnson",
        role: "Founder",
        company: "EcoStyle",
        content: "The viral videos created for our launch were incredible. Not just visually stunning, but strategically designed to convert. Highly recommended!",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
    },
    {
        id: 3,
        name: "Emily Wong",
        role: "Product Manager",
        company: "HYGR",
        content: "Working with Varakorn transformed our content strategy. His deep understanding of platform algorithms and user psychology is a game changer.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
    }
];

export const TestimonialCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full max-w-4xl mx-auto py-12 px-4">
            <div className="relative h-[300px] md:h-[250px] overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center"
                    >
                        <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full"></div>
                            <img
                                src={testimonials[currentIndex].avatar}
                                alt={testimonials[currentIndex].name}
                                className="w-20 h-20 rounded-full border-2 border-purple-500/50 relative z-10"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-purple-600 rounded-full p-1.5 z-20">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                                    <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.405 0 4.725.175 6.995.521 2.267.346 3.787 2.252 3.403 4.538-.39 2.351-2.345 4.962-3.651 6.296-1.956 1.99-4.794 2.981-7.747 2.981-2.953 0-5.791-.99-7.747-2.981C1.946 12.27 0 9.66 0 7.309c0-2.286 1.52-4.192 3.787-4.538.682-.104 1.376-.18 2.083-.228zM12 13.25a.75.75 0 000-1.5.75.75 0 000 1.5zm0 0v-1.5" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        <blockquote className="text-xl md:text-2xl text-gray-200 font-light italic mb-6 max-w-2xl">
                            "{testimonials[currentIndex].content}"
                        </blockquote>

                        <div>
                            <div className="text-white font-bold text-lg">{testimonials[currentIndex].name}</div>
                            <div className="text-purple-400 text-sm">{testimonials[currentIndex].role} at {testimonials[currentIndex].company}</div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-purple-500 w-8' : 'bg-white/20 hover:bg-white/40'
                            }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
