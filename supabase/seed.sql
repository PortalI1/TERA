-- ============================================================================
-- TERA - Dados de exemplo (Fazenda Modelo)
--
-- Rode DEPOIS do schema.sql, uma única vez. As datas são relativas a hoje,
-- então a tela "Preciso irrigar?" mostra um quadro atual. Os números (áreas,
-- solos, déficits) são inventados, só para demonstrar o sistema.
-- Arquivo gerado a partir de src/lib/irrigacao/demo-definicao.ts.
--
-- Para apagar o exemplo depois: delete from propriedades where nome = 'Fazenda Modelo';
-- ============================================================================

begin;

insert into propriedades (nome) values ('Fazenda Modelo');

insert into solos (nome, capacidade_campo, ponto_murcha) values
  ('Argiloso', 38, 20),
  ('Textura média', 28, 14),
  ('Arenoso', 18, 8);

insert into culturas (nome, fator_p) values
  ('Soja', 0.5),
  ('Milho semente', 0.55),
  ('Feijão', 0.45);

insert into cultura_estagios (cultura_id, ordem, nome, dias, kc_inicio, kc_fim, raiz_inicio_cm, raiz_fim_cm)
select c.id, v.ordem, v.nome, v.dias, v.kc_inicio, v.kc_fim, v.raiz_inicio_cm, v.raiz_fim_cm
from (values
  ('Soja', 1, 'Inicial', 20, 0.4, 0.4, 10, 15),
  ('Soja', 2, 'Desenvolvimento', 30, 0.4, 1.15, 15, 60),
  ('Soja', 3, 'Intermediário', 60, 1.15, 1.15, 60, 60),
  ('Soja', 4, 'Final', 25, 1.15, 0.5, 60, 60),
  ('Milho semente', 1, 'Inicial', 20, 0.3, 0.3, 10, 15),
  ('Milho semente', 2, 'Desenvolvimento', 35, 0.3, 1.2, 15, 80),
  ('Milho semente', 3, 'Intermediário', 40, 1.2, 1.2, 80, 80),
  ('Milho semente', 4, 'Final', 30, 1.2, 0.35, 80, 80),
  ('Feijão', 1, 'Inicial', 20, 0.4, 0.4, 10, 15),
  ('Feijão', 2, 'Desenvolvimento', 30, 0.4, 1.15, 15, 50),
  ('Feijão', 3, 'Intermediário', 40, 1.15, 1.15, 50, 50),
  ('Feijão', 4, 'Final', 20, 1.15, 0.35, 50, 50)
) as v(cultura, ordem, nome, dias, kc_inicio, kc_fim, raiz_inicio_cm, raiz_fim_cm)
join culturas c on c.nome = v.cultura;

insert into areas_irrigadas (propriedade_id, solo_id, nome, area_ha, eficiencia)
select p.id, s.id, v.nome, v.area_ha, v.eficiencia
from (values
  ('Pivô 01 - Gleba 01', 'Argiloso', 52, 0.85),
  ('Pivô 01 - Gleba 02', 'Argiloso', 48, 0.85),
  ('Pivô 01 - Gleba 03', 'Argiloso', 50, 0.85),
  ('Pivô 02 - Gleba 05', 'Textura média', 61, 0.85),
  ('Pivô 02 - Gleba 06', 'Textura média', 45, 0.85),
  ('Pivô 03 - Gleba 04', 'Textura média', 47, 0.85),
  ('Pivô 05', 'Arenoso', 58, 0.85),
  ('Pivô 06', 'Argiloso', 72, 0.85),
  ('Pivô 08', 'Textura média', 66, 0.85),
  ('Pivô 09', 'Textura média', 69, 0.85),
  ('Pivô 10', 'Argiloso', 64, 0.85),
  ('Pivô 12', 'Textura média', 55, 0.85),
  ('Pivô Pista', 'Arenoso', 40, 0.85),
  ('Pivô Represa', 'Arenoso', 36, 0.85)
) as v(nome, solo, area_ha, eficiencia)
join propriedades p on p.nome = 'Fazenda Modelo'
join solos s on s.nome = v.solo;

insert into plantios (area_id, cultura_id, nome, data_plantio, data_referencia, deficit_referencia_mm)
select a.id, c.id, v.nome, hoje_br() - v.dias_de_plantio, hoje_br() - 3, v.deficit
from (values
  ('Pivô 01 - Gleba 01', 'Soja', 'Soja 2026/27', 30, 10),
  ('Pivô 01 - Gleba 02', 'Milho semente', 'Milho Semente Bayer (970165M4V2726)', 42, 12),
  ('Pivô 01 - Gleba 03', 'Milho semente', 'Milho Semente Bayer (970165M4V2726)', 42, 12),
  ('Pivô 02 - Gleba 05', 'Milho semente', 'Milho Semente Bayer (970165M4V2725)', 40, 14),
  ('Pivô 02 - Gleba 06', 'Feijão', 'Feijão 2026/27', 28, 9),
  ('Pivô 03 - Gleba 04', 'Feijão', 'Feijão 2026/27', 28, 9),
  ('Pivô 05', 'Feijão', 'Feijão 2026/27', 25, 8),
  ('Pivô 06', 'Milho semente', 'Milho Semente Bayer (970127M4V2724)', 45, 16),
  ('Pivô 08', 'Soja', 'Soja 2026/27', 32, 11),
  ('Pivô 09', 'Soja', 'Soja 2026/27', 32, 12),
  ('Pivô 10', 'Soja', 'Soja 2026/27', 27, 8),
  ('Pivô 12', 'Milho semente', 'Milho Semente Bayer (970165M4V2725)', 38, 20),
  ('Pivô Pista', 'Milho semente', 'Milho Semente Bayer (959608M4V2744)', 36, 22),
  ('Pivô Represa', 'Soja', 'Soja 2026/27', 30, 18)
) as v(area, cultura, nome, dias_de_plantio, deficit)
join propriedades p on p.nome = 'Fazenda Modelo'
join areas_irrigadas a on a.nome = v.area and a.propriedade_id = p.id
join culturas c on c.nome = v.cultura;

insert into meteorologia_diaria (propriedade_id, data, eto_mm, chuva_mm, prob_chuva_pct)
select p.id, hoje_br() + v.dia, v.eto, v.chuva, v.prob
from (values
  (-10, 5.1, 0, 0),
  (-9, 5.3, 0, 0),
  (-8, 4.9, 12.4, 90),
  (-7, 3.6, 0, 20),
  (-6, 4.8, 0, 0),
  (-5, 5.4, 0, 0),
  (-4, 5.6, 0, 0),
  (-3, 5.2, 3, 60),
  (-2, 5.5, 0, 0),
  (-1, 5.3, 0, 0),
  (0, 5.2, 0, 0),
  (1, 5.4, 1, 35),
  (2, 4, 6, 90),
  (3, 4.6, 1, 75),
  (4, 5.5, 4, 35),
  (5, 3.9, 6, 75),
  (6, 4.3, 3, 90)
) as v(dia, eto, chuva, prob)
join propriedades p on p.nome = 'Fazenda Modelo';

insert into lancamentos (plantio_id, data, tipo, lamina_mm)
select pl.id, hoje_br() + v.dia, v.tipo, v.lamina
from (values
  ('Pivô Pista', -1, 'irrigacao', 7.72),
  ('Pivô Represa', -1, 'irrigacao', 2.65)
) as v(area, dia, tipo, lamina)
join propriedades p on p.nome = 'Fazenda Modelo'
join areas_irrigadas a on a.nome = v.area and a.propriedade_id = p.id
join plantios pl on pl.area_id = a.id;

commit;
