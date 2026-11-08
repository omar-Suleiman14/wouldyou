import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { colorsValidator, contentValidator, effectValidator } from "./validators";
import { HEX_COLOR, ISO_DATE, ISO_TIME, LIMITS, checkSlug, normalizeSlug } from "../lib/limits";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Finds a link by its public slug, including links stored in the old "/ask/<slug>" form. */
async function findBySlug(ctx: QueryCtx | MutationCtx, rawSlug: string) {
  const slug = normalizeSlug(rawSlug);
  if (!slug) return null;
  for (const candidate of [slug, `/ask/${slug}`]) {
    const doc = await ctx.db
      .query("experiences")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .first(); // .first(), not .unique(): older data may hold duplicates
    if (doc) return doc;
  }
  return null;
}

async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function ownerMatches(doc: Doc<"experiences">, ownerKey: string) {
  if (!doc.ownerKeyHash || ownerKey.length < 32) return false;
  return (await sha256(ownerKey)) === doc.ownerKeyHash;
}

/** What the recipient's page needs. Never includes the owner key hash or counters. */
function publicView(doc: Doc<"experiences">) {
  return {
    slug: normalizeSlug(doc.slug),
    templateId: doc.templateId,
    recipientName: doc.recipientName,
    senderName: doc.senderName,
    colors: doc.colors,
    content: doc.content,
    visualPersonality: doc.visualPersonality,
    enableDatePicker: doc.enableDatePicker ?? true,
    isRtl: doc.isRtl ?? false,
  };
}

function tooLong(value: string | undefined, max: number) {
  return value !== undefined && value.length > max;
}

function fail(message: string): never {
  throw new ConvexError(message);
}

function clean(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 7);
}

// ─── Queries ────────────────────────────────────────────────────────────────

export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const doc = await findBySlug(ctx, args.slug);
    return doc ? publicView(doc) : null;
  },
});

export const isSlugAvailable = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const slug = normalizeSlug(args.slug);
    if (checkSlug(slug)) return false;
    return (await findBySlug(ctx, slug)) === null;
  },
});

/** Everything the creator sees. Requires the owner key that was made with the link. */
export const results = query({
  args: { slug: v.string(), ownerKey: v.string() },
  handler: async (ctx, args) => {
    const doc = await findBySlug(ctx, args.slug);
    if (!doc) return { status: "not_found" as const };
    if (!doc.ownerKeyHash) return { status: "legacy" as const };
    if (!(await ownerMatches(doc, args.ownerKey))) return { status: "wrong_key" as const };

    const responses = await ctx.db
      .query("responses")
      .withIndex("by_experienceSlug", (q) => q.eq("experienceSlug", doc.slug))
      .order("desc")
      .take(50);

    return {
      status: "ok" as const,
      experience: publicView(doc),
      createdAt: doc._creationTime,
      views: doc.views ?? 0,
      responses: responses.map((r) => ({
        id: r._id,
        createdAt: r.createdAt,
        pickedDate: r.pickedDate,
        pickedTime: r.pickedTime,
        message: r.message,
        dodges: r.dodges ?? 0,
      })),
    };
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    templateId: v.string(),
    slug: v.optional(v.string()),
    ownerKey: v.string(),
    recipientName: v.optional(v.string()),
    senderName: v.optional(v.string()),
    colors: colorsValidator,
    content: contentValidator,
    visualPersonality: effectValidator,
    enableDatePicker: v.boolean(),
    isRtl: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.ownerKey.length < 32 || args.ownerKey.length > 128) fail("Invalid owner key.");

    const c = args.content;
    const headline = c.headline.trim();
    if (!headline) fail("Write a question first.");
    if (!c.yesBtnText.trim() || !c.noBtnText.trim()) fail("Both buttons need a label.");
    if (!c.postYesHeadline.trim()) fail("Write what they see after saying yes.");
    if (
      tooLong(args.recipientName, LIMITS.name) ||
      tooLong(args.senderName, LIMITS.name) ||
      tooLong(headline, LIMITS.headline) ||
      tooLong(c.subtext, LIMITS.subtext) ||
      tooLong(c.yesBtnText, LIMITS.button) ||
      tooLong(c.noBtnText, LIMITS.button) ||
      tooLong(c.postYesHeadline, LIMITS.postHeadline) ||
      tooLong(c.postYesSubtext, LIMITS.postSubtext) ||
      tooLong(c.handwrittenMessage, LIMITS.note)
    ) {
      fail("Some text is longer than allowed.");
    }
    const taunts = (c.noBtnOptions ?? []).map((t) => t.trim()).filter(Boolean);
    if (taunts.length > LIMITS.taunts || taunts.some((t) => t.length > LIMITS.taunt)) {
      fail("Too many or too long No-button lines.");
    }
    if (!Object.values(args.colors).every((color) => HEX_COLOR.test(color))) fail("Invalid colour.");

    let slug: string;
    if (args.slug && args.slug.trim()) {
      slug = normalizeSlug(args.slug);
      const problem = checkSlug(slug);
      if (problem) fail("That link name can't be used. Use 3–48 letters, numbers or dashes.");
      if (await findBySlug(ctx, slug)) fail("That link name is taken. Try another.");
    } else {
      const base = normalizeSlug(args.recipientName ? `for-${args.recipientName}` : "ask").slice(0, 30) || "ask";
      slug = `${base}-${randomSuffix()}`;
      while (await findBySlug(ctx, slug)) slug = `${base}-${randomSuffix()}`;
    }

    await ctx.db.insert("experiences", {
      slug,
      templateId: args.templateId,
      title: headline,
      recipientName: clean(args.recipientName),
      senderName: clean(args.senderName),
      colors: args.colors,
      content: {
        headline,
        subtext: clean(c.subtext),
        yesBtnText: c.yesBtnText.trim(),
        noBtnText: c.noBtnText.trim(),
        noBtnOptions: taunts.length ? taunts : undefined,
        postYesHeadline: c.postYesHeadline.trim(),
        postYesSubtext: clean(c.postYesSubtext),
        handwrittenMessage: clean(c.handwrittenMessage),
      },
      visualPersonality: args.visualPersonality,
      enableDatePicker: args.enableDatePicker,
      isRtl: args.isRtl,
      ownerKeyHash: await sha256(args.ownerKey),
      views: 0,
      yesCount: 0,
    });

    return { slug };
  },
});

export const recordView = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const doc = await findBySlug(ctx, args.slug);
    if (doc) await ctx.db.patch("experiences", doc._id, { views: (doc.views ?? 0) + 1 });
    return null;
  },
});

/** Records a yes. There is no way to record a no: the button never lets them press it. */
export const respond = mutation({
  args: {
    slug: v.string(),
    pickedDate: v.optional(v.string()),
    pickedTime: v.optional(v.string()),
    message: v.optional(v.string()),
    dodges: v.number(),
  },
  handler: async (ctx, args) => {
    const doc = await findBySlug(ctx, args.slug);
    if (!doc) fail("This link no longer exists.");
    if (args.pickedDate && !ISO_DATE.test(args.pickedDate)) fail("Invalid date.");
    if (args.pickedTime && !ISO_TIME.test(args.pickedTime)) fail("Invalid time.");
    if (args.pickedTime && !args.pickedDate) fail("Pick a day as well as a time.");
    if (tooLong(args.message, LIMITS.message)) fail("That message is too long.");

    await ctx.db.insert("responses", {
      experienceSlug: doc.slug,
      answeredYes: true,
      pickedDate: args.pickedDate,
      pickedTime: args.pickedTime,
      message: clean(args.message),
      dodges: Math.max(0, Math.min(9999, Math.floor(args.dodges))),
      createdAt: Date.now(),
    });
    await ctx.db.patch("experiences", doc._id, { yesCount: (doc.yesCount ?? 0) + 1 });
    return null;
  },
});

/** Deletes the link and every answer to it. */
export const remove = mutation({
  args: { slug: v.string(), ownerKey: v.string() },
  handler: async (ctx, args) => {
    const doc = await findBySlug(ctx, args.slug);
    if (!doc) return null;
    if (!(await ownerMatches(doc, args.ownerKey))) fail("Only the person who made this link can delete it.");

    const responses = await ctx.db
      .query("responses")
      .withIndex("by_experienceSlug", (q) => q.eq("experienceSlug", doc.slug))
      .take(500);
    for (const r of responses) await ctx.db.delete("responses", r._id);
    await ctx.db.delete("experiences", doc._id);
    return null;
  },
});
