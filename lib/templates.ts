export type VisualPersonality = "roses" | "stars" | "golden" | "glitch" | "chaos";

export interface ExperienceTemplate {
  slug: string;
  templateId: string;
  title: string;
  recipientName?: string;
  senderName?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBg: string;
    text: string;
  };
  content: {
    headline: string;
    subtext: string;
    yesBtnText: string;
    noBtnText: string;
    noBtnOptions?: string[];
    postYesHeadline: string;
    postYesSubtext: string;
    handwrittenMessage?: string;
  };
  visualPersonality: VisualPersonality;
  isCustom: boolean;
  views?: number;
  yesCount?: number;
}

export const PREBUILT_TEMPLATES: ExperienceTemplate[] = [
  {
    slug: "/valentine",
    templateId: "valentine",
    title: "Valentine Rose",
    recipientName: "",
    senderName: "",
    colors: {
      primary: "#E02478", // High-elegance Studio Ghibli rose
      secondary: "#FF73B3",
      accent: "#F6C15B", // Warm cream gold
      background: "#F8F4F6", // Pristine Apple warm blush pearl
      cardBg: "#FFFFFF",
      text: "#1A1016",
    },
    content: {
      headline: "Will you be my Valentine?",
      subtext: "I promise endless snacks, spontaneous adventures, and zero terrible movie recommendations. What do you say?",
      yesBtnText: "Yes, obviously! 💖",
      noBtnText: "No chance 🛑",
      postYesHeadline: "Best. Decision. Ever. 🎉",
      postYesSubtext: "You just made me the happiest person around! Check your DMs shortly—we're celebrating in style. 🌹✨",
      handwrittenMessage: "It's a date! Can't wait to see you then 💕",
    },
    visualPersonality: "roses",
    isCustom: false,
    views: 124,
    yesCount: 118,
  },
  {
    slug: "/date-night",
    templateId: "date-night",
    title: "Midnight Starlight",
    recipientName: "",
    senderName: "",
    colors: {
      primary: "#5A44C9", // Luxury electric violet
      secondary: "#30C8F6",
      accent: "#FFB82E",
      background: "#F4F5FB", // Clean starlight pearl
      cardBg: "#FFFFFF",
      text: "#111422",
    },
    content: {
      headline: "Are you free for Date Night?",
      subtext: "Drinks, incredible food, stargazing, and laughing until our cheeks hurt. I've got the whole evening planned.",
      yesBtnText: "Count me in! 🍸",
      noBtnText: "I'm boring 😴",
      postYesHeadline: "It's a Date! 🥂✨",
      postYesSubtext: "Get your favorite outfit ready. I'll pick you up at 7:00 PM sharp. Prepare for a 5-star night under the city lights!",
      handwrittenMessage: "See you under the stars ✨",
    },
    visualPersonality: "stars",
    isCustom: false,
    views: 98,
    yesCount: 92,
  },
  {
    slug: "/anniversary",
    templateId: "anniversary",
    title: "Kyoto Sunset Gold",
    recipientName: "",
    senderName: "",
    colors: {
      primary: "#D98818", // Warm Studio Ghibli amber
      secondary: "#F4C46B",
      accent: "#E84E60",
      background: "#FBF8F3", // Japanese rice paper ivory
      cardBg: "#FFFFFF",
      text: "#1F1810",
    },
    content: {
      headline: "Another amazing chapter together. Ready for more?",
      subtext: "Every single day with you is my favorite adventure. Will you celebrate our forever with me tonight?",
      yesBtnText: "To Infinity & Beyond 🥂",
      noBtnText: "Maybe next year 🙈",
      postYesHeadline: "Forever Yours ❤️🔥",
      postYesSubtext: "Thank you for being my rock, my best friend, and my greatest love. Tonight is all about us!",
      handwrittenMessage: "Here's to us, forever and always 🥂",
    },
    visualPersonality: "golden",
    isCustom: false,
    views: 86,
    yesCount: 85,
  },
  {
    slug: "/situationship",
    templateId: "situationship",
    title: "Cyber Mint Jade",
    recipientName: "",
    senderName: "",
    colors: {
      primary: "#00B87A", // Crisp jade emerald
      secondary: "#33E6AC",
      accent: "#FF2B5E",
      background: "#F3FAF7", // Clean sage pearl
      cardBg: "#FFFFFF",
      text: "#0C1F18",
    },
    content: {
      headline: "Should we finally delete Hinge together?",
      subtext: "We spend every weekend together anyway. Let's make this situationship official before my friends stage an intervention.",
      yesBtnText: "Let's lock it in 🔒",
      noBtnText: "Let's keep it complicated 👻",
      postYesHeadline: "Official Status: Locked! 🔐💖",
      postYesSubtext: "Brace yourself—you're officially my plus-one to every wedding, dinner party, and lazy Sunday brunch from now on!",
      handwrittenMessage: "No taking it back now! 😉",
    },
    visualPersonality: "glitch",
    isCustom: false,
    views: 210,
    yesCount: 189,
  },
  {
    slug: "/unhinged-confession",
    templateId: "unhinged",
    title: "Tokyo Cyber Red",
    recipientName: "",
    senderName: "",
    colors: {
      primary: "#E61919", // Clean hyper red
      secondary: "#FF7700",
      accent: "#00E5FF",
      background: "#FCF4F4", // Clean warm white
      cardBg: "#FFFFFF",
      text: "#210B0B",
    },
    content: {
      headline: "I am respectfully 1000% obsessed with you. Go out with me?",
      subtext: "If you say no, I will cry in the rain while dramatic violin music plays. If you say yes, I will personally buy you 500 tacos.",
      yesBtnText: "I want the 500 tacos 🌮",
      noBtnText: "Call security 🚨",
      postYesHeadline: "TACO TIME BABY! 🌮🚀",
      postYesSubtext: "You have unlocked the highest tier of affection! Prepare for overwhelming hype, legendary memes, and unconditional loyalty!",
      handwrittenMessage: "Get ready for those 500 tacos 🌮🔥",
    },
    visualPersonality: "chaos",
    isCustom: false,
    views: 342,
    yesCount: 310,
  },
];

export function getTemplateBySlugOrId(slugOrId: string): ExperienceTemplate | undefined {
  const normalized = slugOrId.startsWith("/") ? slugOrId : `/${slugOrId}`;
  return PREBUILT_TEMPLATES.find(
    (t) => t.slug === normalized || t.templateId === slugOrId || `/${t.templateId}` === normalized
  );
}
