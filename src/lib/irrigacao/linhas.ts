import { calcularBalanco, DIAS_PREVISAO } from "./balanco";
import { somarDias } from "./datas";
import type { DadosIrrigacao, DataISO } from "./tipos";

/** Um valor de déficit (mm) e quanto ele representa do limite de irrigação (1 = no limite). */
export type Celula = { valorMm: number | null; razao: number | null };

/** Uma linha da tabela "Preciso irrigar?": um pivô ou talhão com seu plantio atual. */
export type Linha = {
  chave: string;
  area: string;
  cultura: string;
  areaHa: number | null;
  eficiencia: number;
  /** Mensagem quando não foi possível calcular esta linha. */
  erro: string | null;
  estagio: string | null;
  /** Água que entrou nos 3 dias anteriores a hoje (chuva efetiva + irrigação), em mm. */
  entradas: (number | null)[];
  atual: Celula;
  /** Déficit previsto para cada um dos próximos dias, sem irrigar. */
  previsao: Celula[];
  /** Limite para começar a irrigar (RAW), em mm. */
  limiteMm: number | null;
  /** Lâmina bruta sugerida hoje: déficit atual dividido pela eficiência. */
  laminaSugeridaMm: number | null;
  /** Em quantos dias o déficit chega ao limite (0 = hoje). Nulo se não chega na previsão. */
  diasAteLimite: number | null;
  dataLimite: DataISO | null;
  diasSemClima: number;
};

const CELULA_VAZIA: Celula = { valorMm: null, razao: null };

function linhaComErro(base: Pick<Linha, "chave" | "area" | "cultura" | "areaHa" | "eficiencia">, erro: string): Linha {
  return {
    ...base,
    erro,
    estagio: null,
    entradas: [null, null, null],
    atual: CELULA_VAZIA,
    previsao: Array.from({ length: DIAS_PREVISAO }, () => CELULA_VAZIA),
    limiteMm: null,
    laminaSugeridaMm: null,
    diasAteLimite: null,
    dataLimite: null,
    diasSemClima: 0,
  };
}

/** Calcula as linhas da tabela para uma propriedade. */
export function montarLinhas(
  dados: DadosIrrigacao,
  propriedadeId: string,
  chuvaSimuladaMm: number,
): Linha[] {
  const { hoje } = dados;
  const clima = dados.clima.filter((c) => c.propriedadeId === propriedadeId);
  const areas = dados.areas.filter((a) => a.propriedadeId === propriedadeId);

  return areas.map((area) => {
    // Se houver mais de um plantio ativo na área, vale o plantado mais recentemente.
    const plantio = dados.plantios
      .filter((p) => p.areaId === area.id && p.dataPlantio <= hoje)
      .sort((a, b) => (a.dataPlantio < b.dataPlantio ? 1 : -1))[0];

    const cultura = plantio && dados.culturas.find((c) => c.id === plantio.culturaId);
    const solo = dados.solos.find((s) => s.id === area.soloId);

    const base = {
      chave: area.id,
      area: area.nome,
      cultura: plantio?.nome ?? "",
      areaHa: area.areaHa,
      eficiencia: area.eficiencia,
    };

    if (!plantio) return linhaComErro(base, "Sem plantio ativo nesta área");
    if (!cultura) return linhaComErro(base, "Cultura do plantio não encontrada");
    if (!solo) return linhaComErro(base, "Solo da área não encontrado");

    const resultado = calcularBalanco({
      plantio,
      cultura,
      solo,
      clima,
      lancamentos: dados.lancamentos,
      hoje,
      chuvaSimuladaMm,
    });
    if (!resultado.ok) return linhaComErro(base, resultado.motivo);

    const porData = new Map(resultado.dias.map((d) => [d.data, d]));
    const celula = (data: DataISO): Celula => {
      const dia = porData.get(data);
      if (!dia) return CELULA_VAZIA;
      return {
        valorMm: dia.deficitMm,
        razao: dia.rawMm > 0 ? dia.deficitMm / dia.rawMm : null,
      };
    };

    const diaHoje = porData.get(hoje);
    let diasAteLimite: number | null = null;
    for (let i = 0; i <= DIAS_PREVISAO; i++) {
      const dia = porData.get(somarDias(hoje, i));
      if (dia && dia.rawMm > 0 && dia.deficitMm >= dia.rawMm) {
        diasAteLimite = i;
        break;
      }
    }

    return {
      ...base,
      erro: null,
      estagio: diaHoje?.estagio ?? null,
      entradas: [-3, -2, -1].map((n) => porData.get(somarDias(hoje, n))?.entradaAguaMm ?? null),
      atual: celula(hoje),
      previsao: Array.from({ length: DIAS_PREVISAO }, (_, i) => celula(somarDias(hoje, i + 1))),
      limiteMm: diaHoje?.rawMm ?? null,
      laminaSugeridaMm: diaHoje ? diaHoje.deficitMm / area.eficiencia : null,
      diasAteLimite,
      dataLimite: diasAteLimite === null ? null : somarDias(hoje, diasAteLimite),
      diasSemClima: resultado.diasSemClima,
    };
  });
}
