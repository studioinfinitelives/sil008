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
.PHONY: serve
serve:
	npm run dev

### DEVELOPMENT
# Build and publish to https://sil008-dev.web.app.
.PHONY: dev build-dev deploy-dev
dev: build-dev deploy-dev

build-dev:
	$(call web_build)

deploy-dev:
	$(call assert_export,build-dev)
	firebase deploy --only hosting:dev

### PRODUCTION
# Build and publish to https://sil008.web.app.
# `preview-prod` puts the same build on a temporary channel instead — always the
# last step before a DNS change (see README).
.PHONY: prod build-prod deploy-prod preview-prod
prod: build-prod deploy-prod

build-prod:
	$(call web_build)

deploy-prod:
	$(call assert_export,build-prod)
	firebase deploy --only hosting:prod

preview-prod: build-prod
	$(call assert_export,build-prod)
	firebase hosting:channel:deploy preview --only prod --expires 7d

### CDN
# Publish this site's art to the sil-studio-art Hosting site (cdn.infinitelives.io)
# in the shared CDN project. Art only: no build, no site deploy, seconds not
# minutes. sil006 publishes the app's site from its own cdn/ -- two repos, two
# sites, one project, because one site can only have one publisher.
#
# A Hosting deploy deletes every file absent from the public dir, so guard on a
# known file: a half-finished move would wipe live art.
.PHONY: deploy-cdn
deploy-cdn:
	@test -f cdn/site_infinitelives_logo.svg || { echo "ABORT: cdn/ is missing site_infinitelives_logo.svg -- wrong dir or bad move"; exit 1; }
	firebase deploy --only hosting:sil-studio-art -P cdn --config firebase.cdn.json

### CHECKS
# Everything CI would run, if there were CI. `make check` before any deploy.
.PHONY: check typecheck lint format-check test
check: typecheck lint format-check test

typecheck:
	npm run typecheck

lint:
	npm run lint

format-check:
	npm run format:check

test:
	npm run test:run
