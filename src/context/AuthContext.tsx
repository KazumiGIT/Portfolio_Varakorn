import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_SECRET = 'varakorn_admin_2024';
const STORAGE_KEY = 'portfolio_users';
const CURRENT_USER_KEY = 'portfolio_current_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Load current user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        } else {
            // Set as guest by default
            const guestUser: User = {
                id: 'guest',
                username: 'Guest',
                email: '',
                password: '',
                role: 'guest',
                avatarConfig: {
                    seed: 'guest',
                    gender: 'male',
                    hairStyle: 'shortHair',
                    hairColor: '000000',
                    clothingType: 'hoodie',
                    clothingColor: '000000'
                }
            };
            setCurrentUser(guestUser);
        }
    }, []);

    // Save current user to localStorage whenever it changes
    useEffect(() => {
        if (currentUser && currentUser.role !== 'guest') {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        }
    }, [currentUser]);

    const getUsers = (): User[] => {
        const users = localStorage.getItem(STORAGE_KEY);
        return users ? JSON.parse(users) : [];
    };

    const saveUsers = (users: User[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const signup = async (userData: Omit<User, 'id' | 'role'>): Promise<boolean> => {
        const users = getUsers();

        // Check if email already exists
        if (users.some(u => u.email === userData.email)) {
            return false;
        }

        const newUser: User = {
            ...userData,
            id: Date.now().toString(),
            role: 'user'
        };

        users.push(newUser);
        saveUsers(users);
        setCurrentUser(newUser);
        return true;
    };

    const logout = () => {
        localStorage.removeItem(CURRENT_USER_KEY);
        // Reset to guest
        const guestUser: User = {
            id: 'guest',
            username: 'Guest',
            email: '',
            password: '',
            role: 'guest',
            avatarConfig: {
                seed: 'guest',
                gender: 'male',
                hairStyle: 'shortHair',
                hairColor: '000000',
                clothingType: 'hoodie',
                clothingColor: '000000'
            }
        };
        setCurrentUser(guestUser);
    };

    const updateProfile = (updates: Partial<User>) => {
        if (!currentUser || currentUser.role === 'guest') return;

        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);

        // Update in users list
        const users = getUsers();
        const index = users.findIndex(u => u.id === currentUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            saveUsers(users);
        }
    };

    const adminLogin = (secret: string): boolean => {
        if (secret === ADMIN_SECRET) {
            const adminUser: User = {
                id: 'admin',
                username: 'Admin',
                email: 'admin@varakorn.com',
                password: '',
                role: 'admin',
                avatarConfig: {
                    seed: 'admin',
                    gender: 'male',
                    hairStyle: 'shortHair',
                    hairColor: '000000',
                    clothingType: 'hoodie',
                    clothingColor: '000000'
                }
            };
            setCurrentUser(adminUser);
            return true;
        }
        return false;
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isAuthenticated: currentUser?.role !== 'guest',
                login,
                signup,
                logout,
                updateProfile,
                adminLogin
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
