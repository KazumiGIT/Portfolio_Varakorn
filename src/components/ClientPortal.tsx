import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendEmail } from '../lib/emailjs';

interface ServiceRequest {
    id: number;
    userId: string;
    type: 'Video Editing' | 'AI Chatbot' | 'Web Development' | 'Marketing Strategy';
    description: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    date: string;
}

export const ClientPortal = () => {
    const { currentUser } = useAuth();
    const [requests, setRequests] = useState<ServiceRequest[]>(() => {
        const saved = localStorage.getItem('service_requests');
        return saved ? JSON.parse(saved) : [];
    });
    const [sending, setSending] = useState(false);

    const [newRequest, setNewRequest] = useState({
        type: 'Video Editing',
        description: ''
    });

    useEffect(() => {
        localStorage.setItem('service_requests', JSON.stringify(requests));
    }, [requests]);

    const userRequests = requests.filter(req => req.userId === currentUser?.id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setSending(true);

        try {
            const request: ServiceRequest = {
                id: Date.now(),
                userId: currentUser.id,
                type: newRequest.type as any,
                description: newRequest.description,
                status: 'Pending',
                date: new Date().toLocaleDateString()
            };

            // 1. Save to Local Storage
            setRequests(prev => [request, ...prev]);

            // 2. Send Email Notification
            await sendEmail({
                to_name: 'Varakorn',
                from_name: currentUser.username,
                from_email: currentUser.email,
                service_type: newRequest.type,
                message: newRequest.description,
            });

            setNewRequest(prev => ({ ...prev, description: '' }));
            alert('Request submitted successfully! Check your email for confirmation.');
        } catch (error) {
            console.error('Error submitting request:', error);
            // Even if email fails, we still saved the request locally
            alert('Request saved, but email notification failed. Please check your connection.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Request Form */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">🚀</span> Start a New Project
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Service Type</label>
                            <select
                                value={newRequest.type}
                                onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
                            >
                                <option>Video Editing</option>
                                <option>AI Chatbot</option>
                                <option>Web Development</option>
                                <option>Marketing Strategy</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Project Details</label>
                        <textarea
                            required
                            value={newRequest.description}
                            onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                            placeholder="Describe what you need..."
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors h-24 resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={sending}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-white font-bold shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? 'Sending...' : 'Submit Request'}
                    </button>
                </form>
            </div>

            {/* Request History */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4">My Requests</h3>
                <div className="space-y-3">
                    {userRequests.length === 0 ? (
                        <div className="text-center text-gray-500 py-8 bg-white/5 rounded-xl border border-white/5">
                            No active requests. Start a project above!
                        </div>
                    ) : (
                        userRequests.map((req) => (
                            <div key={req.id} className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center justify-between group hover:border-white/20 transition-colors">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-white">{req.type}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${req.status === 'Pending' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300' :
                                                req.status === 'In Progress' ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' :
                                                    'bg-green-500/20 border-green-500/50 text-green-300'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-1">{req.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">{req.date}</div>
                                    <div className="text-xs text-purple-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Details →
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
