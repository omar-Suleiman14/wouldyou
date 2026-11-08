// Links this browser created, with the owner key that unlocks their results.
// Stored only in localStorage: clearing site data loses them, which the UI says plainly.

export interface OwnedLink {
  slug: string;
  ownerKey: string;
  headline: string;
  recipientName?: string;
  createdAt: number;
}

const KEY = "wouldu:links";

export function readOwnedLinks(): OwnedLink[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((l) => l && typeof l.slug === "string" && typeof l.ownerKey === "string") : [];
  } catch {
    return [];
  }
}

function write(links: OwnedLink[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(links.slice(0, 50)));
  } catch {
    // Storage full or blocked: the link still works, the user just has to keep the results URL.
  }
}

export function saveOwnedLink(link: OwnedLink) {
  write([link, ...readOwnedLinks().filter((l) => l.slug !== link.slug)]);
}

export function forgetOwnedLink(slug: string) {
  write(readOwnedLinks().filter((l) => l.slug !== slug));
}

export function ownsLink(slug: string) {
  return readOwnedLinks().some((l) => l.slug === slug);
}

export function newOwnerKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function resultsPath(slug: string, ownerKey: string) {
  return `/manage/${slug}#key=${ownerKey}`;
}
