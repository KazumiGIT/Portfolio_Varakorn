import { useState } from 'react';
import type { AvatarConfig } from '../types/auth';

interface AvatarEditorProps {
    config: AvatarConfig;
    onChange: (config: AvatarConfig) => void;
}

const hairStyles = {
    male: ['shortHair', 'shortHairDreads01', 'shortHairFrizzle', 'shortHairShaggy', 'shortHairSides', 'shortHairTheCaesar'],
    female: ['longHair', 'longHairBob', 'longHairBun', 'longHairCurly', 'longHairStraight', 'longHairStraight2']
};

const hairColors = [
    { name: 'Black', value: '000000' },
    { name: 'Brown', value: '4A312C' },
    { name: 'Blonde', value: 'F59797' },
    { name: 'Red', value: 'D84315' },
    { name: 'Blue', value: '2196F3' },
    { name: 'Purple', value: '9C27B0' },
    { name: 'Pink', value: 'E91E63' },
    { name: 'White', value: 'FFFFFF' }
];

const clothingTypes = ['hoodie', 'blazer', 'sweater', 'shirtCrewNeck', 'shirtScoopNeck', 'overall'];

const clothingColors = [
    { name: 'Black', value: '000000' },
    { name: 'Gray', value: '3c4f5c' },
    { name: 'Blue', value: '2196F3' },
    { name: 'Red', value: 'D84315' },
    { name: 'Green', value: '4CAF50' },
    { name: 'Purple', value: '9C27B0' },
    { name: 'White', value: 'FFFFFF' }
];

export const AvatarEditor = ({ config, onChange }: AvatarEditorProps) => {
    const [localConfig, setLocalConfig] = useState(config);

    const updateConfig = (updates: Partial<AvatarConfig>) => {
        const newConfig = { ...localConfig, ...updates };
        setLocalConfig(newConfig);
        onChange(newConfig);
    };

    const getAvatarUrl = () => {
        const params = new URLSearchParams({
            seed: localConfig.seed,
            top: localConfig.hairStyle,
            topColor: localConfig.hairColor,
            clothe: localConfig.clothingType,
            clotheColor: localConfig.clothingColor,
            facialHairProbability: localConfig.gender === 'male' ? '20' : '0'
        });
        return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
    };

    return (
        <div className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full"></div>
                    <img
                        src={getAvatarUrl()}
                        alt="Avatar Preview"
                        className="w-32 h-32 rounded-full border-2 border-purple-500/50 relative z-10 bg-black"
                    />
                </div>
            </div>

            {/* Gender Selection */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                    {(['male', 'female'] as const).map((gender) => (
                        <button
                            key={gender}
                            type="button"
                            onClick={() => {
                                const newHairStyle = hairStyles[gender][0];
                                updateConfig({ gender, hairStyle: newHairStyle });
                            }}
                            className={`px-4 py-2 rounded-lg capitalize transition-colors ${localConfig.gender === gender
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {gender}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hair Style */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">Hair Style</label>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {hairStyles[localConfig.gender].map((style) => (
                        <button
                            key={style}
                            type="button"
                            onClick={() => updateConfig({ hairStyle: style })}
                            className={`px-3 py-2 rounded-lg text-xs transition-colors ${localConfig.hairStyle === style
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {style.replace(/([A-Z])/g, ' $1').trim()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hair Color */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">Hair Color</label>
                <div className="grid grid-cols-4 gap-2">
                    {hairColors.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => updateConfig({ hairColor: color.value })}
                            className={`px-3 py-2 rounded-lg text-xs transition-all ${localConfig.hairColor === color.value
                                ? 'ring-2 ring-purple-500 bg-white/10'
                                : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div
                                className="w-4 h-4 rounded-full mx-auto mb-1"
                                style={{ backgroundColor: `#${color.value}` }}
                            />
                            <span className="text-gray-400">{color.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Clothing Type */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">Clothing</label>
                <div className="grid grid-cols-3 gap-2">
                    {clothingTypes.map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => updateConfig({ clothingType: type })}
                            className={`px-3 py-2 rounded-lg text-xs capitalize transition-colors ${localConfig.clothingType === type
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {type.replace(/([A-Z])/g, ' $1').trim()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Clothing Color */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">Clothing Color</label>
                <div className="grid grid-cols-4 gap-2">
                    {clothingColors.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => updateConfig({ clothingColor: color.value })}
                            className={`px-3 py-2 rounded-lg text-xs transition-all ${localConfig.clothingColor === color.value
                                ? 'ring-2 ring-purple-500 bg-white/10'
                                : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div
                                className="w-4 h-4 rounded-full mx-auto mb-1"
                                style={{ backgroundColor: `#${color.value}` }}
                            />
                            <span className="text-gray-400">{color.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
