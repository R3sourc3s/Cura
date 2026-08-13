import type { NextConfig } from "next";

// The app leans on inline `style={{...}}` throughout (every dashboard/marketing
// component) and one inline bootstrap <script> in layout.tsx for FOUC-free theme
// init, so script-src/style-src need 'unsafe-inline' rather than a nonce-based
// policy — a real refactor (middleware-issued nonces threaded through that one
// script tag) would let this drop 'unsafe-inline', but isn't done here. The other
// directives (frame-ancestors, object-src, base-uri) still meaningfully narrow
// the attack surface even with that concession.
// React dev mode uses eval() for better stack traces/hot-reload — harmless
// (dev server isn't customer-facing) but needs 'unsafe-eval' to not break the
// dev experience. React never uses eval() in production, so prod stays strict.
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://images.unsplash.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // camera/geolocation/payment etc. aren't used anywhere in the app; microphone
  // is (VoiceInputButton), so that's allowed for same-origin only.
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
