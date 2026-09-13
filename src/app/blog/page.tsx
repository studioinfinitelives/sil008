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
 * A holding page until there is a blog. Points at the LinkedIn feed instead.
 * The button precedes the art so the useful element is reached first.
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
        {/* True pixels — unoptimized, so these are what reserves the box. */}
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
