-- Reset completo de tabelas e storage para o projeto Canto Certo
-- Execute no Supabase SQL Editor (Database → SQL)
-- Ajuste conforme necessário. Este script é idempotente.

-- Extensões necessárias
create extension if not exists pgcrypto;

-- Remover políticas antigas apenas de storage.objects (sempre existe)
drop policy if exists "read gallery" on storage.objects;
drop policy if exists "insert gallery" on storage.objects;
drop policy if exists "update gallery" on storage.objects;
drop policy if exists "delete gallery" on storage.objects;

-- Dropar tabelas (se existirem)
drop table if exists public.shows cascade;
drop table if exists public.profiles cascade;

-- Criar tabela de perfis
create table public.profiles (
  id uuid primary key,
  email text,
  name text,
  cargo text default 'Membro',
  role text default 'Membro',
  created_at timestamp with time zone default now()
);

-- Criar tabela de shows
create table public.shows (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  data date not null,
  hora text not null,
  descricao text,
  imagem text,
  preco text,
  compra_via text,
  compra_info text,
  ativo boolean default true,
  created_at timestamp with time zone default now()
);

-- Criar tabela de álbuns de eventos
create table public.albums (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  date date not null,
  created_at timestamp with time zone default now()
);

-- Ativar RLS
alter table public.profiles enable row level security;
alter table public.shows enable row level security;
alter table public.albums enable row level security;

-- Políticas de acesso para profiles
create policy "profiles_select_public" on public.profiles
  for select using (true);

create policy "profiles_upsert_authenticated" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_authenticated" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Políticas de acesso para shows
create policy "shows_read_all" on public.shows
  for select using (true);

create policy "shows_manage_auth" on public.shows
  for all to authenticated
  using (true)
  with check (true);

-- Políticas de acesso para albums
create policy "albums_read_all" on public.albums
  for select using (true);

create policy "albums_manage_auth" on public.albums
  for all to authenticated
  using (true)
  with check (true);

-- Criar bucket público da galeria (se não existir) de forma idempotente
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- Políticas de acesso para objetos do bucket 'gallery'
create policy "read gallery" on storage.objects
  for select using (bucket_id = 'gallery');

create policy "insert gallery" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery');

create policy "update gallery" on storage.objects
  for update to authenticated
  using (bucket_id = 'gallery')
  with check (bucket_id = 'gallery');

create policy "delete gallery" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery');

-- Dados iniciais opcionais (remova se não desejar seeds)
-- insert into public.shows (nome, data, hora, descricao, ativo)
-- values
-- ('Forró de Abertura', current_date + interval '2 day', '21:00', 'Abertura oficial do Canto Certo', true);
