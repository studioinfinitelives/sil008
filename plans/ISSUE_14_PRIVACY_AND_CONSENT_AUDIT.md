---
issue: 14
title: [Epic 12] Privacy and consent audit
status: Task
synced: Task
epic: 12
item: PVTI_lADOBDBK484BiBnazhHCJ7I
---

# #14 Privacy and consent audit

Epic #12. Project: `sil008`.

1. `src/lib/click-tracking.ts`, `src/lib/consent.ts`: nothing fires before consent, and no names or ids are sent.
2. `src/content/legal/site-privacy.md` still links Habi Sloth's policy at the old address. It redirects, so report the wording change to the user rather than editing it.
