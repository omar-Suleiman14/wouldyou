import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { PREBUILT_TEMPLATES, getTemplateBySlugOrId } from "../lib/templates";

// ─── Templates ────────────────────────────────────────────────────────────────

export const getTemplates = query({
  args: {},
  handler: async (ctx) => {
    const dbTemplates = await ctx.db
      .query("experiences")
      .withIndex("by_is_custom", (q) => q.eq("isCustom", false))
      .take(20);

    if (dbTemplates.length > 0) return dbTemplates;
    return PREBUILT_TEMPLATES;
  },
});

export const getExperienceBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const normalizedSlug = args.slug.startsWith("/") ? args.slug : `/${args.slug}`;
    const cleanSlug = args.slug.replace(/^\//, "");
    const askPrefixed = normalizedSlug.startsWith("/ask/")
      ? normalizedSlug
      : `/ask/${cleanSlug}`;
    const unPrefixed = normalizedSlug.startsWith("/ask/")
      ? `/${cleanSlug.replace(/^ask\//, "")}`
      : normalizedSlug;

    // 1. Try exact normalized
    const dbEntry = await ctx.db
      .query("experiences")
      .withIndex("by_slug", (q) => q.eq("slug", normalizedSlug))
      .first();
    if (dbEntry) return dbEntry;

    // 2. Try cleanSlug without slash
    const altDbEntry = await ctx.db
      .query("experiences")
      .withIndex("by_slug", (q) => q.eq("slug", cleanSlug))
      .first();
    if (altDbEntry) return altDbEntry;

    // 3. Try with /ask/ prefix if not present
    if (askPrefixed !== normalizedSlug) {
      const askEntry = await ctx.db
        .query("experiences")
        .withIndex("by_slug", (q) => q.eq("slug", askPrefixed))
        .first();
      if (askEntry) return askEntry;
    }

    // 4. Try without /ask/ prefix if present
    if (unPrefixed !== normalizedSlug) {
      const unEntry = await ctx.db
        .query("experiences")
        .withIndex("by_slug", (q) => q.eq("slug", unPrefixed))
        .first();
      if (unEntry) return unEntry;
    }

    // 5. Fallback to prebuilt templates right away so prebuilt URLs always work!
    const prebuilt =
      getTemplateBySlugOrId(normalizedSlug) ||
      getTemplateBySlugOrId(cleanSlug) ||
      getTemplateBySlugOrId(unPrefixed);
    if (prebuilt) return prebuilt;

    return null;
  },
});

export const createExperience = mutation({
  args: {
    templateId: v.string(),
    title: v.string(),
    recipientName: v.optional(v.string()),
    senderName: v.optional(v.string()),
    colors: v.object({
      primary: v.string(),
      secondary: v.string(),
      accent: v.string(),
      background: v.string(),
      cardBg: v.string(),
      text: v.string(),
    }),
    content: v.object({
      headline: v.string(),
      subtext: v.optional(v.string()),
      yesBtnText: v.string(),
      noBtnText: v.string(),
      noBtnOptions: v.optional(v.array(v.string())),
      postYesHeadline: v.string(),
      postYesSubtext: v.optional(v.string()),
      handwrittenMessage: v.optional(v.string()),
    }),
    visualPersonality: v.union(
      v.literal("roses"),
      v.literal("stars"),
      v.literal("golden"),
      v.literal("glitch"),
      v.literal("chaos")
    ),
    customSlug: v.optional(v.string()),
    enableDatePicker: v.optional(v.boolean()),
    isRtl: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let slug = "";
    if (args.customSlug && args.customSlug.trim()) {
      const cleanCustom = args.customSlug.trim().replace(/^\//, "");
      slug = cleanCustom.startsWith("ask/") ? `/${cleanCustom}` : `/ask/${cleanCustom}`;
    }

    if (!slug) {
      const cleanTitle = args.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ask";
      const randomId = Math.random().toString(36).substring(2, 7);
      slug = `/ask/${cleanTitle}-${randomId}`;
    }

    const existing = await ctx.db
      .query("experiences")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) slug = `${slug}-${Math.floor(Math.random() * 1000)}`;

    const id = await ctx.db.insert("experiences", {
      slug,
      templateId: args.templateId,
      title: args.title,
      recipientName: args.recipientName,
      senderName: args.senderName,
      colors: args.colors,
      content: args.content,
      visualPersonality: args.visualPersonality,
      isCustom: true,
      enableDatePicker: args.enableDatePicker ?? true,
      isRtl: args.isRtl ?? false,
      views: 1,
      yesCount: 0,
    });

    return { id, slug };
  },
});

export const recordView = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const normalizedSlug = args.slug.startsWith("/") ? args.slug : `/${args.slug}`;
    const entry = await ctx.db
      .query("experiences")
      .withIndex("by_slug", (q) => q.eq("slug", normalizedSlug))
      .first();
    if (entry) {
      await ctx.db.patch(entry._id, { views: (entry.views || 0) + 1 });
    }
  },
});

export const recordYes = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const normalizedSlug = args.slug.startsWith("/") ? args.slug : `/${args.slug}`;
    const entry = await ctx.db
      .query("experiences")
      .withIndex("by_slug", (q) => q.eq("slug", normalizedSlug))
      .first();
    if (entry) {
      await ctx.db.patch(entry._id, { yesCount: (entry.yesCount || 0) + 1 });
    }
  },
});

// ─── Responses ────────────────────────────────────────────────────────────────

export const submitResponse = mutation({
  args: {
    experienceSlug: v.string(),
    answeredYes: v.boolean(),
    respondentName: v.optional(v.string()),
    pickedDate: v.optional(v.string()),
    pickedTime: v.optional(v.string()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const slug = args.experienceSlug.startsWith("/")
      ? args.experienceSlug
      : `/${args.experienceSlug}`;

    const id = await ctx.db.insert("responses", {
      experienceSlug: slug,
      answeredYes: args.answeredYes,
      respondentName: args.respondentName,
      pickedDate: args.pickedDate,
      pickedTime: args.pickedTime,
      message: args.message,
      createdAt: Date.now(),
    });

    // Also bump yes count on the experience
    if (args.answeredYes) {
      const exp = await ctx.db
        .query("experiences")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (exp) {
        await ctx.db.patch(exp._id, { yesCount: (exp.yesCount || 0) + 1 });
      }
    }

    return { id };
  },
});

export const getResponses = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const slug = args.slug.startsWith("/") ? args.slug : `/${args.slug}`;
    return await ctx.db
      .query("responses")
      .withIndex("by_slug", (q) => q.eq("experienceSlug", slug))
      .order("desc")
      .collect();
  },
});

export const getResponseStats = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const slug = args.slug.startsWith("/") ? args.slug : `/${args.slug}`;
    const all = await ctx.db
      .query("responses")
      .withIndex("by_slug", (q) => q.eq("experienceSlug", slug))
      .collect();

    const yes = all.filter((r) => r.answeredYes).length;
    const no = all.filter((r) => !r.answeredYes).length;

    const exp = await ctx.db
      .query("experiences")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    return { total: all.length, yes, no, views: exp?.views || 0 };
  },
});

// ─── Seed ─────────────────────────────────────────────────────────────────────

export const seedPrebuiltTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    for (const template of PREBUILT_TEMPLATES) {
      const existing = await ctx.db
        .query("experiences")
        .withIndex("by_slug", (q) => q.eq("slug", template.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("experiences", { ...template });
      } else {
        await ctx.db.patch(existing._id, {
          colors: template.colors,
          content: template.content,
          visualPersonality: template.visualPersonality,
          title: template.title,
        });
      }
    }
    return "Seeded successfully!";
  },
});
