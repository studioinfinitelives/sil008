/** Scopes the Fantasy Apples palette to this subtree. See `habisloth/layout.tsx`. */
export default function FantasyApplesLayout({
  children,
}: LayoutProps<"/fantasyapples">) {
  return <div data-section="fantasyapples">{children}</div>;
}
