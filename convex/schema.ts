import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { colorsValidator, contentValidator, effectValidator } from "./validators";

export default defineSchema({
  experiences: defineTable({
    // New links store the bare slug ("dinner-friday"). Links made before the
    // owner-key change are stored as "/ask/<slug>" and still resolve.
    slug: v.string(),
    templateId: v.string(),
    title: v.string(),
    recipientName: v.optional(v.string()),
    senderName: v.optional(v.string()),
    colors: colorsValidator,
    content: contentValidator,
    visualPersonality: effectValidator,
    enableDatePicker: v.optional(v.boolean()),
    isRtl: v.optional(v.boolean()),
    // SHA-256 of the owner key. The key itself is only ever held by the creator.
    // Missing on links made before results became private.
    ownerKeyHash: v.optional(v.string()),
    views: v.optional(v.number()),
    yesCount: v.optional(v.number()),
    // Legacy field kept so existing documents still validate.
    isCustom: v.optional(v.boolean()),
  }).index("by_slug", ["slug"]),

  responses: defineTable({
    experienceSlug: v.string(),
    answeredYes: v.boolean(),
    respondentName: v.optional(v.string()),
    pickedDate: v.optional(v.string()), // "2026-02-14"
    pickedTime: v.optional(v.string()), // "19:30"
    message: v.optional(v.string()),
    // How many times the No button ran away before they said yes.
    dodges: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_experienceSlug", ["experienceSlug"]),
});
