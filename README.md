# Axen Kit Playground

> Public scenario workspace for Axen Kit and **real Axen Form**. Work in progress: K2/A04 scenario shell, not yet a released Kit showcase.

[Open in StackBlitz](https://stackblitz.com/~/github.com/nasirBataruna/axen-kit-playground) · [Axen Form reference](https://github.com/nasirBataruna/axen-form-playground) · [K2 readiness and provenance](https://drive.google.com/file/d/1GemkfIZlbg_laTE1UOZlDdHysAF2PK0p/view)

## What this repo demonstrates

The K2 application is an independently hosted **React 19 + TypeScript + Vite** scenario shell. It is designed for nine named scenarios, grouped as Kit (K01–K03), Form (F01–F03), and Integrated (I01–I03). Each route includes a live/demo pane, a readable config/source pane, expected behavior, events/output, reset, and version provenance. The nine behavior tests belong to K3 and are **not claimed to pass at K2**.

**Current delivery boundary:** `@axenstudio/axen-kit@0.1.0` is built in a private `axen-lib` feature branch, **not publicly distributed**. The public playground must not copy its source or upload its private package artifact without separate Owner authorization. Until an approved public-accessible Kit package channel exists, Kit and integrated routes honestly display an integration-pending notice rather than claiming to render Kit. The Form scenario uses the separately published `@axenstudio/axen-form@0.1.19`.

## Getting started

Requires Node.js 22+ for the standalone Vite playground (Kit consumer verification used Node 24).

```sh
npm install
npm run dev
npm run check
npm run build
```

The StackBlitz link is a **target entrypoint**, not a certified K4 browser acceptance receipt. A04 navigation/build and A05–A09 interactions still require actual independent testing.

## Scenarios and gates

| Route | Scope | Current implementation |
|---|---|---|
| `/scenario/K01`, `K02`, `K03` | Theme, layout slots, trusted overrides | Scenario shell / Kit artifact pending |
| `/scenario/F01`, `F02`, `F03` | Basic form, conditions, custom registration | F01 real Form; F02/F03 future behavior |
| `/scenario/I01`, `I02`, `I03` | Kit+Form composition, theme preservation, accessibility | Kit artifact pending / future behavior |

Routes support reload and direct navigation through React Router. Demo-only surfaces are labelled **DEMO**, not exported Axen Kit components. Never enter real customer data; all examples are static fixtures.

## Exact library provenance

| Dependency | Revision | Status |
|---|---|---|
| Axen Kit 0.1.0 | `nasirBataruna/axen-lib` PR #5, commit `2d9af79bac53c7e6dbd6628d712199ea209add8d` | Private, unpublished; not bundled in this public repo |
| Axen Form | `@axenstudio/axen-form@0.1.19` | Public dependency; owns validation, state and submit |
| Kit A03 technical tests | Nalar `github-test-job:39884f3b536745a8a9b84de5eaa4a334` | 4/4 workflow checks PASS at pinned Kit SHA; not public consumer acceptance |

Private Kit artifact transfer, public publishing and K4 StackBlitz release require explicit approval. No copy of the private `axen-lib` source, credentials, package tokens, or generated tarballs should be committed here. K0/K1 PRs are not merged into the library default branch.

## Architecture

```text
src/scenarios.ts    Route metadata and provenance
src/App.tsx         Public scenario shell, panels and Form demo
src/App.css         Playground-only presentation (NOT Kit source)
src/main.tsx        Browser entry
```

Axen's larger mission is a **domain-neutral application builder**. This playground validates UI-library consumption only; it is not an app generator, a production service or proof of the two non-POS generated apps required for G3.

## Contribution policy

Propose changes on feature branches and draft PRs. Keep the Kit, Form, Builder and Form reference repositories unchanged. Do not merge, publish private artifacts or claim PASS for unexecuted scenarios. Acceptance evidence and project decisions are tracked in the [Continuity Kit](https://drive.google.com/file/d/18LtSWuucr3gA7sl9UvWWV1KCmMlOn-ch/view).

## GitHub About description (to set in repository Settings)

**Axen Kit + Form interactive playground — React/Vite scenario shell, source/config inspector, and verifiable UI acceptance.**
