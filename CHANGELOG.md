# Changelog

## latest

Changes:

\-

## v2024-05-20-1

Changes:

- Minify some css in js
- Pass `default_resolve` to `resolve`

## v2024-05-17-1

Changes:

- Improved imports/exports

## v2024-05-16-1

Changes:

- Use a function to export es instead returns

## v2024-05-14-1

Changes:

- Delete file filters

## v2024-05-08-1

Changes:

- Deflux

## v2024-05-03-1

Changes:

- Make import commonjs in commonjs work
- Remove indents

## v2024-05-02-2

Changes:

- Remove indents

## v2024-05-02-1

Changes:

- Supports `export ... from ... with ...` syntax

## v2024-05-01-2

Changes:

- Fix `resolve`

## v2024-05-01-1

Changes:

- Replace `exclude_modules` with `resolve` function
- Remove generate icon

## v2024-04-26-1

Changes:

- Rename `dev_mode` to `dev`

## v2024-04-22-4

Changes:

- Bundler: Improve wrap CommonJs to ESM

## v2024-04-22-3

Changes:

- Bundler: Remove `no_top_level_await`

## v2024-04-22-2

Changes:

- Bundler: Fix browser

## v2024-04-22-1

Changes:

- Bundler: Improve CommonJs support by seperating it with ESM for sync load it
- Remove serice worker

## v2024-04-18-2

Changes:

- Remove `Localization.mjs`

## v2024-04-18-1

Changes:

- Remove manifest

## v2024-04-17-3

Changes:

- Fix create folders

## v2024-04-17-2

Changes:

- Fix create folders

## v2024-04-17-1

Changes:

- Create folders
- Add missing `await` on `cache.addAll` on `service-worker.mjs` template

## v2024-04-16-1

Changes:

- Move module to texts

## v2024-04-03-1

Changes:

- Add `!` to error logs

## v2024-03-20-1

Changes:

- Make static new async

## v2024-01-25-1

Changes:

- Bundler: Keep import code of not bundled modules directly (NodeJS's built-in modules or exclude modules)
- Bundler: Use NodeJS's `require.resolve` for input path too
- Bundler: Check exclude modules as folder too
- Bundler: Remove path from module comment on non-`dev_mode`

## v2024-01-19-1

Changes:

- Bundler: Remove change `import.meta.url`

## v2024-01-15-1

Changes:

- Load libraries using NodeJS's module resolver
- Load json using import attributes
- Bundler: Replace import assertions with import attributes
- Bundler: Use NodeJS's `require.resolve` for urls in css too
- Bundler: Only add `(` `)` on shorts return arrow functions if needed
- Bundler: Remove unused `load_module` param on css
- Bundler: Remove `FluxImportCss`

## v2024-01-09-1

Changes:

- Renamed to `flux-build-utils`
- Always pass exports from root module if export names could detected (Removed option)
- Use NodeJS's `require.resolve` for every import detected
- Always use `node:` prefix for NodeJS native modules for not add it doubled
- First bundler supports CommonJS - But most will break due use `require` in non-`async` functions replaced with `await ...`, so those can disabled via `exclude_modules` option
- Improved/Fixed some exports syntax
- Generates shorts return arrow functions if only has a return (NodeJS native modules, exluded modules or JSON)

## v2023-12-21-1

Changes:

- Bundler supports more export syntax
- Supports bundle `.js` files if `import` / `export` syntax is detected
- First bundle support using dynamic loading from `node_modules` (Disabled)

## v2023-12-20-1

Changes:

- Bundler supports more import and export syntax
- Bundle exports

## v2023-12-18-1

Changes:

- Fix

## v2023-12-12-2

Changes:

- Fix

## v2023-12-12-1

Changes:

- Fix

## v2023-12-11-3

Changes:

- Fix

## v2023-12-11-2

Changes:

- Fix

## v2023-12-11-1

Changes:

- Fix

## v2023-12-04-5

Changes:

- Fix

## v2023-12-04-4

Changes:

- Minfiy fix `flux-color-scheme` and may WebKit based browsers

## v2023-12-04-3

Changes:

- Fix

## v2023-12-04-2

Changes:

- Fix

## v2023-12-04-1

Changes:

- Bundler/Minifier

## v2023-11-28-6

Changes:

- Fix

## v2023-11-28-5

Changes:

- Fix

## v2023-11-28-4

Changes:

- Fix

## v2023-11-28-3

Changes:

- Fix

## v2023-11-28-2

Changes:

- Fix

## v2023-11-28-1

Changes:

- Pass `web_index_mjs_file`

## v2023-09-25-1

Changes:

- Fix

## v2023-08-07-2

Changes:

- `flux-localization-api`

## v2023-08-07-1

Changes:

- `flux-localization-api`

## v2023-07-27-1

Changes:

- Fix

## v2023-07-21-1

Changes:

- General localizations

## v2023-07-17-1

Changes:

- General `Localization`

## v2023-06-26-1

Changes:

- Fix

## v2023-06-23-8

Changes:

- Fix

## v2023-06-23-7

Changes:

- Fix

## v2023-06-23-6

Changes:

- Fix

## v2023-06-23-5

Changes:

- Fix

## v2023-06-23-4

Changes:

- `deleteEmptyFolders`

## v2023-06-23-3

Changes:

- Fix

## v2023-06-23-2

Changes:

- Fix

## v2023-06-23-1

Changes:

- `get_icon_template_file` callback
- Remove requried svg icon template
- `deleteIgnoresFiles`

## v2023-06-22-8

Changes:

- Fix

## v2023-06-22-7

Changes:

- Fix

## v2023-06-22-6

Changes:

- Fix

## v2023-06-22-5

Changes:

- Dynamic `icon-template.svg`

## v2023-06-22-4

Changes:

- Dynamic `icon-template.svg`

## v2023-06-22-3

Changes:

- Ignore alternative `purposes` icons in `index.html`

## v2023-06-22-2

Changes:

- Generate icons

## v2023-06-22-1

Changes:

- Generate icons

## v2023-06-21-3

Changes:

- Log

## v2023-06-21-2

Changes:

- Log

## v2023-06-21-1

Changes:

- Templates

## v2023-06-20-2

Changes:

- `index-template.html`

## v2023-06-20-1

Changes:

- `manifest-template.json`

## v2023-04-24-1

Changes:

- Optional `flux-localization-api`

## v2023-04-11-1

Changes:

- Remove fetch cache fallback

## v2023-03-22-1

Changes:

- path

## v2023-03-21-1

Changes:

- `flux-localization-api`

## v2023-03-20-1

Changes:

- Simplify

## v2023-03-17-1

Changes:

- Simplify
- Renamed to `flux-pwa-generator`

## v2023-03-15-1

Changes:

- Remove `flux-json-api`

## v2023-03-14-3

Changes:

- Log ignored files

## v2023-03-14-2

Changes:

- Service worker generator file filter
- Optional ignore jsdoc files

## v2023-03-14-1

Changes:

- Ignore files with comments only on service worker generator (JSDoc)

## v2023-03-13-1

Changes:

- Use native `fetch` in fetch service worker event when possible
- Message service worker event data object
- Validate message service worker origin

## v2023-02-27-1

Changes:

- Remove legacy fallbacks

## v2023-02-09-1

Changes:

- build / publish

## v2023-02-03-1

Changes:

- Code style

## v2023-01-17-1

Changes:

- Code style

## v2022-12-19-1

Changes:

- Code style

## v2022-12-12-2

Changes:

- Use dynamic file extension

## v2022-12-12-1

Changes:

- `SKIP_WAITING`

## v2022-12-08-2

Changes:

- Fix default `service-worker-template.mjs`

## v2022-12-08-1

Changes:

- Default `service-worker-template.mjs`
- `metadata.json`

## v2022-11-24-1

Changes:

- Remove empty `init`

## v2022-11-16-1

Changes:

- `optionalDependencies`

## v2022-11-14-1

Changes:

- Use `node:path/posix`

## v2022-11-11-1

Changes:

- New `flux-localization-api`

## v2022-11-09-1

Changes:

- New `flux-localization-api`

## v2022-11-08-1

Changes:

- Fix missing service worker file in `APPLICATION_CACHE_FILES`

## v2022-11-07-2

Changes:

- Service worker template

## v2022-11-07-1

Changes:

- `LocalizationService`

## v2022-11-02-1

Changes:

- Generate service worker with any data

## v2022-11-01-1

Changes:

- Pass cache prefix

## v2022-10-31-1

Changes:

- First release
