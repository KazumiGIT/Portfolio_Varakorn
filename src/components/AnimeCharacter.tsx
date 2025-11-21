import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface AnimeCharacterProps {
    scrollProgress: number;
    section: number;
}

export const AnimeCharacter = ({ scrollProgress }: AnimeCharacterProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Mesh>(null);
    const bodyRef = useRef<THREE.Mesh>(null);

    // Character growth based on timeline
    // Section 0 (Hero): Small/young
    // Section 1 (Timeline): Growing
    // Section 2 (HYGR): Adult
    // Section 3 (AI Agency): Mature
    // Section 4 (Contact): Full grown

    const baseScale = 0.5 + (scrollProgress * 0.5); // Grows from 0.5 to 1.0
    const characterAge = Math.min(scrollProgress * 5, 4); // 0-4 representing age stages

    useFrame((state) => {
        if (groupRef.current) {
            // Gentle floating animation
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

            // Slight rotation based on scroll
            groupRef.current.rotation.y = scrollProgress * Math.PI * 0.5;
        }

        // Head bobbing
        if (headRef.current) {
            headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.05;
        }
    });

    // Position character on the right side of screen
    const xPosition = 2;
    const yPosition = -1 + (scrollProgress * 2);

    // Color scheme changes with age
    const getOutfitColor = () => {
        if (characterAge < 1) return '#6366f1'; // Student - Indigo
        if (characterAge < 2) return '#ec4899'; // Content Creator - Pink
        if (characterAge < 3) return '#8b5cf6'; // Transitioning - Purple
        return '#3b82f6'; // AI Entrepreneur - Blue
    };

    const getHairColor = () => {
        return '#1e293b'; // Dark hair
    };

    const getSkinColor = () => {
        return '#fcd34d'; // Anime-style light skin
    };

    return (
        <group ref={groupRef} position={[xPosition, yPosition, 0]} scale={baseScale}>
            {/* Head */}
            <group ref={headRef} position={[0, 1.5, 0]}>
                {/* Face */}
                <Sphere args={[0.4, 32, 32]} position={[0, 0, 0]}>
                    <meshStandardMaterial color={getSkinColor()} />
                </Sphere>

                {/* Hair */}
                <Sphere args={[0.42, 32, 32]} position={[0, 0.1, 0]}>
                    <meshStandardMaterial color={getHairColor()} />
                </Sphere>

                {/* Eyes */}
                <Sphere args={[0.08, 16, 16]} position={[-0.15, 0.05, 0.35]}>
                    <meshStandardMaterial color="#000000" />
                </Sphere>
                <Sphere args={[0.08, 16, 16]} position={[0.15, 0.05, 0.35]}>
                    <meshStandardMaterial color="#000000" />
                </Sphere>

                {/* Eye highlights */}
                <Sphere args={[0.03, 16, 16]} position={[-0.13, 0.08, 0.4]}>
                    <meshBasicMaterial color="#ffffff" />
                </Sphere>
                <Sphere args={[0.03, 16, 16]} position={[0.17, 0.08, 0.4]}>
                    <meshBasicMaterial color="#ffffff" />
                </Sphere>
            </group>

            {/* Body */}
            <group ref={bodyRef} position={[0, 0.7, 0]}>
                {/* Torso */}
                <Box args={[0.6, 0.8, 0.4]} position={[0, 0, 0]}>
                    <meshStandardMaterial color={getOutfitColor()} />
                </Box>

                {/* Neck */}
                <Cylinder args={[0.15, 0.15, 0.2, 16]} position={[0, 0.5, 0]}>
                    <meshStandardMaterial color={getSkinColor()} />
                </Cylinder>
            </group>

            {/* Arms */}
            <group position={[0, 0.6, 0]}>
                {/* Left arm */}
                <Cylinder args={[0.1, 0.08, 0.7, 16]} position={[-0.4, -0.2, 0]} rotation={[0, 0, 0.3]}>
                    <meshStandardMaterial color={getOutfitColor()} />
                </Cylinder>
                {/* Left hand */}
                <Sphere args={[0.1, 16, 16]} position={[-0.6, -0.5, 0]}>
                    <meshStandardMaterial color={getSkinColor()} />
                </Sphere>

                {/* Right arm */}
                <Cylinder args={[0.1, 0.08, 0.7, 16]} position={[0.4, -0.2, 0]} rotation={[0, 0, -0.3]}>
                    <meshStandardMaterial color={getOutfitColor()} />
                </Cylinder>
                {/* Right hand */}
                <Sphere args={[0.1, 16, 16]} position={[0.6, -0.5, 0]}>
                    <meshStandardMaterial color={getSkinColor()} />
                </Sphere>
            </group>

            {/* Legs */}
            <group position={[0, 0, 0]}>
                {/* Left leg */}
                <Cylinder args={[0.12, 0.1, 0.8, 16]} position={[-0.2, -0.4, 0]}>
                    <meshStandardMaterial color="#1e293b" />
                </Cylinder>
                {/* Left shoe */}
                <Box args={[0.15, 0.1, 0.25]} position={[-0.2, -0.85, 0.05]}>
                    <meshStandardMaterial color="#000000" />
                </Box>

                {/* Right leg */}
                <Cylinder args={[0.12, 0.1, 0.8, 16]} position={[0.2, -0.4, 0]}>
                    <meshStandardMaterial color="#1e293b" />
                </Cylinder>
                {/* Right shoe */}
                <Box args={[0.15, 0.1, 0.25]} position={[0.2, -0.85, 0.05]}>
                    <meshStandardMaterial color="#000000" />
                </Box>
            </group>

            {/* Accessories based on age/stage */}
            {characterAge < 1.5 && (
                // Student - Backpack
                <Box args={[0.4, 0.5, 0.2]} position={[0, 0.7, -0.3]}>
                    <meshStandardMaterial color="#ef4444" />
                </Box>
            )}

            {characterAge >= 1.5 && characterAge < 3 && (
                // Content Creator - Camera
                <group position={[0.5, 0.8, 0.3]}>
                    <Box args={[0.15, 0.12, 0.08]}>
                        <meshStandardMaterial color="#1e293b" />
                    </Box>
                    <Cylinder args={[0.06, 0.06, 0.1, 16]} rotation={[0, 0, Math.PI / 2]} position={[0.1, 0, 0]}>
                        <meshStandardMaterial color="#374151" />
                    </Cylinder>
                </group>
            )}

            {characterAge >= 3 && (
                // AI Entrepreneur - Laptop
                <group position={[0, 0.3, 0.4]} rotation={[-0.3, 0, 0]}>
                    <Box args={[0.3, 0.02, 0.2]}>
                        <meshStandardMaterial color="#1e293b" />
                    </Box>
                    <Box args={[0.3, 0.25, 0.02]} position={[0, 0.13, -0.1]}>
                        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.2} />
                    </Box>
                </group>
            )}
        </group>
    );
};
