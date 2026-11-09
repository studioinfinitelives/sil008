@AGENTS.md

# CLAUDE.md

**infinitelives.io**: the studio's static Next.js site, exported to Firebase Hosting (`sil008` prod, `sil008-dev` for review). Art comes from `cdn.infinitelives.io`.

Product legal pages live on each product's own site and are linked from here, never copied.

Comment examples for this repo are in [docs/COMMENTS.md](docs/COMMENTS.md). Hard constraints in comments are CAPITALISED.

## Gotchas

- CDN files are cached immutably for a year: new art is a new filename.
- Contracts with `../sil006` and `../sil_common` are commented at the use site, including which side is the source of truth.
- `make deploy-cdn` first pulls listed files, so a deploy can't drop published art. Commit `cdn.manifest` after.
- `make deploy-prod` writes release notes first (`src/content/release_notes.json`, voice in `docs/VOICE.md`) and bumps the `package.json` patch version after the deploy. Commit both after.
- Keep every page Prettier-clean: run `bash tool/test.sh sil008 format <paths>` after editing, sub agents included. `make test` fails on unformatted files.
- Privacy and terms are public HTML, never markdown or behind a login.
