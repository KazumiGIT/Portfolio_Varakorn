import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Video {
    id: number;
    title: string;
    views: string;
    videoSrc: string;
    link: string;
}

const videos: Video[] = [
    {
        id: 1,
        title: "Viral Tinted Lip Balm",
        views: "5.2M",
        videoSrc: "/videos/video1.mp4",
        link: "https://vt.tiktok.com/ZSf278Hax/"
    },
    {
        id: 2,
        title: "Natural Deodorant Launch",
        views: "3.8M",
        videoSrc: "/videos/video2.mp4",
        link: "https://vt.tiktok.com/ZSf278Hax/"
    },
    {
        id: 3,
        title: "Behind The Scenes",
        views: "2.1M",
        videoSrc: "/videos/video3.mp4",
        link: "https://vt.tiktok.com/ZSf278Hax/"
    },
    {
        id: 4,
        title: "Customer Reviews",
        views: "1.5M",
        videoSrc: "/videos/video4.mp4",
        link: "https://vt.tiktok.com/ZSf278Hax/"
    },
    {
        id: 5,
        title: "Product ASMR",
        views: "4.1M",
        videoSrc: "/videos/video5.mp4",
        link: "https://vt.tiktok.com/ZSf278Hax/"
    }
];

export const VideoGallery = () => {
    const [activeIndex, setActiveIndex] = useState(2);

    const nextVideo = () => {
        setActiveIndex((prev) => (prev + 1) % videos.length);
    };

    const prevVideo = () => {
        setActiveIndex((prev) => (prev - 1 + videos.length) % videos.length);
    };

    return (
        <div className="relative w-full max-w-6xl mx-auto py-12 px-4">
            <div className="flex justify-center items-center gap-4 mb-8">
                <button
                    onClick={prevVideo}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10 z-10"
                    aria-label="Previous video"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <div className="relative h-[300px] md:h-[400px] w-full flex justify-center items-center overflow-hidden perspective-1000">
                    <AnimatePresence mode="popLayout">
                        {videos.map((video, index) => {
                            // Calculate offset from active index
                            let offset = index - activeIndex;
                            // Handle wrapping for infinite loop feel
                            if (offset < -2) offset += videos.length;
                            if (offset > 2) offset -= videos.length;

                            // Only show 5 items: active, 2 prev, 2 next
                            if (Math.abs(offset) > 2) return null;

                            return (
                                <motion.div
                                    key={video.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8, x: offset * 100 }}
                                    animate={{
                                        opacity: offset === 0 ? 1 : 0.5,
                                        scale: offset === 0 ? 1 : 0.8,
                                        x: offset * (window.innerWidth < 768 ? 60 : 200), // Adjust spacing for mobile
                                        zIndex: 10 - Math.abs(offset),
                                        rotateY: offset * -15
                                    }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="absolute w-[200px] md:w-[300px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl cursor-pointer border-2 border-white/10 bg-gray-900"
                                    onClick={() => setActiveIndex(index)}
                                >
                                    <div className="w-full h-full relative group">
                                        <video
                                            src={video.videoSrc}
                                            className="w-full h-full object-cover"
                                            muted
                                            loop
                                            playsInline
                                            autoPlay
                                        />

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 flex flex-col justify-end p-4">
                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <h3 className="text-white font-bold text-lg leading-tight mb-1 drop-shadow-md">{video.title}</h3>
                                                <p className="text-pink-300 text-sm font-medium flex items-center gap-1 drop-shadow-md">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                                        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                                                    </svg>
                                                    {video.views}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Play Button Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white ml-1">
                                                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                <button
                    onClick={nextVideo}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10 z-10"
                    aria-label="Next video"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>

            <div className="text-center mt-6">
                <a
                    href="https://www.tiktok.com/@kazumi_v?_r=1&_t=ZS-91TQqdQR3jj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-white font-semibold hover:scale-105 transition-transform shadow-lg hover:shadow-pink-500/25"
                >
                    <span>View All Videos on TikTok</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                </a>
            </div>
        </div>
    );
};
