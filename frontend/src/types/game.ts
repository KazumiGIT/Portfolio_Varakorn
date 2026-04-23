export type InteractableKind =
  | "chest"
  | "chest_contact"
  | "enemy"
  | "portal_entrance"
  | "portal_locked"
  // legacy
  | "pedestal"
  | "altar"
  | "statue"
  | "fountain"
  | "anvil"
  | "rune"
  | "door"
  | "throne"
  | "crystal_ball"
  | "messenger_bird"
  | "screen"
  | "stairs"
  | "portal";

export interface Interactable {
  id: string;
  kind: InteractableKind;
  x: number; // tile coord
  y: number;
  w: number;
  h: number;
  label: string;
  title: string;
  body: string;
  accent?: string;
  meta?: Record<string, string | number | boolean>;
}

export interface FloorExit {
  to_floor: number;
  x: number;
  y: number;
  label: string;
}

export type SocialKind = "link" | "vcard" | "donation";
export type SocialGroup = "primary" | "others";

export interface Social {
  id: string;
  label: string;
  href: string;
  glyph: string;
  accent: string;
  kind?: SocialKind;
  group?: SocialGroup;
  disabled?: boolean;
}

export interface Profile {
  name: string;
  alias?: string | null;
  role: string;
  business?: string | null;
  email: string;
  location?: string | null;
  languages: string[];
  bio: string;
  tagline?: string | null;
  what_i_do: string[];
  socials: Social[];
}

export interface Floor {
  id: number;
  slug: string;
  name: string;
  theme: string;
  palette: string[];
  ambient: string;
  width: number;
  height: number;
  spawn: [number, number];
  exits: FloorExit[];
  interactables: Interactable[];
  soft_gate_required: string[];
}
