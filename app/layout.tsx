import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  // Section pages set their own title; this suffixes them.
  title: {
    default: "Studio Infinite Lives",
    template: "%s — Studio Infinite Lives",
  },
  description:
    "Studio Infinite Lives builds Habi Sloth, a habit tracker for the easy going, and Team EvL, a card game.",
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
          <div className="fixed top-3 right-3 z-50">
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
