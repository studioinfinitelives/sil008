# Build and deploy commands for the static export, mirroring ../sil006/Makefile.
#
# Two Hosting sites live in the one `sil008` Firebase project (see .firebaserc):
#
#   dev   https://sil008-dev.web.app   served noindex, for review
#   prod  https://sil008.web.app       becomes infinitelives.io at DNS cutover
#
# Art comes from one CDN host for every build (cdn.infinitelives.io, published
# from sil006's cdn-studio/), so there is no build-time flavor: a dev export and
# a prod export are byte-identical and differ only in which site they land on.
# The dev site's noindex is a Hosting header, not a build flag (firebase.json).

# `out/` is ALWAYS removed first: Next does not purge the export directory, so a
# file dropped from the site would otherwise keep shipping from a stale build.
define web_build
rm -rf out && npm run build
endef

# The flavor guard that used to live here greped for the per-flavor CDN host --
# the only thing that told a dev export from a prod one. With one shared host
# there is nothing left to discriminate on, so all that remains is a staleness
# check. $(1) = target to re-run.
define assert_export
@test -f out/index.html || { echo "ABORT: no out/ -- run 'make $(1)' first"; exit 1; }
endef

### LOCAL DEV
.PHONY: localdev
localdev: ## Run the Next dev server
	npm run dev

### DEVELOPMENT
# Build and publish to https://sil008-dev.web.app.
.PHONY: dev build-dev deploy-dev
dev: build-dev deploy-dev ## Build + deploy to sil008-dev

build-dev: ## Clean static export (no deploy)
	$(call web_build)

deploy-dev: ## Deploy the current out/ to sil008-dev
	$(call assert_export,build-dev)
	firebase deploy --only hosting:dev

### PRODUCTION
# Build and publish to https://sil008.web.app.
# `preview-prod` puts the same build on a temporary channel instead — always the
# last step before a DNS change (see README).
.PHONY: prod build-prod deploy-prod preview-prod
prod: build-prod deploy-prod ## Build + deploy to prod

build-prod: ## Clean static export (no deploy)
	$(call web_build)

deploy-prod: ## Deploy the current out/ to prod
	$(call assert_export,build-prod)
	firebase deploy --only hosting:prod

preview-prod: build-prod ## Build + deploy to the prod preview channel (7d)
	$(call assert_export,build-prod)
	firebase hosting:channel:deploy preview --only prod --expires 7d

### CDN
# Publish this site's art to the sil-studio-art Hosting site (cdn.infinitelives.io)
# in the shared CDN project. Art only: no build, no site deploy, seconds not
# minutes. sil006 publishes the app's site from its own cdn/ -- two repos, two
# sites, one project, because one site can only have one publisher.
#
# A Hosting deploy deletes every file absent from the public dir, and cdn/ is
# gitignored. The committed cdn.manifest lists every published file, so the
# deploy first PULLS any listed file missing from cdn/ off the live host, then
# RECORDS new files into the manifest -- no deploy can drop a published one.
# Retiring a file = delete its manifest line AND cdn/ file (see
# ../sil_common/tool/cdn_sync.py). Commit cdn.manifest after every deploy.
CDN_SYNC = python3 ../sil_common/tool/cdn_sync.py
CDN_HOST = https://cdn.infinitelives.io

.PHONY: pull-cdn deploy-cdn
pull-cdn: ## Fetch manifest-listed files missing from cdn/
	@test -d ../sil_common || { echo "ABORT: ../sil_common not found"; exit 1; }
	$(CDN_SYNC) pull --cdn-dir cdn --manifest cdn.manifest --host $(CDN_HOST)

deploy-cdn: pull-cdn ## Pull, record manifest, test, publish cdn/ art
	$(CDN_SYNC) record --cdn-dir cdn --manifest cdn.manifest
	npx vitest run src/lib/cdn.test.ts
	firebase deploy --only hosting:sil-studio-art -P cdn --config firebase.cdn.json
	@git diff --quiet -- cdn.manifest || echo "cdn.manifest changed -- commit it"

### CHECKS
# Everything CI would run, if there were CI. `make check` before any deploy.
.PHONY: check typecheck lint format-check test
check: typecheck lint format-check test ## typecheck + lint + format-check + test

typecheck: ## TypeScript typecheck
	npm run typecheck

lint: ## ESLint
	npm run lint

format-check: ## Prettier check
	npm run format:check

test: ## Vitest run
	npm run test:run

### HELP
# List every target tagged with a trailing `## description`, grouped under its
# `### SECTION` header. Tag new targets the same way to have them show up here.
.PHONY: help
help: ## List targets
	@awk 'BEGIN {FS = ":.*## "} /^### / {printf "\n%s\n", substr($$0, 5)} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
