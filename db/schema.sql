-- Guestbook comments for blog posts and experience pages.
-- Applied by scripts/comments-db.mjs setup (idempotent).

create table if not exists comments (
  id         bigint generated always as identity primary key,
  page       text        not null,
  name       text        not null,
  body       text        not null,
  approved   boolean     not null default false,
  ip_hash    text,
  created_at timestamptz not null default now()
);

create index if not exists comments_page_idx
  on comments (page, approved, created_at desc);

create index if not exists comments_ip_recent_idx
  on comments (ip_hash, created_at desc);
