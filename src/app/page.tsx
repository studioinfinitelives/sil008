import Image from "next/image";
import { ContactReveal } from "@/app/_components/ContactReveal";
import { ProjectCard } from "@/app/_components/ProjectCard";
import { cardArt, logoUrl } from "@/lib/cdn";

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
    <main className="bg-surface-alt flex flex-1 flex-col items-center px-5 py-14 text-center">
      <Image
        className="size-50 rounded-full"
        src={logoUrl}
        alt="Studio Infinite Lives"
        width={200}
        height={200}
        priority
      />
      <h1 className="text-ink mt-8 text-3xl font-black tracking-wide sm:text-4xl">
        Studio Infinite Lives
      </h1>

      <h2 className="text-ink mt-20 text-lg font-medium lg:mt-30">
        Our Creations
      </h2>
      <div className="mt-8 flex flex-wrap justify-center gap-8">
        <ProjectCard
          name="Team EvL"
          subtitle="The Card Game"
          src={cardArt.teamevl}
          to="/teamevl"
        />
        <ProjectCard
          name="Habi Sloth"
          src={cardArt.habisloth}
          to="/habisloth"
        />
        <ProjectCard
          name="More"
          subtitle="Coming Soon"
          src={cardArt.comingSoon}
        />
      </div>

      <div className="mt-14">
        <ContactReveal />
      </div>
    </main>
  );
}
