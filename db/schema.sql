-- Accounts era schema, on Supabase Postgres (Singapore).
-- Identity lives in Supabase Auth (auth.users, uuid). Everything here hangs
-- off profiles, which mirrors auth.users 1:1 and is filled in lazily by the
-- API on a user's first write.
--
-- Row level security is ON for every table with NO policies, on purpose:
-- the publishable key can reach PostgREST, and this slams that door shut.
-- All reads and writes go through the Vercel functions, which connect as the
-- table owner over the pooler and are not subject to RLS.
--
-- Applied by scripts/comments-db.mjs setup and self-healed by api/_lib/store.js.

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text        not null,
  picture    text,
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;

create table if not exists comments (
  id         bigint generated always as identity primary key,
  page       text        not null,
  user_id    uuid        not null references profiles(id) on delete cascade,
  parent_id  bigint      references comments(id) on delete cascade,
  body       text        not null,
  approved   boolean     not null default false,
  ip_hash    text,
  created_at timestamptz not null default now()
);
alter table comments enable row level security;

create index if not exists comments_page_idx
  on comments (page, approved, created_at desc);

create index if not exists comments_user_recent_idx
  on comments (user_id, created_at desc);

create table if not exists likes (
  comment_id bigint      not null references comments(id) on delete cascade,
  user_id    uuid        not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);
alter table likes enable row level security;

-- One vouch per person per experience page, moderated like comments.
create table if not exists testimonials (
  id         bigint generated always as identity primary key,
  user_id    uuid        not null references profiles(id) on delete cascade,
  page       text        not null,
  relation   text        not null,
  body       text        not null,
  approved   boolean     not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, page)
);
alter table testimonials enable row level security;

create index if not exists testimonials_page_idx
  on testimonials (page, approved, created_at desc);

-- Hanko passport: one stamp per chapter read.
create table if not exists stamps (
  user_id    uuid        not null references profiles(id) on delete cascade,
  stamp      text        not null,
  created_at timestamptz not null default now(),
  primary key (user_id, stamp)
);
alter table stamps enable row level security;

-- Blog notes finished, for the reading ring.
create table if not exists reading (
  user_id    uuid        not null references profiles(id) on delete cascade,
  slug       text        not null,
  created_at timestamptz not null default now(),
  primary key (user_id, slug)
);
alter table reading enable row level security;

-- Desk terminal history for signed in visitors.
create table if not exists chats (
  id         bigint generated always as identity primary key,
  user_id    uuid        not null references profiles(id) on delete cascade,
  role       text        not null check (role in ('user', 'model')),
  body       text        not null,
  created_at timestamptz not null default now()
);
alter table chats enable row level security;

create index if not exists chats_user_idx
  on chats (user_id, created_at);
