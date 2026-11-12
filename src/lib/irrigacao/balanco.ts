import { diferencaDias, somarDias } from "./datas";
import type {
  Cultura,
  DataISO,
  DiaClima,
  Lancamento,
  Plantio,
  Solo,
} from "./tipos";

/**
 * Balanço hídrico diário do solo, no método da FAO-56:
 *
 *   déficit do dia = déficit do dia anterior + ETc − chuva efetiva − irrigação
 *   ETc            = Kc da cultura × ETo do dia
 *   TAW            = água disponível do solo (mm/cm) × profundidade da raiz (cm)
 *   RAW            = TAW × fator p da cultura  (limite para começar a irrigar)
 *
 * O déficit nunca fica abaixo de zero (solo na capacidade de campo).
 */

/** Dias de previsão mostrados depois de hoje. */
export const DIAS_PREVISAO = 6;

/** Chuva abaixo disso (mm) é considerada sem efeito: molha a folha, não o solo. */
export const CHUVA_MINIMA_EFETIVA_MM = 2;

export type DiaBalanco = {
  data: DataISO;
  previsao: boolean;
  /** Não havia dado de clima cadastrado para este dia. */
  semClima: boolean;
  kc: number;
  raizCm: number;
  estagio: string;
  etcMm: number;
  chuvaEfetivaMm: number;
  irrigacaoMm: number;
  /** Água que entrou no solo no dia (chuva efetiva + irrigação). */
  entradaAguaMm: number;
  deficitMm: number;
  tawMm: number;
  rawMm: number;
};

export type ResultadoBalanco =
  | { ok: true; dias: DiaBalanco[]; diasSemClima: number }
  | { ok: false; motivo: string };

export type EntradaBalanco = {
  plantio: Plantio;
  cultura: Cultura;
  solo: Solo;
  /** Clima da propriedade onde está o plantio. */
  clima: DiaClima[];
  lancamentos: Lancamento[];
  hoje: DataISO;
  diasPrevisao?: number;
  /** Chuva extra (mm) simulada para amanhã, no "E se chover?". */
  chuvaSimuladaMm?: number;
};

function interpolar(inicio: number, fim: number, fracao: number): number {
  return inicio + (fim - inicio) * fracao;
}

/** Água disponível no solo, em mm por cm de profundidade. */
export function aguaDisponivelMmPorCm(solo: Solo): number {
  return (solo.capacidadeCampo - solo.pontoMurcha) / 10;
}

/** Kc, profundidade de raiz e fase da cultura, para um dia após o plantio. */
export function parametrosNoDia(cultura: Cultura, diasAposPlantio: number) {
  const estagios = cultura.estagios;
  let inicioDoEstagio = 0;

  for (const estagio of estagios) {
    const fimDoEstagio = inicioDoEstagio + estagio.dias;
    if (diasAposPlantio < fimDoEstagio) {
      const fracao =
        estagio.dias > 0
          ? Math.max(0, (diasAposPlantio - inicioDoEstagio) / estagio.dias)
          : 1;
      return {
        kc: interpolar(estagio.kcInicio, estagio.kcFim, fracao),
        raizCm: interpolar(estagio.raizInicioCm, estagio.raizFimCm, fracao),
        estagio: estagio.nome,
      };
    }
    inicioDoEstagio = fimDoEstagio;
  }

  const ultimo = estagios[estagios.length - 1];
  return { kc: ultimo.kcFim, raizCm: ultimo.raizFimCm, estagio: "Ciclo concluído" };
}

export function calcularBalanco(entrada: EntradaBalanco): ResultadoBalanco {
  const { plantio, cultura, solo, hoje } = entrada;

  if (cultura.estagios.length === 0) {
    return { ok: false, motivo: "Cultura sem fases cadastradas" };
  }
  if (plantio.dataReferencia > hoje) {
    return { ok: false, motivo: "Balanço ainda não iniciado" };
  }

  const diasPrevisao = entrada.diasPrevisao ?? DIAS_PREVISAO;
  const chuvaSimuladaMm = Math.max(0, entrada.chuvaSimuladaMm ?? 0);
  const amanha = somarDias(hoje, 1);
  const ultimoDia = somarDias(hoje, diasPrevisao);
  const aguaMmPorCm = aguaDisponivelMmPorCm(solo);

  const climaPorData = new Map(entrada.clima.map((c) => [c.data, c]));
  const chuvaLancada = new Map<string, number>();
  const irrigacaoLancada = new Map<string, number>();
  for (const l of entrada.lancamentos) {
    if (l.plantioId !== plantio.id) continue;
    const destino = l.tipo === "chuva" ? chuvaLancada : irrigacaoLancada;
    destino.set(l.data, (destino.get(l.data) ?? 0) + l.laminaMm);
  }

  const dias: DiaBalanco[] = [];
  let deficit = plantio.deficitReferenciaMm;
  let diasSemClima = 0;
  const totalDias = diferencaDias(plantio.dataReferencia, ultimoDia);

  for (let i = 0; i <= totalDias; i++) {
    const data = somarDias(plantio.dataReferencia, i);
    const previsao = data > hoje;
    const clima = climaPorData.get(data);
    const fase = parametrosNoDia(cultura, diferencaDias(plantio.dataPlantio, data));

    const etcMm = fase.kc * (clima?.etoMm ?? 0);

    // Chuva medida no talhão tem prioridade sobre a da estação/previsão.
    const chuvaBrutaMm = chuvaLancada.get(data) ?? clima?.chuvaMm ?? 0;
    let chuvaEfetivaMm = chuvaBrutaMm >= CHUVA_MINIMA_EFETIVA_MM ? chuvaBrutaMm : 0;
    if (data === amanha) chuvaEfetivaMm += chuvaSimuladaMm;

    // Na previsão, não se conta irrigação: o objetivo é mostrar se vai precisar.
    const irrigacaoMm = previsao ? 0 : (irrigacaoLancada.get(data) ?? 0);

    deficit = Math.max(0, deficit + etcMm - chuvaEfetivaMm - irrigacaoMm);

    const tawMm = aguaMmPorCm * fase.raizCm;
    if (!clima && !previsao) diasSemClima++;

    dias.push({
      data,
      previsao,
      semClima: !clima,
      kc: fase.kc,
      raizCm: fase.raizCm,
      estagio: fase.estagio,
      etcMm,
      chuvaEfetivaMm,
      irrigacaoMm,
      entradaAguaMm: chuvaEfetivaMm + irrigacaoMm,
      deficitMm: deficit,
      tawMm,
      rawMm: tawMm * cultura.fatorP,
    });
  }

  return { ok: true, dias, diasSemClima };
}
