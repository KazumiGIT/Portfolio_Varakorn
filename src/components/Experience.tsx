import { Float, Stars, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { lerp } from "../utils/scrollAnimations";

export const Experience = () => {
    const scrollProgress = useScrollProgress();
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    useFrame(() => {
        const { progress, section, sectionProgress } = scrollProgress;

        // Camera animations based on section
        if (section === 0) {
            // Hero: Front view with slight movement
            camera.position.x = lerp(camera.position.x, Math.sin(progress * Math.PI) * 0.5, 0.05);
            camera.position.y = lerp(camera.position.y, 0, 0.05);
            camera.position.z = lerp(camera.position.z, 5, 0.05);
        } else if (section === 1) {
            // About: Rotate around
            const angle = sectionProgress * Math.PI * 2;
            camera.position.x = lerp(camera.position.x, Math.sin(angle) * 4, 0.05);
            camera.position.y = lerp(camera.position.y, 1, 0.05);
            camera.position.z = lerp(camera.position.z, Math.cos(angle) * 4, 0.05);
        } else if (section === 2) {
            // Experience: Top-down view
            camera.position.x = lerp(camera.position.x, 0, 0.05);
            camera.position.y = lerp(camera.position.y, 5 - sectionProgress * 2, 0.05);
            camera.position.z = lerp(camera.position.z, 3, 0.05);
        } else if (section === 3) {
            // Portfolio: Dolly through
            camera.position.x = lerp(camera.position.x, sectionProgress * 2 - 1, 0.05);
            camera.position.y = lerp(camera.position.y, 0, 0.05);
            camera.position.z = lerp(camera.position.z, 6 - sectionProgress * 3, 0.05);
        } else if (section === 4) {
            // Contact: Pull back
            camera.position.x = lerp(camera.position.x, 0, 0.05);
            camera.position.y = lerp(camera.position.y, 2, 0.05);
            camera.position.z = lerp(camera.position.z, 8, 0.05);
        }

        camera.lookAt(0, 0, 0);

        // Group rotation and position
        if (groupRef.current) {
            groupRef.current.rotation.y = progress * Math.PI * 2;
            groupRef.current.position.y = -progress * 3;
        }
    });

    const { section } = scrollProgress;

    return (
        <>
            <color attach="background" args={["#0a0a0a"]} />

            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
            <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} penumbra={1} color="#ec4899" />

            <group ref={groupRef}>
                {/* Section 0: Hero - Large Central Torus Knot */}
                {section === 0 && (
                    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
                        <mesh position={[0, 0, 0]} scale={1.2}>
                            <torusKnotGeometry args={[1.5, 0.4, 128, 16]} />
                            <MeshDistortMaterial
                                color="#8b5cf6"
                                roughness={0.1}
                                metalness={0.9}
                                distort={0.3}
                                speed={2}
                            />
                        </mesh>
                    </Float>
                )}

                {/* Section 0: Floating Particles */}
                {section === 0 && (
                    <>
                        <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
                            <mesh position={[-3, 1, -2]} scale={0.4}>
                                <icosahedronGeometry args={[1, 0]} />
                                <meshStandardMaterial color="#ec4899" roughness={0.2} metalness={0.8} />
                            </mesh>
                        </Float>
                        <Float speed={1.8} rotationIntensity={1.5} floatIntensity={1.5}>
                            <mesh position={[3, -1, -1]} scale={0.3}>
                                <octahedronGeometry args={[1, 0]} />
                                <meshStandardMaterial color="#14b8a6" roughness={0.2} metalness={0.8} />
                            </mesh>
                        </Float>
                    </>
                )}

                {/* Section 1: About - Morphing Shapes */}
                {section === 1 && (
                    <>
                        <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2}>
                            <mesh position={[0, 0, 0]} scale={1}>
                                <Sphere args={[1.5, 64, 64]}>
                                    <MeshDistortMaterial
                                        color="#6366f1"
                                        roughness={0.2}
                                        metalness={0.8}
                                        distort={0.5}
                                        speed={3}
                                    />
                                </Sphere>
                            </mesh>
                        </Float>
                        <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
                            <mesh position={[-2, 1, 1]} scale={0.5}>
                                <dodecahedronGeometry args={[1, 0]} />
                                <meshStandardMaterial color="#ec4899" roughness={0.2} metalness={0.8} wireframe />
                            </mesh>
                        </Float>
                    </>
                )}

                {/* Section 2: Experience - 3D Bar Chart Style */}
                {section === 2 && (
                    <>
                        <mesh position={[-2, -5, 0]} scale={[0.5, 2, 0.5]}>
                            <boxGeometry />
                            <meshStandardMaterial color="#8b5cf6" roughness={0.2} metalness={0.8} />
                        </mesh>
                        <mesh position={[0, -5, 0]} scale={[0.5, 3.5, 0.5]}>
                            <boxGeometry />
                            <meshStandardMaterial color="#ec4899" roughness={0.2} metalness={0.8} />
                        </mesh>
                        <mesh position={[2, -5, 0]} scale={[0.5, 5, 0.5]}>
                            <boxGeometry />
                            <meshStandardMaterial color="#14b8a6" roughness={0.2} metalness={0.8} />
                        </mesh>
                    </>
                )}

                {/* Section 3: Portfolio - Floating Frames */}
                {section === 3 && (
                    <>
                        <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
                            <mesh position={[-2, -10, 2]} rotation={[0, Math.PI / 4, 0]}>
                                <boxGeometry args={[2, 1.5, 0.1]} />
                                <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.8} />
                            </mesh>
                        </Float>
                        <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1}>
                            <mesh position={[0, -10, 0]} rotation={[0, 0, 0]}>
                                <boxGeometry args={[2, 1.5, 0.1]} />
                                <meshStandardMaterial color="#8b5cf6" roughness={0.2} metalness={0.8} />
                            </mesh>
                        </Float>
                        <Float speed={0.8} rotationIntensity={0.5} floatIntensity={1}>
                            <mesh position={[2, -10, -2]} rotation={[0, -Math.PI / 4, 0]}>
                                <boxGeometry args={[2, 1.5, 0.1]} />
                                <meshStandardMaterial color="#ec4899" roughness={0.2} metalness={0.8} />
                            </mesh>
                        </Float>
                    </>
                )}

                {/* Section 4: Contact - Final Sphere */}
                {section === 4 && (
                    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
                        <mesh position={[0, -15, 0]} scale={1.5}>
                            <Sphere args={[1, 64, 64]}>
                                <MeshDistortMaterial
                                    color="#8b5cf6"
                                    roughness={0.1}
                                    metalness={0.9}
                                    distort={0.2}
                                    speed={1}
                                />
                            </Sphere>
                        </mesh>
                    </Float>
                )}
            </group>

            {/* Background Stars */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </>
    );
};
