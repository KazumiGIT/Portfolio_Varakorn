import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { findAnswer } from '../data/knowledgeBase';
import { usePet } from '../context/PetContext';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

export const PetChat = () => {
    const { isChatOpen, setChatOpen, message: guideMessage, setPetMode } = usePet();
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Beep boop! 🤖 I'm V-Bot. Drag me around or ask me anything!", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isChatOpen]);

    // If the guide message changes (from context), add it to chat
    useEffect(() => {
        if (guideMessage && !messages.some(m => m.text === guideMessage)) {
            setMessages(prev => [...prev, { id: Date.now(), text: guideMessage, sender: 'bot' }]);
        }
    }, [guideMessage]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Check for commands
        const lowerInput = input.toLowerCase();
        let botResponse = "";

        if (lowerInput.includes('fly') || lowerInput.includes('freedom')) {
            setPetMode('flying');
            botResponse = "Wheee! I'm flying now! 🦅";
        } else if (lowerInput.includes('sit') || lowerInput.includes('ground')) {
            setPetMode('ground');
            botResponse = "Okay, back to the ground. 🦶";
        } else {
            botResponse = findAnswer(userMsg.text);
        }

        // Simulate thinking delay
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
        }, 600);
    };

    return (
        <AnimatePresence>
            {isChatOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20, x: 0 }}
                    animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20, x: 0 }}
                    className="absolute bottom-28 right-0 w-80 bg-gray-900/90 backdrop-blur-md border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden z-50 cursor-default"
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking chat
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside chat
                >
                    {/* Header */}
                    <div className="bg-purple-600/20 p-3 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-white font-bold text-sm">V-Bot Knowledge Base</span>
                        </div>
                        <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="h-64 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.sender === 'user'
                                        ? 'bg-purple-600 text-white rounded-tr-none'
                                        : 'bg-white/10 text-gray-200 rounded-tl-none'
                                        }`}
                                >
                                    <p className="whitespace-pre-line">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/20">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none transition-colors"
                            />
                            <button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
