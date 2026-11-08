export type Lang = "en" | "ar";

/** Background effect. "golden", "glitch" and "chaos" only exist on older links and render as sparkles. */
export type Effect = "roses" | "stars" | "none" | "golden" | "glitch" | "chaos";

export interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBg: string;
  text: string;
}

export interface Content {
  headline: string;
  subtext?: string;
  yesBtnText: string;
  noBtnText: string;
  noBtnOptions?: string[];
  postYesHeadline: string;
  postYesSubtext?: string;
  handwrittenMessage?: string;
}

/** Everything the recipient's page needs to render. */
export interface ExperienceData {
  slug: string;
  templateId: string;
  recipientName?: string;
  senderName?: string;
  colors: Colors;
  content: Content;
  visualPersonality: Effect;
  enableDatePicker: boolean;
  isRtl: boolean;
}

export interface Palette {
  id: string;
  name: string;
  colors: Colors;
}

export const PALETTES: Palette[] = [
  { id: "rose", name: "Rose", colors: { primary: "#C2305A", secondary: "#F07A9B", accent: "#F2B84B", background: "#FBF4F5", cardBg: "#FFFFFF", text: "#2A1219" } },
  { id: "violet", name: "Violet", colors: { primary: "#5B47C9", secondary: "#34B9E8", accent: "#F6B13A", background: "#F4F4FB", cardBg: "#FFFFFF", text: "#16152B" } },
  { id: "amber", name: "Amber", colors: { primary: "#A35508", secondary: "#E8B04D", accent: "#D9485F", background: "#FBF7F0", cardBg: "#FFFFFF", text: "#2A1D0E" } },
  { id: "jade", name: "Jade", colors: { primary: "#08775A", secondary: "#3CCB9A", accent: "#E9466C", background: "#F1F8F4", cardBg: "#FFFFFF", text: "#0E231B" } },
  { id: "night", name: "Night", colors: { primary: "#D9466F", secondary: "#9B8CFF", accent: "#F2B84B", background: "#161417", cardBg: "#221F23", text: "#F4EFF1" } },
];

export const EFFECTS: { id: Effect; label: string }[] = [
  { id: "roses", label: "Hearts" },
  { id: "stars", label: "Sparkles" },
  { id: "none", label: "None" },
];

export const DEFAULT_TAUNTS: Record<Lang, string[]> = {
  en: ["Nope", "Not that one", "Too slow", "Try again", "Nice try", "Other button"],
  ar: ["لأ لأ", "مش ده", "بعيد عنك", "قريب… بس لأ", "الزرار التاني أحسن", "إيه ده؟"],
};

export interface Template {
  id: string;
  name: Record<Lang, string>;
  paletteId: string;
  effect: Effect;
  content: Record<Lang, Content>;
}

export const TEMPLATES: Template[] = [
  {
    id: "date",
    name: { en: "First date", ar: "أول خروجة" },
    paletteId: "rose",
    effect: "roses",
    content: {
      en: {
        headline: "Would you go on a date with me?",
        subtext: "Dinner, a walk, whatever you like. I'd just like to see you.",
        yesBtnText: "Yes",
        noBtnText: "No",
        postYesHeadline: "Good answer.",
        postYesSubtext: "I'll send you the details soon.",
        handwrittenMessage: "Can't wait.",
      },
      ar: {
        headline: "نخرج سوا؟",
        subtext: "عشا، تمشية، أو أي حاجة تحبها. نفسي أشوفك.",
        yesBtnText: "أكيد",
        noBtnText: "لأ",
        postYesHeadline: "أحلى إجابة.",
        postYesSubtext: "هبعتلك التفاصيل قريب.",
        handwrittenMessage: "على ميعادنا.",
      },
    },
  },
  {
    id: "valentine",
    name: { en: "Valentine's", ar: "عيد الحب" },
    paletteId: "rose",
    effect: "roses",
    content: {
      en: {
        headline: "Will you be my Valentine?",
        subtext: "I already bought the chocolates. Don't make this awkward.",
        yesBtnText: "Yes, obviously",
        noBtnText: "No",
        postYesHeadline: "Best answer.",
        postYesSubtext: "See you on the 14th.",
        handwrittenMessage: "Happy Valentine's.",
      },
      ar: {
        headline: "الفالنتاين ده معايا؟",
        subtext: "الشوكولاتة جاهزة خلاص.",
        yesBtnText: "أكيد طبعًا",
        noBtnText: "لأ",
        postYesHeadline: "أحسن إجابة.",
        postYesSubtext: "نتقابل يوم ١٤.",
        handwrittenMessage: "فالنتاين سعيد.",
      },
    },
  },
  {
    id: "official",
    name: { en: "Make it official", ar: "نخليها رسمي" },
    paletteId: "jade",
    effect: "stars",
    content: {
      en: {
        headline: "So… are we official?",
        subtext: "We already share fries. Might as well.",
        yesBtnText: "Let's do it",
        noBtnText: "Let's not",
        postYesHeadline: "Official.",
        postYesSubtext: "Telling my friends. Updating everything.",
        handwrittenMessage: "No take-backs.",
      },
      ar: {
        headline: "نخليها رسمي؟",
        subtext: "إحنا أصلًا بنقسم البطاطس سوا.",
        yesBtnText: "يلا",
        noBtnText: "خليها كده",
        postYesHeadline: "رسمي.",
        postYesSubtext: "هقول لصحابي وأغيّر كل حاجة.",
        handwrittenMessage: "مفيش رجوع.",
      },
    },
  },
  {
    id: "anniversary",
    name: { en: "Anniversary", ar: "ذكرى سنوية" },
    paletteId: "amber",
    effect: "stars",
    content: {
      en: {
        headline: "Another year together. Shall we celebrate?",
        subtext: "Somewhere nice, my treat. You pick the night.",
        yesBtnText: "Of course",
        noBtnText: "Maybe not",
        postYesHeadline: "Here's to us.",
        postYesSubtext: "I'll book a table and let you know.",
        handwrittenMessage: "Love you.",
      },
      ar: {
        headline: "سنة كمان مع بعض. نحتفل؟",
        subtext: "مكان حلو، والعزومة عليّا.",
        yesBtnText: "طبعًا",
        noBtnText: "مش دلوقتي",
        postYesHeadline: "في صحتنا.",
        postYesSubtext: "هحجز وأقولك.",
        handwrittenMessage: "بحبك.",
      },
    },
  },
  {
    id: "plans",
    name: { en: "Weekend plans", ar: "خروجة الويكند" },
    paletteId: "violet",
    effect: "none",
    content: {
      en: {
        headline: "Free this weekend?",
        subtext: "I have an idea and I need you there.",
        yesBtnText: "I'm in",
        noBtnText: "Busy",
        postYesHeadline: "Great.",
        postYesSubtext: "I'll send you the plan.",
        handwrittenMessage: "See you there.",
      },
      ar: {
        headline: "عندك وقت الويكند ده؟",
        subtext: "عندي فكرة ومحتاجك فيها.",
        yesBtnText: "يلا بينا",
        noBtnText: "مش هينفع",
        postYesHeadline: "تمام.",
        postYesSubtext: "هبعتلك الخطة.",
        handwrittenMessage: "نتقابل هناك.",
      },
    },
  },
];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function getPalette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

export function paletteIdFor(colors: Colors): string | null {
  return PALETTES.find((p) => p.colors.primary === colors.primary && p.colors.background === colors.background)?.id ?? null;
}

/** A template rendered as a ready-to-view experience, used for demos and as the editor's starting point. */
export function templateExperience(template: Template, lang: Lang = "en"): ExperienceData {
  return {
    slug: `demo-${template.id}`,
    templateId: template.id,
    colors: getPalette(template.paletteId).colors,
    content: { ...template.content[lang], noBtnOptions: DEFAULT_TAUNTS[lang] },
    visualPersonality: template.effect,
    enableDatePicker: true,
    isRtl: lang === "ar",
  };
}
