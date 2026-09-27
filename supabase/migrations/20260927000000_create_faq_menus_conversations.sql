-- FAQ, menus, and conversation log tables for the LINE bot.

create extension if not exists "pgcrypto";

-- 自動で updated_at を更新するための共通トリガー関数
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── faq: よくある質問と回答 ─────────────────────────────
create table public.faq (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger faq_set_updated_at
  before update on public.faq
  for each row
  execute function public.set_updated_at();

alter table public.faq enable row level security;

-- 公開読み取り可(bot・公開ウィジェットから参照する想定)、書き込みは service role のみ(RLSをバイパス)
create policy "faq is publicly readable"
  on public.faq
  for select
  to anon, authenticated
  using (true);

-- ── menus: メニューと料金 ───────────────────────────────
create table public.menus (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null check (price >= 0),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger menus_set_updated_at
  before update on public.menus
  for each row
  execute function public.set_updated_at();

alter table public.menus enable row level security;

create policy "menus is publicly readable"
  on public.menus
  for select
  to anon, authenticated
  using (true);

-- ── conversations: bot との会話ログ ─────────────────────
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  line_user_id text not null,
  message text not null,
  bot_response text,
  confidence real,
  escalated boolean not null default false,
  created_at timestamptz not null default now()
);

create index conversations_line_user_id_idx on public.conversations (line_user_id);
create index conversations_created_at_idx on public.conversations (created_at);

alter table public.conversations enable row level security;

-- 会話ログは顧客の個人情報を含むため、anon / authenticated には一切の権限を与えない
-- (service role key はRLSをバイパスするため、Next.jsのAPIルートからのみアクセス可能)
