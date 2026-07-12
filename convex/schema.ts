import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  experiences: defineTable({
    slug: v.string(),
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
    isCustom: v.boolean(),
    enableDatePicker: v.optional(v.boolean()),
    isRtl: v.optional(v.boolean()),
    views: v.optional(v.number()),
    yesCount: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_template_id", ["templateId"])
    .index("by_is_custom", ["isCustom"]),

  responses: defineTable({
    experienceSlug: v.string(),
    answeredYes: v.boolean(),
    respondentName: v.optional(v.string()),
    pickedDate: v.optional(v.string()),  // ISO "2024-02-14"
    pickedTime: v.optional(v.string()),  // "19:30"
    message: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_slug", ["experienceSlug"]),
});
