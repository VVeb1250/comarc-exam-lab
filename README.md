# ComArc Exam Lab

A Thai-language, reading-first interactive textbook for **198322 Computer Architecture** (FE2019b, questions 1–6). The current `/study/` edition follows the approved shared textbook source; the previous edition remains available under `/legacy/study/`.

## Develop locally

```sh
npm ci
npm run dev
```

Open `http://localhost:4321/comarc-exam-lab/`. The six lessons are authored as MDX, with interactive simulators and practice questions hydrated as small React islands. Progress, answers, theme, and reading size remain in this browser's `localStorage`.

## Validate

```sh
npm test
npm run build
```

`npm test` runs the Vitest calculator and content-integrity checks plus Playwright checks for all six current and legacy chapters, the interactive simulators, practice answers, theme, progress, and figure zoom. The static production files are written to `dist/`.

## GitHub Pages

The Astro build uses the `/comarc-exam-lab/` base path and writes static files to `dist/`. `.github/workflows/pages.yml` runs tests and the production build for pull requests and deploys successful builds from `main`. In GitHub, set Pages to **GitHub Actions** under Settings → Pages → Build and deployment.

Expected URL: `https://vveb1250.github.io/comarc-exam-lab/`.

## Reference figures

The approved source contains three raster figures, referenced at these exact paths:

- `public/images/q3_datapath.png`
- `public/images/fe2019b_q4_srl_wired.png`
- `public/images/fe2019b_q6_figure5.png`

The conversation showed these images inline, but the image bytes were not made available to the workspace. The lesson pages link the exact filenames and show a clear fallback until the original files are added. Do not replace them with approximations.

The remaining small diagrams are the source SVGs embedded in the approved lesson text. Review educational reuse and attribution rights before publishing original source pages.

FE2019b question 5 states **1 GHz** and **1 µs period** simultaneously; mathematically 1 GHz corresponds to **1 ns**. The site presents both timing assumptions explicitly.
