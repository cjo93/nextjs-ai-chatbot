import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: {
    default: "DEFRAG - Mechanical Clarity for Relational Dynamics",
    template: "%s | DEFRAG",
  },
  description:
    "Transform relational friction into clarity using deterministic Human Design mechanics. Track events, understand patterns, evolve consciously.",
  keywords: [
    "human design",
    "relationship compatibility",
    "emotional intelligence",
    "self-awareness",
    "personal development",
  ],
  authors: [{ name: "DEFRAG" }],
  creator: "DEFRAG",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://defrag.app",
    title: "DEFRAG - Mechanical Clarity for Relational Dynamics",
    description:
      "Transform relational friction into clarity using deterministic Human Design mechanics.",
    siteName: "DEFRAG",
    images: [
      {
        url: "https://defrag.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "DEFRAG Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DEFRAG - Mechanical Clarity for Relational Dynamics",
    description:
      "Transform relational friction into clarity using deterministic Human Design mechanics.",
    images: ["https://defrag.app/og-image.png"],
    creator: "@defrag_app",
  },
  metadataBase: new URL("https://defrag.app"),
  alternates: {
    canonical: "https://defrag.app",
  },
  verification: {
    // Add your Google site verification code here after claiming the domain in Google Search Console
    // google: 'your-verification-code',
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const LIGHT_THEME_COLOR = "hsl(0 0% 100%)";
const DARK_THEME_COLOR = "hsl(240deg 10% 3.92%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${geist.variable} ${geistMono.variable}`}
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required"
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <Toaster position="top-center" />
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
