import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

interface ProjectCardBase {
  /** Primary label under the artwork. */
  name: string;
  /** Optional second line, rendered as its own element. */
  subtitle?: string;
  /** Square artwork, clipped to a circle. */
  src: string;
}

/**
 * A card is exactly one of three things: an internal link, an external link, or
 * not a link.
 *
 * The `?: never` arms are load-bearing — they stop `to` and `externalUrl` being
 * passed together. `to: Route` fails `tsc` when the route does not exist, which
 * an `href.startsWith("http")` check could not do.
 */
export type ProjectCardProps = ProjectCardBase &
  (
    | { to: Route; externalUrl?: never }
    | { externalUrl: string; to?: never }
    | { to?: never; externalUrl?: never }
  );

const CARD =
  "flex w-35 flex-col items-center text-subtle no-underline transition-transform duration-200";
const LINK = "hover:scale-105 hover:text-ink focus-visible:scale-105";

/** One "Our Creations" entry: circular artwork over a one- or two-line label. */
export function ProjectCard({
  name,
  subtitle,
  src,
  to,
  externalUrl,
}: ProjectCardProps) {
  // `alt=""` marks the artwork decorative and the link carries the accessible
  // name, so a screen reader announces the label once rather than twice.
  const inner = (
    <>
      <Image
        className="size-30 rounded-full object-cover"
        src={src}
        alt=""
        width={240}
        height={240}
      />
      <span className="mt-4 text-center text-sm leading-snug font-medium">
        {name}
        {subtitle ? (
          <>
            <br />
            {subtitle}
          </>
        ) : null}
      </span>
    </>
  );

  const label = subtitle ? `${name} ${subtitle}` : name;

  if (to !== undefined) {
    return (
      <Link className={`${CARD} ${LINK}`} href={to} aria-label={label}>
        {inner}
      </Link>
    );
  }

  if (externalUrl !== undefined) {
    return (
      <a
        className={`${CARD} ${LINK}`}
        href={externalUrl}
        aria-label={label}
        target="_blank"
        rel="noreferrer"
      >
        {inner}
      </a>
    );
  }

  return <div className={CARD}>{inner}</div>;
}
