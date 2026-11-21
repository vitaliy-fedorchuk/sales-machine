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

## База, адмінка, кейси

Кейси (`/stati/<slug>`) і медіатека живуть у PostgreSQL (Prisma 7); редагуються в `/admin`.

```bash
cp .env.example .env     # налаштування (у git не потрапляє)
npm run db:up            # PostgreSQL 18 у Docker (порт 5433)
npm run db:migrate       # таблиці
npm run db:seed          # перенесені кейси + їхні фото в медіатеку
npm run admin:create -- --email you@example.com --name "Имя"   # користувач адмінки (пароль покаже один раз)
```

- Схема бази — `prisma/schema.prisma`; блоки кейсу — `lib/cases/schema.ts` (zod: перевірка і при збереженні, і при читанні).
- Блоки: текст із заголовком розділу, фото, галерея, відео (YouTube/Vimeo/Rutube), аудіо, відеовідгук, кнопка-посилання, цитати ЗМІ.
- Фото: `sharp` → 4 розміри webp (480–2400), без EXIF/GPS. Сховище: Vercel Blob, якщо є `BLOB_READ_WRITE_TOKEN`, інакше папка `UPLOADS_DIR` (локально).
- Вхід: argon2id, сесія — httpOnly-cookie (у базі лише SHA-256 токена), 5 невдалих спроб на пошту / 20 на IP за 15 хв → блок.
  `proxy.ts` не пускає в `/admin` без cookie; справжня перевірка — `requireUser()` у кожній сторінці й дії.
- Чернетка зберігається сама; опублікований кейс оновлюється на сайті кнопкою «Обновить» (кеш `/stati/<slug>` і `/keysy` скидається).
- Перегляд чернетки — `/preview/<id>` (лише після входу).

### Прод (Vercel)

1. Storage → створити Postgres (Neon) і Blob — Vercel сам додасть `DATABASE_URL` і `BLOB_READ_WRITE_TOKEN`.
2. Додати `SITE_URL=https://<домен>`.
3. Деплой: `npm run build` сам застосовує міграції (`prisma migrate deploy`).
4. Один раз: тимчасово вписати в `.env` прод-значення `DATABASE_URL` і `BLOB_READ_WRITE_TOKEN` (Vercel → Settings → Environment Variables),
   запустити `npm run db:seed` і `npm run admin:create -- --email … --name …`, потім повернути локальні значення.
