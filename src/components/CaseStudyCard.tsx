import { motion } from 'framer-motion';

interface CaseStudyProps {
    title: string;
    category: string;
    description: string;
    stats: { label: string; value: string }[];
    image: string;
    color: string;
}

export const CaseStudyCard = ({ title, category, description, stats, image, color }: CaseStudyProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative group overflow-hidden rounded-2xl bg-gray-900 border border-white/10 hover:border-white/20 transition-all"
        >
            <div className="grid md:grid-cols-2 gap-0 h-full">
                {/* Image Section */}
                <div className="relative h-64 md:h-full overflow-hidden">
                    <div className={`absolute inset-0 bg-${color}-500/20 mix-blend-overlay z-10 group-hover:bg-transparent transition-colors duration-500`}></div>
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                </div>

                {/* Content Section */}
                <div className="p-8 flex flex-col justify-center relative">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 blur-3xl rounded-full -mr-16 -mt-16`}></div>

                    <div className="relative z-10">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-${color}-500/20 text-${color}-300 mb-4 border border-${color}-500/30`}>
                            {category}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{title}</h3>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            {description}
                        </p>

                        <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                            {stats.map((stat, index) => (
                                <div key={index}>
                                    <div className={`text-xl font-bold text-${color}-400`}>{stat.value}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
