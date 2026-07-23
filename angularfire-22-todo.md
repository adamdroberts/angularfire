# AngularFire 22 release-candidate upgrade audit

> Audit snapshot: 14 July 2026  
> Target release: `@angular/fire@22.0.0-rc.0`  
> Target npm distribution tag: `next`  
> Status: implementation checklist; unchecked items are release blockers unless marked conditional

This document is the implementation and release checklist for moving this repository from the AngularFire 21 release candidate to AngularFire 22. It is intentionally scoped to Angular 22 compatibility and the first AngularFire 22 release candidate. It is not a general dependency-refresh project.

## Definition of done

AngularFire 22 RC is complete only when all of the following are true:

- [ ] The source, package metadata, lockfiles, build tools, tests, sample, CI, and documentation use the Angular 22 compatibility contract recorded below.
- [ ] The Angular 22 package builds with TypeScript 6 without private or removed Angular APIs.
- [ ] The packed artifact installs into a clean Angular 22 browser-and-SSR application.
- [ ] All supported Node versions pass CI, including lint, Node tests, browser tests, and the sample consumer test.
- [ ] `22.0.0-rc.0` is published under npm's `next` tag, while `latest` remains on the current stable AngularFire release.
- [ ] Every completed item in this audit is backed by a committed diff, successful command output, or CI run.

## Audited starting point

The repository is not starting from a stable AngularFire 21 release:

| Surface | Audited state | Consequence |
| --- | --- | --- |
| Root `package.json` | `21.0.0-rc.0` | Bump directly to `22.0.0-rc.0`. |
| Root `package-lock.json` | Root package still identifies as `21.0.0-next.0` | Regeneration is mandatory; do not hand-edit only the visible version fields. |
| Published package template | Angular peers and schematics dependencies are `^21.0.0` | Angular 22 consumers will otherwise receive an invalid peer graph. |
| Root toolchain | Angular/CLI/DevKit/ng-packagr 21, TypeScript `>=5.9 <6.0`, Node types 12 | This cannot satisfy Angular 22's TypeScript and Node requirements. |
| Local Node selection | `mise.toml` uses `latest` | Builds are not reproducible and may silently move beyond Angular's tested engines. |
| CI | Fixed jobs use Node 20; matrix uses Node 20/22/24; lint is disabled | Node 20 must be removed and exact supported versions must be tested. |
| Analytics screen tracking | Uses `ComponentFactoryResolver` and private `ɵEmptyOutletComponent` | Both dependencies must be removed before Angular 22 compilation can succeed. |
| Build compiler | `tspc` via `ts-patch@3` and `ts-transformer-keys` | TypeScript 6 compatibility must be proven; generated wrappers are a release gate. |
| Consumer sample | Angular 19, `ng19-test`, and a versioned AngularFire 19 tarball | It currently provides no Angular 22 consumer coverage. |
| Root aggregate tests | References deleted typings and `ng-build` scripts | `test:all` is not a truthful release gate. |

As of the audit date, the AngularFire npm `next` tag points to the AngularFire 21 RC and `latest` is AngularFire 20.0.1. Re-check this immediately before release rather than treating the snapshot as permanent.

## Supported versions and exact dependency policy

Angular 22 requires TypeScript `>=6.0 <6.1` and Node `^22.22.3 || ^24.15.0 || >=26.0.0`. The following ranges deliberately allow compatible Angular 22 patch releases while preventing an accidental Angular 23 upgrade.

### Root development manifest

Update `package.json` as one dependency operation, then regenerate `package-lock.json` with Node 22.22.3.

| Package or field | Current | Required target |
| --- | --- | --- |
| `version` | `21.0.0-rc.0` | `22.0.0-rc.0` |
| `engines.node` | absent | `^22.22.3 || ^24.15.0 || >=26.0.0` |
| `@angular-devkit/architect` | `~0.2100.0` | `~0.2200.0` |
| `@angular-devkit/core` | `^21.0.0` | `^22.0.0` |
| `@angular-devkit/schematics` | `^21.0.0` | `^22.0.0` |
| `@angular-devkit/build-angular` | `^21.0.0` | `^22.0.0` |
| `@schematics/angular` | `^21.0.0` | `^22.0.0` |
| `@angular/common` | `^21.0.0` | `^22.0.0` |
| `@angular/compiler` | `^21.0.0` | `^22.0.0` |
| `@angular/core` | `^21.0.0` | `^22.0.0` |
| `@angular/platform-browser` | `^21.0.0` | `^22.0.0` |
| `@angular/platform-browser-dynamic` | `^21.0.0` | `^22.0.0` |
| `@angular/router` | `^21.0.0` | `^22.0.0` |
| `@angular/animations` | `^21.0.0` | `^22.0.0` |
| `@angular/cli` | `^21.0.0` | `^22.0.0` |
| `@angular/compiler-cli` | `^21.0.0` | `^22.0.0` |
| `@angular/platform-server` | `^21.0.0` | `^22.0.0` |
| `@angular-eslint/builder` | `^21.0.0` | `^22.0.0` |
| `@angular-eslint/eslint-plugin` | `^21.0.0` | `^22.0.0` |
| `ng-packagr` | `^21.0.0` | `^22.0.0` |
| `typescript` | `>=5.9 <6.0` | `>=6.0 <6.1` |
| `zone.js` | `~0.15.0` | `~0.16.0` |
| `@types/node` | `^12.6.2 <12.12.42` | `^22.0.0` |
| `ts-patch` | `^3.2.1` | `^4.0.1` |
| `@typescript-eslint/eslint-plugin` | `^8.33.0` | `^8.64.0` |
| `@typescript-eslint/parser` | `^8.33.0` | `^8.64.0` |

Keep these ranges unchanged during this upgrade unless a failing compatibility test supplies evidence that they must move:

- `firebase: ^12.4.0`
- `firebase-functions: ^6.1.0`
- `firebase-tools: ^14.0.0 || ^15.0.0`
- `rxfire: ^6.1.0`
- `rxjs: ~7.8.0`
- `ts-transformer-keys: ^0.4.4`, subject to the TypeScript 6 build gate below

Do not mix a Firebase SDK major upgrade into the Angular 22 pull request. It would make regressions harder to attribute and is not required by Angular 22.

### Published package template

Update `src/package.json`; the build replaces `ANGULARFIRE2_VERSION`, so retain that placeholder.

- [ ] Change all Angular peer dependencies from `^21.0.0` to `^22.0.0`.
- [ ] Change `@angular-devkit/schematics` and `@schematics/angular` dependencies from `^21.0.0` to `^22.0.0`.
- [ ] Add `engines.node: "^22.22.3 || ^24.15.0 || >=26.0.0"`.
- [ ] Retain the RxJS peer at `~7.8.0` and the optional peer metadata for `firebase-tools` and `@angular/platform-server`.
- [ ] Verify the built `dist/packages-dist/package.json`, not just the source template.

### Reproducible Node selection and lockfiles

- [ ] Replace `node = "latest"` in `mise.toml` with `node = "22.22.3"`.
- [ ] Activate Node 22.22.3 before installing or regenerating dependencies.
- [ ] Regenerate the root lockfile through npm so its package version becomes `22.0.0-rc.0` and all Angular packages resolve within major 22.
- [ ] Regenerate the sample lockfile after upgrading the sample.
- [ ] Do not touch `site`, `sample/functions`, or `test/functions` lockfiles solely because of this upgrade.
- [ ] Run the following dependency check with no `invalid`, `extraneous`, or peer-resolution errors:

```shell
npm ci
npm ls @angular/core @angular/cli @angular-devkit/architect @angular-devkit/build-angular ng-packagr typescript @angular-eslint/builder ts-patch
```

## Angular 22 source compatibility

### Replace removed component-factory APIs

Angular 22 removes `ComponentFactoryResolver` and `ComponentFactory`. The affected implementation is shared by modern and compat analytics screen tracking.

- [ ] In `src/analytics/screen-tracking.service.ts`, import `reflectComponentType` from `@angular/core` and remove `ComponentFactoryResolver`.
- [ ] Remove `ComponentFactoryResolver` from the modern service constructor and the call to `ɵscreenViewEvent`.
- [ ] In `src/compat/analytics/screen-tracking.service.ts`, remove the resolver import, constructor injection, and helper argument.
- [ ] Change the internal helper signature from `ɵscreenViewEvent(router, title, resolver)` to `ɵscreenViewEvent(router, title)`.
- [ ] For a class component, obtain its selector with `reflectComponentType(component)?.selector`.
- [ ] Preserve the existing string-component behavior.
- [ ] If reflection returns `null`, treat the activation as unresolved and omit its analytics event rather than throwing.

The intended component-selection logic is:

1. Find the active route for the activation outlet.
2. Walk to its deepest active child.
3. Use the deepest route's component, falling back to the activation snapshot component only when necessary.
4. Emit the string directly for a string component.
5. Emit the reflected selector for an Angular component class.
6. Ignore componentless or unresolved lazy activations.

### Remove the private router dependency

`ɵEmptyOutletComponent` is an Angular private export and cannot be a compatibility contract.

- [ ] Remove the `ɵEmptyOutletComponent` import from `@angular/router`.
- [ ] Delete the special-case comparison against it.
- [ ] Use the deepest active route selected by the algorithm above to handle componentless and nested routes through public router state.
- [ ] Search current source for other Angular `ɵ` imports. Review every result; do not automatically remove AngularFire's own intentional `ɵ` exports.

```shell
rg "from '@angular/.+ɵ|ɵ[A-Z].+from '@angular" src test
```

### Add regression tests

Add focused Jasmine coverage for `ɵscreenViewEvent`, preferably in `src/analytics/screen-tracking.service.spec.ts`, using real router navigation rather than mocking the event stream shape.

- [ ] A decorated standalone component reports its declared selector as `screen_class`.
- [ ] Page path, route-derived screen name, outlet, and optional page title remain unchanged.
- [ ] The second navigation in an outlet includes previous screen class, name, and instance ID.
- [ ] Nested routes and componentless parents resolve the deepest active component.
- [ ] A legacy string component retains its string class value if the router test utilities permit constructing that case.
- [ ] Componentless or unresolved lazy activations produce no event and do not throw.
- [ ] Both modern and compat services compile without resolver injection.

## TypeScript 6 and generated-wrapper build gate

The package build compiles `tools/build.ts` through `tspc`, and `tsconfig.build.json` loads `ts-transformer-keys`. The build uses `tsKeys<typeof import(...)>()` to generate Firebase and RxFire wrapper modules. A successful TypeScript compile alone is insufficient: empty or incomplete generated wrappers would publish a broken package.

### Primary implementation

- [ ] Upgrade `ts-patch` to `^4.0.1`.
- [ ] Retain `ts-transformer-keys@^0.4.4` for the first build attempt.
- [ ] Run `npm run build` under Node 22.22.3 and TypeScript 6.
- [ ] Inspect every generated `src/**/firebase.ts` and `src/**/rxfire.ts` diff.
- [ ] Confirm generated files are non-empty, deterministic across two clean builds, and contain the expected exports.
- [ ] Commit only intentional generated changes.

### Mandatory fallback if the transformer fails

Use this fallback if `tspc` fails, the transformer emits incorrect keys, or two clean builds differ. Do not suppress the failure or pin TypeScript below 6.

- [ ] Remove `tsKeys` and `ts-transformer-keys` usage from `tools/build.ts`.
- [ ] Derive module export names with `Object.keys(await import(path))` inside the existing `reexport` flow.
- [ ] Preserve the explicit RxFire and Functions allowlists and every existing exclusion.
- [ ] Remove the transformer plugin from `tsconfig.build.json`.
- [ ] Remove `ts-patch` and `ts-transformer-keys` from development dependencies.
- [ ] Change the build script from `tspc -p tsconfig.build.json` to `tsc -p tsconfig.build.json`.
- [ ] Repeat the clean-build determinism and generated-export checks.

Whichever path succeeds becomes the committed solution; the release must not retain an unused fallback dependency or script.

## Angular 22 consumer sample

The sample must test the package produced by the current build rather than a historical AngularFire tarball.

### Neutralize version-specific naming

- [ ] Rename the sample package from `ng19-test` to `angularfire-sample`.
- [ ] Rename the Angular workspace project, output paths, SSR serve script, application title, tests, and README references consistently.
- [ ] Verify `rg "ng19|angular-fire-19" sample` returns no current configuration or documentation matches.

### Upgrade its dependency graph

In `sample/package.json`:

- [ ] Move all Angular framework packages, `@angular/ssr`, CLI, compiler CLI, and build-angular to `^22.0.0`.
- [ ] Move TypeScript to `~6.0.3` and `@types/node` to `^22.0.0`.
- [ ] Replace `@angular/fire: file:../angular-fire-19.0.0.tgz` with `file:../dist/packages-dist`.
- [ ] Keep RxJS at `~7.8.0`.
- [ ] Remove the sample's `zone.js` dependency because its polyfill list is empty and the sample is zoneless.
- [ ] Regenerate `sample/package-lock.json` only after `dist/packages-dist` has been built.

### Update zoneless configuration and tests

- [ ] Replace `provideExperimentalZonelessChangeDetection` with the stable `provideZonelessChangeDetection` API in `sample/src/app/app.config.ts`.
- [ ] Ensure sample components work with Angular 22's default OnPush change detection; do not add manual change detection merely to hide a broken data flow.
- [ ] Replace stale assertions for `ng19-test` and the absent `<h1>` with meaningful application creation/rendering assertions.
- [ ] Avoid instantiating Firebase-dependent child components in shallow unit tests unless their Firebase providers are configured.

### Add root scripts

Remove the dead `test:typings` and `test:build` scripts: their referenced files were deleted and they cannot be release gates.

Add a `test:sample` script that, after the root package build exists:

1. Runs `npm ci --prefix sample`.
2. Runs the sample production browser/SSR build.
3. Runs sample tests once in ChromeHeadless.

Redefine `test:all` to execute, in order:

1. `lint`
2. the root package `build`
3. `build:jasmine`
4. CommonJS and ESM Node tests
5. ChromeHeadless and FirefoxHeadless emulator suites
6. `test:sample`

Update `CONTRIBUTING.md` if it names the deleted scripts or describes a different aggregate test sequence.

## Continuous integration

Update `.github/workflows/test.yml` without broadening permissions.

### Node coverage

- [ ] Use exact Node `22.22.3` in fixed `build`, `browser`, `contribute`, and `publish` jobs.
- [ ] Test exact Node `22.22.3`, `24.15.0`, and `26.0.0` in the existing Linux/macOS/Windows Node matrix.
- [ ] Set `check-latest: false` for exact versions so CI does not silently change the runtime.
- [ ] Retain the existing Java setup for Firebase Emulator Suite browser tests.

### Restore and extend required checks

- [ ] Re-enable `npm run lint` in CI.
- [ ] Add a `sample` job that needs `build`, downloads the `dist` artifact, installs the sample lockfile, builds the sample in production including SSR, and runs its headless tests.
- [ ] Add `sample` to the `test_and_contribute` branch-protection job's `needs` list.
- [ ] Add `sample` to the publish job's prerequisites so an RC cannot publish with a broken consumer build.
- [ ] Keep Markdown-only changes excluded from this workflow; the implementation PR will change code/config and therefore run it normally.

## Documentation and migration policy

- [ ] Add AngularFire 22 RC to the README compatibility/status information.
- [ ] Add `docs/version-22-upgrade.md` covering:
  - Angular 22, Node, and TypeScript requirements.
  - RC installation with `ng add @angular/fire@next`.
  - Angular 22's default OnPush and stable zoneless behavior as consumer considerations.
  - The fact that no supported AngularFire feature API requires a migration.
  - The unsupported status of AngularFire and Angular symbols prefixed with `ɵ`.
- [ ] Update the sample README for the neutral name and current commands.
- [ ] Use conventional commits and the GitHub release body for release notes.

No AngularFire 22 migration schematic is required: the resolver/router fixes are internal, and the package peer-range change is enforced by npm. Do not add an empty migration merely to create a version marker.

The repository intentionally removed its historical `CHANGELOG.md`; do not recreate it solely for this release. The stale root `changelog` script may be removed in the upgrade PR if it is confirmed unused.

## Public and internal compatibility impact

| Surface | AngularFire 22 behavior | Required communication |
| --- | --- | --- |
| Angular peer dependencies | `^22.0.0`; Angular 21 is no longer declared compatible | Breaking compatibility note in RC release notes and upgrade guide. |
| Node engine | `^22.22.3 || ^24.15.0 || >=26.0.0` | Installation prerequisites in README/upgrade guide. |
| Supported AngularFire feature APIs | No intentional change | State explicitly; do not advertise an unnecessary migration. |
| `ɵscreenViewEvent` | Third resolver argument removed | Record as an internal-only breaking change; no schematic or compatibility overload. |
| Analytics screen-class detection | Public reflection replaces removed factory/private router APIs | Regression tests must prove emitted analytics fields remain stable. |

## Verification gates

Run these gates from a clean checkout using Node 22.22.3. A gate is not complete when it passes only with uncommitted generated changes.

### Static and package checks

- [ ] `npm ci`
- [ ] `npm ls @angular/core @angular/cli @angular-devkit/architect @angular-devkit/build-angular ng-packagr typescript @angular-eslint/builder ts-patch`
- [ ] `npm run lint`
- [ ] Search current manifests/config/docs for stale version markers:

```shell
rg '21\.0\.0|0\.2100|>=5\.9|<6\.0|ng19|angular-fire-19' \
  package.json package-lock.json src/package.json mise.toml sample .github README.md docs
```

Any intentional historical reference must be explained; current configuration must have none.

### Build and generated artifacts

- [ ] Run `npm run build` twice from clean generated state and compare wrapper output.
- [ ] Confirm `dist/packages-dist/package.json` contains:
  - version `22.0.0-rc.0`;
  - Angular peer ranges `^22.0.0`;
  - the required Node engine;
  - unchanged intended Firebase/RxFire/RxJS ranges;
  - no Angular 21 references.
- [ ] Run `npm pack --dry-run ./dist/packages-dist` and review the complete file list for missing entry points or accidental source/build files.

### Automated tests

- [ ] `npm run build:jasmine`
- [ ] `npm run test:node`
- [ ] `npm run test:node-esm`
- [ ] `npm run test:chrome-headless`
- [ ] `npm run test:firefox-headless`
- [ ] `npm run test:sample`
- [ ] `npm run test:all` succeeds as the reproducible aggregate command.
- [ ] CI succeeds on Node 22.22.3, 24.15.0, and 26.0.0 across the declared OS matrix.

### Packed-artifact consumer smoke test

Do not use a workspace link for the final smoke test. Install the actual tarball created by the root build into a disposable Angular 22 application.

```shell
npx @angular/cli@22 new angularfire-22-smoke \
  --standalone --routing --ssr --skip-git --package-manager npm
cd angularfire-22-smoke
npm install /absolute/path/to/angular-fire-22.0.0-rc.0.tgz
npx ng build
npm run build
```

- [ ] Import and initialize at least one AngularFire provider so the test validates package typings and Angular compilation, not merely npm installation.
- [ ] Verify browser and server bundles both compile.
- [ ] Exercise the packaged `ng-add` collection against a disposable application/Firebase project, including configuration generation.
- [ ] Confirm the generated application configuration contains only supported `FirebaseOptions` keys.

## Release sequence for `22.0.0-rc.0`

1. [ ] Merge the RC-ready pull request only after every pre-publish gate above is green.
2. [ ] Confirm the build artifact reports `22.0.0-rc.0`; do not rely only on the root manifest.
3. [ ] Create and publish the GitHub release/tag `22.0.0-rc.0`.
4. [ ] Confirm `tools/build.sh`/the generated publish script recognizes the hyphenated prerelease and publishes with `npm publish --tag next`.
5. [ ] Verify the immutable published package metadata:

```shell
npm view @angular/fire@22.0.0-rc.0 version peerDependencies dependencies engines
npm view @angular/fire dist-tags
```

6. [ ] Confirm `next` is exactly `22.0.0-rc.0` and `latest` did not move.
7. [ ] Repeat the clean Angular 22 browser/SSR consumer smoke test using `@angular/fire@next`, rather than the local tarball.
8. [ ] Verify the install documentation and GitHub release notes link to the Angular 22 upgrade guide.

Stable `22.0.0` promotion is a later release decision. Do not publish this first deliverable under `latest`.

## Explicitly out of scope

- AngularFire 22 stable promotion.
- Continued declared compatibility with Angular 21.
- A Firebase JavaScript SDK major upgrade without an independently demonstrated blocker.
- Changes to the Node runtimes of `sample/functions` or `test/functions`; those are Firebase deployment runtimes, not Angular CLI build runtimes.
- Recreating the removed repository changelog.
- Adding a no-op AngularFire migration schematic.
- Unrelated site, documentation-platform, lint-rule, or legacy dependency modernization.

## Authoritative references

- [Angular version compatibility](https://angular.dev/reference/versions): Angular 22 Node, TypeScript, and RxJS support matrix.
- [Angular 22.0.0 changelog](https://github.com/angular/angular/blob/v22.0.0/CHANGELOG.md): removed APIs and framework breaking changes.
- [Angular `provideZonelessChangeDetection`](https://angular.dev/api/core/provideZonelessChangeDetection): stable zoneless provider.
- [Angular ESLint supported CLI versions](https://github.com/angular-eslint/angular-eslint#supported-angular-cli-versions): Angular CLI major alignment.
- [`ts-patch` package](https://www.npmjs.com/package/ts-patch): TypeScript 6-compatible compiler patch line.
- [AngularFire npm versions](https://www.npmjs.com/package/@angular/fire?activeTab=versions): published releases and distribution tags.

When a current package manifest or official compatibility page disagrees with a version recorded in this dated audit, use the newest compatible patch within the fixed major/range, update the audit with the evidence, and do not broaden the supported Angular or TypeScript major.
