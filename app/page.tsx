import Link from "next/link";
import { ArrowRight, CalendarCheck, Globe, Lock } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { LiveDemo } from "@/components/site/LiveDemo";
import { TEMPLATES, getPalette } from "@/lib/templates";

/*
 * Every claim here maps to shipped code. Deliberately absent: user counts, testimonials,
 * frame rates, and anything about "analytics" beyond the open count and the answer.
 */

const steps = [
  { title: "Write the question", body: "Start from an example or from scratch. Change every word, the colours and the buttons." },
  { title: "Send the link", body: "Share it however you like. They open it on any phone or computer, no app or account." },
  { title: "See the answer", body: "Your private results page shows when it was opened, the day they picked and any note." },
];

const details = [
  { icon: Lock, title: "Results only you can see", body: "Each link comes with a private results link. Without it, nobody can see the answer, including the person you asked." },
  { icon: CalendarCheck, title: "They pick the day", body: "After yes, they choose a day and time and can leave a note. Both of you can add it to your calendar." },
  { icon: Globe, title: "English and Arabic", body: "Write in either language. Arabic links read right to left, and every button and label on their page is in Arabic too." },
];

const faq = [
  { q: "Can they actually say no?", a: "Not with the button. It moves away whenever they try. They can still close the page, or just tell you." },
  { q: "Who can see the answer?", a: "Only someone with the private results link. It's shown once when you make the link and saved in the browser you used. Keep it somewhere safe; we can't recover it." },
  { q: "What do you store?", a: "What you wrote, how many times the link was opened, and for each yes the day, time and note they chose. No accounts, cookies or tracking scripts. Deleting the link from its results page removes all of it." },
  { q: "Can I run my own copy?", a: "Yes. The source is on GitHub. It's a Next.js app with a Convex backend." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="mx-auto max-w-[1120px] px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-24">
          <h1 className="mx-auto max-w-[14ch] text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-[1.06] tracking-[-0.05em]">
            Ask them properly.
          </h1>
          <p className="mx-auto mt-6 max-w-[36rem] text-lg leading-relaxed text-soft">
            Make a page with your question and a No button that won&apos;t hold still. Send the link. When they say yes, they pick a day and you see it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/create" className="btn btn--primary btn--lg min-w-44">Make a link</Link>
            <a href="#demo" className="btn btn--secondary btn--lg min-w-44">Try it first</a>
          </div>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-muted" aria-label="At a glance">
            <li>Free</li>
            <li aria-hidden>·</li>
            <li>No sign-up</li>
            <li aria-hidden>·</li>
            <li>English and Arabic</li>
            <li aria-hidden>·</li>
            <li>Open source</li>
          </ul>
        </section>

        <section id="demo" className="mx-auto max-w-[1000px] scroll-mt-20 px-4 sm:px-6" aria-label="Live demo">
          <LiveDemo />
          <p className="mt-3 text-center text-sm text-muted">This is the real page your link opens. Try pressing No.</p>
        </section>

        <section id="how" className="mx-auto max-w-[1120px] scroll-mt-20 px-4 pt-28 sm:px-6">
          <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold tracking-[-0.04em]">How it works</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="border-t border-line pt-5">
                <span className="text-sm font-semibold tabular-nums text-accent">{i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="examples" className="mx-auto max-w-[1120px] scroll-mt-20 px-4 pt-28 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold tracking-[-0.04em]">Start from an example</h2>
              <p className="mt-3 max-w-md text-soft">Open one to see it as they would, then make it yours.</p>
            </div>
            <Link href="/create" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:text-accent">
              Start from scratch <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {TEMPLATES.map((tpl) => {
              const c = getPalette(tpl.paletteId).colors;
              return (
                <li key={tpl.id}>
                  <Link
                    href={`/demo/${tpl.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-card transition-colors hover:border-line-strong"
                  >
                    <div className="flex h-36 flex-col items-center justify-center gap-3 px-4 text-center" style={{ background: c.background, color: c.text }}>
                      <p className="text-[15px] font-semibold leading-snug tracking-[-0.02em]">{tpl.content.en.headline}</p>
                      <span className="flex gap-1.5">
                        <span className="rounded-md px-2.5 py-1 text-[11px] font-semibold text-white" style={{ background: c.primary }}>{tpl.content.en.yesBtnText}</span>
                        <span className="rounded-md border px-2.5 py-1 text-[11px]" style={{ borderColor: `color-mix(in srgb, ${c.text} 15%, transparent)` }}>{tpl.content.en.noBtnText}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3 text-sm">
                      <span className="font-medium">{tpl.name.en}</span>
                      <span className="text-muted group-hover:text-accent">Open</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mx-auto max-w-[1120px] px-4 pt-28 sm:px-6" aria-labelledby="details-title">
          <h2 id="details-title" className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold tracking-[-0.04em]">What you get</h2>
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-3">
            {details.map(({ icon: Icon, title, body }) => (
              <article key={title}>
                <Icon className="size-5 text-accent" aria-hidden />
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-soft">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-[760px] scroll-mt-20 px-4 pt-28 sm:px-6">
          <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold tracking-[-0.04em]">Questions</h2>
          <div className="mt-8 border-t border-line">
            {faq.map((f) => (
              <details key={f.q} className="group border-b border-line">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="text-xl leading-none text-muted transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="pb-5 leading-relaxed text-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1120px] px-4 pt-28 text-center sm:px-6">
          <h2 className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold tracking-[-0.04em]">Better than a text.</h2>
          <p className="mx-auto mt-3 max-w-md text-soft">It takes about a minute. You don&apos;t need an account.</p>
          <Link href="/create" className="btn btn--accent btn--lg mt-7">Make a link</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
