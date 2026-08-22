/**
 * Scopes the Habi Sloth palette to this route subtree.
 *
 * Everything under /habisloth renders inside `data-section="habisloth"`, which
 * swaps the semantic tokens in globals.css. Nothing else needs to know which
 * brand it is being rendered under — see plan §2.
 */
export default function HabiSlothLayout({
  children,
}: LayoutProps<"/habisloth">) {
  return <div data-section="habisloth">{children}</div>;
}
