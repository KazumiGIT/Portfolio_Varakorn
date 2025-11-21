import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { CustomCursor } from './components/CustomCursor';
import { Navigation } from './components/Navigation';
import { LoadingScreen } from './components/LoadingScreen';
import { SpaceBackground } from './components/SpaceBackground';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import { useState } from 'react';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  const handleNavigate = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
      <SpaceBackground />
      <CustomCursor />
      <Navigation onNavigate={handleNavigate} />
      <ThemeToggle />

      <div
        data-scroll-container
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
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
