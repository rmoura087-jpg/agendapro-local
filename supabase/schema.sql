-- AgendaPro Local
-- Execute este arquivo no Supabase SQL Editor.
-- Ele cria tabelas, índices, RLS, gatilhos de cadastro e RPCs públicas seguras.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.establishments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  phone text,
  whatsapp text,
  address text,
  city text,
  instagram text,
  logo_url text,
  cover_url text,
  segment text default 'Barbearia',
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  name text not null,
  specialty text,
  photo_url text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professional_services (
  professional_id uuid not null references public.professionals(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (professional_id, service_id)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(establishment_id, phone)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  price numeric(10,2) not null default 0,
  status text not null default 'scheduled' check (status in ('scheduled','confirmed','completed','cancelled','no_show')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blocked_times (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  professional_id uuid references public.professionals(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  day_of_week integer not null check(day_of_week between 0 and 6),
  is_open boolean not null default false,
  open_time time not null default '09:00',
  close_time time not null default '19:00',
  break_start time,
  break_end time,
  unique(establishment_id, day_of_week)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_services_establishment on public.services(establishment_id);
create index if not exists idx_professionals_establishment on public.professionals(establishment_id);
create index if not exists idx_customers_establishment on public.customers(establishment_id);
create index if not exists idx_appointments_establishment_date on public.appointments(establishment_id, appointment_date);
create index if not exists idx_appointments_professional_date on public.appointments(professional_id, appointment_date);
create index if not exists idx_blocked_professional_date on public.blocked_times(professional_id, date);

create or replace function public.is_owner_of_establishment(p_establishment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.establishments
    where id = p_establishment_id and owner_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.establishments enable row level security;
alter table public.services enable row level security;
alter table public.professionals enable row level security;
alter table public.professional_services enable row level security;
alter table public.customers enable row level security;
alter table public.appointments enable row level security;
alter table public.blocked_times enable row level security;
alter table public.business_hours enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles own" on public.profiles;
create policy "profiles own" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "establishments owner" on public.establishments;
create policy "establishments owner" on public.establishments for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "services owner" on public.services;
create policy "services owner" on public.services for all using (public.is_owner_of_establishment(establishment_id)) with check (public.is_owner_of_establishment(establishment_id));

drop policy if exists "professionals owner" on public.professionals;
create policy "professionals owner" on public.professionals for all using (public.is_owner_of_establishment(establishment_id)) with check (public.is_owner_of_establishment(establishment_id));

drop policy if exists "professional_services owner" on public.professional_services;
create policy "professional_services owner" on public.professional_services for all
using (
  exists(select 1 from public.professionals p where p.id = professional_id and public.is_owner_of_establishment(p.establishment_id))
)
with check (
  exists(select 1 from public.professionals p where p.id = professional_id and public.is_owner_of_establishment(p.establishment_id))
);

drop policy if exists "customers owner" on public.customers;
create policy "customers owner" on public.customers for all using (public.is_owner_of_establishment(establishment_id)) with check (public.is_owner_of_establishment(establishment_id));

drop policy if exists "appointments owner" on public.appointments;
create policy "appointments owner" on public.appointments for all using (public.is_owner_of_establishment(establishment_id)) with check (public.is_owner_of_establishment(establishment_id));

drop policy if exists "blocked owner" on public.blocked_times;
create policy "blocked owner" on public.blocked_times for all using (public.is_owner_of_establishment(establishment_id)) with check (public.is_owner_of_establishment(establishment_id));

drop policy if exists "hours owner" on public.business_hours;
create policy "hours owner" on public.business_hours for all using (public.is_owner_of_establishment(establishment_id)) with check (public.is_owner_of_establishment(establishment_id));

drop policy if exists "notifications owner" on public.notifications;
create policy "notifications owner" on public.notifications for all using (public.is_owner_of_establishment(establishment_id)) with check (public.is_owner_of_establishment(establishment_id));

-- Trigger de cadastro: cria perfil e estabelecimento automaticamente com os metadados enviados pelo formulário.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_slug text;
begin
  insert into public.profiles(id, full_name, email, phone)
  values(new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'phone')
  on conflict (id) do update set full_name=excluded.full_name, email=excluded.email, phone=excluded.phone;

  base_slug := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'establishment_name','meu-negocio'), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  if base_slug = '' then base_slug := 'meu-negocio'; end if;

  insert into public.establishments(owner_id, name, slug, phone, whatsapp, city, segment)
  values(
    new.id,
    coalesce(new.raw_user_meta_data->>'establishment_name','Meu negócio'),
    base_slug || '-' || substr(replace(new.id::text,'-',''),1,6),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'city',
    coalesce(new.raw_user_meta_data->>'segment','Barbearia')
  )
  on conflict (owner_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Função de disponibilidade: não expõe agenda, clientes ou dados privados.
create or replace function public.get_available_slots(
  p_establishment_id uuid,
  p_service_id uuid,
  p_professional_id uuid,
  p_date date
)
returns table(slot time)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duration integer;
  v_day integer;
  v_open time;
  v_close time;
  v_break_start time;
  v_break_end time;
  v_slot time;
  v_end time;
  v_busy boolean;
begin
  select duration_minutes into v_duration from public.services
  where id=p_service_id and establishment_id=p_establishment_id and active=true;

  if v_duration is null then return; end if;

  select extract(dow from p_date)::integer into v_day;
  select open_time, close_time, break_start, break_end
  into v_open, v_close, v_break_start, v_break_end
  from public.business_hours
  where establishment_id=p_establishment_id and day_of_week=v_day and is_open=true;

  if v_open is null then return; end if;

  v_slot := v_open;
  while v_slot + make_interval(mins=>v_duration)::time <= v_close loop
    v_end := v_slot + make_interval(mins=>v_duration)::time;
    v_busy := exists(
      select 1 from public.appointments a
      where a.establishment_id=p_establishment_id
        and a.professional_id=p_professional_id
        and a.appointment_date=p_date
        and a.status <> 'cancelled'
        and a.start_time < v_end and a.end_time > v_slot
    ) or exists(
      select 1 from public.blocked_times b
      where b.establishment_id=p_establishment_id
        and (b.professional_id is null or b.professional_id=p_professional_id)
        and b.date=p_date
        and b.start_time < v_end and b.end_time > v_slot
    );

    if not v_busy and not (v_break_start is not null and v_break_end is not null and v_slot < v_break_end and v_end > v_break_start) then
      slot := v_slot; return next;
    end if;

    v_slot := v_slot + interval '30 minutes';
  end loop;
end;
$$;

-- Função pública de criação: valida horário novamente no servidor e só retorna sucesso/erro.
create or replace function public.create_public_appointment(
  p_establishment_id uuid,
  p_service_id uuid,
  p_professional_id uuid,
  p_date date,
  p_start_time time,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duration integer;
  v_price numeric;
  v_end time;
  v_customer_id uuid;
  v_available boolean;
begin
  select duration_minutes, price into v_duration, v_price
  from public.services
  where id=p_service_id and establishment_id=p_establishment_id and active=true;

  if v_duration is null then return jsonb_build_object('success',false,'message','Serviço inválido.'); end if;

  if not exists(select 1 from public.professionals where id=p_professional_id and establishment_id=p_establishment_id and active=true) then
    return jsonb_build_object('success',false,'message','Profissional inválido.');
  end if;

  v_end := p_start_time + make_interval(mins=>v_duration)::time;

  select exists(select 1 from public.get_available_slots(p_establishment_id,p_service_id,p_professional_id,p_date) s where s.slot=p_start_time)
  into v_available;

  if not v_available then return jsonb_build_object('success',false,'message','Esse horário não está disponível.'); end if;

  insert into public.customers(establishment_id,name,phone,email)
  values(p_establishment_id,trim(p_customer_name),trim(p_customer_phone),nullif(trim(coalesce(p_customer_email,'')),''))
  on conflict(establishment_id,phone) do update set
    name=excluded.name,
    email=coalesce(excluded.email,public.customers.email),
    updated_at=now()
  returning id into v_customer_id;

  insert into public.appointments(establishment_id,customer_id,professional_id,service_id,appointment_date,start_time,end_time,price,status)
  values(p_establishment_id,v_customer_id,p_professional_id,p_service_id,p_date,p_start_time,v_end,v_price,'scheduled');

  return jsonb_build_object('success',true);
exception
  when others then
    return jsonb_build_object('success',false,'message','Não foi possível concluir o agendamento. Tente novamente.');
end;
$$;

grant execute on function public.get_available_slots(uuid,uuid,uuid,date) to anon, authenticated;
grant execute on function public.create_public_appointment(uuid,uuid,uuid,date,time,text,text,text) to anon, authenticated;

-- Leitura pública controlada. Estas policies permitem somente informações não sensíveis da página pública.
drop policy if exists "public establishment by slug" on public.establishments;
create policy "public establishment by slug" on public.establishments for select to anon, authenticated using (true);

drop policy if exists "public active services" on public.services;
create policy "public active services" on public.services for select to anon, authenticated using (active=true);

drop policy if exists "public active professionals" on public.professionals;
create policy "public active professionals" on public.professionals for select to anon, authenticated using (active=true);

-- IMPORTANTE: não existem policies públicas de SELECT para customers, appointments, blocked_times ou notifications.
