import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { ConvexClientProvider } from "../components/ConvexClientProvider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "WouldYou. | The Question They Can't Escape",
  description:
    "Build beautiful, interactive will-you-go-out-with-me experiences. Physics-powered 'No' button, calendar date picking, and real-time response tracking — all in one shareable link.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "WouldYou. | The Question They Can't Escape",
    description: "An absurdly over-animated, Apple-polished way to ask someone out.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        {/* DNS prefetch for Convex */}
        <link rel="dns-prefetch" href="https://bold-hamster-16.eu-west-1.convex.cloud" />
        <link rel="preconnect" href="https://bold-hamster-16.eu-west-1.convex.cloud" crossOrigin="anonymous" />
        {/* Prefetch key routes */}
        <link rel="prefetch" href="/studio" as="document" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#FAFAFA] text-[#111318] font-sans selection:bg-pink-500 selection:text-white overflow-x-hidden"
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
