-- Guestbook with Google accounts: users, comments (one reply level), likes.
-- Applied by scripts/comments-db.mjs setup and self-healed by the store.

create table if not exists users (
  id         bigint generated always as identity primary key,
  google_sub text        not null unique,
  name       text        not null,
  email      text,
  picture    text,
  created_at timestamptz not null default now()
);

create table if not exists comments (
  id         bigint generated always as identity primary key,
  page       text        not null,
  user_id    bigint      not null references users(id) on delete cascade,
  parent_id  bigint      references comments(id) on delete cascade,
  body       text        not null,
  approved   boolean     not null default false,
  ip_hash    text,
  created_at timestamptz not null default now()
);

create index if not exists comments_page_idx
  on comments (page, approved, created_at desc);

create index if not exists comments_user_recent_idx
  on comments (user_id, created_at desc);

create table if not exists likes (
  comment_id bigint      not null references comments(id) on delete cascade,
  user_id    bigint      not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);
