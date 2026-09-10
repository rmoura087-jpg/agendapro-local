-- ============================================================
-- AGENDAPRO LOCAL — UPGRADES V2
-- Rode este arquivo DEPOIS do schema.sql original, no SQL Editor
-- Adiciona: planos, limites por plano, autoatendimento do
-- cliente (consultar/cancelar) e notificação por WhatsApp.
-- ============================================================

-- ------------------------------------------------------------
-- 1. CAMPOS DE PLANO NO ESTABELECIMENTO
-- ------------------------------------------------------------

alter table public.establishments
  add column if not exists plan_status text not null default 'active'
    check (plan_status in ('active', 'past_due', 'canceled')),
  add column if not exists plan_renews_at timestamptz,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists whatsapp_notify boolean not null default true;

-- 'plan' já existe na tabela original (free | profissional | studio)

-- ------------------------------------------------------------
-- 2. LIMITES DO PLANO GRÁTIS (SERVIDOR, NÃO SÓ NA TELA)
-- ------------------------------------------------------------

create or replace function public.enforce_professional_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_count integer;
begin
  select plan into v_plan from public.establishments where id = new.establishment_id;

  if v_plan = 'free' then
    select count(*) into v_count
    from public.professionals
    where establishment_id = new.establishment_id;

    if v_count >= 1 then
      raise exception 'plan_limit_professionals'
        using hint = 'O plano Grátis permite apenas 1 profissional. Faça upgrade para adicionar mais.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_professional_limit on public.professionals;

create trigger trg_enforce_professional_limit
before insert on public.professionals
for each row
execute procedure public.enforce_professional_plan_limit();

-- Limite de agendamentos/mês do plano grátis é verificado dentro de
-- create_public_appointment (recriada na seção 4).

-- ------------------------------------------------------------
-- 3. AUTOATENDIMENTO DO CLIENTE: CONSULTAR E CANCELAR
-- ------------------------------------------------------------

create or replace function public.get_customer_appointments(
  p_establishment_id uuid,
  p_phone text
)
returns table (
  id uuid,
  appointment_date date,
  start_time time,
  end_time time,
  price numeric,
  status text,
  service_name text,
  professional_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id,
    a.appointment_date,
    a.start_time,
    a.end_time,
    a.price,
    a.status,
    s.name as service_name,
    p.name as professional_name
  from public.appointments a
  join public.customers c on c.id = a.customer_id
  join public.services s on s.id = a.service_id
  join public.professionals p on p.id = a.professional_id
  where a.establishment_id = p_establishment_id
    and c.phone = p_phone
  order by a.appointment_date desc, a.start_time desc
  limit 50;
$$;

grant execute on function public.get_customer_appointments(uuid, text) to anon, authenticated;

create or replace function public.cancel_customer_appointment(
  p_appointment_id uuid,
  p_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_customer_phone text;
begin
  select a.status, c.phone
  into v_status, v_customer_phone
  from public.appointments a
  join public.customers c on c.id = a.customer_id
  where a.id = p_appointment_id;

  if v_customer_phone is null or v_customer_phone <> p_phone then
    return jsonb_build_object('success', false, 'message', 'Agendamento não encontrado para esse telefone.');
  end if;

  if v_status in ('cancelled', 'completed') then
    return jsonb_build_object('success', false, 'message', 'Esse agendamento não pode mais ser cancelado.');
  end if;

  update public.appointments
  set status = 'cancelled', updated_at = now()
  where id = p_appointment_id;

  return jsonb_build_object('success', true);
end;
$$;

grant execute on function public.cancel_customer_appointment(uuid, text) to anon, authenticated;

-- ------------------------------------------------------------
-- 4. CREATE_PUBLIC_APPOINTMENT: + LIMITE MENSAL DO PLANO GRÁTIS
-- ------------------------------------------------------------

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
  v_plan text;
  v_month_count integer;
begin
  select duration_minutes, price
  into v_duration, v_price
  from public.services
  where id = p_service_id
    and establishment_id = p_establishment_id
    and active = true;

  if v_duration is null then
    return jsonb_build_object('success', false, 'message', 'Serviço inválido.');
  end if;

  if not exists (
    select 1 from public.professionals
    where id = p_professional_id
      and establishment_id = p_establishment_id
      and active = true
  ) then
    return jsonb_build_object('success', false, 'message', 'Profissional inválido.');
  end if;

  select plan into v_plan from public.establishments where id = p_establishment_id;

  if v_plan = 'free' then
    select count(*) into v_month_count
    from public.appointments
    where establishment_id = p_establishment_id
      and status <> 'cancelled'
      and date_trunc('month', appointment_date) = date_trunc('month', p_date);

    if v_month_count >= 30 then
      return jsonb_build_object(
        'success', false,
        'message', 'Este estabelecimento atingiu o limite de agendamentos do plano Grátis neste mês.'
      );
    end if;
  end if;

  v_end := p_start_time + (v_duration * interval '1 minute');

  select exists (
    select 1
    from public.get_available_slots(p_establishment_id, p_service_id, p_professional_id, p_date) s
    where s.slot = p_start_time
  )
  into v_available;

  if not v_available then
    return jsonb_build_object('success', false, 'message', 'Esse horário não está disponível.');
  end if;

  insert into public.customers (establishment_id, name, phone, email)
  values (
    p_establishment_id,
    trim(p_customer_name),
    trim(p_customer_phone),
    nullif(trim(coalesce(p_customer_email, '')), '')
  )
  on conflict (establishment_id, phone)
  do update set
    name = excluded.name,
    email = coalesce(excluded.email, public.customers.email),
    updated_at = now()
  returning id
  into v_customer_id;

  insert into public.appointments (
    establishment_id, customer_id, professional_id, service_id,
    appointment_date, start_time, end_time, price, status
  )
  values (
    p_establishment_id, v_customer_id, p_professional_id, p_service_id,
    p_date, p_start_time, v_end, v_price, 'scheduled'
  );

  return jsonb_build_object('success', true);

exception
  when others then
    return jsonb_build_object(
      'success', false,
      'message', 'Não foi possível concluir o agendamento. Tente novamente.'
    );
end;
$$;

grant execute on function public.create_public_appointment(uuid, uuid, uuid, date, time, text, text, text) to anon, authenticated;

-- ============================================================
-- FIM DO UPGRADE V2
-- ============================================================
