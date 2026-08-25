import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { habiArt } from "@/lib/cdn";

export const metadata: Metadata = {
  title: "Blog",
  alternates: { canonical: "/blog" },
};

const LINKEDIN_ACTIVITY_URL =
  "https://www.linkedin.com/in/weberec7/recent-activity/all/";

/**
 * A holding page until there is a blog to hold (plan §3).
 *
 * Rather than an empty shell, it says out loud that the writing is elsewhere
 * and sends the visitor to the LinkedIn feed that actually has it. The button
 * comes before the art so the one useful thing on the page is the first thing
 * reached — the sleeping sloth is the joke, not the destination.
 *
 * Button and art are centred as one column: the button is the whole point of
 * the page, and left-aligning it under a centred illustration would leave it
 * looking like a stray caption.
 */
export default function Page() {
  return (
    <PageShell
      eyebrow="Infinite Lives"
      title="This Is Not the Blog You Are Looking For"
      lede="Click or Don’t Click, but Don’t Try."
    >
      <div className="flex flex-col items-center gap-5">
        <Button
          asChild
          size="lg"
          className="h-13 rounded-full px-8 text-base font-bold tracking-wide uppercase"
        >
          <a href={LINKEDIN_ACTIVITY_URL} target="_blank" rel="noreferrer">
            Ethan&rsquo;s LinkedIn Posts
          </a>
        </Button>
        {/*
          Width and height are the file's true pixels: `next/image` is
          unoptimized in a static export, so they are what reserves the box and
          keeps the page from jumping as the art loads.
        */}
        <Image
          src={habiArt.points}
          alt="Habi the sloth asleep along a tree branch"
          width={1200}
          height={701}
          priority
          className="h-auto w-full max-w-3xl"
        />
      </div>
    </PageShell>
  );
}
