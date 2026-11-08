/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const KEY = "a".repeat(48);

const link = {
  templateId: "date",
  ownerKey: KEY,
  recipientName: "Sam",
  senderName: "Alex",
  colors: { primary: "#C2305A", secondary: "#F07A9B", accent: "#F2B84B", background: "#FBF4F5", cardBg: "#FFFFFF", text: "#2A1219" },
  content: { headline: "Dinner?", yesBtnText: "Yes", noBtnText: "No", postYesHeadline: "Great" },
  visualPersonality: "roses" as const,
  enableDatePicker: true,
  isRtl: false,
};

describe("experiences", () => {
  test("the public view never includes the owner key hash or counters", async () => {
    const t = convexTest(schema, modules);
    const { slug } = await t.mutation(api.experiences.create, { ...link, slug: "dinner-friday" });
    expect(slug).toBe("dinner-friday");
    const view = await t.query(api.experiences.get, { slug });
    expect(view?.content.headline).toBe("Dinner?");
    expect(view).not.toHaveProperty("ownerKeyHash");
    expect(view).not.toHaveProperty("views");
  });

  test("results need the right key", async () => {
    const t = convexTest(schema, modules);
    const { slug } = await t.mutation(api.experiences.create, link);
    expect((await t.query(api.experiences.results, { slug, ownerKey: "b".repeat(48) })).status).toBe("wrong_key");
    expect((await t.query(api.experiences.results, { slug, ownerKey: KEY })).status).toBe("ok");
  });

  test("a yes is recorded once with its date, and views are counted", async () => {
    const t = convexTest(schema, modules);
    const { slug } = await t.mutation(api.experiences.create, link);
    await t.mutation(api.experiences.recordView, { slug });
    await t.mutation(api.experiences.respond, { slug, pickedDate: "2026-02-14", pickedTime: "19:30", message: "Yay", dodges: 4 });
    const res = await t.query(api.experiences.results, { slug, ownerKey: KEY });
    if (res.status !== "ok") throw new Error(res.status);
    expect(res.views).toBe(1);
    expect(res.responses).toHaveLength(1);
    expect(res.responses[0]).toMatchObject({ pickedDate: "2026-02-14", pickedTime: "19:30", message: "Yay", dodges: 4 });
  });

  test("bad input is rejected", async () => {
    const t = convexTest(schema, modules);
    await expect(t.mutation(api.experiences.create, { ...link, slug: "create" })).rejects.toThrow();
    await t.mutation(api.experiences.create, { ...link, slug: "taken-name" });
    await expect(t.mutation(api.experiences.create, { ...link, slug: "taken-name" })).rejects.toThrow(/taken/);
    await expect(t.mutation(api.experiences.respond, { slug: "taken-name", pickedDate: "Feb 14", dodges: 0 })).rejects.toThrow();
    expect(await t.query(api.experiences.isSlugAvailable, { slug: "taken-name" })).toBe(false);
  });

  test("only the owner can delete, and deleting removes the answers", async () => {
    const t = convexTest(schema, modules);
    const { slug } = await t.mutation(api.experiences.create, link);
    await t.mutation(api.experiences.respond, { slug, dodges: 0 });
    await expect(t.mutation(api.experiences.remove, { slug, ownerKey: "c".repeat(48) })).rejects.toThrow();
    await t.mutation(api.experiences.remove, { slug, ownerKey: KEY });
    expect(await t.query(api.experiences.get, { slug })).toBeNull();
    expect(await t.run((ctx) => ctx.db.query("responses").collect())).toHaveLength(0);
  });

  test("links made before owner keys still open but have no results page", async () => {
    const t = convexTest(schema, modules);
    await t.run((ctx) =>
      ctx.db.insert("experiences", { ...link, slug: "/ask/old-one", title: "Dinner?", isCustom: true, ownerKey: undefined } as never),
    );
    expect((await t.query(api.experiences.get, { slug: "old-one" }))?.slug).toBe("old-one");
    expect((await t.query(api.experiences.results, { slug: "old-one", ownerKey: KEY })).status).toBe("legacy");
  });
});
