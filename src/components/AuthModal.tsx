import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'login' | 'signup';
}

export const AuthModal = ({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) => {
    const { login, signup, adminLogin } = useAuth();
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupData, setSignupData] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        avatarConfig: {
            seed: `user-${Date.now()}`
        }
    });
    const [loginError, setLoginError] = useState('');
    const [signupError, setSignupError] = useState('');

    // Admin Login State
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [adminSecret, setAdminSecret] = useState('');
    const [adminError, setAdminError] = useState('');

    const handleLogoClick = (e: React.MouseEvent) => {
        if (e.detail === 3) { // Triple click
            setShowAdminLogin(true);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        const success = await login(loginEmail, loginPassword);
        if (success) {
            onClose();
            setLoginEmail('');
            setLoginPassword('');
        } else {
            setLoginError('Invalid email or password');
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignupError('');

        if (signupData.password.length < 6) {
            setSignupError('Password must be at least 6 characters');
            return;
        }

        const success = await signup(signupData);
        if (success) {
            onClose();
            setSignupData({
                username: '',
                email: '',
                password: '',
                phone: '',
                avatarConfig: {
                    seed: `user-${Date.now()}`
                }
            });
        } else {
            setSignupError('Email already exists');
        }
    };

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setAdminError('');

        const success = adminLogin(adminSecret);
        if (success) {
            onClose();
            setAdminSecret('');
            setShowAdminLogin(false);
        } else {
            setAdminError('Invalid admin secret');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80"
                onClick={onClose}
                style={{ backdropFilter: 'none' }}
            />

            {/* Modal Content */}
            <div
                className="relative p-8 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                style={{
                    zIndex: 100000,
                    backgroundColor: '#111827',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                }}
            >
                {/* Logo (Secret Admin Trigger) */}
                <div className="flex justify-center mb-6">
                    <h2
                        onClick={handleLogoClick}
                        className="text-3xl font-bold text-white cursor-pointer select-none"
                    >
                        VARAKORN
                    </h2>
                </div>

                {showAdminLogin ? (
                    /* Admin Login Form */
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <h3 className="text-xl font-bold text-red-400 text-center mb-4">Admin Access</h3>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Admin Secret</label>
                            <input
                                type="password"
                                value={adminSecret}
                                onChange={(e) => setAdminSecret(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-500 outline-none transition-colors"
                                placeholder="Enter admin secret"
                            />
                        </div>
                        {adminError && <p className="text-red-400 text-sm">{adminError}</p>}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAdminLogin(false);
                                    setAdminSecret('');
                                    setAdminError('');
                                }}
                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
                            >
                                Admin Login
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('login')}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${activeTab === 'login'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setActiveTab('signup')}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${activeTab === 'signup'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Login Form */}
                        {activeTab === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                                    >
                                        Login
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Signup Form */}
                        {activeTab === 'signup' && (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Username *</label>
                                        <input
                                            type="text"
                                            required
                                            value={signupData.username}
                                            onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={signupData.email}
                                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Password *</label>
                                        <input
                                            type="password"
                                            required
                                            value={signupData.password}
                                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            value={signupData.phone}
                                            onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                                            placeholder="+60 12 345 6789"
                                        />
                                    </div>
                                </div>

                                {/* Avatar Preview & Randomizer */}
                                <div className="flex justify-center py-4">
                                    <div
                                        className="relative group cursor-pointer"
                                        onClick={() => setSignupData(prev => ({ ...prev, avatarConfig: { seed: `user-${Date.now()}-${Math.random()}` } }))}
                                        title="Click to randomize avatar"
                                    >
                                        <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
                                        <div className="relative w-24 h-24 rounded-full border-2 border-purple-500/50 overflow-hidden bg-black group-hover:border-purple-500 transition-colors">
                                            <img
                                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${signupData.avatarConfig.seed}&backgroundColor=transparent&size=160`}
                                                alt="Avatar Preview"
                                                className="w-full h-full object-cover pixelated"
                                            />
                                        </div>
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            Click to Randomize
                                        </div>
                                    </div>
                                </div>

                                {signupError && <p className="text-red-400 text-sm">{signupError}</p>}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                                    >
                                        Create Account
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
