alter table public.prispevky
add column if not exists potvrzovaci_token_hash text;

alter table public.prispevky
add column if not exists potvrzeno_v timestamp;

alter table public.prispevky
add column if not exists smazano_autorem_v timestamp;

alter table public.prispevky
alter column vytvoreno set default now();

create table if not exists public.prispevky_spravni_odkazy (
  id bigserial primary key,
  email varchar not null,
  token_hash text not null,
  vytvoreno timestamp default now(),
  platnost_do timestamp not null,
  naposledy_pouzito timestamp
);
