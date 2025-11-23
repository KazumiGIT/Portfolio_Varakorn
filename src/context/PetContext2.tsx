import { createContext, useContext } from 'react';

const PetContext = createContext<any>(undefined);

export const PetProvider = ({ children }: { children: any }) => {
    return (
        <>
            {children}
        </>
    );
};

export const usePet = () => {
    return {
        say: () => { },
        isChatOpen: false,
        setChatOpen: () => { },
        message: null
    };
};
