/**
 * کلاینت اتصال به PostgreSQL واقعی.
 * - DATABASE_URL فقط از Secret Store / محیط خوانده می‌شود؛ هرگز در گیت نیست.
 * - در غیاب DATABASE_URL، توابع دیتا به دیتای لوکال fallback می‌کنند تا
 *   بیلد و توسعه متوقف نشود (Launch Gate تا اتصال واقعی بسته می‌ماند).
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  (typeof process !== 'undefined' ? process.env?.DATABASE_URL : undefined) ||
  '';

function createDb() {
  if (!connectionString) return null;
  const client = postgres(connectionString, {
    max: 1,
    idle_timeout: 20,
    // کوتاه نگه داشتن connect_timeout و max_lifetime یعنی اتصال مرده زود
    // دور ریخته و جایگزین می‌شود؛ عمر خیلی بلند، اتصال نیم‌مرده را نگه می‌دارد
    // و کوئری‌های بعدی را تا سقف زمانی رندر معطل می‌کند.
    connect_timeout: 8,
    max_lifetime: 300,
    prepare: false,
  });
  return drizzle(client, { schema });
}

export type AppDb = NonNullable<ReturnType<typeof createDb>>;

let cached: AppDb | null | undefined;

export function getDb(): AppDb | null {
  if (cached !== undefined) return cached;
  try {
    cached = createDb();
  } catch {
    cached = null;
  }
  return cached;
}

export function isDbConfigured(): boolean {
  return Boolean(connectionString);
}
