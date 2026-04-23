import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setDots((d) => (d + 1) % 4), 250);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-bg-deepest"
      style={{ zIndex: 10000 }}
    >
      <div className="font-pixel text-torch-flame" style={{ fontSize: 12, letterSpacing: 2 }}>
        LOADING{".".repeat(dots)}
      </div>
      {/* Pixel spinner */}
      <div
        className="mt-4 pixel"
        style={{
          width: 16,
          height: 16,
          background: "#ffcd75",
          animation: "idle-bob 500ms steps(2) infinite, glow-pulse 1.2s steps(4) infinite",
        }}
      />
      <div
        className="mt-6 font-dialog text-parchment"
        style={{ fontSize: 14, opacity: 0.6 }}
      >
        The torch flickers to life...
      </div>
    </div>
  );
}
