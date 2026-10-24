# ToolPile - Claude Instructions

## Deployment Rules
- **NEVER deploy to Netlify without explicit user approval.** Every deploy costs credits.
- Batch changes: build many tools/articles first, then deploy once when the user says to.
- Always run `npx next build` to verify compilation before requesting deploy approval.
- Deploy command: `npx netlify-cli deploy --build --prod`
- Site: https://toolpile.app (Netlify ID: e8405535-1790-4871-8cb4-853703c702dd)

## Project Structure
- Framework: Next.js 16 with Turbopack, TypeScript, Tailwind CSS
- All tools are client-side only — no server processing, no API routes
- Tool pages: `src/app/tools/[tool-name]/page.tsx`
- Shared layout: `src/components/ToolLayout.tsx` (provides title, description, FAQs, related tools, keywords, guide)
- Blog articles: `src/app/blog/[slug]/page.tsx`
- Homepage tool list: `src/app/page.tsx` (tools array)
- Sitemap: `src/app/sitemap.ts`
- Footer: `src/components/Footer.tsx`

## When Adding a New Tool
1. Create `src/app/tools/[tool-name]/page.tsx` using ToolLayout component
2. Add entry to homepage tools array in `src/app/page.tsx`
3. Add slug to sitemap tools array in `src/app/sitemap.ts`
4. Run `npx next build` to verify — do NOT deploy

## When Adding a Blog Article
1. Create article in `src/app/blog/[slug]/page.tsx`
2. Add to blog index and sitemap
3. Run `npx next build` to verify — do NOT deploy

## AdSense
- Publisher ID: ca-pub-7469078813419410
- Script in layout.tsx head
- ads.txt in public/

## Tool Patterns
- All tools use 'use client' directive
- Use ToolLayout wrapper with faqs, relatedTools, keywords, guide props
- Dark theme: zinc-900 backgrounds, zinc-800 borders, blue-500/600 accents
- Keep tools self-contained in a single page.tsx file when possible
- Canvas API for image processing, Web Crypto for hashing, no unnecessary npm packages
