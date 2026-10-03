-- موج ۴ — تورلیدر، نظر مسافران، گالری واقعی (۱۴۰۵/۰۷/۱۱)
-- کاملاً افزایشی (expand): هیچ ستون/کلیدی حذف نمی‌شود؛ کد قدیمی main بی‌صدا رد می‌شود.

-- ۱) تورلیدرها: نام، عکس، سابقه در مسیر، زبان‌ها، نحوهٔ همراهی گروه
create table if not exists tour_leaders (
  id uuid primary key default gen_random_uuid(),
  name varchar(160) not null,
  photo text,
  bio text,
  languages varchar(240),
  join_mode varchar(40) not null default 'from_origin', -- 'from_origin' | 'at_destination'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ۲) انتساب لیدر به تور (nullable؛ تور بی‌لیدر معتبر است)
alter table site_tours add column if not exists leader_id uuid references tour_leaders(id);

-- ۳) گالری واقعی تور: آرایهٔ [{url, caption}] — خالی یعنی «گالری نداریم»، نه پلیس‌هولدر
alter table site_tours add column if not exists gallery jsonb default '[]';

-- ۴) نظر مسافران: فقط نظرهای is_visible=true روی سایت دیده می‌شوند
create table if not exists tour_reviews (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references site_tours(id) on delete cascade,
  name varchar(120) not null,
  rating smallint not null check (rating between 1 and 5),
  text text not null,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_tour_reviews_tour on tour_reviews(tour_id);
