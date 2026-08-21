import Image from "next/image";
import Link from "next/link";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  /** Label under the avatar. Use `\n` for the second line. */
  name: string;
  /** Square artwork, clipped to a circle. */
  src: string;
  /** Internal route, external URL, or omitted for a card that isn't a link. */
  href?: string;
}

/**
 * One "Our Creations" entry: circular artwork over a two-line label.
 *
 * Cards without an `href` render as plain content rather than a dead link —
 * Team EvL points out to its linktree, Habi Sloth in to its section, and
 * "More Coming Soon" links nowhere on purpose.
 */
export function ProjectCard({ name, src, href }: ProjectCardProps) {
  const inner = (
    <>
      <Image
        className={styles.avatar}
        src={src}
        alt=""
        width={240}
        height={240}
      />
      <span className={styles.name}>{name}</span>
    </>
  );

  if (href === undefined) {
    return <div className={styles.card}>{inner}</div>;
  }

  const isExternal = href.startsWith("http");
  const label = name.replace("\n", " ");

  return isExternal ? (
    <a
      className={styles.card}
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
    >
      {inner}
    </a>
  ) : (
    <Link className={styles.card} href={href} aria-label={label}>
      {inner}
    </Link>
  );
}

export type { ProjectCardProps };
