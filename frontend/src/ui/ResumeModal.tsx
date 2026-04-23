import { useGame } from "@/stores/gameStore";

/**
 * Accessibility + speed-runner modal. Plain text resume for users who don't
 * want to play the dungeon.
 */
export function ResumeModal() {
  const open = useGame((s) => s.resumeOpen);
  const close = useGame((s) => s.setResumeOpen);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/70"
      style={{ zIndex: 10050 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-title"
    >
      <div
        className="nine-slice w-full max-w-[640px] max-h-[80vh] overflow-y-auto text-parchment"
        style={{ borderColor: "#ffcd75" }}
      >
        <div className="flex items-start justify-between mb-3">
          <h2
            id="resume-title"
            className="font-pixel text-torch-flame"
            style={{ fontSize: 12, letterSpacing: 2 }}
          >
            ⬥ VARAKORN — TEXT RESUME
          </h2>
          <button
            onClick={() => close(false)}
            className="font-pixel text-parchment"
            style={{
              fontSize: 10,
              padding: "4px 8px",
              background: "#b13e53",
              border: "2px solid #f4f0bc",
              cursor: "pointer",
            }}
          >
            [X] CLOSE
          </button>
        </div>

        <div className="font-dialog" style={{ fontSize: 16, lineHeight: "20px" }}>
          <p><strong>Varakorn (Kazumi)</strong> — Full Stack AI Engineer</p>
          <p>Orion Automation — SSM-registered sole proprietorship</p>
          <p>Shah Alam, Selangor, Malaysia · varakornm0403@gmail.com</p>
          <p>Languages: English, Malay, Chinese, spoken Thai</p>

          <h3 className="font-pixel text-torch-ember mt-4" style={{ fontSize: 10 }}>EDUCATION</h3>
          <p>— Kolej Komuniti, IT Certificate</p>
          <p>— Gamuda AI Academy, Full Stack AI Engineer (presented prototype to Minister YB Chang Lih Kang)</p>

          <h3 className="font-pixel text-torch-ember mt-4" style={{ fontSize: 10 }}>EXPERIENCE</h3>
          <p>— HYGR — Content creation, 38M+ views across social media, Natural Deodorant campaigns</p>
          <p>— Orion Automation — Custom web solutions, BPA, workflow automation, SEO/AEO/GEO via vibe coding</p>

          <h3 className="font-pixel text-torch-ember mt-4" style={{ fontSize: 10 }}>PROJECTS</h3>
          <p>— Tendervise AI</p>
          <p>— Abang Mystery</p>
          <p>— Health Monitor</p>
          <p>— HYGR Operations Automation</p>

          <h3 className="font-pixel text-torch-ember mt-4" style={{ fontSize: 10 }}>SKILLS</h3>
          <p>Python (primary), FastAPI, React, Langchain, AI agents, backend development, AI integration</p>
        </div>
      </div>
    </div>
  );
}
