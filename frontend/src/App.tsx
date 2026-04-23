import { useEffect, useMemo, useState } from "react";

import { setMuted } from "@/engine/audio";
import { FloorAgency } from "@/floors/FloorAgency";
import { FloorEducation } from "@/floors/FloorEducation";
import { FloorEntrance } from "@/floors/FloorEntrance";
import { FloorExperience } from "@/floors/FloorExperience";
import { Viewport } from "@/game/Viewport";
import { api } from "@/lib/api";
import { useGame } from "@/stores/gameStore";
import { CRTOverlay } from "@/ui/CRTOverlay";
import { ChatModal } from "@/ui/ChatModal";
import { ContactModal } from "@/ui/ContactModal";
import { ControlsHelp } from "@/ui/ControlsHelp";
import { DeathOverlay } from "@/ui/DeathOverlay";
import { DialogBox } from "@/ui/DialogBox";
import { FloorIntro } from "@/ui/FloorIntro";
import { HUD } from "@/ui/HUD";
import { HealthHUD } from "@/ui/HealthHUD";
import { LoadingScreen } from "@/ui/LoadingScreen";
import { MobileControls } from "@/ui/MobileControls";
import { ProfileCard } from "@/ui/ProfileCard";
import { ResumeModal } from "@/ui/ResumeModal";
import type { Floor } from "@/types/game";

/** Interactable kinds that count toward torch progress. */
const CONTENT_KINDS = new Set(["chest", "chest_contact"]);

function isTouch(): boolean {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export default function App() {
  const floorId = useGame((s) => s.floorId);
  const loading = useGame((s) => s.loading);
  const setLoading = useGame((s) => s.setLoading);
  const muted = useGame((s) => s.muted);
  const setTotalContentCount = useGame((s) => s.setTotalContentCount);
  const contentInteracted = useGame((s) => s.contentInteracted);

  const [floors, setFloors] = useState<Floor[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const touch = useMemo(() => isTouch(), []);

  useEffect(() => {
    setMuted(muted);
  }, [muted]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.floors();
        if (!cancelled) {
          setFloors(data);
          const total = data.reduce(
            (acc, f) =>
              acc + f.interactables.filter((i) => CONTENT_KINDS.has(i.kind)).length,
            0,
          );
          setTotalContentCount(total || 1);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Failed to load dungeon.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setLoading, setTotalContentCount]);

  if (loading) return <LoadingScreen />;
  if (err) return <ErrorBoundary detail={err} />;

  const floor = floors.find((f) => f.id === floorId);
  if (!floor) return <ErrorBoundary detail={`Floor ${floorId} missing.`} />;

  const floorChests = floor.interactables.filter((i) => CONTENT_KINDS.has(i.kind));
  const floorChestsLooted = floorChests.filter((i) => contentInteracted.has(i.id)).length;

  return (
    <div className="fixed inset-0">
      <Viewport>
        {floor.id === 0 && <FloorEntrance floor={floor} />}
        {floor.id === 1 && <FloorEducation floor={floor} />}
        {floor.id === 2 && <FloorExperience floor={floor} />}
        {floor.id === 3 && <FloorAgency floor={floor} />}
        <FloorIntro
          floorId={floor.id}
          name={floor.name}
          slug={floor.slug}
          theme={floor.theme}
          accent={floor.palette[4] ?? floor.palette[3] ?? "#fee761"}
        />
        <HUD floorId={floor.id} floorName={floor.name} />
        <HealthHUD
          floorChestsTotal={floorChests.length}
          floorChestsLooted={floorChestsLooted}
        />
        <DialogBox />
      </Viewport>
      <CRTOverlay />
      <ContactModal />
      <ResumeModal />
      <ProfileCard />
      <ChatModal />
      <ControlsHelp isTouch={touch} />
      <DeathOverlay />
      {touch && <MobileControls />}
    </div>
  );
}

function ErrorBoundary({ detail }: { detail: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bg-deepest p-4">
      <div className="nine-slice max-w-md text-center">
        <div className="font-pixel text-rune-crimson mb-3" style={{ fontSize: 12 }}>
          ⚠ THE TORCH WENT OUT
        </div>
        <div className="font-dialog text-parchment" style={{ fontSize: 16 }}>
          {detail}
        </div>
        <div className="font-dialog text-parchment mt-3" style={{ fontSize: 14, opacity: 0.6 }}>
          Check the backend is running: <code>uvicorn app.main:app --reload</code>
        </div>
      </div>
    </div>
  );
}
