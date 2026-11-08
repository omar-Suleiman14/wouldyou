import { v } from "convex/values";

export const colorsValidator = v.object({
  primary: v.string(),
  secondary: v.string(),
  accent: v.string(),
  background: v.string(),
  cardBg: v.string(),
  text: v.string(),
});

export const contentValidator = v.object({
  headline: v.string(),
  subtext: v.optional(v.string()),
  yesBtnText: v.string(),
  noBtnText: v.string(),
  noBtnOptions: v.optional(v.array(v.string())),
  postYesHeadline: v.string(),
  postYesSubtext: v.optional(v.string()),
  handwrittenMessage: v.optional(v.string()),
});

// "golden", "glitch" and "chaos" are legacy values; they render as sparkles.
export const effectValidator = v.union(
  v.literal("roses"),
  v.literal("stars"),
  v.literal("none"),
  v.literal("golden"),
  v.literal("glitch"),
  v.literal("chaos"),
);
