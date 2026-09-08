import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Required before any metadata field may use a relative URL — without it,
  // a relative `openGraph.images` is a build error rather than a silent bug.
  // It is also what lets the OG card resolve to an absolute URL, which is the
  // only form link-preview bots accept.
  metadataBase: new URL(SITE_URL),
  // Section pages set their own title; this suffixes them.
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // suppressHydrationWarning is required by next-themes: it writes the theme
  // class onto <html> before React hydrates, so the server markup differs.
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          {children}
          <SiteFooter />
          {/*
            Inside the provider so the banner picks up the theme, and last so the
            fixed banner sits over the page without a z-index fight with the
            sticky header — both are z-50, and this one is later in the DOM.
          */}
          <SiteAnalytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
