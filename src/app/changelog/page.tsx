import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import releaseNotes from "@/content/release_notes.json";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What changed on infinitelives.io, newest first.",
  alternates: { canonical: "/changelog" },
};

interface Release {
  version: string;
  date: string;
  notes: ReadonlyArray<{ title: string; body: string }>;
}

// Bodies carry `**bold**` markers (written by ../sil_common/tool/release_notes.py).
function Body({ text }: { text: string }) {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

export default function Page() {
  const releases: Release[] = releaseNotes.releases;

  return (
    <PageShell
      eyebrow="Studio Infinite Lives"
      title="Changelog"
      lede="What changed on this site, newest first."
    >
      {releases.length === 0 ? (
        <p className="text-subtle">Nothing here yet.</p>
      ) : null}
      {releases.map((release) => (
        <section key={release.version} className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold">
            Version {release.version}{" "}
            <span className="text-subtle text-base font-normal">
              {release.date}
            </span>
          </h2>
          <ul className="flex flex-col gap-2">
            {release.notes.map((note) => (
              <li key={note.title + note.body}>
                {note.title ? <strong>{note.title}. </strong> : null}
                <Body text={note.body} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </PageShell>
  );
}
