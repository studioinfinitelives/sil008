import type { Block, Inline, LegalDocument } from "@/lib/legal";

/**
 * Renders a parsed legal document.
 *
 * Deliberately not a generic markdown renderer — it handles exactly the block
 * and inline kinds `lib/legal.ts` can produce, so the union is exhaustive and
 * a new construct upstream is a type error here rather than a silent omission.
 *
 * Every `##` gets a slug `id`, which is what makes a specific clause citable —
 * support replies and store reviewers both tend to link to one section rather
 * than the whole policy.
 */

interface LegalDocumentProps {
  document: LegalDocument;
}

export function LegalDocumentBody({ document }: LegalDocumentProps) {
  return (
    <article className="max-w-[72ch]">
      {document.blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </article>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "heading": {
      const text = plainText(block.text);
      return (
        <h2
          id={slugify(text)}
          className="text-ink mt-10 scroll-mt-20 text-xl font-bold first:mt-0"
        >
          <InlineView runs={block.text} />
        </h2>
      );
    }
    case "paragraph":
      return (
        <p className="mt-4">
          <InlineView runs={block.text} />
        </p>
      );
    case "list":
      return (
        <ul className="mt-4 flex list-disc flex-col gap-2 pl-6">
          {block.items.map((item, index) => (
            <li key={index}>
              <InlineView runs={item} />
            </li>
          ))}
        </ul>
      );
  }
}

function InlineView({ runs }: { runs: Inline[] }) {
  return runs.map((run, index) => {
    switch (run.kind) {
      case "text":
        return <span key={index}>{run.value}</span>;
      case "strong":
        return (
          <strong key={index} className="text-ink font-semibold">
            {run.value}
          </strong>
        );
      case "code":
        return (
          <code
            key={index}
            className="bg-surface-alt border-line rounded border px-1.5 py-0.5 font-mono text-[0.9em]"
          >
            {run.value}
          </code>
        );
    }
  });
}

function plainText(runs: Inline[]): string {
  return runs.map((run) => run.value).join("");
}

/** "12. Cookies and local storage (web)" → "12-cookies-and-local-storage-web". */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
