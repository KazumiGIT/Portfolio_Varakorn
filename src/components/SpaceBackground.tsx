import { useTheme } from '../context/ThemeContext';

export const SpaceBackground = () => {
    const { theme } = useTheme();

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Base gradient */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${theme === 'dark'
                    ? 'bg-gradient-to-b from-[#0a0a1f] via-[#1a1a3e] to-[#0f0f2e]'
                    : 'bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc]'
                }`} />

            {/* Animated stars */}
            <div className="stars-container">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="star"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            {/* Floating planets/orbs */}
            <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-purple-500/20 blur-3xl animate-float" />
            <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-pink-500/20 blur-3xl animate-float-delayed" />
            <div className="absolute bottom-32 left-1/4 w-36 h-36 rounded-full bg-blue-500/20 blur-3xl animate-float-slow" />
            <div className="absolute bottom-20 right-1/3 w-28 h-28 rounded-full bg-teal-500/20 blur-3xl animate-float" />

            {/* Shooting stars */}
            <div className="shooting-star" style={{ top: '20%', animationDelay: '2s' }} />
            <div className="shooting-star" style={{ top: '50%', animationDelay: '5s' }} />
            <div className="shooting-star" style={{ top: '70%', animationDelay: '8s' }} />
        </div>
    );
};
