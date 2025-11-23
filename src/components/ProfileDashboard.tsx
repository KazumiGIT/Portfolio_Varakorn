import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Guestbook } from './Guestbook';

interface ProfileDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileDashboard = ({ isOpen, onClose }: ProfileDashboardProps) => {
    const { currentUser, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'guestbook'>('profile');

    if (!isOpen || !currentUser) return null;

    const getAvatarUrl = () => {
        if (currentUser.profilePicture) return currentUser.profilePicture;
        const config = currentUser.avatarConfig;
        return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${config.seed}&backgroundColor=transparent&size=160`;
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90"
                onClick={onClose}
            />

            {/* Dashboard Container */}
            <div
                className="relative w-full max-w-4xl h-[85vh] bg-[#0f1115] rounded-2xl border border-white/10 shadow-2xl flex overflow-hidden"
                style={{ zIndex: 100000 }}
            >
                {/* Sidebar */}
                <div className="w-64 bg-black/40 border-r border-white/5 p-6 flex flex-col">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 rounded-full border-2 border-purple-500/50 overflow-hidden bg-black mb-3">
                            <img
                                src={getAvatarUrl()}
                                alt={currentUser.username}
                                className="w-full h-full object-cover pixelated"
                            />
                        </div>
                        <h3 className="text-white font-bold text-lg">{currentUser.username}</h3>
                        <p className="text-gray-500 text-sm capitalize">{currentUser.role}</p>
                    </div>

                    <nav className="space-y-2 flex-1">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${activeTab === 'profile' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span>👤</span> My Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('guestbook')}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${activeTab === 'guestbook' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span>💬</span> Guestbook
                        </button>
                    </nav>

                    <button
                        onClick={onClose}
                        className="mt-auto w-full px-4 py-2 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Close Dashboard
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-900 to-black">
                    {activeTab === 'profile' && (
                        <div className="max-w-xl mx-auto space-y-8">
                            <h2 className="text-3xl font-bold text-white">Edit Profile</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={currentUser.username}
                                        onChange={(e) => updateProfile({ username: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={currentUser.email}
                                        onChange={(e) => updateProfile({ email: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={currentUser.phone || ''}
                                        onChange={(e) => updateProfile({ phone: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={() => updateProfile({ avatarConfig: { seed: `user-${Date.now()}-${Math.random()}` } })}
                                        className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>🎲</span> Randomize Avatar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'guestbook' && (
                        <div className="max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold text-white mb-8">Public Guestbook</h2>
                            <Guestbook />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
