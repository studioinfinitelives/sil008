@AGENTS.md

# CLAUDE.md

**infinitelives.io**: the studio's static Next.js site, exported to Firebase Hosting (`sil008` prod, `sil008-dev` for review). Art comes from `cdn.infinitelives.io`.

Product legal pages live on each product's own site and are linked from here, never copied.

Comment examples for this repo are in [docs/COMMENTS.md](docs/COMMENTS.md). Hard constraints in comments are CAPITALISED.

## Gotchas

- CDN files are cached immutably for a year: new art is a new filename.
- Contracts with `../sil006` and `../sil_common` are commented at the use site, including which side is the source of truth.
- `make deploy-cdn` first pulls listed files, so a deploy can't drop published art. Commit `cdn.manifest` after.
