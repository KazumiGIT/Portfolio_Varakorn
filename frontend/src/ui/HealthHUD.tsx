import { useGame } from "@/stores/gameStore";

/**
 * Hearts + chest-progress row. Sits below the floor banner on top-center so
 * players always see their HP + how close they are to unlocking the portal.
 */
export function HealthHUD({
  floorChestsTotal,
  floorChestsLooted,
}: {
  floorChestsTotal: number;
  floorChestsLooted: number;
}) {
  const hp = useGame((s) => s.playerHp);
  const maxHp = useGame((s) => s.maxHp);

  return (
    <div
      className="absolute flex items-center gap-2 no-select"
      style={{
        top: 18,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 400,
      }}
    >
      <div
        className="flex gap-1"
        style={{
          background: "#0e0e12",
          border: "1px solid #f4f0bc",
          padding: "3px 4px",
          boxShadow: "1px 1px 0 0 #000",
        }}
      >
        {Array.from({ length: maxHp }).map((_, i) => (
          <Heart key={i} filled={i < hp} />
        ))}
      </div>
      {floorChestsTotal > 0 && (
        <div
          className="font-pixel"
          style={{
            fontSize: 6,
            background: "#0e0e12",
            border: "1px solid #ffcd75",
            padding: "3px 5px",
            color: "#ffcd75",
            boxShadow: "1px 1px 0 0 #000",
            letterSpacing: 1,
          }}
          aria-label={`Chests ${floorChestsLooted} of ${floorChestsTotal}`}
        >
          ⛁ {floorChestsLooted}/{floorChestsTotal}
        </div>
      )}
    </div>
  );
}

function Heart({ filled }: { filled: boolean }) {
  const color = filled ? "#ea4f36" : "#3e3546";
  return (
    <div
      className="pixel"
      style={{
        width: 9,
        height: 8,
        position: "relative",
      }}
      aria-hidden
    >
      {/* Top bumps */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 1,
          width: 3,
          height: 3,
          background: color,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 3,
          top: 0,
          width: 3,
          height: 3,
          background: color,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 6,
          top: 1,
          width: 3,
          height: 3,
          background: color,
        }}
      />
      {/* Body */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 2,
          width: 9,
          height: 3,
          background: color,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1,
          top: 5,
          width: 7,
          height: 2,
          background: color,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 3,
          top: 7,
          width: 3,
          height: 1,
          background: color,
        }}
      />
      {/* Highlight on filled */}
      {filled && (
        <div
          style={{
            position: "absolute",
            left: 1,
            top: 2,
            width: 2,
            height: 1,
            background: "#f77622",
          }}
        />
      )}
    </div>
  );
}
