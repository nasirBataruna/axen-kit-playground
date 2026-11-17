# Axen Kit + Form Playground — K2/K3 as-built

Public, independent React 19 / Vite / TypeScript playground, with nine real source-backed scenarios. Development evidence is bound to the draft feature branch, **not** default `main`.

**Preview:** https://stackblitz.com/github/nasirBataruna/axen-kit-playground/tree/k2-a04-preview  
**Draft PR:** https://github.com/nasirBataruna/axen-kit-playground/pull/1  
**Continuous integration:** https://github.com/nasirBataruna/axen-kit-playground/actions

## Clean reproducible install — K4 A08

Requires Node.js **24.x** (matching Kit package engine). Use the tracked `package-lock.json` generated on a clean GitHub Actions runner, not `npm install`:

```sh
npm ci --no-audit --no-fund
npm run check
npm run build
npm run test:browser  # after npx playwright install --with-deps chromium
npm run dev
```

The lock contains the exact installed dependency graph including the **local** `file:vendor/axen-kit` package. The six Kit-only files are sourced from private `nasirBataruna/axen-lib` draft PR #5 exact SHA `2d9af79bac53c7e6dbd6628d712199ea209add8d`; the upstream monorepo and Builder remain private. The consumed Form is public `@axenstudio/axen-form@0.1.19`. All external dependencies are pinned and frozen by lockfile. **This is a playground preview, not a published Kit package or a production deployment.**

## Actual implemented scenarios

| Route | Browser-observable behavior |
|---|---|
| K01 | Default/override theme; immutable default token |
| K02 | Semantic required/optional Kit slots at 375, 900 and 1200px without horizontal page overflow |
| K03 | Trusted registry overrides and unknown-component rejection |
| F01 | Real Form required/invalid/valid submit, visible inline feedback and reset |
| F02 | Conditional delivery address, Form ref getValues/resetForm, required validation and inline submit feedback |
| F03 | Custom registered field `registrationCode` with Zod validation, inline error/success, reset |
| I01 | Real KitAppShell wraps real Form, submitted values appear inline and in Events |
| I02 | Switching Kit theme preserves Form values, submit feedback and reset behavior |
| I03 | Semantic Kit loading/empty/error states, focus and alert attributes |

Kit owns presentation/layout/theme; **Axen Form owns values, validation and submit**. Events/output panel is technical evidence only, never the sole user confirmation. The application is client-only with demo values, no backend or real Customer data.

## Evidence, boundaries and limitations

- **K3 existing receipt:** GitHub Actions `44104593290` at SHA `10704654387444b4ff291f8181ea6a2e231b4310`: TypeScript/build and **13/13 Chromium browser tests PASS**.
- **K4 lock source:** clean GitHub runner `44106911129` on source SHA `6bebabf189a87a09a12aec917b61c68892bf78ee` created the lock and verified `npm ci`, typecheck and build; original candidate SHA-256: `2681a73a6e0d13e1644a4847098eab14887aab3ce3e929049ec3b80400a2ddd7`. K4 final acceptance requires CI on **resulting commit** with this lock tracked.
- **StackBlitz A09:** separate external Chromium probe against the actual StackBlitz import is diagnostic only; **do not infer A09 PASS from local Vite Chromium**. The probe records PASS only if the StackBlitz live app iframe actually runs Kit+Form submission and F02. Evidence remains distinguishable if blocked by browser/network/StackBlitz.
- Formal independent review, merge, production release, generated domain apps, and any full G3 exit are **not** claimed. Source remains draft PR #1. No automatic publishing, Builder edits, visibility changes or source-merging.
