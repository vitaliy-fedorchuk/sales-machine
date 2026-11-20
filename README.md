# Sales Machine

Сайт sales-machine.team на Next.js (App Router) + TypeScript.

```bash
npm install
npm run dev        # http://localhost:3100
npm test           # юніт-тести engine.ts (vitest)
npm run build
```

- Головна «Скручена драбина» — `components/spiral/` (ТЗ і прототип: `task/1/`).
- Напрями — `lib/directions.ts` (пізніше з CMS).
- Шрифт тимчасово Manrope; Gilroy підключити через `next/font/local` у `app/layout.tsx`.
