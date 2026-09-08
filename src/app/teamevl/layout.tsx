/**
 * Scopes the Team EvL palette to this route subtree.
 *
 * Everything under /teamevl renders inside `data-section="teamevl"`, which
 * swaps the semantic tokens in globals.css — the same mechanism /habisloth
 * uses, with a violet brand instead of a yellow one.
 */
export default function TeamEvlLayout({ children }: LayoutProps<"/teamevl">) {
  return <div data-section="teamevl">{children}</div>;
}
