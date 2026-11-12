import type { DataISO } from "./tipos";

function partes(data: DataISO): [number, number, number] {
  const [ano, mes, dia] = data.split("-").map(Number);
  return [ano, mes, dia];
}

/** Soma (ou subtrai, com valor negativo) dias a uma data "AAAA-MM-DD". */
export function somarDias(data: DataISO, dias: number): DataISO {
  const [ano, mes, dia] = partes(data);
  return new Date(Date.UTC(ano, mes - 1, dia + dias)).toISOString().slice(0, 10);
}

/** Quantos dias vão de `a` até `b` (positivo quando `b` é depois de `a`). */
export function diferencaDias(a: DataISO, b: DataISO): number {
  const [anoA, mesA, diaA] = partes(a);
  const [anoB, mesB, diaB] = partes(b);
  const ms = Date.UTC(anoB, mesB - 1, diaB) - Date.UTC(anoA, mesA - 1, diaA);
  return Math.round(ms / 86400000);
}

/** "2026-11-11" vira "11/11". */
export function formatarDiaMes(data: DataISO): string {
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}

/** A data de hoje no horário de Brasília, independente do fuso do servidor. */
export function hojeNoBrasil(): DataISO {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
