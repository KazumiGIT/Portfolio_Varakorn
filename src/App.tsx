import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { CustomCursor } from './components/CustomCursor';
import { LoadingScreen } from './components/LoadingScreen';
import { SpaceBackground } from './components/SpaceBackground';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import { SEO } from './components/SEO';
import { SectionSelector } from './components/SectionSelector';
import { useState } from 'react';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <>
        <CustomCursor />
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      </>
    );
  }

  return (
    <>
      <SEO />
      <SectionSelector />
      <SpaceBackground />
      <CustomCursor />
      <ThemeToggle />

      <div
        data-scroll-container
        style={{
          position: 'relative',
          width: '100vw',
          minHeight: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch'
        } as React.CSSProperties}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <Experience />
        </Canvas>
        <Overlay />
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
