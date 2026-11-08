import type { Lang } from "./templates";

/** Interface text on the recipient's page. It follows the link's language, not the visitor's. */
export const EXPERIENCE_COPY = {
  en: {
    to: (name: string) => `For ${name}`,
    from: (name: string) => `From ${name}`,
    toFrom: (to: string, from: string) => `For ${to}, from ${from}`,
    preview: "Preview. Answers aren't saved.",
    restart: "Start again",
    pickDay: "Pick a day",
    pickDayHint: "When works for you?",
    time: "Time",
    noteLabel: "Add a note",
    optional: "optional",
    notePlaceholder: "Anything you'd like them to know",
    send: "Send",
    sending: "Sending…",
    skip: "Just say yes, no date",
    addToCalendar: "Add to calendar",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    soundOn: "Sound on",
    soundOff: "Sound off",
    sendFailed: "Couldn't send your answer. Check your connection and try again.",
    makeYourOwn: "Make your own",
    noLabel: "This button doesn't want to be pressed",
    calendarTitle: (from?: string) => (from ? `Date with ${from}` : "Date"),
  },
  ar: {
    to: (name: string) => `إلى ${name}`,
    from: (name: string) => `من ${name}`,
    toFrom: (to: string, from: string) => `إلى ${to}، من ${from}`,
    preview: "معاينة. الإجابات مش بتتحفظ.",
    restart: "ابدأ من الأول",
    pickDay: "اختار يوم",
    pickDayHint: "إمتى يناسبك؟",
    time: "الساعة",
    noteLabel: "اكتب ملاحظة",
    optional: "اختياري",
    notePlaceholder: "أي حاجة حابب تقولها",
    send: "إرسال",
    sending: "جارٍ الإرسال…",
    skip: "موافق، من غير ميعاد",
    addToCalendar: "أضف للتقويم",
    prevMonth: "الشهر اللي فات",
    nextMonth: "الشهر الجاي",
    soundOn: "الصوت شغال",
    soundOff: "الصوت مقفول",
    sendFailed: "مقدرناش نبعت إجابتك. اتأكد من الاتصال وجرّب تاني.",
    makeYourOwn: "اعمل واحد ليك",
    noLabel: "الزرار ده مش عايز يتداس",
    calendarTitle: (from?: string) => (from ? `ميعاد مع ${from}` : "ميعاد"),
  },
} satisfies Record<Lang, Record<string, unknown>>;

export function langOf(isRtl: boolean): Lang {
  return isRtl ? "ar" : "en";
}

export function intlLocale(lang: Lang) {
  return lang === "ar" ? "ar-EG" : "en-US";
}
