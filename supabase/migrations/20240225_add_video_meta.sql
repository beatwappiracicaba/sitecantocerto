
alter table public.videos 
add column if not exists event_name text,
add column if not exists event_date date;
