export interface AvatarConfig {
    seed: string;
    gender: 'male' | 'female';
    hairStyle: string;
    hairColor: string;
    clothingType: string;
    clothingColor: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    avatarConfig: AvatarConfig;
    role: 'guest' | 'user' | 'admin';
    profilePicture?: string; // Optional custom uploaded picture
}

export interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (userData: Omit<User, 'id' | 'role'>) => Promise<boolean>;
    logout: () => void;
    updateProfile: (updates: Partial<User>) => void;
    adminLogin: (secret: string) => boolean;
}
