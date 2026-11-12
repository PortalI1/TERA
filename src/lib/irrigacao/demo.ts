import { somarDias } from "./datas";
import { DEMO } from "./demo-definicao";
import type { DadosIrrigacao } from "./tipos";

/** Monta os dados de exemplo para uma data de "hoje". Usado quando o banco não está configurado. */
export function dadosDemo(hoje: string): DadosIrrigacao {
  const propriedadeId = "demo-propriedade";
  const idSolo = (nome: string) => `demo-solo-${nome}`;
  const idCultura = (nome: string) => `demo-cultura-${nome}`;
  const idArea = (nome: string) => `demo-area-${nome}`;
  const idPlantio = (nome: string) => `demo-plantio-${nome}`;

  return {
    origem: "demo",
    hoje,
    propriedades: [{ id: propriedadeId, nome: DEMO.propriedade }],
    solos: DEMO.solos.map((s) => ({ id: idSolo(s.nome), ...s })),
    culturas: DEMO.culturas.map((c) => ({
      id: idCultura(c.nome),
      nome: c.nome,
      fatorP: c.fatorP,
      estagios: c.estagios,
    })),
    areas: DEMO.areas.map((a) => ({
      id: idArea(a.nome),
      propriedadeId,
      soloId: idSolo(a.solo),
      nome: a.nome,
      areaHa: a.areaHa,
      eficiencia: a.eficiencia,
    })),
    plantios: DEMO.areas.map((a) => ({
      id: idPlantio(a.nome),
      areaId: idArea(a.nome),
      culturaId: idCultura(a.cultura),
      nome: a.plantio,
      variedade: null,
      dataPlantio: somarDias(hoje, -a.diasDePlantio),
      dataReferencia: somarDias(hoje, DEMO.diaReferencia),
      deficitReferenciaMm: a.deficitInicialMm,
    })),
    clima: DEMO.clima.map((c) => ({
      propriedadeId,
      data: somarDias(hoje, c.dia),
      etoMm: c.eto,
      chuvaMm: c.chuva,
      probChuvaPct: c.prob,
    })),
    lancamentos: DEMO.lancamentos.map((l) => ({
      plantioId: idPlantio(l.area),
      data: somarDias(hoje, l.dia),
      tipo: l.tipo,
      laminaMm: l.lamina,
    })),
  };
}
