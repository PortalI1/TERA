-- ============================================================================
-- TERA - Esquema do banco de dados (Supabase / PostgreSQL)
--
-- Como usar: no painel do Supabase, abra "SQL Editor", cole todo este arquivo
-- e clique em "Run". Rode uma única vez, em um projeto vazio.
-- Depois, se quiser dados de exemplo, rode também o arquivo seed.sql.
-- ============================================================================

-- Data de hoje no horário de Brasília (o servidor do Supabase usa UTC).
create or replace function hoje_br() returns date
language sql stable as $$
  select (now() at time zone 'America/Sao_Paulo')::date
$$;

-- Propriedades (fazendas) ----------------------------------------------------
create table propriedades (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null unique,
  municipio  text,
  uf         char(2),
  latitude   numeric(9,6),
  longitude  numeric(9,6),
  criado_em  timestamptz not null default now()
);

-- Solos: capacidade de campo e ponto de murcha, em % de volume ----------------
create table solos (
  id               uuid primary key default gen_random_uuid(),
  nome             text not null unique,
  capacidade_campo numeric(5,2) not null check (capacidade_campo > 0 and capacidade_campo <= 100),
  ponto_murcha     numeric(5,2) not null check (ponto_murcha >= 0),
  criado_em        timestamptz not null default now(),
  check (capacidade_campo > ponto_murcha)
);

-- Culturas e suas fases (Kc e raiz) --------------------------------------------
create table culturas (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null unique,
  -- Fração da água disponível que a planta usa sem estresse (fator p, FAO-56).
  fator_p   numeric(3,2) not null default 0.50 check (fator_p between 0.10 and 0.90),
  criado_em timestamptz not null default now()
);

create table cultura_estagios (
  id              uuid primary key default gen_random_uuid(),
  cultura_id      uuid not null references culturas(id) on delete cascade,
  ordem           smallint not null check (ordem > 0),
  nome            text not null,
  dias            smallint not null check (dias > 0),
  kc_inicio       numeric(4,2) not null check (kc_inicio >= 0),
  kc_fim          numeric(4,2) not null check (kc_fim >= 0),
  raiz_inicio_cm  numeric(5,1) not null check (raiz_inicio_cm > 0),
  raiz_fim_cm     numeric(5,1) not null check (raiz_fim_cm > 0),
  unique (cultura_id, ordem)
);

-- Áreas irrigadas: pivôs e talhões ----------------------------------------------
create table areas_irrigadas (
  id             uuid primary key default gen_random_uuid(),
  propriedade_id uuid not null references propriedades(id) on delete cascade,
  solo_id        uuid not null references solos(id) on delete restrict,
  nome           text not null,
  area_ha        numeric(8,2) check (area_ha > 0),
  -- Eficiência do sistema de irrigação (0,85 = 85%).
  eficiencia     numeric(3,2) not null default 0.85 check (eficiencia between 0.30 and 1.00),
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now(),
  unique (propriedade_id, nome)
);

-- Plantios: o que está plantado em cada área ------------------------------------
create table plantios (
  id                    uuid primary key default gen_random_uuid(),
  area_id               uuid not null references areas_irrigadas(id) on delete cascade,
  cultura_id            uuid not null references culturas(id) on delete restrict,
  nome                  text not null,
  variedade             text,
  data_plantio          date not null,
  data_colheita         date,
  -- O balanço hídrico começa em data_referencia, com este déficit (mm) no solo.
  data_referencia       date not null,
  deficit_referencia_mm numeric(6,2) not null default 0 check (deficit_referencia_mm >= 0),
  ativo                 boolean not null default true,
  criado_em             timestamptz not null default now(),
  check (data_referencia >= data_plantio)
);

-- Clima diário da propriedade (observado e previsto) -----------------------------
create table meteorologia_diaria (
  id             uuid primary key default gen_random_uuid(),
  propriedade_id uuid not null references propriedades(id) on delete cascade,
  data           date not null,
  -- Evapotranspiração de referência, em mm/dia.
  eto_mm         numeric(5,2) not null check (eto_mm >= 0),
  chuva_mm       numeric(6,2) not null default 0 check (chuva_mm >= 0),
  prob_chuva_pct smallint check (prob_chuva_pct between 0 and 100),
  temp_min       numeric(4,1),
  temp_max       numeric(4,1),
  origem         text not null default 'manual',
  atualizado_em  timestamptz not null default now(),
  unique (propriedade_id, data)
);

-- Lançamentos: irrigação feita ou chuva medida em cada plantio --------------------
create table lancamentos (
  id         uuid primary key default gen_random_uuid(),
  plantio_id uuid not null references plantios(id) on delete cascade,
  data       date not null,
  tipo       text not null check (tipo in ('irrigacao', 'chuva')),
  lamina_mm  numeric(6,2) not null check (lamina_mm >= 0),
  observacao text,
  criado_em  timestamptz not null default now()
);

create index lancamentos_plantio_data_idx on lancamentos (plantio_id, data);
create index plantios_area_idx on plantios (area_id);
create index areas_propriedade_idx on areas_irrigadas (propriedade_id);
create index estagios_cultura_idx on cultura_estagios (cultura_id);

-- Segurança ------------------------------------------------------------------------
-- Todas as tabelas ficam fechadas para acesso direto pela internet (RLS ligado, sem
-- regras). O sistema lê e grava pelo servidor, usando a chave "service_role", que
-- nunca vai para o navegador. Quando o login de usuários for criado, as regras de
-- acesso por usuário entram aqui.
alter table propriedades         enable row level security;
alter table solos                enable row level security;
alter table culturas             enable row level security;
alter table cultura_estagios     enable row level security;
alter table areas_irrigadas      enable row level security;
alter table plantios             enable row level security;
alter table meteorologia_diaria  enable row level security;
alter table lancamentos          enable row level security;
