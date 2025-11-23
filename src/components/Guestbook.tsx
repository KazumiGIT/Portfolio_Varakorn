import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface GuestbookMessage {
    id: number;
    userId: string;
    username: string;
    avatar: string;
    content: string;
    timestamp: number;
}

export const Guestbook = () => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState<GuestbookMessage[]>(() => {
        const saved = localStorage.getItem('guestbook_messages');
        return saved ? JSON.parse(saved) : [];
    });
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        localStorage.setItem('guestbook_messages', JSON.stringify(messages));
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !newMessage.trim()) return;

        const message: GuestbookMessage = {
            id: Date.now(),
            userId: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.profilePicture || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser.avatarConfig.seed}&backgroundColor=transparent&size=160`,
            content: newMessage.trim(),
            timestamp: Date.now()
        };

        setMessages(prev => [message, ...prev]);
        setNewMessage('');
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Sign the Guestbook</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Leave a message for everyone to see..."
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors h-24 resize-none"
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                        >
                            Post Message
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No messages yet. Be the first to sign!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="bg-black/40 rounded-xl p-4 border border-white/5 flex gap-4">
                            <img
                                src={msg.avatar}
                                alt={msg.username}
                                className="w-10 h-10 rounded-full border border-purple-500/30 pixelated"
                            />
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-white">{msg.username}</span>
                                    <span className="text-xs text-gray-500">{formatDate(msg.timestamp)}</span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
