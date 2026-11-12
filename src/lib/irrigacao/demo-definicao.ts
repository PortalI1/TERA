// Dados de exemplo do TERA.
//
// Este arquivo é a única fonte dos dados de exemplo: a tela usa estes dados quando o banco
// ainda não foi configurado, e o arquivo supabase/seed.sql foi gerado a partir dele.
// Todas as datas são relativas a hoje: 0 = hoje, -1 = ontem, 1 = amanhã.
// Os números (áreas, solos, déficits) são inventados, só para demonstrar a tela.

export type DemoEstagio = {
  nome: string;
  dias: number;
  kcInicio: number;
  kcFim: number;
  raizInicioCm: number;
  raizFimCm: number;
};

export type DemoCultura = { nome: string; fatorP: number; estagios: DemoEstagio[] };
export type DemoSolo = { nome: string; capacidadeCampo: number; pontoMurcha: number };

export type DemoArea = {
  nome: string;
  areaHa: number;
  solo: string;
  eficiencia: number;
  cultura: string;
  plantio: string;
  /** Dias desde o plantio, hoje. */
  diasDePlantio: number;
  /** Déficit de água (mm) no dia de referência. */
  deficitInicialMm: number;
};

export type DemoClima = { dia: number; eto: number; chuva: number; prob: number };
export type DemoLancamento = {
  area: string;
  dia: number;
  tipo: "irrigacao" | "chuva";
  lamina: number;
};

export type Demo = {
  propriedade: string;
  /** Dia (relativo a hoje) em que o balanço de cada plantio começa. */
  diaReferencia: number;
  solos: DemoSolo[];
  culturas: DemoCultura[];
  areas: DemoArea[];
  clima: DemoClima[];
  lancamentos: DemoLancamento[];
};

// Valores de Kc e fator p conforme o boletim FAO-56 (referência de partida;
// vale conferir com o agrônomo da fazenda e ajustar para a região e a variedade).
export const DEMO: Demo = {
  propriedade: "Fazenda Modelo",
  diaReferencia: -3,
  solos: [
    { nome: "Argiloso", capacidadeCampo: 38, pontoMurcha: 20 },
    { nome: "Textura média", capacidadeCampo: 28, pontoMurcha: 14 },
    { nome: "Arenoso", capacidadeCampo: 18, pontoMurcha: 8 },
  ],
  culturas: [
    {
      nome: "Soja",
      fatorP: 0.5,
      estagios: [
        { nome: "Inicial", dias: 20, kcInicio: 0.4, kcFim: 0.4, raizInicioCm: 10, raizFimCm: 15 },
        { nome: "Desenvolvimento", dias: 30, kcInicio: 0.4, kcFim: 1.15, raizInicioCm: 15, raizFimCm: 60 },
        { nome: "Intermediário", dias: 60, kcInicio: 1.15, kcFim: 1.15, raizInicioCm: 60, raizFimCm: 60 },
        { nome: "Final", dias: 25, kcInicio: 1.15, kcFim: 0.5, raizInicioCm: 60, raizFimCm: 60 },
      ],
    },
    {
      nome: "Milho semente",
      fatorP: 0.55,
      estagios: [
        { nome: "Inicial", dias: 20, kcInicio: 0.3, kcFim: 0.3, raizInicioCm: 10, raizFimCm: 15 },
        { nome: "Desenvolvimento", dias: 35, kcInicio: 0.3, kcFim: 1.2, raizInicioCm: 15, raizFimCm: 80 },
        { nome: "Intermediário", dias: 40, kcInicio: 1.2, kcFim: 1.2, raizInicioCm: 80, raizFimCm: 80 },
        { nome: "Final", dias: 30, kcInicio: 1.2, kcFim: 0.35, raizInicioCm: 80, raizFimCm: 80 },
      ],
    },
    {
      nome: "Feijão",
      fatorP: 0.45,
      estagios: [
        { nome: "Inicial", dias: 20, kcInicio: 0.4, kcFim: 0.4, raizInicioCm: 10, raizFimCm: 15 },
        { nome: "Desenvolvimento", dias: 30, kcInicio: 0.4, kcFim: 1.15, raizInicioCm: 15, raizFimCm: 50 },
        { nome: "Intermediário", dias: 40, kcInicio: 1.15, kcFim: 1.15, raizInicioCm: 50, raizFimCm: 50 },
        { nome: "Final", dias: 20, kcInicio: 1.15, kcFim: 0.35, raizInicioCm: 50, raizFimCm: 50 },
      ],
    },
  ],
  areas: [
    { nome: "Pivô 01 - Gleba 01", areaHa: 52, solo: "Argiloso", eficiencia: 0.85, cultura: "Soja", plantio: "Soja 2026/27", diasDePlantio: 30, deficitInicialMm: 10 },
    { nome: "Pivô 01 - Gleba 02", areaHa: 48, solo: "Argiloso", eficiencia: 0.85, cultura: "Milho semente", plantio: "Milho Semente Bayer (970165M4V2726)", diasDePlantio: 42, deficitInicialMm: 12 },
    { nome: "Pivô 01 - Gleba 03", areaHa: 50, solo: "Argiloso", eficiencia: 0.85, cultura: "Milho semente", plantio: "Milho Semente Bayer (970165M4V2726)", diasDePlantio: 42, deficitInicialMm: 12 },
    { nome: "Pivô 02 - Gleba 05", areaHa: 61, solo: "Textura média", eficiencia: 0.85, cultura: "Milho semente", plantio: "Milho Semente Bayer (970165M4V2725)", diasDePlantio: 40, deficitInicialMm: 14 },
    { nome: "Pivô 02 - Gleba 06", areaHa: 45, solo: "Textura média", eficiencia: 0.85, cultura: "Feijão", plantio: "Feijão 2026/27", diasDePlantio: 28, deficitInicialMm: 9 },
    { nome: "Pivô 03 - Gleba 04", areaHa: 47, solo: "Textura média", eficiencia: 0.85, cultura: "Feijão", plantio: "Feijão 2026/27", diasDePlantio: 28, deficitInicialMm: 9 },
    { nome: "Pivô 05", areaHa: 58, solo: "Arenoso", eficiencia: 0.85, cultura: "Feijão", plantio: "Feijão 2026/27", diasDePlantio: 25, deficitInicialMm: 8 },
    { nome: "Pivô 06", areaHa: 72, solo: "Argiloso", eficiencia: 0.85, cultura: "Milho semente", plantio: "Milho Semente Bayer (970127M4V2724)", diasDePlantio: 45, deficitInicialMm: 16 },
    { nome: "Pivô 08", areaHa: 66, solo: "Textura média", eficiencia: 0.85, cultura: "Soja", plantio: "Soja 2026/27", diasDePlantio: 32, deficitInicialMm: 11 },
    { nome: "Pivô 09", areaHa: 69, solo: "Textura média", eficiencia: 0.85, cultura: "Soja", plantio: "Soja 2026/27", diasDePlantio: 32, deficitInicialMm: 12 },
    { nome: "Pivô 10", areaHa: 64, solo: "Argiloso", eficiencia: 0.85, cultura: "Soja", plantio: "Soja 2026/27", diasDePlantio: 27, deficitInicialMm: 8 },
    { nome: "Pivô 12", areaHa: 55, solo: "Textura média", eficiencia: 0.85, cultura: "Milho semente", plantio: "Milho Semente Bayer (970165M4V2725)", diasDePlantio: 38, deficitInicialMm: 20 },
    { nome: "Pivô Pista", areaHa: 40, solo: "Arenoso", eficiencia: 0.85, cultura: "Milho semente", plantio: "Milho Semente Bayer (959608M4V2744)", diasDePlantio: 36, deficitInicialMm: 22 },
    { nome: "Pivô Represa", areaHa: 36, solo: "Arenoso", eficiencia: 0.85, cultura: "Soja", plantio: "Soja 2026/27", diasDePlantio: 30, deficitInicialMm: 18 },
  ],
  clima: [
    { dia: -10, eto: 5.1, chuva: 0, prob: 0 },
    { dia: -9, eto: 5.3, chuva: 0, prob: 0 },
    { dia: -8, eto: 4.9, chuva: 12.4, prob: 90 },
    { dia: -7, eto: 3.6, chuva: 0, prob: 20 },
    { dia: -6, eto: 4.8, chuva: 0, prob: 0 },
    { dia: -5, eto: 5.4, chuva: 0, prob: 0 },
    { dia: -4, eto: 5.6, chuva: 0, prob: 0 },
    { dia: -3, eto: 5.2, chuva: 3, prob: 60 },
    { dia: -2, eto: 5.5, chuva: 0, prob: 0 },
    { dia: -1, eto: 5.3, chuva: 0, prob: 0 },
    { dia: 0, eto: 5.2, chuva: 0, prob: 0 },
    { dia: 1, eto: 5.4, chuva: 1, prob: 35 },
    { dia: 2, eto: 4.0, chuva: 6, prob: 90 },
    { dia: 3, eto: 4.6, chuva: 1, prob: 75 },
    { dia: 4, eto: 5.5, chuva: 4, prob: 35 },
    { dia: 5, eto: 3.9, chuva: 6, prob: 75 },
    { dia: 6, eto: 4.3, chuva: 3, prob: 90 },
  ],
  lancamentos: [
    { area: "Pivô Pista", dia: -1, tipo: "irrigacao", lamina: 7.72 },
    { area: "Pivô Represa", dia: -1, tipo: "irrigacao", lamina: 2.65 },
  ],
};
