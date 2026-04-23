import { useGame } from "@/stores/gameStore";

/**
 * "YOU DIED" style overlay. Not a fail state — portfolio dungeon shouldn't
 * punish the player with a full reset, so we just restore HP and respawn them
 * at the current floor's spawn tile.
 */
export function DeathOverlay() {
  const open = useGame((s) => s.deathOverlayOpen);
  const resetHp = useGame((s) => s.resetHp);
  const setFloor = useGame((s) => s.setFloor);
  const floorId = useGame((s) => s.floorId);

  if (!open) return null;

  const respawn = () => {
    resetHp();
    // Nudge the floor state so Dungeon remounts the spawn position.
    setFloor(floorId);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/85"
      style={{ zIndex: 10090 }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="nine-slice text-center"
        style={{
          borderColor: "#b13e53",
          padding: 24,
          maxWidth: 360,
        }}
      >
        <div
          className="font-pixel text-rune-crimson mb-3"
          style={{ fontSize: 18, letterSpacing: 3 }}
        >
          YOU DIED
        </div>
        <div
          className="font-dialog text-parchment mb-4"
          style={{ fontSize: 16, lineHeight: "18px" }}
        >
          The dungeon claims another soul. Loot and defeated enemies are
          preserved — walk back and try again.
        </div>
        <button
          type="button"
          onClick={respawn}
          className="btn-pixel"
          style={{ background: "#b13e53" }}
        >
          RESPAWN
        </button>
      </div>
    </div>
  );
}
