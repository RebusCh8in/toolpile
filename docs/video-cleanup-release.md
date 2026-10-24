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
