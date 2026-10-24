# Automatic video cleanup release

## Site baseline recovery

The GitHub main branch (04ac552) contained 41 pages, while the live site's sitemap contained 289 URLs. The expanded source was recovered from the existing local microtools checkout into this isolated release checkout, preserving the original working folders. Recovery commit ecb8383 includes the existing site, shared SEO, analytics, advertising integration, and missing BlogLayout. Do not deploy the older prototype checkout: it lacks most live pages.

## Changes

- Integrate adaptive background matching / MI-GAN repair into the existing video tool, with three-second previews and bounded full-length exports. Preserve draggable/resizable multiple-region selections and analytics events. Multiple regions run sequentially through the same repair engine.
- Keep the live route, title, canonical URL, guide/FAQ structure, related links, sitemap, and shared metadata. Update obsolete descriptions of modes and unlimited input to reflect actual behavior.
- Support SDR videos up to 150 MB, two minutes, 1080p, 60 fps, and approximately 248-pixel selections. Normalize variable-frame-rate input to the reported source rate. Preserve common fractional rates and audio, with cancellation.
- Build/download checksum-verified model and runtime assets during deployment. Separate the new runtime package alias from the photo tool's existing ONNX dependency.
- Use webpack for the tested FFmpeg worker bundle; mark the existing OCR/PDF remote imports as browser imports so webpack does not attempt to bundle HTTPS modules.

## Verification

- Full production build passes, including TypeScript and 276 generated static pages.
- Nine automated checks and targeted ESLint pass.
- Production localhost:3013 upload → region selection → repair → download passed on 1280×720 fountain footage. Output is 3.003 seconds with decoded audio.
- Full-export engine previously verified on 427 frames at exactly 30000/1001 fps with matching source audio timing, plus a silent 105-frame 25 fps CPU-only fixture and cancellation.
- Production sitemap comparison: 289 old URLs, 289 release URLs, zero removed or added. Existing dynamic conversion routes remain present.
- Local rendered title, canonical, and index/follow match the live page. Shared layout, ToolLayout, sitemap, robots, and LLM files are unchanged relative to recovered baseline.
- Netlify draft deployment created successfully: 6adc018f4e6ad5967198d5ef. Not promoted to production.

## Handoff

User requested to test the local release before publishing. Local production server is on port 3013. No push to main or live deployment has occurred. Production Netlify site is e8405535-1790-4871-8cb4-853703c702dd; previous live deployment is 6a582d7978f0546b40f54876. Wait for the user's test feedback before publication.

## Local performance update — 2026-10-23

Not deployed. The local production server on port 3013 includes the speed update; the earlier Netlify draft does not.

- The page owns a repair session. It retains the model, normalized source, and bounded 48 MiB crop cache for up to 60 seconds between operations, with explicit cleanup on new video, cancel/error, reset, and unmount. Cached crops are copied before repair so later runs cannot read mutated data.
- Previews and full exports now share this session and use one adaptive pipeline. Changing the preview start or switching to full export invalidates the prepared footage and assessments, while retaining the model. The preview no longer computes an unused old-method result.
- Multiple selections share source preparation and a single final composite/encode per batch, instead of processing the full video again for each selection. Each patch is cropped before being transferred to the video engine, reducing temporary data. Multi-region results avoid extra lossy encoding passes; they are not expected to be byte-identical to the old sequential pipeline.
- Model, repair/blend math, full-export resolution/frame rate, CRF, preset, and audio settings remain unchanged.

Measured in the same local Chrome session using the three-second 1280×720 fountain fixture:

| Operation | Previous | Optimized |
| --- | ---: | ---: |
| Single-region retry | 14.89 s | 10.62 s |
| Two regions, fresh source | 28.67 s | 26.55 s |

The initial original run took 26.77 s. Optimized fresh-session runs varied from 38.21 s to 14.16 s, with most variation in model initialization/inference. Do not claim a reliable large first-run gain or extrapolate to phones. A later final-build retry took 23.23 s despite skipping preparation/model creation; inference timing varied substantially. The 29% retry figure is one paired observation, not a guaranteed or established average speedup. Controlled sequential repeats are recorded below. The two-region observation was a modest ~7% improvement.

Baseline, original retry, optimized fresh export, optimized retry, and final-build single export have identical SHA256: 89bae5ea13f1d8625d76e52c330705c4a3ef1b7a5c3a1abf4300aefcc2293a49. This verifies exact preservation of the tested single-region output, including audio; it is not universal quality certification.

The final preview-to-full test used a 4.2-second, 25 fps silent clip and a preview start of 0.5 seconds. Preview was 3 seconds; full export retained all 105 frames at exactly 25 fps / 4.2 seconds. This guards against reusing truncated or 12 fps preview footage for full export. Active inference cancellation returned an enabled retry state. Ten automated tests (including repeated model loading/CPU fallback reuse), production build, targeted lint/type checks, and the unchanged 289-URL sitemap comparison pass. Benchmark outputs/reports live under ignored output/bench/.

Controlled retry comparison (three runs each, no concurrent builds or other inference): original 16.769 / 13.656 / 13.412 seconds; optimized 9.956 / 9.879 / 9.883 seconds. Median 13.656 → 9.883 seconds, a 27.6% reduction on this fixture. These are retries with the source and model retained in the optimized session, not first-load timings. Final cancellation followed by a completed retry also produced the identical SHA256 above.
