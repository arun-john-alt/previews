# Swathi & Arun — Immersive HD wedding invitation

## Start here

This is a static, **mobile-first, scroll-scrubbed wedding film website**. The default mode is **Immersive**. On compatible phones, the pre-rendered portrait master fills the display with no browser-time 16:9 zoom or crop. Scrolling up/down advances or reverses the film. Open **Play with sound** for normal playback and audio. The chapter rail, replay, date details, and calendar download are included.

Open `index.html` on a browser, ideally served from a web server, or publish this whole folder to GitHub Pages.

## Site files

- `index.html` — complete HTML/CSS/JavaScript; zero build tooling and no icon library.
- `assets/royal-film-immersive-HD.mp4` — default 1080 × 2340 portrait film, 24 fps, 940 frames, ~64.4 MiB. H.264, frequent 0.25 s keyframes for scroll seeking.
- `assets/royal-film-enhanced-1080p.mp4` — previous 1920 × 1080 landscape version, loaded **only when Clarity or Original is selected**.
- `assets/poster-portrait.jpg`, `assets/poster-wide.jpg` — first-load posters.
- `assets/mark.svg`, `assets/noise.svg` — lightweight branded vector assets.
- `docs/QA_REPORT.md` — tested checks, measurements and limitations.

## Publish to the existing GitHub Pages website

This edition is intended for the existing **`arun-john-alt/previews`** repository,
under the **`swathi-arun-immersive-hd/`** subfolder on the `main` branch.

**Intended URL:** https://arun-john-alt.github.io/previews/swathi-arun-immersive-hd/

The separate `publish_wedding_invitation.py` supplied one level above this folder
clones the existing repository and commits only this subfolder, leaving
`swathi-arun-wedding/` and all other sites untouched. Run the script from a
computer or Codex environment with Git, GitHub CLI and access to GitHub:

```bash
python publish_wedding_invitation.py --check-only
python publish_wedding_invitation.py
```

To update an existing version of the immersive website intentionally, add
`--replace`. Do not upload the original ZIP as the website; publish these
extracted files and retain their `assets/` directory.

### Prefer the maximum-quality master?

If your hosting provider permits a single video larger than 100 MiB, replace `assets/royal-film-immersive-HD.mp4` with the separately supplied `Swathi_Arun_Immersive_HD_Master.mp4` **renamed to** `royal-film-immersive-HD.mp4`. Both video variants have identical dimensions, frame count, duration and seek-keyframe layout, so no HTML changes are required. For GitHub Pages, retain the included ~64 MiB web version.

## Quality notes

The Gemini source is **1280 × 720 landscape**. Immersive framing retains only about 333 source pixels across the 720-pixel height. Every frame was cropped, lightly denoised, resized using a high-quality filter and contrast-adaptively sharpened, and then individually encoded into a portrait video. This improves encoding fidelity, presentation and perceptual edge quality but **does not invent genuine fine detail**. True native-resolution immersive footage requires generating the scene in portrait (9:19.5 or 9:16 with safe crop) using Gemini or another AI video tool.

See `docs/QA_REPORT.md` for tested browser sizes and remaining mobile playback verification.
