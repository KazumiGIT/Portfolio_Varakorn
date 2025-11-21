import { useRef } from 'react';
import { motion } from 'framer-motion';
import { VideoGallery } from "./VideoGallery";
import { AnimatedCounter } from "./AnimatedCounter";
import { CaseStudyCard } from "./CaseStudyCard";
import { TestimonialCarousel } from "./TestimonialCarousel";

export const Overlay = () => {
    const educationRef = useRef<HTMLDivElement>(null);
    const hygrRef = useRef<HTMLDivElement>(null);
    const aiAgencyRef = useRef<HTMLDivElement>(null);

    return (
        <div
            className="absolute top-0 left-0 w-full pointer-events-none"
            style={{
                zIndex: 10,
                minHeight: '100vh'
            }}
        >
            {/* Section 0: Hero */}
            <section className="h-screen w-screen flex flex-col justify-center items-start p-6 md:p-24 max-w-4xl pointer-events-auto">
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
                            <span className="text-gray-400 text-xs md:text-sm">🤖 AI Marketing Agency</span>
                        </div>
                    </div>
                    <div className="mt-10 animate-bounce text-gray-400 text-sm">
                        ↓ Scroll to explore my journey
                    </div>
                </div>
            </section>

            {/* Section 1: Timeline */}
            <section className="min-h-screen w-screen flex flex-col justify-center items-center p-6 md:p-24 pointer-events-auto">
                <div className="max-w-5xl w-full space-y-12">
                    <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tight text-center">
                        My Journey
                    </h2>

                    <p className="text-lg md:text-xl text-gray-300 text-center max-w-2xl mx-auto mb-16 leading-relaxed">
                        From software development to viral content creation, and now pioneering AI-driven
                        marketing solutions. Here's my story.
                    </p>

                    <div className="relative space-y-24 md:space-y-32">
                        {/* Vertical Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent transform -translate-x-1/2 hidden md:block"></div>

                        {/* 2022-2023: Education */}
                        <motion.div
                            ref={educationRef}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ margin: "-100px" }}
                            transition={{ duration: 0.5 }}
                            className="relative flex flex-col md:flex-row items-center gap-4 md:gap-8"
                        >
                            <div className="w-full md:w-1/2 text-center md:text-right md:pr-12">
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
                            <div className="absolute left-1/2 w-3 h-3 md:w-4 md:h-4 bg-purple-500 rounded-full border-2 md:border-4 border-black transform -translate-x-1/2 hidden md:block"></div>
                            <div className="w-full md:w-1/2 md:pl-12 mt-4 md:mt-0">
                                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/20">
                                    <h4 className="text-white font-semibold mb-3">What I Learned:</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center text-gray-300">
                                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                                            Full-stack Development
                                        </li>
                                        <li className="flex items-center text-gray-300">
                                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                                            Database Management
                                        </li>
                                        <li className="flex items-center text-gray-300">
                                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                                            UI/UX Design Principles
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2023-2025: HYGR */}
                        <motion.div
                            ref={hygrRef}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ margin: "-100px" }}
                            transition={{ duration: 0.5 }}
                            className="relative flex flex-col md:flex-row-reverse items-center gap-4 md:gap-8"
                        >
                            <div className="w-full md:w-1/2 text-center md:text-left md:pl-12">
                                <div className="inline-block px-2 py-0.5 md:px-4 md:py-1 bg-pink-500/20 rounded-full border border-pink-500/30 mb-2 md:mb-3">
                                    <span className="text-pink-300 text-xs md:text-sm font-semibold">2023 - 2025</span>
                                </div>
                                <h3 className="text-lg md:text-3xl font-bold text-white mb-2 md:mb-3">Content Creator at HYGR</h3>
                                <p className="text-xs md:text-base text-gray-400 leading-relaxed">
                                    Created viral video content for HYGR's Natural Deodorant & Tinted Lip Balm products.
                                    Achieved 38M+ views across 261+ videos.
                                </p>
                            </div>
                            <div className="absolute left-1/2 w-3 h-3 md:w-4 md:h-4 bg-pink-500 rounded-full border-2 md:border-4 border-black transform -translate-x-1/2 hidden md:block"></div>
                            <div className="w-full md:w-1/2 md:pr-12 mt-4 md:mt-0">
                                <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 backdrop-blur-sm p-6 rounded-2xl border border-pink-500/20">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-pink-400">38M+</div>
                                            <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Views</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-pink-400">261+</div>
                                            <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Videos</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-pink-400">100k+</div>
                                            <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Followers</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2025: Current - AI Agency */}
                        <motion.div
                            ref={aiAgencyRef}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ margin: "-100px" }}
                            transition={{ duration: 0.5 }}
                            className="relative flex flex-col md:flex-row items-center gap-4 md:gap-8"
                        >
                            <div className="w-full md:w-1/2 text-center md:text-right md:pr-12">
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
                            <div className="absolute left-1/2 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full border-2 md:border-4 border-black transform -translate-x-1/2 animate-pulse hidden md:block"></div>
                            <div className="w-full md:w-1/2 md:pl-12 mt-4 md:mt-0">
                                <div className="bg-gradient-to-br from-blue-500/10 via-teal-500/10 to-blue-600/5 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
                                    <div className="relative space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-200 font-medium">AI-Powered Strategy</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-teal-500/20 rounded-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-200 font-medium">Data-Driven Results</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Section 2: HYGR Experience (Detailed) */}
            <section className="min-h-screen w-screen flex flex-col justify-center items-center p-6 md:p-24 bg-gradient-to-b from-black via-pink-900/10 to-black pointer-events-auto">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        <AnimatedCounter value={38} suffix="M+" label="Total Views" />
                        <AnimatedCounter value={261} suffix="+" label="Videos Created" />
                        <AnimatedCounter value={100} suffix="k+" label="Followers Gained" />
                    </div>

                    {/* Video Gallery */}
                    <div className="mt-16">
                        <h3 className="text-2xl md:text-4xl font-bold text-white text-center mb-8">Featured Content</h3>
                        <VideoGallery />
                    </div>
                </div>
            </section>

            {/* Section 3: Current Project - AI Agency */}
            <section className="min-h-screen w-screen flex flex-col justify-center items-center p-6 md:p-24 pointer-events-auto">
                <div className="max-w-7xl w-full space-y-12">
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

                    {/* Case Studies */}
                    <div className="grid md:grid-cols-2 gap-8 mt-12">
                        <CaseStudyCard
                            title="AI-Driven Content Strategy"
                            category="Strategy"
                            description="Leveraging AI to analyze trends and generate high-converting content ideas, reducing research time by 70%."
                            stats={[
                                { label: "Efficiency", value: "+70%" },
                                { label: "Engagement", value: "2.5x" },
                                { label: "ROI", value: "150%" }
                            ]}
                            image="/ai-strategy.jpg"
                            color="blue"
                        />
                        <CaseStudyCard
                            title="Automated Customer Engagement"
                            category="Automation"
                            description="Implementing AI chatbots and personalized email sequences to nurture leads and drive sales 24/7."
                            stats={[
                                { label: "Response Time", value: "<1min" },
                                { label: "Conversion", value: "+40%" },
                                { label: "Satisfaction", value: "4.8/5" }
                            ]}
                            image="/ai-automation.jpg"
                            color="teal"
                        />
                    </div>

                    {/* AI Tools Showcase (Simple List for now) */}
                    <div className="mt-16 text-center">
                        <h3 className="text-2xl font-bold text-white mb-8">Powered By Top AI Technologies</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            {['OpenAI', 'Midjourney', 'RunwayML', 'Jasper', 'Stable Diffusion'].map((tool) => (
                                <span key={tool} className="px-6 py-3 bg-white/5 rounded-full border border-white/10 text-gray-300 hover:bg-white/10 transition-colors">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Testimonials & Contact */}
            <section className="min-h-screen w-screen flex flex-col justify-center items-center p-6 md:p-24 text-center pointer-events-auto">
                <div className="max-w-5xl w-full space-y-16">
                    {/* Testimonials */}
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Client Success Stories</h2>
                        <TestimonialCarousel />
                    </div>

                    {/* Contact */}
                    <div className="max-w-3xl mx-auto space-y-8">
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

                        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                            <a
                                href="mailto:varakorn.work@gmail.com"
                                className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg hover:shadow-white/25 w-full md:w-auto"
                            >
                                Book a Free Consultation
                            </a>
                            <a
                                href="https://www.linkedin.com/in/varakorn-cn/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 bg-transparent border-2 border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors w-full md:w-auto"
                            >
                                View LinkedIn Profile
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
