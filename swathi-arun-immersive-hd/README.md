# Swathi & Arun — Immersive HD wedding invitation

## Start here

This is a static, **mobile-first, scroll-scrubbed wedding film website**. The default mode is **Clarity**, which shows a wider view of the film. Immersive is available from the framing menu and loads an AI-upscaled portrait film only when selected. Scrolling up/down advances or reverses the film. Open **Play with sound** for normal playback and audio. The chapter rail, replay, date details, and calendar download are included.

Open `index.html` on a browser, ideally served from a web server, or publish this whole folder to GitHub Pages.

## Site files

- `index.html` — complete HTML/CSS/JavaScript; zero build tooling and no icon library.
- `assets/royal-film-immersive-HD.mp4` — AI-upscaled 1080 × 2340 portrait film, 24 fps, 940 frames, about 53 MiB. H.264, frequent 0.25 s keyframes for scroll seeking.
- `assets/royal-film-enhanced-1080p.mp4` — 1920 × 1080 wide version used by Clarity and Original; loaded on entry in Clarity mode.
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

## Quality notes

The Gemini source is 1280 × 720. Immersive framing retains roughly 333 source pixels across the original 720-pixel height. The portrait film uses Real-ESRGAN's `realesr-general-x4v3` model to upscale a center crop of the wide encode, then fits it to 1080 × 2340. This reduces visible pixelation, but generated details can differ from the source. It is not native 4K footage. The original audio and 24 fps timing are preserved.

Model and architecture: https://github.com/xinntao/Real-ESRGAN

See `docs/QA_REPORT.md` for tested browser sizes and remaining mobile playback verification.
