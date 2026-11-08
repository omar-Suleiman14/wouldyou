// Shared by the editor (to show limits) and Convex (to enforce them).

export const LIMITS = {
  name: 40,
  headline: 140,
  subtext: 280,
  button: 40,
  taunt: 40,
  taunts: 8,
  postHeadline: 140,
  postSubtext: 280,
  note: 160,
  message: 500,
  slugMin: 3,
  slugMax: 48,
} as const;

export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

// Paths the app already uses, so a custom link can never shadow them.
export const RESERVED_SLUGS = new Set([
  "admin", "api", "ask", "create", "demo", "manage", "new", "preview", "studio", "static",
]);

export function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/^ask\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type SlugProblem = "short" | "long" | "format" | "reserved";

export function checkSlug(slug: string): SlugProblem | null {
  if (slug.length < LIMITS.slugMin) return "short";
  if (slug.length > LIMITS.slugMax) return "long";
  if (!SLUG_PATTERN.test(slug)) return "format";
  if (RESERVED_SLUGS.has(slug)) return "reserved";
  return null;
}

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const ISO_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
