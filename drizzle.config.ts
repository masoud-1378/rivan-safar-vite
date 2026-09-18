import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // drizzle-kit فقط هنگام اجرای دستور migration به این نیاز دارد.
    // مقدار از محیط خوانده می‌شود و در گیت ذخیره نمی‌شود.
    url: process.env.DATABASE_URL || '',
  },
});
