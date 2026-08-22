"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Wraps next-themes so the rest of the tree stays server components.
 *
 * `attribute="class"` puts `.dark` on <html>, which is what both shadcn's
 * `@custom-variant dark` and the token blocks in globals.css key off.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemeProvider>) {
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
}
