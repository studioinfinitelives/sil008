import type { ReactNode } from "react";
import styles from "./PageShell.module.css";

interface PageShellProps {
  /** Small label above the title — usually the section name. */
  eyebrow?: string;
  title: string;
  /** Optional standfirst under the title. */
  lede?: string;
  children?: ReactNode;
}

/**
 * The common page frame: centred measure, section eyebrow, title, body.
 *
 * Deliberately styled only through the tokens in globals.css, so a page renders
 * in whichever brand its route subtree is scoped to.
 */
export function PageShell({ eyebrow, title, lede, children }: PageShellProps) {
  return (
    <main className={styles.shell}>
      <div className={styles.inner}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <h1>{title}</h1>
        {lede ? <p className={styles.lede}>{lede}</p> : null}
        {children ? <div className={styles.body}>{children}</div> : null}
      </div>
    </main>
  );
}
