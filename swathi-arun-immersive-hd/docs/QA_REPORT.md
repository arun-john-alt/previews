# Mobile-first website QA — Immersive HD edition

## AI upscale update, 19 November 2026

Clarity is the default on every page load. Immersive remains optional and its portrait file loads only when selected.

The portrait film now uses Real-ESRGAN `realesr-general-x4v3` on all 940 frames. The input is a 498 × 1080 center crop of the wide encode, reduced to 332 × 720 (near the original source resolution), then upscaled 4× with the model and fitted to 1080 × 2340 with Lanczos.

- Output: 1080 × 2340, 24 fps, 940 frames; 39.167 seconds of picture and 39.213 seconds in the audio/video container.
- H.264 High level 5.1, 0.25-second keyframes, fast-start MP4, and about 53 MiB.
- BT.709 primaries/matrix and the source sRGB transfer tag are retained.
- Full video/audio decode completed without errors. Original and output audio have identical SHA-256 hashes when extracted as ADTS.
- Matching frames and a six-second comparison show clearer lettering and ornament edges. This uses a frame-by-frame model; subtle temporal artifacts remain possible.
- This is AI-upscaled detail, not native 4K capture. Existing source transitions and framing remain.

Model and architecture: https://github.com/xinntao/Real-ESRGAN

## Original package QA, 17 November 2026

**Date:** 17 November 2026
**Source:** `gemini_generated_video_27589263.mp4`, 1280 × 720, 24 fps, 40.04 s.
**Previous re-edit:** two abrupt cuts softened; 940 frames and 39.213 s.
**New portrait website video:** 1080 × 2340, 24 fps, 940 frames, H.264 High level 5.1, AAC audio, 64.4 MiB.
**Archival version:** same 940 frames / portrait size, high-bitrate H.264, 128.4 MiB (separate link, NOT included in GitHub Pages site).

## Changes made

1. Immersive mode is now the **initial mode**, using a newly rendered native-portrait raster of the same cinematic sequence. The browser no longer magnifies a 16:9 stream to fill the phone.
2. Old localStorage framing preferences cannot override this updated first-launch default (uses a fresh storage key). Subsequent user-selected framing choices are saved.
3. The full widescreen film remains available in Clarity and Original mode, lazy loaded only when explicitly selected.
4. The existing fixed monogram and inline SVG controls are preserved; alignment constraints on narrow screens were rechecked.
5. Framing menu was fixed again to anchor to the actual viewport, including a new case found at 375px.
6. Scroll-linked seeking is preserved, including backward scrolling, replay, scene labels and controls.
7. 0.25-second H.264 keyframes make seeking more responsive.

## Image/video processing

- All **940 frames** were processed with a light spatial-temporal denoise, center-crop, Lanczos high-quality resize and conservative contrast-adaptive sharpening. No neural super-resolution model was used.
- 1080 × 2340 portrait dimensions match a common tall Android display aspect ratio. Other phone ratios may experience a small additional edge crop.
- The initial landscape source is only 720 pixels tall. Its phone-height portrait crop contains approximately 333 source pixels across; this is not equal to native 1080-pixel horizontal detail.
- The high-bitrate archival encode (CRF 13) and the web encode (CRF 17) were both independently generated from the same processed source; neither was re-encoded from the other.

## Automated verification

- Full 940-frame decoding of **both** portrait videos with FFmpeg: **no decoding errors**.
- Probed dimensions, frame count, frame rate, codecs, duration and keyframe placement.
- Measured web encode versus archival master over six sampled frames: PSNR approximately 43–45 dB and SSIM around **0.994–0.995**. This is an encode-fidelity comparison, **not** a measure of true upscale sharpness.
- Chromium mobile emulation at **320 × 640, 360 × 740, 375 × 667, 390 × 844, 412 × 915 and 430 × 932** using a compressed 39-second copy of the *same portrait video* to keep automation memory and CPU usage manageable.
- All six viewport checks passed after fixing a framing menu overflow discovered at 375px.
- Verified no horizontal scrolling, circle/monogram fit, header collision, frame-control menu bounds, correct default mode, portrait video visible, landscape video hidden and loaded on demand, switch back, watch dialog and ending layout.
- Scroll-seeking tested at 25%, 50%, 82% and then 35% with correctly ordered media timestamps.
- Browser-script static syntax check passed.
- Full-height H.264 browser decode separately tested using an actual 1080 × 2340 high-bitrate sample: 1080 × 2340 was detected, the seek to 0.5 seconds completed and no media error occurred.
- High-res screenshots and full-video decode independently checked; one compact contact sheet is included in `docs/PORTRAIT_PREVIEW.jpg`.

## Remaining limitations

- Browser automation used **real film frames**, but a lower-resolution 216 × 468 copy for interaction testing; it was not a physical Android/iOS device test. Test high-res scroll smoothness and audio on the final hosted site using an actual phone, including cellular internet.
- The original video does not contain missing native portrait pixels. High-bitrate encoding can preserve edges and avoid added compression, but cannot restore lost details from the original Gemini render. The full-bleed crop can also truncate parts of the original wide lettering; all verified event details are shown separately in crisp HTML at the end.
- First-load download is ~64.4 MiB in Immersive mode; the alternative widescreen video adds ~40 MiB only when selected. On metered mobile connections loading may take time.
- The 128 MiB archival master is intentionally separate to keep the published site compatible with GitHub repository file limits.
