import Image from "next/image";
import Link from "next/link";

interface ProjectCardProps {
  /** Label under the avatar. Use `\n` for the second line. */
  name: string;
  /** Square artwork, clipped to a circle. */
  src: string;
  /** Internal route, external URL, or omitted for a card that isn't a link. */
  href?: string;
}

const CARD =
  "flex w-35 flex-col items-center text-subtle no-underline transition-transform duration-200";
const LINK = "hover:scale-105 hover:text-ink focus-visible:scale-105";

/**
 * One "Our Creations" entry: circular artwork over a two-line label.
 *
 * Cards without an `href` render as plain content rather than a dead link.
 */
export function ProjectCard({ name, src, href }: ProjectCardProps) {
  const inner = (
    <>
      <Image
        className="size-30 rounded-full object-cover"
        src={src}
        alt=""
        width={240}
        height={240}
      />
      <span className="mt-4 text-center text-sm leading-snug font-medium whitespace-pre-line">
        {name}
      </span>
    </>
  );

  if (href === undefined) {
    return <div className={CARD}>{inner}</div>;
  }

  const label = name.replace("\n", " ");

  return href.startsWith("http") ? (
    <a
      className={`${CARD} ${LINK}`}
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
    >
      {inner}
    </a>
  ) : (
    <Link className={`${CARD} ${LINK}`} href={href} aria-label={label}>
      {inner}
    </Link>
  );
}

export type { ProjectCardProps };
