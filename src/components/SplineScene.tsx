import Spline from '@splinetool/react-spline';
import { useState } from 'react';

interface SplineSceneProps {
    sceneUrl: string;
    className?: string;
}

export const SplineScene = ({ sceneUrl, className = '' }: SplineSceneProps) => {
    const [isLoaded, setIsLoaded] = useState(false);

    function onLoad(_spline: any) {
        setIsLoaded(true);
        console.log('Spline scene loaded successfully!');

        // You can add event listeners here
        // spline.addEventListener('mouseDown', (e) => {
        //   console.log('Clicked:', e.target.name);
        // });
    }

    return (
        <div className={`relative w-full h-full ${className}`}>
            {/* Loading indicator */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                        <p>Loading 3D Scene...</p>
                    </div>
                </div>
            )}

            {/* Spline Scene */}
            <Spline
                scene={sceneUrl}
                onLoad={onLoad}
                className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
};

// Example usage:
// <SplineScene sceneUrl="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode" />
