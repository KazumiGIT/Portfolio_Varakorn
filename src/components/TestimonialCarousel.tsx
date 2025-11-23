import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface Testimonial {
    id: number;
    name: string;
    role: string;
    content: string;
    avatar: string;
    rating: number;
}

const initialTestimonials: Testimonial[] = [
    {
        id: 1,
        name: "Aiman Hakim",
        role: "Content Creator",
        content: "The video editing quality is top-notch. My engagement skyrocketed after working with Varakorn!",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aiman&top=shortHair,shortHairDreads01,shortHairFrizzle,shortHairSides,shortHairTheCaesar&facialHairProbability=20",
        rating: 5
    },
    {
        id: 2,
        name: "Siti Sarah",
        role: "Brand Owner",
        content: "Fast turnaround and the edits were exactly what I needed for my TikTok ads. Highly recommended!",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti&top=longHair,longHairBob,longHairBun,longHairCurly,longHairStraight&facialHairProbability=0",
        rating: 5
    },
    {
        id: 3,
        name: "Rajiv Kumar",
        role: "YouTuber",
        content: "Varakorn knows how to pace a video perfectly. My retention rates are up 200% since we started.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajiv&top=shortHair,shortHairDreads01,shortHairFrizzle,shortHairSides,shortHairTheCaesar&facialHairProbability=20",
        rating: 4
    }
];


interface TestimonialCarouselProps {
    onOpenAuthModal: (tab: 'login' | 'signup') => void;
}

export const TestimonialCarousel = ({ onOpenAuthModal }: TestimonialCarouselProps) => {
    const { currentUser, isAuthenticated } = useAuth();
    const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
        const saved = localStorage.getItem('testimonials');
        return saved ? JSON.parse(saved) : initialTestimonials;
    });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newReview, setNewReview] = useState({ content: '', rating: 5 });

    useEffect(() => {
        localStorage.setItem('testimonials', JSON.stringify(testimonials));
    }, [testimonials]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (!isModalOpen) { // Pause rotation when modal is open
                setCurrentIndex((prev) => (prev + 1) % testimonials.length);
            }
        }, 5000);
        return () => clearInterval(timer);
    }, [testimonials.length, isModalOpen]);

    const averageRating = (testimonials.reduce((acc, curr) => acc + curr.rating, 0) / testimonials.length).toFixed(1);

    const isAdmin = currentUser?.role === 'admin';

    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this testimonial?")) {
            const updated = testimonials.filter(t => t.id !== id);
            setTestimonials(updated);
            // If we deleted the last item, or the current index is now out of bounds, reset index
            if (currentIndex >= updated.length) {
                setCurrentIndex(0);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !isAuthenticated || !newReview.content) return;

        const config = currentUser.avatarConfig;

        const newTestimonial: Testimonial = {
            id: Date.now(),
            name: currentUser.username,
            role: currentUser.role === 'admin' ? 'Administrator' : 'Client',
            content: newReview.content,
            avatar: currentUser.profilePicture || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${config.seed}&backgroundColor=transparent&size=160`,
            rating: newReview.rating
        };

        setTestimonials(prev => [...prev, newTestimonial]);
        setNewReview({ content: '', rating: 5 });
        setIsModalOpen(false);
        setCurrentIndex(testimonials.length);
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto py-12 px-4">
            {/* Overall Rating Badge */}
            <div
                className="absolute top-0 right-4 md:right-0 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-2"
            >
                <span className="text-yellow-400 text-xl">★</span>
                <span className="text-white font-bold">{averageRating}</span>
                <span className="text-gray-400 text-sm">({testimonials.length} reviews)</span>
            </div>

            <div className="relative h-[400px] md:h-[350px] overflow-hidden mt-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center"
                    >
                        <div className="mb-6 relative group">
                            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full"></div>
                            <img
                                src={testimonials[currentIndex].avatar}
                                alt={testimonials[currentIndex].name}
                                className="w-24 h-24 rounded-full border-2 border-purple-500/50 relative z-10 bg-black object-cover"
                            />

                            {/* Delete Button (Admin Only) */}
                            {isAdmin && (
                                <button
                                    onClick={() => handleDelete(testimonials[currentIndex].id)}
                                    className="absolute -top-2 -right-2 z-20 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                    title="Delete Testimonial"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Star Rating Display */}
                        <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-xl ${i < testimonials[currentIndex].rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                                    ★
                                </span>
                            ))}
                        </div>

                        <blockquote className="text-xl md:text-2xl text-gray-200 font-light italic mb-6 max-w-2xl px-4">
                            "{testimonials[currentIndex].content}"
                        </blockquote>

                        <div>
                            <div className="text-white font-bold text-lg">{testimonials[currentIndex].name}</div>
                            <div className="text-purple-400 text-sm">{testimonials[currentIndex].role}</div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex justify-center gap-2 mt-4 mb-8">
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

            <div className="text-center">
                {isAuthenticated ? (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm transition-all hover:scale-105"
                    >
                        + Leave a Review
                    </button>
                ) : (
                    <div className="text-gray-400 text-sm">
                        <p className="mb-2">Please login to leave a review</p>
                        <button
                            onClick={() => onOpenAuthModal('login')}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 border border-purple-500 rounded-full text-white text-sm transition-all hover:scale-105"
                        >
                            Login / Sign Up
                        </button>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-gray-900 border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <h3 className="text-2xl font-bold text-white mb-6">Share Your Experience</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Rating</label>
                                    <div className="flex gap-1 py-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                                className={`text-2xl ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Feedback</label>
                                    <textarea
                                        required
                                        value={newReview.content}
                                        onChange={e => setNewReview({ ...newReview, content: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors h-32 resize-none"
                                        placeholder="How was your experience?"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                                    >
                                        Submit Review
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
