import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const GlassCat = () => {
    const group = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Mesh>(null);
    const headRef = useRef<THREE.Mesh>(null);
    const legFLRef = useRef<THREE.Mesh>(null);
    const legFRRef = useRef<THREE.Mesh>(null);
    const legBLRef = useRef<THREE.Mesh>(null);
    const legBRRef = useRef<THREE.Mesh>(null);
    const tailRef = useRef<THREE.Mesh>(null);

    // 12-frame Gallop Cycle Data (Approximate rotations in radians)
    // Frame: 0 to 11
    const frames = [
        // Frame 1: Compressed, legs gathered
        { fl: -0.5, fr: -0.6, bl: 0.8, br: 0.7, bodyY: 0, bodyRot: 0.1, tail: -0.2 },
        // Frame 2: FL extending, BL pushing
        { fl: 0.2, fr: -0.3, bl: 1.0, br: 0.5, bodyY: 0.05, bodyRot: 0.05, tail: -0.1 },
        // Frame 3: FL extended, BL extended back (leap start)
        { fl: 0.8, fr: 0.4, bl: -0.2, br: 0.9, bodyY: 0.1, bodyRot: 0, tail: 0 },
        // Frame 4: Full extension (Air)
        { fl: 1.2, fr: 0.8, bl: -0.5, br: -0.4, bodyY: 0.2, bodyRot: -0.05, tail: 0.2 },
        // Frame 5: Descent, FR preparing to land
        { fl: 0.8, fr: 1.1, bl: -0.8, br: -0.6, bodyY: 0.15, bodyRot: -0.1, tail: 0.3 },
        // Frame 6: FR Impact
        { fl: 0.4, fr: 0.5, bl: -1.0, br: -0.8, bodyY: 0.05, bodyRot: -0.15, tail: 0.4 },
        // Frame 7: FL Impact, compressed
        { fl: -0.2, fr: -0.1, bl: -0.8, br: -1.0, bodyY: 0, bodyRot: -0.1, tail: 0.3 },
        // Frame 8: FL pushing, Back legs coming forward
        { fl: -0.6, fr: -0.5, bl: -0.2, br: -0.5, bodyY: 0.05, bodyRot: 0, tail: 0.2 },
        // Frame 9: Back legs passing front
        { fl: -0.8, fr: -0.7, bl: 0.4, br: 0.1, bodyY: 0.1, bodyRot: 0.1, tail: 0.1 },
        // Frame 10: BL Impact (Air phase 2 start)
        { fl: -0.9, fr: -0.8, bl: 0.8, br: 0.5, bodyY: 0.15, bodyRot: 0.15, tail: 0 },
        // Frame 11: BR Impact
        { fl: -0.8, fr: -0.9, bl: 0.5, br: 0.9, bodyY: 0.1, bodyRot: 0.1, tail: -0.1 },
        // Frame 12: Recovery to Frame 1
        { fl: -0.6, fr: -0.8, bl: 0.2, br: 0.8, bodyY: 0.05, bodyRot: 0.05, tail: -0.2 },
    ];

    useFrame((state) => {
        if (!group.current) return;

        const t = state.clock.getElapsedTime();
        const fps = 12; // Match the 12 frames per second look
        const frameIndex = Math.floor(t * fps) % 12;
        const pose = frames[frameIndex];

        // Apply pose
        if (bodyRef.current) {
            bodyRef.current.position.y = pose.bodyY;
            bodyRef.current.rotation.z = pose.bodyRot;
        }
        if (headRef.current) {
            headRef.current.position.y = 0.6 + pose.bodyY * 0.5; // Head follows body slightly
            headRef.current.rotation.z = -pose.bodyRot * 0.5; // Counter-balance
        }
        if (legFLRef.current) legFLRef.current.rotation.x = pose.fl;
        if (legFRRef.current) legFRRef.current.rotation.x = pose.fr;
        if (legBLRef.current) legBLRef.current.rotation.x = pose.bl;
        if (legBRRef.current) legBRRef.current.rotation.x = pose.br;
        if (tailRef.current) {
            tailRef.current.rotation.z = pose.tail;
            tailRef.current.rotation.y = Math.cos(t * 5) * 0.1; // Slight sway
        }
    });

    const glassMaterialProps = {
        thickness: 0.5,
        roughness: 0,
        transmission: 1,
        ior: 1.5,
        chromaticAberration: 0.1,
        backside: true,
        color: '#a78bfa' // Purple tint
    };

    return (
        <group ref={group} scale={1.5}>
            {/* Body */}
            <mesh ref={bodyRef} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
                <MeshTransmissionMaterial {...glassMaterialProps} />
            </mesh>

            {/* Head */}
            <mesh ref={headRef} position={[0.5, 0.6, 0]}>
                <sphereGeometry args={[0.35, 32, 32]} />
                <MeshTransmissionMaterial {...glassMaterialProps} />

                {/* Ears */}
                <mesh position={[0.15, 0.25, 0.15]} rotation={[0, 0, -0.2]}>
                    <coneGeometry args={[0.1, 0.2, 4]} />
                    <MeshTransmissionMaterial {...glassMaterialProps} />
                </mesh>
                <mesh position={[0.15, 0.25, -0.15]} rotation={[0, 0, -0.2]}>
                    <coneGeometry args={[0.1, 0.2, 4]} />
                    <MeshTransmissionMaterial {...glassMaterialProps} />
                </mesh>
            </mesh>

            {/* Legs */}
            <mesh ref={legFLRef} position={[0.3, -0.4, 0.2]}>
                <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
                <MeshTransmissionMaterial {...glassMaterialProps} />
            </mesh>
            <mesh ref={legFRRef} position={[0.3, -0.4, -0.2]}>
                <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
                <MeshTransmissionMaterial {...glassMaterialProps} />
            </mesh>
            <mesh ref={legBLRef} position={[-0.3, -0.4, 0.2]}>
                <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
                <MeshTransmissionMaterial {...glassMaterialProps} />
            </mesh>
            <mesh ref={legBRRef} position={[-0.3, -0.4, -0.2]}>
                <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
                <MeshTransmissionMaterial {...glassMaterialProps} />
            </mesh>

            {/* Tail */}
            <mesh ref={tailRef} position={[-0.5, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.04, 0.08, 0.8, 8]} />
                <MeshTransmissionMaterial {...glassMaterialProps} />
            </mesh>
        </group>
    );
};
