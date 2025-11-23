import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePet } from '../context/PetContext';

interface ProfileBarProps {
    isMusicPlaying: boolean;
    onToggleMusic: () => void;
    playlist: { title: string; videoId: string; }[];
    currentTrackIndex: number;
    onSelectTrack: (index: number) => void;
    onOpenAuthModal: (tab: 'login' | 'signup') => void;
    onOpenProfileDashboard: () => void;
}

export const ProfileBar = ({
    isMusicPlaying,
    onToggleMusic,
    playlist,
    currentTrackIndex,
    onSelectTrack,
    onOpenAuthModal,
    onOpenProfileDashboard
}: ProfileBarProps) => {
    const { currentUser, isAuthenticated, logout } = useAuth();
    const { isPetActive, togglePetActive } = usePet();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getAvatarUrl = () => {
        if (!currentUser) return '';

        if (currentUser.profilePicture) {
            return currentUser.profilePicture;
        }

        const config = currentUser.avatarConfig;
        const params = new URLSearchParams({
            seed: config.seed,
            backgroundColor: 'transparent',
            size: '160'
        });
        return `https://api.dicebear.com/7.x/pixel-art/svg?${params.toString()}`;
    };

    const handleLogin = () => {
        onOpenAuthModal('login');
        setIsDropdownOpen(false);
    };

    const handleSignup = () => {
        onOpenAuthModal('signup');
        setIsDropdownOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
    };

    const handleProfileClick = () => {
        if (isAuthenticated) {
            onOpenProfileDashboard();
            setIsDropdownOpen(false);
        } else {
            handleLogin();
        }
    };

    return (
        <>
            <div className="fixed top-8 right-8 z-50" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="group relative"
                >
                    <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative w-14 h-14 rounded-full border-2 border-purple-500/50 overflow-hidden bg-black hover:border-purple-500 transition-colors">
                        {currentUser && (
                            <img
                                src={getAvatarUrl()}
                                alt={currentUser.username}
                                className="w-full h-full object-cover pixelated"
                            />
                        )}
                    </div>
                    {currentUser?.role === 'admin' && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-black flex items-center justify-center">
                            <span className="text-white text-xs font-bold">A</span>
                        </div>
                    )}
                </button>

                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-64 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={getAvatarUrl()}
                                        alt={currentUser?.username}
                                        className="w-12 h-12 rounded-full border border-purple-500/50 pixelated"
                                    />
                                    <div>
                                        <p className="text-white font-medium">{currentUser?.username}</p>
                                        <p className="text-gray-400 text-sm">
                                            {currentUser?.role === 'admin' ? 'Administrator' :
                                                currentUser?.role === 'guest' ? 'Guest User' : 'Member'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2">
                                {isAuthenticated ? (
                                    <>
                                        <button
                                            onClick={handleProfileClick}
                                            className="w-full text-left px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            My Profile
                                        </button>
                                        <button
                                            onClick={onToggleMusic}
                                            className="w-full text-left px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {isMusicPlaying ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                )}
                                            </svg>
                                            {isMusicPlaying ? 'Pause Music' : 'Play Music'}
                                        </button>
                                        <button
                                            onClick={togglePetActive}
                                            className="w-full text-left px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {isPetActive ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                )}
                                                {!isPetActive && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}
                                            </svg>
                                            {isPetActive ? 'Disable Pet' : 'Enable Pet'}
                                        </button>
                                        <div className="border-t border-white/10 my-2"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleLogin}
                                            className="w-full text-left px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                            Login
                                        </button>
                                        <button
                                            onClick={handleSignup}
                                            className="w-full text-left px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                            Sign Up
                                        </button>
                                        <button
                                            onClick={onToggleMusic}
                                            className="w-full text-left px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {isMusicPlaying ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                )}
                                            </svg>
                                            {isMusicPlaying ? 'Pause Music' : 'Play Music'}
                                        </button>
                                        <button
                                            onClick={togglePetActive}
                                            className="w-full text-left px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {isPetActive ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                )}
                                                {!isPetActive && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}
                                            </svg>
                                            {isPetActive ? 'Disable Pet' : 'Enable Pet'}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Music Playlist Section */}
                            <div className="border-t border-white/10 p-2">
                                <p className="px-4 py-1 text-xs text-gray-500 font-semibold uppercase tracking-wider">Background Music</p>
                                {playlist && playlist.map((track, index) => (
                                    <button
                                        key={index}
                                        onClick={() => onSelectTrack(index)}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${currentTrackIndex === index
                                            ? 'bg-purple-500/20 text-purple-300'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${currentTrackIndex === index && isMusicPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}></span>
                                        {track.title}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


        </>
    );
};
