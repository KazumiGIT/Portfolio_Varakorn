export interface KnowledgeEntry {
    keywords: string[];
    answer: string;
    category: 'general' | 'technical' | 'personal' | 'fun';
}

export const knowledgeBase: KnowledgeEntry[] = [
    // General / Navigation
    {
        keywords: ['hello', 'hi', 'hey', 'greetings'],
        answer: "Hello there! 👋 I'm V-Bot, your personal guide to Varakorn's portfolio. Feel free to drag me around!",
        category: 'general'
    },
    {
        keywords: ['who are you', 'what are you', 'name'],
        answer: "I am V-Bot! 🤖 A sentient pixel-art construct living in this browser. I run on React and coffee.",
        category: 'personal'
    },
    {
        keywords: ['help', 'guide', 'what can you do'],
        answer: "I can answer questions about Varakorn, tell jokes, or just hang out! Try asking about 'services', 'skills', or 'contact'. You can also pick me up and throw me!",
        category: 'general'
    },

    // Services & Skills
    {
        keywords: ['service', 'offer', 'do', 'work'],
        answer: "Varakorn specializes in:\n1. 🎥 Video Editing (Premiere, After Effects)\n2. 🤖 AI Solutions (Chatbots, Automation)\n3. 💻 Web Development (React, TypeScript)\n4. 📈 Marketing Strategy",
        category: 'technical'
    },
    {
        keywords: ['skill', 'stack', 'tech', 'language'],
        answer: "My creator is fluent in TypeScript, React, Python, and Node.js. He also speaks 'Client' and 'Designer' fluently! 😉",
        category: 'technical'
    },
    {
        keywords: ['price', 'cost', 'rate', 'quote'],
        answer: "Every project is unique! 💎 The best way to get a quote is to sign the Guestbook or send an email via the contact info.",
        category: 'general'
    },

    // Contact
    {
        keywords: ['contact', 'email', 'hire', 'reach'],
        answer: "You can reach Varakorn directly at his email (check the resume!) or just shout really loud at your screen. (Email is probably better).",
        category: 'general'
    },

    // Fun
    {
        keywords: ['joke', 'funny'],
        answer: "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
        category: 'fun'
    },
    {
        keywords: ['secret', 'hidden'],
        answer: "I heard there's a secret Konami code hidden somewhere... just kidding, or am I? 👀",
        category: 'fun'
    },
    {
        keywords: ['love', 'like'],
        answer: "Aww, I love you too! But I'm just a bot, so it's a platonic, binary kind of love. 01001100 01001111 01010110 01000101 ❤️",
        category: 'fun'
    }
];

export const findAnswer = (input: string): string => {
    const lowerInput = input.toLowerCase();

    // 1. Exact keyword match
    for (const entry of knowledgeBase) {
        if (entry.keywords.some(k => lowerInput.includes(k))) {
            return entry.answer;
        }
    }

    // 2. Fallback
    return "I'm not sure about that one! 🧠 Try asking about 'services', 'skills', or just say 'hello'.";
};
