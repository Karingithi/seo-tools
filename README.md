# free-seo-tools

Starter React + Vite + Tailwind (TypeScript) project pre-configured for SEO tools.

## Quick start

1. Install dependencies:
```bash
npm install
```

2. Start dev server:
```bash
npm run dev
```

3. Open http://localhost:5173

## Notes
- Tailwind v3 is included in devDependencies. If you run into issues with `npx` on Windows, use:
  - `npm install -D tailwindcss@3 postcss autoprefixer`
  - then `npx tailwindcss init -p`
- Files of interest:
  - `src/components/MetaTagGenerator.tsx` — example tool
  - `src/utils/metaUtils.ts` — helper to build meta tags
