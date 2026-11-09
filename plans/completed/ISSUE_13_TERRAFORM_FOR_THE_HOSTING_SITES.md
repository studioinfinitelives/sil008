---
issue: 13
title: [Epic 12] Terraform for the Hosting sites
status: Review
synced: Review
epic: 12
item: PVTI_lADOBDBK484BiBnazhHCJyk
---

# #13 Terraform for the Hosting sites

Epic #12. Project: `sil008`.

Two Hosting sites in project `sil008`: `sil008` and `sil008-dev`. No database, so skip the module's Firestore and App Check; a small `infra/terraform/` with the backend block and `google_firebase_hosting_site` is enough.

Also import `infra/cdn` (`sil006-art`, `sil-studio-art` in `sil-cdn-fa1a1`) and check it with `bash tool/tf.sh plan cdn`.

Shared rules: `infra/README.md`. Module: `infra/modules/firebase-app`. Never create a dev environment that doesn't exist.

1. If `gs://sil-terraform-state` doesn't exist, create it with the two commands in `infra/README.md`.
2. Write `infra/terraform/` (project `sil008`) with the `backend "gcs"` block, prefix `sil008`, the module, and `envs/prod.tfvars` (`create_project = false`).
3. `terraform import` every resource the module declares, against the live project.
4. `bash tool/tf.sh plan sil008` until it shows no deletions or replacements. Investigate every other change.
5. Point-in-time recovery turning on is expected. Nothing else should change on the database.
6. `bash tool/tf.sh apply sil008`. The permission prompt is the user's approval.
