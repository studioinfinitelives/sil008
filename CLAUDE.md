@AGENTS.md

# Comments

Comments in this repo are written for an AI assistant reading the code, not for
a person browsing it. Keep them short, accurate, and load-bearing.

## The test

A comment earns its place if deleting it would let a plausible, well-intentioned
edit introduce a bug. If nothing would break, cut it.

## Keep

At whatever length the fact actually needs:

- **Invariants invisible in the code.** CDN files are cached immutably for a
  year, so art is never replaced in place — new art is a new filename.
- **Why the obvious approach is wrong.** `lib/analytics.ts` hand-rolls Google's
  gtag shim because rewriting it as an arrow function silently breaks it.
- **Traps waiting for the next edit.** Clipping the carousel's ring instead of
  its stage collapses the 3D. `userEvent` deadlocks against Vitest fake timers.
  `FallbackImage` must stay a client component, because the art host answers a
  missing file with `200 text/html` rather than a 404.
- **Contracts with `../sil006` and `../sil_common`**, including which side is
  the source of truth.
- **Deliberate dead code**, marked plainly so it is not removed as cruft. See
  `lib/habits.ts`.

## Cut

- Design and aesthetic rationale.
- Where art came from, what it was delivered at, how it was resized.
- Prose restating what the next line already says.
- Anything that reads as authorial voice rather than instruction.

That reasoning is not forbidden, it just lives in commit messages and issues
rather than in the files.

## Style

- CAPITALISE a hard constraint so it reads as a rule, not an aside.
- Prefer a one-line `//` over a docblock when the fact is one line.
- Reserve JSDoc for exported API contracts.
- Point at the file to read rather than re-explaining it there.

## Accuracy outranks brevity

A confidently wrong comment is worse than no comment, because it gets acted on.
Changing code means changing the comment above it in the same edit. Comment rot
scales with comment volume, which is the main reason to keep the volume low.
