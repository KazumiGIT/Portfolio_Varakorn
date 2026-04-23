import type { Profile, Social } from "@/types/game";

/**
 * Builds a vCard 3.0 blob and triggers a download. vCard 3.0 has the
 * widest contact-app support (iOS, Android native contacts, Outlook).
 */
export function downloadVCard(profile: Profile): void {
  const vcf = buildVCard(profile);
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${profile.name.replace(/\s+/g, "_")}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildVCard(profile: Profile): string {
  const phone = primaryPhone(profile.socials);
  const work = profile.socials.find((s) => s.id === "agency")?.href ?? "";
  const email = profile.email;
  const org = profile.business ?? "Orion Automation";
  const title = profile.role;
  // Kuala Lumpur / Selangor per user spec.
  const city = "Kuala Lumpur / Selangor";
  const country = "Malaysia";

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:;${esc(profile.name)};;;`,
    `FN:${esc(profile.name)}`,
    `ORG:${esc(org)}`,
    `TITLE:${esc(title)}`,
  ];

  if (phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${phone}`);
    lines.push(`TEL;TYPE=WORK,VOICE:${phone}`);
  }
  if (email) lines.push(`EMAIL;TYPE=INTERNET,PREF:${esc(email)}`);
  if (work) lines.push(`URL;TYPE=WORK:${esc(work)}`);

  // Extra URLs for each non-link-kind social.
  for (const s of profile.socials) {
    if (s.disabled) continue;
    if (s.kind && s.kind !== "link") continue;
    if (s.id === "email" || s.id === "whatsapp" || s.id === "agency") continue;
    if (!s.href || s.href === "#") continue;
    lines.push(`URL;TYPE=${esc(s.label.toUpperCase())}:${esc(s.href)}`);
  }

  lines.push(`ADR;TYPE=WORK:;;;${esc(city)};;;${esc(country)}`);
  lines.push(`NOTE:${esc(profile.tagline ?? profile.bio)}`);
  lines.push("END:VCARD");

  return lines.join("\r\n") + "\r\n";
}

function primaryPhone(socials: Social[]): string {
  const wa = socials.find((s) => s.id === "whatsapp");
  if (!wa?.href) return "";
  const m = /wa\.me\/(\+?\d+)/.exec(wa.href);
  if (!m) return "";
  // Re-prefix with "+" if missing for international format.
  const raw = m[1];
  return raw.startsWith("+") ? raw : `+${raw}`;
}

function esc(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
