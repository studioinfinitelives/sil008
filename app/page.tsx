import Image from "next/image";
import { cardArt, logoUrl } from "@/lib/cdn";
import { ContactReveal } from "@/components/ContactReveal";
import { ProjectCard } from "@/components/ProjectCard";
import styles from "./page.module.css";

/**
 * The studio hub.
 *
 * Reproduces the layout of the Flutter site this replaces — logo, wordmark,
 * "Our Creations", three circular cards, reveal-on-click contact — but as
 * static HTML with the content in the markup, which is the entire point of the
 * rebuild. Fuller copy is plan §3.
 */
export default function Page() {
  return (
    <main className={styles.hub}>
      <Image
        className={styles.logo}
        src={logoUrl}
        alt="Studio Infinite Lives"
        width={200}
        height={200}
        priority
      />
      <h1 className={styles.wordmark}>Studio Infinite Lives</h1>

      <h2 className={styles.creations}>Our Creations</h2>
      <div className={styles.cards}>
        <ProjectCard
          name={"Team EvL\nThe Card Game"}
          src={cardArt.teamevl}
          href="https://linktr.ee/teamevl"
        />
        <ProjectCard
          name="Habi Sloth"
          src={cardArt.habisloth}
          href="/habisloth"
        />
        <ProjectCard name={"More\nComing Soon"} src={cardArt.comingSoon} />
      </div>

      <div className={styles.contact}>
        <ContactReveal />
      </div>
    </main>
  );
}
