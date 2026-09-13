/**
 * Scopes the Habi Sloth palette to this subtree. `data-section` swaps the
 * semantic tokens in globals.css, so no component knows which brand it is in.
 */
export default function HabiSlothLayout({
  children,
}: LayoutProps<"/habisloth">) {
  return <div data-section="habisloth">{children}</div>;
}
