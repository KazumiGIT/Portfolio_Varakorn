import { useEffect, useState } from "react";

const FLOOR_GLYPHS: Record<string, string> = {
  archives: "📚",
  "echo-chamber": "📢",
  forge: "🔨",
  throne: "👑",
};

type Props = {
  floorId: number;
  name: string;
  slug: string;
  theme: string;
  accent?: string;
};

/**
 * Floor intro signboard. Shows the floor name + theme as a large pixel banner
 * when the floor changes. Fades/steps out after ~2.8s so it doesn't block play.
 */
export function FloorIntro({ floorId, name, slug, theme, accent = "#fee761" }: Props) {
  const [stage, setStage] = useState<"in" | "hold" | "out" | "gone">("gone");

  useEffect(() => {
    setStage("in");
    const t1 = window.setTimeout(() => setStage("hold"), 350);
    const t2 = window.setTimeout(() => setStage("out"), 2400);
    const t3 = window.setTimeout(() => setStage("gone"), 2900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [floorId]);

  if (stage === "gone") return null;

  const glyph = FLOOR_GLYPHS[slug] ?? "⬥";
  const progress = stage === "in" ? 0 : stage === "hold" ? 1 : 1;
  const opacity = stage === "out" ? 0 : 1;

  return (
    <div
      className="absolute inset-0 flex items-start justify-center pointer-events-none"
      style={{
        paddingTop: 36,
        zIndex: 450,
        opacity,
        transition: "opacity 500ms steps(4)",
      }}
    >
      <div
        className="nine-slice text-center no-select"
        style={{
          borderColor: accent,
          background: "#0e0e12",
          padding: "10px 16px",
          minWidth: 220,
          maxWidth: 280,
          transform: `scale(${progress === 0 ? 0.92 : 1})`,
          transition: "transform 350ms steps(5)",
          boxShadow: `4px 4px 0 0 #000, 0 0 0 2px ${accent}33`,
        }}
      >
        <div
          className="font-pixel"
          style={{
            fontSize: 6,
            letterSpacing: 2,
            color: "#566c86",
            marginBottom: 4,
          }}
        >
          ⬥ FLOOR {floorId} ⬥
        </div>
        <div
          className="font-pixel"
          style={{
            fontSize: 11,
            color: accent,
            letterSpacing: 1,
            lineHeight: "13px",
          }}
        >
          {glyph} {name.toUpperCase()}
        </div>
        <div
          className="font-dialog"
          style={{
            fontSize: 11,
            color: "#c7dcd0",
            marginTop: 5,
            lineHeight: "12px",
          }}
        >
          {theme}
        </div>
      </div>
    </div>
  );
}
