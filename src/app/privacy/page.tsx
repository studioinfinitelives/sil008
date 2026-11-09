import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Privacy and Cookies",
  description:
    "How infinitelives.io uses cookies and analytics, and how to change your choice.",
  alternates: { canonical: "/privacy" },
};

/**
 * The studio's own privacy and cookie notice. Separate from
 * each product's own policy. This is what the cookie banner's
 * "Learn more" points at, so it must describe THIS site's cookies.
 *
 * If the set of cookies materially changes, bump the version here AND
 * `COOKIE_CONSENT_VERSION`: the notice below promises the banner asks again.
 */
export default function Page() {
  return (
    <PageShell
      eyebrow="Studio Infinite Lives"
      title="Privacy and Cookies"
      lede="Effective date: September 4, 2026 (version 1)."
    >
      <article className="max-w-[72ch]">
        <p className="mt-4">
          This notice covers infinitelives.io, the website of Studio Infinite
          Lives, LLC. It does not cover the Habi Sloth app, which has its own
          privacy policy at{" "}
          <a
            href="https://habisloth.app/privacy.html"
            className="text-link underline"
          >
            habisloth.app/privacy.html
          </a>
          .
        </p>

        <Heading id="what-this-site-is">What this site is</Heading>
        <p className="mt-4">
          A set of static pages describing what the studio makes. There are no
          accounts, no sign-in, and no forms. We never ask you for your name,
          your email address, or anything else about you.
        </p>

        <Heading id="analytics-only-if-you-allow-it">
          Analytics, only if you allow it
        </Heading>
        <p className="mt-4">
          With your permission we use Google Analytics to count visits and see
          which pages people read and which links they follow. It tells us that
          a page was read, not who read it.
        </p>
        <p className="mt-4">
          Analytics is <Strong>off until you turn it on</Strong>. Nothing is
          loaded from Google and no cookie is written until you choose
          &ldquo;Accept all&rdquo; in the cookie banner. If you choose
          &ldquo;Essential only&rdquo;, the analytics script is never fetched at
          all.
        </p>

        <Heading id="cookies">Cookies</Heading>
        <p className="mt-4">
          <Strong>Essential.</Strong> One entry in your browser&apos;s local
          storage, named <Code>cookie_consent</Code>, remembering the choice you
          made so we do not ask again. It is not a tracking cookie and is never
          sent to us or to anyone else.
        </p>
        <p className="mt-4">
          <Strong>Analytics, optional.</Strong> When you allow analytics, Google
          Analytics sets cookies named <Code>_ga</Code> and <Code>_ga_</Code>{" "}
          followed by an identifier, used to recognise a returning browser and
          to group page views into a visit. They are set only after you say yes.
        </p>
        <p className="mt-4">
          We use no advertising or marketing cookies, and we do not share
          anything with advertisers. Google&apos;s advertising signals are
          switched off for this site at all times.
        </p>

        <Heading id="changing-your-mind">Changing your mind</Heading>
        <p className="mt-4">
          Choose <Strong>Cookie Preferences</Strong> at the bottom of any page.
          Turning analytics off stops collection immediately and expires the{" "}
          <Code>_ga</Code> cookies that were already set. You can also clear
          cookies and site data for this domain in your browser, which resets
          the choice and brings the banner back.
        </p>

        <Heading id="what-we-collect-without-analytics">
          What we collect without analytics
        </Heading>
        <p className="mt-4">
          Nothing beyond the ordinary server logs kept by our hosting provider,
          Google Firebase Hosting, which records requests in order to serve
          pages and protect against abuse. We do not use those logs to build a
          profile of you.
        </p>

        <Heading id="your-rights">Your rights</Heading>
        <p className="mt-4">
          <Strong>If you are in the EEA or the UK</Strong>, you have the right
          to access, correct, erase, and port your data, to object to or
          restrict processing, and to complain to your data protection
          authority. Analytics on this site is processed with your consent,
          which you can withdraw at any time.
        </p>
        <p className="mt-4">
          <Strong>If you are in California</Strong>, you have the right to know
          what we collect, to delete it, to correct it, and not to be
          discriminated against for exercising those rights. We do not sell or
          share personal information.
        </p>

        <Heading id="changes-to-this-notice">Changes to this notice</Heading>
        <p className="mt-4">
          If the set of cookies materially changes we bump the version number
          above, and the banner asks you again rather than assuming your old
          answer still applies.
        </p>

        <Heading id="contact">Contact</Heading>
        <p className="mt-4">
          Questions about your privacy? Contact us at support@infinitelives.io.
        </p>
        <p className="mt-4">
          © 2026 Studio Infinite Lives, LLC. All rights reserved.
        </p>
      </article>
    </PageShell>
  );
}

function Heading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="text-ink mt-10 scroll-mt-20 text-xl font-bold first:mt-0"
    >
      {children}
    </h2>
  );
}

function Strong({ children }: { children: ReactNode }) {
  return <strong className="text-ink font-semibold">{children}</strong>;
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="bg-surface-alt border-line rounded border px-1.5 py-0.5 font-mono text-[0.9em]">
      {children}
    </code>
  );
}
