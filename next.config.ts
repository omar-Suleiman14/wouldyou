import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async redirects() {
    return [
      { source: "/studio", destination: "/create", permanent: true },
      // Old example pages.
      { source: "/valentine", destination: "/demo/valentine", permanent: true },
      { source: "/date-night", destination: "/demo/date", permanent: true },
      { source: "/anniversary", destination: "/demo/anniversary", permanent: true },
      { source: "/situationship", destination: "/demo/official", permanent: true },
      { source: "/unhinged-confession", destination: "/demo/date", permanent: true },
      { source: "/custom", destination: "/create", permanent: true },
      // Old dashboards were public; they now need the owner key.
      { source: "/admin/ask/:slug", destination: "/manage/:slug", permanent: true },
      { source: "/admin/:slug", destination: "/manage/:slug", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/manage/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
};

export default nextConfig;
