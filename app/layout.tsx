import type { Metadata, Viewport } from "next";
import { Caveat, IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({ variable: "--font-arabic", subsets: ["arabic"], weight: ["400", "500", "600", "700"], display: "swap" });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "wouldu — ask them properly", template: "%s · wouldu" },
  description:
    "Make a page that asks someone out, with a No button that won't hold still. When they say yes, they pick a day and you see it. Free, no sign-up.",
  openGraph: {
    title: "wouldu — ask them properly",
    description: "A link that asks the question for you. When they say yes, they pick a day.",
    type: "website",
    siteName: "wouldu",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcfb" },
    { media: "(prefers-color-scheme: dark)", color: "#171716" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${arabic.variable} ${caveat.variable}`}>
      <body className="min-h-dvh">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
