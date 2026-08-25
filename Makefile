# Build and deploy commands for the static export, mirroring ../sil006/Makefile.
#
# Two Hosting sites live in the one `sil008` Firebase project (see .firebaserc):
#
#   dev   https://sil008-dev.web.app   served noindex, for review
#   prod  https://sil008.web.app       becomes infinitelives.io at DNS cutover
#
# APP_FLAVOR picks which sil006 CDN the art is hotlinked from, exactly as that
# project's --dart-define does (lib/utils/asset_urls.dart). It defaults to
# development, so a plain `npm run dev` needs no flag.

DEV_CDN := https://sil006-dev.web.app
PROD_CDN := https://sil006.web.app

# `out/` is ALWAYS removed first: Next does not purge the export directory, so a
# file dropped from the site would otherwise keep shipping from a stale build.
define web_build
rm -rf out && APP_FLAVOR=$(1) npm run build
endef

# The CDN host is baked into the exported HTML at build time and is the only
# thing that distinguishes a dev export from a prod one — the routes are
# byte-identical otherwise. Guard both ways before every deploy, as sil006's
# deploy-cdn-* targets do, so a stale `out/` cannot reach the wrong site.
# $(1) = expected host, $(2) = host that must be absent, $(3) = target to re-run.
define assert_export
@test -f out/index.html || { echo "ABORT: no out/ -- run 'make $(3)' first"; exit 1; }
@grep -rq "$(1)" out || { echo "ABORT: out/ does not hotlink $(1) -- run 'make $(3)' first"; exit 1; }
@! grep -rq "$(2)" out || { echo "ABORT: out/ hotlinks $(2) -- wrong flavor, run 'make $(3)' first"; exit 1; }
endef

### LOCAL DEV
.PHONY: serve
serve:
	npm run dev

### DEVELOPMENT
# Build against the dev CDN and publish to https://sil008-dev.web.app.
.PHONY: dev build-dev deploy-dev
dev: build-dev deploy-dev

build-dev:
	$(call web_build,development)

deploy-dev:
	$(call assert_export,$(DEV_CDN),$(PROD_CDN),build-dev)
	firebase deploy --only hosting:dev

### PRODUCTION
# Build against the prod CDN and publish to https://sil008.web.app.
# `preview-prod` puts the same build on a temporary channel instead — always the
# last step before a DNS change (see README).
.PHONY: prod build-prod deploy-prod preview-prod
prod: build-prod deploy-prod

build-prod:
	$(call web_build,production)

deploy-prod:
	$(call assert_export,$(PROD_CDN),$(DEV_CDN),build-prod)
	firebase deploy --only hosting:prod

preview-prod: build-prod
	$(call assert_export,$(PROD_CDN),$(DEV_CDN),build-prod)
	firebase hosting:channel:deploy preview --only prod --expires 7d

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
