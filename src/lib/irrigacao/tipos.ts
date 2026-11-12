// Tipos usados pelo cálculo de irrigação e pela tela "Preciso irrigar?".
// Datas sempre no formato texto "AAAA-MM-DD" (ex.: "2026-11-11").

export type DataISO = string;

export type Propriedade = {
  id: string;
  nome: string;
};

/** Capacidade de campo e ponto de murcha em % de volume (ex.: 38 = 38%). */
export type Solo = {
  id: string;
  nome: string;
  capacidadeCampo: number;
  pontoMurcha: number;
};

/** Uma fase do ciclo da cultura, com Kc e profundidade de raiz no início e no fim da fase. */
export type Estagio = {
  nome: string;
  dias: number;
  kcInicio: number;
  kcFim: number;
  raizInicioCm: number;
  raizFimCm: number;
};

export type Cultura = {
  id: string;
  nome: string;
  /** Fração da água disponível que a planta pode usar sem sofrer estresse (0 a 1). */
  fatorP: number;
  estagios: Estagio[];
};

/** Pivô ou talhão irrigado. */
export type AreaIrrigada = {
  id: string;
  propriedadeId: string;
  soloId: string;
  nome: string;
  areaHa: number | null;
  /** Eficiência do sistema de irrigação (0 a 1). */
  eficiencia: number;
};

export type Plantio = {
  id: string;
  areaId: string;
  culturaId: string;
  nome: string;
  variedade: string | null;
  dataPlantio: DataISO;
  /** Dia em que o balanço começa a ser contado. */
  dataReferencia: DataISO;
  /** Déficit de água no solo (mm) no início da data de referência. */
  deficitReferenciaMm: number;
};

export type DiaClima = {
  propriedadeId: string;
  data: DataISO;
  /** Evapotranspiração de referência (mm/dia). */
  etoMm: number;
  chuvaMm: number;
  probChuvaPct: number | null;
};

export type Lancamento = {
  plantioId: string;
  data: DataISO;
  tipo: "irrigacao" | "chuva";
  laminaMm: number;
};

export type DadosIrrigacao = {
  origem: "banco" | "demo";
  hoje: DataISO;
  propriedades: Propriedade[];
  solos: Solo[];
  culturas: Cultura[];
  areas: AreaIrrigada[];
  plantios: Plantio[];
  clima: DiaClima[];
  lancamentos: Lancamento[];
};

export type ResultadoCarga =
  | { tipo: "ok"; dados: DadosIrrigacao }
  | { tipo: "erro"; mensagem: string };
