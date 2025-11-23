import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { LoadingScreen } from './components/LoadingScreen';
import { SpaceBackground } from './components/SpaceBackground';
import { ProfileBar } from './components/ProfileBar';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SEO } from './components/SEO';
import { SectionSelector } from './components/SectionSelector';
import { MusicPlayer } from './components/MusicPlayer';
import { AuthModal } from './components/AuthModal';
import { ProfileDashboard } from './components/ProfileDashboard';
import { DesktopPet } from './components/DesktopPet';
import { PetProvider } from './context/PetContext';
import { useState } from 'react';



function AppContent({ isMusicPlaying, setIsMusicPlaying }: { isMusicPlaying: boolean, setIsMusicPlaying: (playing: boolean) => void }) {
  const [isLoading, setIsLoading] = useState(true);
  // isMusicPlaying state moved to parent
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [isProfileDashboardOpen, setIsProfileDashboardOpen] = useState(false);

  const playlist = [
    { title: "เที่ยงคืนสิบห้านาที-25Hour", videoId: "nHHrkanG9bw" },
    { title: "เพลงที่เธอไม่ฟัง-Bedroom Audio", videoId: "_g7GFcVv7q4" }
  ];

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index);
    setIsMusicPlaying(true);
  };

  const handleOpenAuthModal = (tab: 'login' | 'signup') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  // Guide logic moved to DesktopPet or removed for now to prevent crash

  if (isLoading) {
    return (
      <>
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      </>
    );
  }

  return (
    <>
      <SEO />
      <SectionSelector />
      <SpaceBackground />

      <ProfileBar
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={toggleMusic}
        playlist={playlist}
        currentTrackIndex={currentTrackIndex}
        onSelectTrack={handleTrackSelect}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenProfileDashboard={() => setIsProfileDashboardOpen(true)}
      />

      <MusicPlayer
        videoId={playlist[currentTrackIndex].videoId}
        isPlaying={isMusicPlaying}
        volume={50}
        onEnded={() => {
          // Auto-play next track or loop
          const nextIndex = (currentTrackIndex + 1) % playlist.length;
          setCurrentTrackIndex(nextIndex);
        }}
      />

      <div className="relative w-full min-h-screen">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', pointerEvents: 'none', zIndex: 0 }}
        >
          <Experience />
        </Canvas>
        <Overlay onOpenAuthModal={handleOpenAuthModal} />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      <ProfileDashboard
        isOpen={isProfileDashboardOpen}
        onClose={() => setIsProfileDashboardOpen(false)}
      />

      <DesktopPet />
    </>
  );
}

function App() {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <PetProvider isMusicPlaying={isMusicPlaying}>
          <AppContent isMusicPlaying={isMusicPlaying} setIsMusicPlaying={setIsMusicPlaying} />
        </PetProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
