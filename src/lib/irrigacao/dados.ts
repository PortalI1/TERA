import { bancoConfigurado, consultar } from "@/lib/db";
import { DIAS_PREVISAO } from "./balanco";
import { hojeNoBrasil, somarDias } from "./datas";
import { dadosDemo } from "./demo";
import type { DadosIrrigacao, ResultadoCarga } from "./tipos";

// O Supabase devolve no máximo 1000 linhas por consulta. Se chegar nisso, os dados
// podem estar cortados, então avisamos em vez de mostrar números errados.
const LIMITE_LINHAS = 1000;

type LinhaPropriedade = { id: string; nome: string };
type LinhaSolo = { id: string; nome: string; capacidade_campo: number; ponto_murcha: number };
type LinhaCultura = {
  id: string;
  nome: string;
  fator_p: number;
  cultura_estagios: {
    ordem: number;
    nome: string;
    dias: number;
    kc_inicio: number;
    kc_fim: number;
    raiz_inicio_cm: number;
    raiz_fim_cm: number;
  }[];
};
type LinhaArea = {
  id: string;
  propriedade_id: string;
  solo_id: string;
  nome: string;
  area_ha: number | null;
  eficiencia: number;
};
type LinhaPlantio = {
  id: string;
  area_id: string;
  cultura_id: string;
  nome: string;
  variedade: string | null;
  data_plantio: string;
  data_referencia: string;
  deficit_referencia_mm: number;
};
type LinhaClima = {
  propriedade_id: string;
  data: string;
  eto_mm: number;
  chuva_mm: number;
  prob_chuva_pct: number | null;
};
type LinhaLancamento = {
  plantio_id: string;
  data: string;
  tipo: "irrigacao" | "chuva";
  lamina_mm: number;
};

function garantirSemCorte<T>(linhas: T[], tabela: string): T[] {
  if (linhas.length >= LIMITE_LINHAS) {
    throw new Error(`A tabela "${tabela}" tem registros demais para este período (limite de ${LIMITE_LINHAS}).`);
  }
  return linhas;
}

/**
 * Carrega os dados da tela "Preciso irrigar?".
 * - Banco configurado: lê do Supabase (se der erro, mostra o erro; nunca troca por dados de exemplo).
 * - Banco não configurado: usa os dados de exemplo.
 */
export async function carregarDados(): Promise<ResultadoCarga> {
  const hoje = hojeNoBrasil();

  if (!bancoConfigurado()) {
    return { tipo: "ok", dados: dadosDemo(hoje) };
  }

  try {
    const [propriedades, solos, culturas, areas, plantios] = await Promise.all([
      consultar<LinhaPropriedade>("propriedades?select=id,nome&order=nome"),
      consultar<LinhaSolo>("solos?select=id,nome,capacidade_campo,ponto_murcha"),
      consultar<LinhaCultura>(
        "culturas?select=id,nome,fator_p,cultura_estagios(ordem,nome,dias,kc_inicio,kc_fim,raiz_inicio_cm,raiz_fim_cm)",
      ),
      consultar<LinhaArea>(
        "areas_irrigadas?select=id,propriedade_id,solo_id,nome,area_ha,eficiencia&ativo=eq.true&order=nome",
      ),
      consultar<LinhaPlantio>(
        "plantios?select=id,area_id,cultura_id,nome,variedade,data_plantio,data_referencia,deficit_referencia_mm&ativo=eq.true",
      ),
    ]);

    // O clima e os lançamentos são lidos desde o início do balanço mais antigo.
    const inicio = plantios.reduce(
      (menor, p) => (p.data_referencia < menor ? p.data_referencia : menor),
      somarDias(hoje, -3),
    );
    const fim = somarDias(hoje, DIAS_PREVISAO);

    const [clima, lancamentos] = await Promise.all([
      consultar<LinhaClima>(
        `meteorologia_diaria?select=propriedade_id,data,eto_mm,chuva_mm,prob_chuva_pct&and=(data.gte.${inicio},data.lte.${fim})&order=data`,
      ),
      consultar<LinhaLancamento>(
        `lancamentos?select=plantio_id,data,tipo,lamina_mm&data=gte.${inicio}&order=data`,
      ),
    ]);

    garantirSemCorte(clima, "meteorologia_diaria");
    garantirSemCorte(lancamentos, "lancamentos");

    const dados: DadosIrrigacao = {
      origem: "banco",
      hoje,
      propriedades,
      solos: solos.map((s) => ({
        id: s.id,
        nome: s.nome,
        capacidadeCampo: s.capacidade_campo,
        pontoMurcha: s.ponto_murcha,
      })),
      culturas: culturas.map((c) => ({
        id: c.id,
        nome: c.nome,
        fatorP: c.fator_p,
        estagios: [...c.cultura_estagios]
          .sort((a, b) => a.ordem - b.ordem)
          .map((e) => ({
            nome: e.nome,
            dias: e.dias,
            kcInicio: e.kc_inicio,
            kcFim: e.kc_fim,
            raizInicioCm: e.raiz_inicio_cm,
            raizFimCm: e.raiz_fim_cm,
          })),
      })),
      areas: areas.map((a) => ({
        id: a.id,
        propriedadeId: a.propriedade_id,
        soloId: a.solo_id,
        nome: a.nome,
        areaHa: a.area_ha,
        eficiencia: a.eficiencia,
      })),
      plantios: plantios.map((p) => ({
        id: p.id,
        areaId: p.area_id,
        culturaId: p.cultura_id,
        nome: p.nome,
        variedade: p.variedade,
        dataPlantio: p.data_plantio,
        dataReferencia: p.data_referencia,
        deficitReferenciaMm: p.deficit_referencia_mm,
      })),
      clima: clima.map((c) => ({
        propriedadeId: c.propriedade_id,
        data: c.data,
        etoMm: c.eto_mm,
        chuvaMm: c.chuva_mm,
        probChuvaPct: c.prob_chuva_pct,
      })),
      lancamentos: lancamentos.map((l) => ({
        plantioId: l.plantio_id,
        data: l.data,
        tipo: l.tipo,
        laminaMm: l.lamina_mm,
      })),
    };

    return { tipo: "ok", dados };
  } catch (erro) {
    console.error("[TERA] Erro ao carregar dados do banco:", erro);
    const detalhe =
      process.env.NODE_ENV !== "production" && erro instanceof Error ? ` Detalhe: ${erro.message}` : "";
    return {
      tipo: "erro",
      mensagem:
        "Não foi possível ler os dados do banco. Confira as chaves SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY " +
        "e se o arquivo supabase/schema.sql foi executado." +
        detalhe,
    };
  }
}
