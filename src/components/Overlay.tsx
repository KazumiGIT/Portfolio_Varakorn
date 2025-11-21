import { useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export const Overlay = () => {
    const educationRef = useRef<HTMLDivElement>(null);
    const hygrRef = useRef<HTMLDivElement>(null);
    const aiAgencyRef = useRef<HTMLDivElement>(null);

    const education = useScrollAnimation(educationRef);
    const hygr = useScrollAnimation(hygrRef);
    const aiAgency = useScrollAnimation(aiAgencyRef);

    // Calculate zoom scale based on scroll progress
    const getZoomScale = (progress: number) => {
        // Scale from 0.8 to 1.2 based on progress
        return 0.8 + (progress * 0.4);
    };

    return (
        <div
            data-scroll-container
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                pointerEvents: 'auto'
            }}
        >
            {/* Section 0: Hero */}
            <section className="h-screen w-screen flex flex-col justify-center items-start p-6 md:p-24 max-w-4xl">
                <div className="space-y-6 animate-fade-in">
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-4">
                        <span className="text-purple-300 text-sm font-medium">✨ AI Digital Marketing Specialist</span>
                    </div>
                    <h1 className="text-5xl md:text-9xl font-bold text-white mb-4 tracking-tighter leading-none">
                        Hello,
                        <br />
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                            I'm Varakorn
                        </span>
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-300 font-light leading-relaxed max-w-2xl">
                        A creative content creator, software developer, and AI marketing strategist
                        crafting immersive digital experiences that captivate audiences and drive results.
                    </p>
                    <div className="flex flex-wrap gap-2 md:gap-3 mt-8">
                        <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                            <span className="text-gray-400 text-xs md:text-sm">🎓 IT Software Developer</span>
                        </div>
                        <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                            <span className="text-gray-400 text-xs md:text-sm">🎥 Content Creator</span>
                        </div>
                        <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                            <span className="text-gray-400 text-xs md:text-sm">🤖 AI Marketing</span>
                        </div>
                    </div>
                    <div className="mt-10 animate-bounce text-gray-400 text-sm">
                        ↓ Scroll to explore my journey
                    </div>
                </div>
            </section>

            {/* Section 1: Timeline */}
            <section className="min-h-screen w-screen flex flex-col justify-center items-center p-6 md:p-24">
                <div className="max-w-5xl w-full space-y-12">
                    <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tight text-center">
                        My Journey
                    </h2>

                    <p className="text-lg md:text-xl text-gray-300 text-center max-w-2xl mx-auto mb-16 leading-relaxed">
                        From software development to viral content creation, and now pioneering AI-driven
                        marketing solutions. Here's my story.
                    </p>

                    {/* Timeline */}
                    <div className="relative space-y-16">
                        {/* Timeline Line */}
                        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500 transform md:-translate-x-1/2"></div>

                        {/* 2022-2023: Education */}
                        <div
                            ref={educationRef}
                            className="relative flex flex-row items-center gap-4 md:gap-8 transition-all duration-500"
                            style={{
                                transform: `scale(${getZoomScale(education.scrollProgress)})`,
                                opacity: 0.5 + (education.scrollProgress * 0.5)
                            }}
                        >
                            <div className="w-1/2 text-right pr-6 md:pr-12">
                                <div className="inline-block px-2 py-0.5 md:px-4 md:py-1 bg-purple-500/20 rounded-full border border-purple-500/30 mb-2 md:mb-3">
                                    <span className="text-purple-300 text-xs md:text-sm font-semibold">2022 - 2023</span>
                                </div>
                                <h3 className="text-lg md:text-3xl font-bold text-white mb-2 md:mb-3">IT Software Developer</h3>
                                <p className="text-xs md:text-base text-gray-400 leading-relaxed mb-2 md:mb-3 hidden md:block">
                                    Studied at <a href="https://share.google/Ecl0J9vhT9lf6HSXR" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">Kolej Komuniti Pasir Salak</a>,
                                    mastering programming fundamentals and modern development practices.
                                </p>
                                <p className="text-xs text-gray-400 leading-relaxed mb-2 md:hidden">
                                    Studied at Kolej Komuniti Pasir Salak.
                                </p>

                                {/* College Photos */}
                                <div className="grid grid-cols-2 gap-2 md:gap-3 mt-2 md:mt-4">
                                    <img
                                        src="/college-coding.jpg"
                                        alt="Coding at college"
                                        className="rounded-lg border border-purple-500/20 hover:border-purple-400/40 transition-all hover:scale-105 w-full h-16 md:h-32 object-cover"
                                    />
                                    <img
                                        src="/college-flag.jpg"
                                        alt="College campus"
                                        className="rounded-lg border border-purple-500/20 hover:border-purple-400/40 transition-all hover:scale-105 w-full h-16 md:h-32 object-cover"
                                    />
                                </div>
                            </div>
                            <div className="absolute left-1/2 w-3 h-3 md:w-4 md:h-4 bg-purple-500 rounded-full border-2 md:border-4 border-black transform -translate-x-1/2"></div>
                            <div className="w-1/2 pl-6 md:pl-12">
                                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/20">
                                    <h4 className="text-white font-semibold mb-3">What I Learned:</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-400">📱</span>
                                            <span className="text-gray-300">Develop Basic Mobile & Web Apps</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-400">🐧</span>
                                            <span className="text-gray-300">Linux Operating System</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-400">🎮</span>
                                            <span className="text-gray-300">3D VR Game Development (Unity)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-400">🌐</span>
                                            <span className="text-gray-300">Basic Website Creation</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-400">📊</span>
                                            <span className="text-gray-300">Multimedia & Social Media Marketing</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 pt-4 border-t border-purple-500/20">
                                        <p className="text-xs text-gray-400 italic">
                                            This foundation led me to join HYGR as an Editor Intern,
                                            later promoted to Full-Time Content Creator.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2023-2025: HYGR */}
                        <div
                            ref={hygrRef}
                            className="relative flex flex-row-reverse items-center gap-4 md:gap-8 transition-all duration-500"
                            style={{
                                transform: `scale(${getZoomScale(hygr.scrollProgress)})`,
                                opacity: 0.5 + (hygr.scrollProgress * 0.5)
                            }}
                        >
                            <div className="w-1/2 text-left pl-6 md:pl-12">
                                <div className="inline-block px-2 py-0.5 md:px-4 md:py-1 bg-pink-500/20 rounded-full border border-pink-500/30 mb-2 md:mb-3">
                                    <span className="text-pink-300 text-xs md:text-sm font-semibold">2023 - 2025</span>
                                </div>
                                <h3 className="text-lg md:text-3xl font-bold text-white mb-2 md:mb-3">Content Creator at HYGR</h3>
                                <p className="text-xs md:text-base text-gray-400 leading-relaxed">
                                    Created viral video content for HYGR's Natural Deodorant & Tinted Lip Balm products.
                                    Achieved 38M+ views across 261+ videos.
                                </p>
                            </div>
                            <div className="absolute left-1/2 w-3 h-3 md:w-4 md:h-4 bg-pink-500 rounded-full border-2 md:border-4 border-black transform -translate-x-1/2"></div>
                            <div className="w-1/2 pr-6 md:pr-12">
                                <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 backdrop-blur-sm p-6 rounded-2xl border border-pink-500/20">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-pink-400">2</div>
                                            <div className="text-xs text-gray-400">Years</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-pink-400">261+</div>
                                            <div className="text-xs text-gray-400">Videos</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-pink-400">38M+</div>
                                            <div className="text-xs text-gray-400">Views</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2025: Current - AI Agency */}
                        <div
                            ref={aiAgencyRef}
                            className="relative flex flex-row items-center gap-4 md:gap-8 transition-all duration-500"
                            style={{
                                transform: `scale(${getZoomScale(aiAgency.scrollProgress)})`,
                                opacity: 0.5 + (aiAgency.scrollProgress * 0.5)
                            }}
                        >
                            <div className="w-1/2 text-right pr-6 md:pr-12">
                                <div className="inline-block px-2 py-0.5 md:px-4 md:py-1 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-full border border-blue-500/30 mb-2 md:mb-3 animate-pulse">
                                    <span className="text-blue-300 text-xs md:text-sm font-semibold">2025 - Present</span>
                                </div>
                                <h3 className="text-lg md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent mb-2 md:mb-3">
                                    AI Digital Marketing Agency
                                </h3>
                                <p className="text-xs md:text-base text-gray-400 leading-relaxed">
                                    Building an innovative AI-powered digital marketing agency combining
                                    cutting-edge AI with creative storytelling.
                                </p>
                            </div>
                            <div className="absolute left-1/2 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full border-2 md:border-4 border-black transform -translate-x-1/2 animate-pulse"></div>
                            <div className="w-1/2 pl-6 md:pl-12">
                                <div className="bg-gradient-to-br from-blue-500/10 via-teal-500/10 to-blue-600/5 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
                                    <div className="relative space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">🤖</span>
                                            <span className="text-white font-semibold">AI-Powered Solutions</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">📊</span>
                                            <span className="text-white font-semibold">Data-Driven Strategies</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">🎨</span>
                                            <span className="text-white font-semibold">Creative Content</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: HYGR Experience (Detailed) */}
            <section className="min-h-screen w-screen flex flex-col justify-center items-center p-6 md:p-24 bg-gradient-to-b from-black via-pink-900/10 to-black">
                <div className="max-w-7xl w-full space-y-12">
                    {/* Header */}
                    <div className="text-center space-y-6">
                        <div className="inline-block px-6 py-2 bg-pink-500/20 rounded-full border border-pink-500/30 mb-4">
                            <span className="text-pink-300 text-xs md:text-sm font-medium">2023 - 2025 • Editor Intern → Full-Time Content Creator</span>
                        </div>
                        <h2 className="text-4xl md:text-8xl font-bold text-white mb-8 tracking-tight">
                            My Journey at{' '}
                            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                HYGR
                            </span>
                        </h2>
                        <p className="text-lg md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                            Creating viral video content for HYGR's Natural Deodorant & Tinted Lip Balm products,
                            driving significant growth through strategic content and advertising.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="group bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm p-10 rounded-3xl border border-purple-500/20 hover:border-purple-400/40 transition-all hover:scale-105 text-center">
                            <div className="text-7xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-4">
                                2
                            </div>
                            <p className="text-gray-300 font-semibold text-xl">Years Experience</p>
                            <p className="text-gray-500 text-sm mt-2">Editor Intern → Content Creator</p>
                            <div className="mt-6 h-1 w-full bg-gradient-to-r from-purple-500 to-transparent rounded-full"></div>
                        </div>

                        <div className="group bg-gradient-to-br from-pink-500/10 to-pink-600/5 backdrop-blur-sm p-10 rounded-3xl border border-pink-500/20 hover:border-pink-400/40 transition-all hover:scale-105 text-center">
                            <div className="text-7xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent mb-4">
                                261+
                            </div>
                            <p className="text-gray-300 font-semibold text-xl">Videos Created</p>
                            <p className="text-gray-500 text-sm mt-2">Viral content pieces</p>
                            <div className="mt-6 h-1 w-full bg-gradient-to-r from-pink-500 to-transparent rounded-full"></div>
                        </div>

                        <div className="group bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm p-10 rounded-3xl border border-blue-500/20 hover:border-blue-400/40 transition-all hover:scale-105 text-center">
                            <div className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">
                                38M+
                            </div>
                            <p className="text-gray-300 font-semibold text-xl">Total Views</p>
                            <p className="text-gray-500 text-sm mt-2">Across all platforms</p>
                            <div className="mt-6 h-1 w-full bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
                        </div>
                    </div>

                    {/* HYGR Booth Photo */}
                    <div className="relative rounded-3xl overflow-hidden border border-pink-500/20 group">
                        <img
                            src="/hygr-booth.jpg"
                            alt="HYGR Booth Experience"
                            className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex items-end p-8">
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-2">Behind the Brand</h3>
                                <p className="text-gray-300">Creating memorable experiences at HYGR events and campaigns</p>
                            </div>
                        </div>
                    </div>

                    {/* Video Gallery */}
                    <div className="space-y-6">
                        <h3 className="text-4xl font-bold text-white text-center">Featured Content</h3>
                        <p className="text-gray-400 text-center max-w-2xl mx-auto">
                            Scroll through some of my viral videos that helped HYGR reach millions
                        </p>

                        {/* Horizontal Scrolling Container */}
                        <div className="relative">
                            <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-pink-500/30 scrollbar-track-transparent">
                                {/* Video 1 */}
                                <a
                                    href="https://vt.tiktok.com/ZSf2GTavF/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-64 snap-start group"
                                >
                                    <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-400/40 transition-all hover:scale-105 bg-gradient-to-br from-purple-500/10 to-transparent">
                                        <div className="aspect-[9/16] bg-gray-800 flex items-center justify-center">
                                            <div className="text-center p-6">
                                                <div className="text-6xl mb-4">🎥</div>
                                                <p className="text-white font-semibold">TikTok Video 1</p>
                                                <p className="text-gray-400 text-sm mt-2">Click to watch</p>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="text-white text-5xl">▶</div>
                                        </div>
                                    </div>
                                </a>

                                {/* Video 2 */}
                                <a
                                    href="https://vt.tiktok.com/ZSf2G496G/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-64 snap-start group"
                                >
                                    <div className="relative rounded-2xl overflow-hidden border border-pink-500/20 hover:border-pink-400/40 transition-all hover:scale-105 bg-gradient-to-br from-pink-500/10 to-transparent">
                                        <div className="aspect-[9/16] bg-gray-800 flex items-center justify-center">
                                            <div className="text-center p-6">
                                                <div className="text-6xl mb-4">🎥</div>
                                                <p className="text-white font-semibold">TikTok Video 2</p>
                                                <p className="text-gray-400 text-sm mt-2">Click to watch</p>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="text-white text-5xl">▶</div>
                                        </div>
                                    </div>
                                </a>

                                {/* Video 3 */}
                                <a
                                    href="https://vt.tiktok.com/ZSf2GX6ud/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-64 snap-start group"
                                >
                                    <div className="relative rounded-2xl overflow-hidden border border-blue-500/20 hover:border-blue-400/40 transition-all hover:scale-105 bg-gradient-to-br from-blue-500/10 to-transparent">
                                        <div className="aspect-[9/16] bg-gray-800 flex items-center justify-center">
                                            <div className="text-center p-6">
                                                <div className="text-6xl mb-4">🎥</div>
                                                <p className="text-white font-semibold">TikTok Video 3</p>
                                                <p className="text-gray-400 text-sm mt-2">Click to watch</p>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="text-white text-5xl">▶</div>
                                        </div>
                                    </div>
                                </a>

                                {/* Video 4 */}
                                <a
                                    href="https://vt.tiktok.com/ZSf2GsSqH/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-64 snap-start group"
                                >
                                    <div className="relative rounded-2xl overflow-hidden border border-teal-500/20 hover:border-teal-400/40 transition-all hover:scale-105 bg-gradient-to-br from-teal-500/10 to-transparent">
                                        <div className="aspect-[9/16] bg-gray-800 flex items-center justify-center">
                                            <div className="text-center p-6">
                                                <div className="text-6xl mb-4">🎥</div>
                                                <p className="text-white font-semibold">TikTok Video 4</p>
                                                <p className="text-gray-400 text-sm mt-2">Click to watch</p>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="text-white text-5xl">▶</div>
                                        </div>
                                    </div>
                                </a>

                                {/* Video 5 */}
                                <a
                                    href="https://vt.tiktok.com/ZSf2GVr8c/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 w-64 snap-start group"
                                >
                                    <div className="relative rounded-2xl overflow-hidden border border-indigo-500/20 hover:border-indigo-400/40 transition-all hover:scale-105 bg-gradient-to-br from-indigo-500/10 to-transparent">
                                        <div className="aspect-[9/16] bg-gray-800 flex items-center justify-center">
                                            <div className="text-center p-6">
                                                <div className="text-6xl mb-4">🎥</div>
                                                <p className="text-white font-semibold">TikTok Video 5</p>
                                                <p className="text-gray-400 text-sm mt-2">Click to watch</p>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="text-white text-5xl">▶</div>
                                        </div>
                                    </div>
                                </a>
                            </div>

                            {/* Scroll Hint */}
                            <div className="text-center mt-4">
                                <p className="text-gray-500 text-sm">← Scroll horizontally to see more →</p>
                            </div>
                        </div>
                    </div>

                    {/* Key Achievements */}
                    <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm p-10 rounded-3xl border border-white/10">
                        <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="text-4xl">🎯</span>
                            Key Achievements
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4 group">
                                <span className="text-purple-400 text-2xl group-hover:scale-125 transition-transform">▹</span>
                                <span className="text-gray-300 group-hover:text-white transition-colors text-lg">Developed viral content strategies achieving millions of views consistently</span>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <span className="text-pink-400 text-2xl group-hover:scale-125 transition-transform">▹</span>
                                <span className="text-gray-300 group-hover:text-white transition-colors text-lg">Created engaging product demonstrations and lifestyle content</span>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <span className="text-blue-400 text-2xl group-hover:scale-125 transition-transform">▹</span>
                                <span className="text-gray-300 group-hover:text-white transition-colors text-lg">Optimized content for multiple social media platforms</span>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <span className="text-teal-400 text-2xl group-hover:scale-125 transition-transform">▹</span>
                                <span className="text-gray-300 group-hover:text-white transition-colors text-lg">Promoted from Editor Intern to Full-Time Content Creator</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Current Project - AI Agency */}
            <section className="min-h-screen w-screen flex flex-col justify-center items-center p-6 md:p-24">
                <div className="max-w-5xl w-full space-y-12">
                    <div className="text-center space-y-4">
                        <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-full border border-blue-500/30 mb-4 animate-pulse">
                            <span className="text-blue-300 text-sm font-medium">🚀 Current Project - 2025</span>
                        </div>
                        <h2 className="text-4xl md:text-7xl font-bold tracking-tight">
                            <span className="bg-gradient-to-r from-blue-400 via-teal-400 to-purple-400 bg-clip-text text-transparent">
                                AI Digital Marketing
                                <br />
                                Agency
                            </span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Pioneering the future of digital marketing by combining artificial intelligence
                            with creative storytelling to deliver unprecedented results.
                        </p>
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                        <div className="group relative bg-gradient-to-br from-blue-500/10 to-transparent backdrop-blur-sm rounded-2xl border border-blue-500/20 p-8 hover:border-blue-400/40 transition-all hover:scale-105 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:w-48 group-hover:h-48 transition-all"></div>
                            <div className="relative">
                                <div className="text-5xl mb-4">🤖</div>
                                <h3 className="text-2xl font-bold text-white mb-3">AI-Powered Content</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Leveraging cutting-edge AI tools to create, optimize, and scale content
                                    production while maintaining authentic brand voice.
                                </p>
                            </div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-teal-500/10 to-transparent backdrop-blur-sm rounded-2xl border border-teal-500/20 p-8 hover:border-teal-400/40 transition-all hover:scale-105 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl group-hover:w-48 group-hover:h-48 transition-all"></div>
                            <div className="relative">
                                <div className="text-5xl mb-4">📊</div>
                                <h3 className="text-2xl font-bold text-white mb-3">Data-Driven Strategy</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Using advanced analytics and AI insights to craft strategies that
                                    maximize ROI and audience engagement.
                                </p>
                            </div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-purple-500/10 to-transparent backdrop-blur-sm rounded-2xl border border-purple-500/20 p-8 hover:border-purple-400/40 transition-all hover:scale-105 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:w-48 group-hover:h-48 transition-all"></div>
                            <div className="relative">
                                <div className="text-5xl mb-4">🎨</div>
                                <h3 className="text-2xl font-bold text-white mb-3">Creative Excellence</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Blending AI efficiency with human creativity to produce visually
                                    stunning and emotionally resonant campaigns.
                                </p>
                            </div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-pink-500/10 to-transparent backdrop-blur-sm rounded-2xl border border-pink-500/20 p-8 hover:border-pink-400/40 transition-all hover:scale-105 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl group-hover:w-48 group-hover:h-48 transition-all"></div>
                            <div className="relative">
                                <div className="text-5xl mb-4">⚡</div>
                                <h3 className="text-2xl font-bold text-white mb-3">Rapid Execution</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    AI-accelerated workflows enable faster turnaround times without
                                    compromising on quality or creativity.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm p-8 rounded-2xl border border-white/10 mt-12">
                        <h3 className="text-2xl font-bold text-white mb-6 text-center">Powered By</h3>
                        <div className="flex flex-wrap justify-center gap-3">
                            <span className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/10 rounded-full text-blue-300 text-sm border border-blue-500/30">ChatGPT</span>
                            <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-purple-600/10 rounded-full text-purple-300 text-sm border border-purple-500/30">Midjourney</span>
                            <span className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-pink-600/10 rounded-full text-pink-300 text-sm border border-pink-500/30">Runway ML</span>
                            <span className="px-4 py-2 bg-gradient-to-r from-teal-500/20 to-teal-600/10 rounded-full text-teal-300 text-sm border border-teal-500/30">Claude AI</span>
                            <span className="px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-indigo-600/10 rounded-full text-indigo-300 text-sm border border-indigo-500/30">Stable Diffusion</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Contact */}
            <section className="min-h-screen w-screen flex flex-col justify-center items-center p-6 md:p-24 text-center">
                <div className="max-w-3xl space-y-8">
                    <h2 className="text-4xl md:text-8xl font-bold text-white mb-10 tracking-tight">
                        Let's Create
                        <br />
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                            Together
                        </span>
                    </h2>

                    <p className="text-lg md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Ready to elevate your brand with AI-powered digital marketing and viral content?
                        Let's discuss how we can create something extraordinary together.
                    </p>

                    <a
                        href="https://wa.me/601111267609"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-500 hover:to-pink-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
                    >
                        <span>Chat on WhatsApp</span>
                        <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                    </a>

                    <div className="mt-16 pt-8 border-t border-white/10">
                        <p className="text-gray-500 text-sm">
                            © 2025 Varakorn. Crafting the future of digital marketing with AI.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};
