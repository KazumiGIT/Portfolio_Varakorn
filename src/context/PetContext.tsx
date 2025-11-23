import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface PetContextType {
    say: (message: string, duration?: number) => void;
    isChatOpen: boolean;
    setChatOpen: (open: boolean) => void;
    message: string | null;
    petMode: 'ground' | 'flying';
    setPetMode: (mode: 'ground' | 'flying') => void;
    isMusicPlaying: boolean;
    isPetActive: boolean;
    togglePetActive: () => void;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const PetProvider = ({ children, isMusicPlaying = false }: { children: ReactNode, isMusicPlaying?: boolean }) => {
    const [message, setMessage] = useState<string | null>(null);
    const [isChatOpen, setChatOpen] = useState(false);
    const [petMode, setPetMode] = useState<'ground' | 'flying'>('ground');

    const [isPetActive, setIsPetActive] = useState(true);

    const togglePetActive = () => {
        setIsPetActive(prev => !prev);
    };

    const say = useCallback((text: string, duration = 5000) => {
        setMessage(text);
        if (!isChatOpen) {
            setTimeout(() => setMessage(null), duration);
        }
    }, [isChatOpen]);

    return (
        <PetContext.Provider value={{
            say,
            isChatOpen,
            setChatOpen,
            message,
            petMode,
            setPetMode,
            isMusicPlaying,
            isPetActive,
            togglePetActive
        }}>
            {children}
        </PetContext.Provider>
    );
};

export const usePet = () => {
    const context = useContext(PetContext);
    if (!context) {
        throw new Error('usePet must be used within PetProvider');
    }
    return context;
};
