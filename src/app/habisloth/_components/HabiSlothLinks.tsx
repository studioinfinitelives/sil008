/**
 * Habi Sloth's legal pages live on the app's own site, like Fantasy Apples'
 * (`lib/faLinks.ts`). This site never keeps a copy.
 */

const APP_URL = "https://habisloth.app";

const LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: `${APP_URL}/privacy.html`, label: "Privacy Policy" },
  { href: `${APP_URL}/terms.html`, label: "Terms & Conditions" },
];

export function HabiSlothLinks() {
  return (
    <nav
      className="border-line mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-sm"
      aria-label="Habi Sloth legal"
    >
      {LINKS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="text-link underline underline-offset-4"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
