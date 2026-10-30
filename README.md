# ComArc Exam Lab

A Thai-language, reading-first interactive textbook for **198322 Computer Architecture** (FE2019b, questions 1–6).

## Features

- Full worked lessons and solutions for questions 1–6, with interactive visual explanations
- Signed/unsigned 4-bit adder and overflow explorer
- ALU control explorer (ADD, SUB, AND, OR, NOR, SLT)
- Multicycle 3-state Main Control explorer, separate zone A / zone B
- 32-bit barrel shifter explorer and original annotated wiring diagram
- Pipeline timeline / hazard explorer and instruction control tracing
- Light and dark modes, adjustable reading font size, mobile navigation
- Separate practice mode, local progress storage (no account/backend)
- Works as a plain static website. No `npm install` or third-party JS libraries required

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000/#/study/1
```

You can also open `index.html` locally in a browser, although using a local static server is recommended.

## Deploy to a NEW GitHub repository

Create a **public** repository named `comarc-exam-lab` in the GitHub account `VVeb1250`. **Do not** add the files to the existing portfolio (`VVeb1250.github.io`).

```sh
git init -b main
git add .
git commit -m "Build ComArc Exam Lab interactive textbook"
git remote add origin https://github.com/VVeb1250/comarc-exam-lab.git
git push -u origin main
```

Then in GitHub: Settings → Pages → Build and deployment → Source: **GitHub Actions**. `.github/workflows/pages.yml` deploys the static files in the repository's root. Expected URL: `https://vveb1250.github.io/comarc-exam-lab/`.

### Content / copyright notes

Explanations are newly authored for the user's exam preparation. SVG figures are redrawn from the hardware concepts. The original scanned exam PDF/images are **not included** in this public package. Review educational reuse/attribution rights before publishing original source pages.

### Important source discrepancies

FE2019b question 5 states **1 GHz** and **1 µs period** simultaneously; mathematically 1 GHz corresponds to **1 ns**. The website presents both timing assumptions explicitly.

## Project files

- `index.html`: accessible page shell + navigation
- `style.css`: light/dark reading design and responsive styles
- `app.js`: lesson content, visualizations, interactive practice, and client-side state
- `.github/workflows/pages.yml`: GitHub Pages deployment
- `favicon.svg`: site icon

## Notes

- Hash-based navigation works under GitHub Pages project paths without rewrites.
- Local progress stays on the user's browser only and will not sync across devices.
- Theme defaults to OS setting; explicit user choice persists locally.
