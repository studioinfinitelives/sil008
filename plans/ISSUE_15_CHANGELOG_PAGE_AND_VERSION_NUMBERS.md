---
issue: 15
title: [Epic 12] Changelog page and version numbers
status: Task
synced: Task
epic: 12
item: PVTI_lADOBDBK484BiBnazhHCKCE
---

# #15 Changelog page and version numbers

Epic #12. Project: `sil008`.

1. `sil_common/tool/release_notes.py` reads only `pubspec.yaml`; teach it `package.json` (`x.y.z`, no build number) and bump on deploy.
2. `docs/VOICE.md` for the site's audience.
3. `src/app/changelog/page.tsx` from `release_notes.json`, added to the sitemap.
4. `include ../sil_common/make/release_notes.mk` and run `prep-deploy` first in `deploy-prod`.
