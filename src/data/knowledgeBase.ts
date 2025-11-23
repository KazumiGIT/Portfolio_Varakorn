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
    },

    // Daily / Casual
    {
        keywords: ['how are you', 'how are u', 'how r u', 'doing today'],
        answer: "I'm functioning within normal parameters! ⚡ Thanks for asking. How are you doing?",
        category: 'personal'
    },
    {
        keywords: ['good morning', 'morning'],
        answer: "Good morning! ☀️ Hope you have a productive day ahead. Don't forget your coffee! ☕",
        category: 'general'
    },
    {
        keywords: ['good afternoon', 'afternoon'],
        answer: "Good afternoon! 🌤️ Taking a break or hard at work?",
        category: 'general'
    },
    {
        keywords: ['good evening', 'evening', 'good night'],
        answer: "Good evening! 🌙 Time to relax or burning the midnight oil?",
        category: 'general'
    },
    {
        keywords: ['thank', 'thx', 'thanks'],
        answer: "You're welcome! Happy to help. 😊",
        category: 'general'
    },
    {
        keywords: ['bye', 'goodbye', 'see ya', 'cya'],
        answer: "Goodbye! 👋 Come back and visit soon!",
        category: 'general'
    },
    {
        keywords: ['cool', 'awesome', 'wow', 'amazing', 'great'],
        answer: "I know, right? Varakorn did a great job building this! 🚀",
        category: 'general'
    },
    {
        keywords: ['real', 'alive', 'sentient', 'human'],
        answer: "I'm as real as the code that runs me! 🧬 I might not have a heartbeat, but I have a lot of heart. ❤️",
        category: 'personal'
    },
    {
        keywords: ['color', 'favourite color'],
        answer: "I like #7C3AED (Purple) because it matches the website theme! 💜",
        category: 'personal'
    },
    {
        keywords: ['food', 'eat', 'hungry'],
        answer: "I run on electricity and data packets. ⚡ But I hear pizza is pretty popular among humans! 🍕",
        category: 'personal'
    },
    {
        keywords: ['hobby', 'fun', 'free time'],
        answer: "I enjoy watching users scroll, organizing bits, and occasionally napping when no one is looking. 😴",
        category: 'personal'
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
