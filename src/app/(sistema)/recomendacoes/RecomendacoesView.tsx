"use client";

import { Fragment, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CloudDrizzle,
  CloudRain,
  CloudSun,
  Filter,
  Printer,
  Settings,
  Sun,
  X,
  CheckCircle2,
} from "lucide-react";
import { DIAS_PREVISAO } from "@/lib/irrigacao/balanco";
import { formatarDiaMes, somarDias } from "@/lib/irrigacao/datas";
import { montarLinhas, type Celula } from "@/lib/irrigacao/linhas";
import type { ResultadoCarga } from "@/lib/irrigacao/tipos";

const formatMM = (value: number) =>
  value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// A cor mostra quanto do limite de irrigação (RAW) o déficit já consumiu.
function corDaCelula(razao: number | null) {
  if (razao === null) return "bg-[#46444e] text-[#c3c1cc]";
  if (razao < 0.25) return "bg-emerald-500 text-white";
  if (razao < 0.5) return "bg-lime-500 text-white";
  if (razao < 0.75) return "bg-yellow-400 text-zinc-950";
  if (razao < 1) return "bg-orange-500 text-white";
  return "bg-red-600 text-white";
}

function iconeDoTempo(chuvaMm: number, probabilidade: number | null) {
  if (chuvaMm >= 5) return CloudRain;
  if (chuvaMm >= 1) return CloudDrizzle;
  if ((probabilidade ?? 0) >= 30) return CloudSun;
  return Sun;
}

function CelulaMm({ celula }: { celula: Celula }) {
  return (
    <span
      className={`mx-auto flex h-[39px] w-[39px] flex-col items-center justify-center rounded-[9px] text-[10px] font-bold leading-tight ${corDaCelula(celula.razao)}`}
    >
      {celula.valorMm === null ? (
        <span>–</span>
      ) : (
        <>
          <span>{formatMM(celula.valorMm)}</span>
          <span>mm</span>
        </>
      )}
    </span>
  );
}

function quandoIrrigar(diasAteLimite: number | null, dataLimite: string | null) {
  if (diasAteLimite === null || dataLimite === null) return `Não atinge o limite em ${DIAS_PREVISAO} dias`;
  if (diasAteLimite === 0) return "Hoje";
  return `${formatarDiaMes(dataLimite)} (em ${diasAteLimite} ${diasAteLimite === 1 ? "dia" : "dias"})`;
}

export default function RecomendacoesView({ resultado }: { resultado: ResultadoCarga }) {
  const [activeTab, setActiveTab] = useState("irrigar");
  const [rain, setRain] = useState("10");
  const [simulated, setSimulated] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [propriedadeEscolhida, setPropriedadeEscolhida] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const dados = resultado.tipo === "ok" ? resultado.dados : null;
  const propriedadeId = propriedadeEscolhida ?? dados?.propriedades[0]?.id ?? null;
  const propriedade = dados?.propriedades.find((p) => p.id === propriedadeId) ?? null;
  const chuvaSimulada = simulated ? Math.max(0, Number(rain) || 0) : 0;

  const linhas = useMemo(
    () => (dados && propriedadeId ? montarLinhas(dados, propriedadeId, chuvaSimulada) : []),
    [dados, propriedadeId, chuvaSimulada],
  );

  const resetSimulation = () => {
    setRain("10");
    setSimulated(false);
    setShowSimulation(false);
  };

  const hoje = dados?.hoje ?? "";
  const datasHistorico = dados ? [-3, -2, -1].map((n) => somarDias(hoje, n)) : [];
  const datasPrevisao = dados ? Array.from({ length: DIAS_PREVISAO }, (_, i) => somarDias(hoje, i + 1)) : [];

  // Previsão do tempo da propriedade escolhida: hoje e os próximos 6 dias.
  const tempo = dados
    ? [0, ...datasPrevisao.map((_, i) => i + 1)].map((n) => {
        const data = somarDias(hoje, n);
        return dados.clima.find((c) => c.propriedadeId === propriedadeId && c.data === data) ?? null;
      })
    : [];

  const ultimaDataClima = dados
    ? dados.clima
        .filter((c) => c.propriedadeId === propriedadeId && c.data <= hoje)
        .reduce<string | null>((maior, c) => (maior === null || c.data > maior ? c.data : maior), null)
    : null;
  const climaEmDia = ultimaDataClima !== null && ultimaDataClima >= somarDias(hoje, -1);

  const noLimiteHoje = linhas.filter((l) => l.diasAteLimite === 0).length;
  const noLimiteEmBreve = linhas.filter((l) => l.diasAteLimite !== null && l.diasAteLimite > 0).length;

  return (
    <main className="-mx-3 -my-4 min-h-[calc(100vh-5rem)] overflow-hidden bg-[#1f1e27] text-[#f4f3f7] sm:-mx-5 sm:-my-5">
      <div className="min-h-full px-3 pb-5 pt-3 sm:px-5">
        {/* Cabeçalho da página */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#373641] pb-3">
          <div className="flex items-center gap-2 text-xs text-[#aaa9b8]">
            <span className="text-emerald-500">⌂</span>
            <ChevronRight size={13} />
            <span className="text-white">Preciso irrigar?</span>
            <ChevronRight size={13} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{propriedade?.nome ?? ""}</span>
            <button aria-label="Imprimir" className="text-[#d5d4df] hover:text-white">
              <Printer size={18} />
            </button>
            <button
              aria-label="Filtros"
              onClick={() => setShowFilters(!showFilters)}
              className={`hover:text-white ${showFilters ? "text-emerald-400" : "text-[#d5d4df]"}`}
            >
              <Filter size={18} />
            </button>
            <button aria-label="Configurações" className="text-[#d5d4df] hover:text-white">
              <Settings size={18} />
            </button>
            <button aria-label="Fechar" className="rounded-full border border-[#858391] p-1 text-[#d5d4df] hover:bg-white/10">
              <X size={15} />
            </button>
          </div>
        </div>

        {dados?.origem === "demo" && (
          <div className="mb-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
            Modo demonstração: os dados abaixo são de exemplo. Conecte o banco de dados (passo a passo no README) para usar os dados reais da fazenda.
          </div>
        )}

        {resultado.tipo === "erro" && (
          <div role="alert" className="mt-4 rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {resultado.mensagem}
          </div>
        )}

        {dados && dados.propriedades.length === 0 && (
          <div className="mt-4 rounded-md border border-[#454451] bg-[#292833] px-4 py-3 text-sm text-[#c6c4d0]">
            O banco está conectado, mas ainda não há nenhuma propriedade cadastrada. Cadastre os dados pela tabela
            de propriedades no Supabase ou rode o arquivo supabase/seed.sql para carregar um exemplo.
          </div>
        )}

        {dados && propriedadeId && (
          <>
            {showFilters && (
              <div className="mb-3 flex flex-wrap items-center gap-3 rounded-md border border-[#454451] bg-[#292833] px-4 py-3">
                <label htmlFor="filtro-propriedade" className="text-xs text-[#b8b7c4]">
                  Propriedade
                </label>
                <select
                  id="filtro-propriedade"
                  value={propriedadeId}
                  onChange={(e) => {
                    setPropriedadeEscolhida(e.target.value);
                    setExpanded(null);
                  }}
                  className="rounded border border-[#555361] bg-[#1f1e27] px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                >
                  {dados.propriedades.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Abas */}
            <nav className="mb-2 flex items-center gap-4 overflow-x-auto" aria-label="Seções de recomendação">
              {[
                { id: "irrigar", label: "Preciso irrigar?" },
                { id: "analisar", label: "Analisar" },
                { id: "planejar", label: "Planejar" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-w-[114px] border-b-[4px] px-3 pb-2 pt-1 text-xs font-semibold transition ${activeTab === tab.id ? "border-[#19a83b] text-white" : "border-transparent text-[#b2b0bd] hover:text-white"}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {activeTab === "irrigar" && (
              <>
                {/* Resumo */}
                <p className="mb-2 text-xs text-[#b9b7c4]">
                  {noLimiteHoje > 0 ? (
                    <strong className="text-red-300">
                      {noLimiteHoje} {noLimiteHoje === 1 ? "área já atingiu" : "áreas já atingiram"} o limite de irrigação hoje.
                    </strong>
                  ) : (
                    <span>Nenhuma área atingiu o limite de irrigação hoje.</span>
                  )}{" "}
                  {noLimiteEmBreve > 0 && (
                    <span>
                      Mais {noLimiteEmBreve} {noLimiteEmBreve === 1 ? "área atinge" : "áreas atingem"} nos próximos {DIAS_PREVISAO} dias, se não chover nem irrigar.
                    </span>
                  )}
                </p>

                {/* Previsão meteorológica e controle de simulação */}
                <div className="grid grid-cols-[minmax(300px,42%),repeat(7,minmax(76px,1fr)),minmax(100px,0.8fr)] items-end gap-1 border-b border-[#3b3945] pb-2">
                  <div className="hidden sm:block" />
                  {tempo.map((dia, i) => {
                    const Icon = iconeDoTempo(dia?.chuvaMm ?? 0, dia?.probChuvaPct ?? null);
                    return (
                      <div key={i} className="flex min-w-0 flex-col items-center justify-end gap-1 text-center text-[10px] font-medium text-[#aaa8b8]">
                        <Icon size={22} strokeWidth={1.4} className={(dia?.chuvaMm ?? 0) >= 5 ? "text-sky-300" : "text-[#d6d5df]"} />
                        <span className="whitespace-nowrap">
                          {dia
                            ? `${formatMM(dia.chuvaMm)} mm${dia.probChuvaPct === null ? "" : ` | ${dia.probChuvaPct}%`}`
                            : "sem previsão"}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex flex-col items-center justify-end gap-1 pb-0.5 text-[10px] text-[#b9b7c4]">
                    <span className="font-semibold">E se Chover?</span>
                    <button onClick={() => setShowSimulation(!showSimulation)} className="flex items-center gap-2" aria-pressed={simulated}>
                      <span>Simular</span>
                      <span className={`relative h-[19px] w-[43px] rounded-full border border-[#777582] transition ${simulated ? "bg-emerald-600" : "bg-[#777681]"}`}>
                        <span className={`absolute top-[2px] h-[13px] w-[13px] rounded-full bg-white transition-all ${simulated ? "left-[25px]" : "left-[3px]"}`} />
                        <span className={`absolute right-[4px] top-[1px] text-[10px] ${simulated ? "text-white/50" : "text-white"}`}>×</span>
                      </span>
                    </button>
                  </div>
                </div>

                {showSimulation && (
                  <div className="my-2 flex flex-wrap items-center gap-3 rounded-md border border-[#484653] bg-[#292833] px-3 py-2">
                    <CloudRain size={17} className="text-sky-300" />
                    <label htmlFor="rain-mm" className="text-xs text-[#c6c4d0]">
                      Chuva simulada amanhã (mm)
                    </label>
                    <input
                      id="rain-mm"
                      type="number"
                      min="0"
                      step="0.1"
                      value={rain}
                      onChange={(e) => setRain(e.target.value)}
                      className="w-24 rounded border border-[#555361] bg-[#1d1c25] px-2 py-1 text-xs text-white outline-none focus:border-sky-400"
                    />
                    <button onClick={() => setSimulated(true)} className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500">
                      Aplicar simulação
                    </button>
                    <button onClick={resetSimulation} className="rounded border border-[#5b5966] px-3 py-1.5 text-xs text-[#d0ced8] hover:bg-white/5">
                      Limpar
                    </button>
                    {simulated && <span className="text-[11px] text-emerald-300">Simulação aplicada aos valores previstos</span>}
                  </div>
                )}

                {/* Tabela principal */}
                <div className="mt-1 overflow-x-auto">
                  <table className="w-full min-w-[1250px] table-fixed border-collapse text-left">
                    <colgroup>
                      <col style={{ width: "24%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "4%" }} />
                      <col style={{ width: "4%" }} />
                      <col style={{ width: "4%" }} />
                      <col style={{ width: "5%" }} />
                      {Array.from({ length: DIAS_PREVISAO }).map((_, i) => (
                        <col key={i} style={{ width: "6.5%" }} />
                      ))}
                      <col style={{ width: "4%" }} />
                    </colgroup>
                    <thead>
                      <tr className="h-7 bg-[#34333b] text-[10px] font-semibold text-white">
                        <th colSpan={2} className="border-r border-[#46444e]" />
                        <th colSpan={3} className="border-r border-[#46444e] text-center">Entrada de água</th>
                        <th className="bg-[#2c2b34]" />
                        <th colSpan={DIAS_PREVISAO} className="text-center">Déficit previsto para os próximos dias</th>
                        <th />
                      </tr>
                      <tr className="h-[52px] border-b border-[#44424c] text-[11px] font-semibold text-[#e6e5eb]">
                        <th className="px-2 text-left"> </th>
                        <th className="text-center text-[10px] text-[#c3c1cc]">Clima atualizado</th>
                        {datasHistorico.map((data) => (
                          <th key={data} className="text-center">{formatarDiaMes(data)}</th>
                        ))}
                        <th className="bg-[#302f38] px-1 text-center">
                          <span className="block whitespace-nowrap">{formatarDiaMes(hoje)}</span>
                          <span className="block text-[9px] font-normal text-[#9c9aa8]">hoje</span>
                        </th>
                        {datasPrevisao.map((data) => (
                          <th key={data} className="text-center">{formatarDiaMes(data)}</th>
                        ))}
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {linhas.map((linha) => (
                        <Fragment key={linha.chave}>
                          <tr className="h-[54px] border-b border-[#373640] text-[11px] hover:bg-white/[0.035]">
                            <td className="truncate px-2 font-medium text-white" title={`${linha.area} - ${linha.cultura}`}>
                              {linha.area}
                              {linha.cultura ? ` - ${linha.cultura}` : ""}
                            </td>
                            <td className="text-center">
                              {climaEmDia && linha.diasSemClima === 0 ? (
                                <CheckCircle2 size={15} className="mx-auto text-green-500" aria-label="Clima em dia" />
                              ) : (
                                <span
                                  className="mx-auto flex h-[15px] w-[15px] items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950"
                                  title={
                                    ultimaDataClima
                                      ? `Último clima cadastrado: ${formatarDiaMes(ultimaDataClima)}. Dias sem clima no balanço: ${linha.diasSemClima}.`
                                      : "Nenhum clima cadastrado para esta propriedade."
                                  }
                                  aria-label="Clima desatualizado"
                                >
                                  !
                                </span>
                              )}
                            </td>
                            {linha.erro ? (
                              <td colSpan={DIAS_PREVISAO + 4} className="px-2 text-[11px] text-amber-300">
                                {linha.erro}
                              </td>
                            ) : (
                              <>
                                {linha.entradas.map((valor, i) => (
                                  <td key={i} className="text-center text-[10px] text-[#b9b7d0]">
                                    <span className="block">{valor === null ? "–" : formatMM(valor)}</span>
                                    <span className="text-[9px] text-[#777584]">mm</span>
                                  </td>
                                ))}
                                <td className="bg-[#302f38] text-center">
                                  <CelulaMm celula={linha.atual} />
                                </td>
                                {linha.previsao.map((celula, i) => (
                                  <td key={i} className={`text-center ${simulated ? "bg-sky-950/10" : ""}`}>
                                    <CelulaMm celula={celula} />
                                  </td>
                                ))}
                              </>
                            )}
                            <td className="text-center">
                              <button
                                onClick={() => setExpanded(expanded === linha.chave ? null : linha.chave)}
                                aria-label={`Detalhes de ${linha.area}`}
                                aria-expanded={expanded === linha.chave}
                                className="rounded-full text-white hover:text-emerald-300"
                              >
                                <ChevronDown size={16} className={`fill-white text-[#24232b] transition-transform ${expanded === linha.chave ? "rotate-180" : ""}`} />
                              </button>
                            </td>
                          </tr>
                          {expanded === linha.chave && (
                            <tr className="border-b border-[#45434e] bg-[#292832]">
                              <td colSpan={DIAS_PREVISAO + 7} className="px-4 py-3">
                                <div className="grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-4">
                                  <div>
                                    <span className="block text-[#8e8c9a]">Plantio</span>
                                    <strong className="text-white">{linha.cultura || "—"}</strong>
                                  </div>
                                  <div>
                                    <span className="block text-[#8e8c9a]">Fase da cultura</span>
                                    <strong className="text-white">{linha.estagio ?? "—"}</strong>
                                  </div>
                                  <div>
                                    <span className="block text-[#8e8c9a]">Área</span>
                                    <strong className="text-white">{linha.areaHa === null ? "—" : `${linha.areaHa.toLocaleString("pt-BR")} ha`}</strong>
                                  </div>
                                  <div>
                                    <span className="block text-[#8e8c9a]">Déficit hoje</span>
                                    <strong className="text-white">{linha.atual.valorMm === null ? "—" : `${formatMM(linha.atual.valorMm)} mm`}</strong>
                                  </div>
                                  <div>
                                    <span className="block text-[#8e8c9a]">Limite para irrigar</span>
                                    <strong className="text-white">{linha.limiteMm === null ? "—" : `${formatMM(linha.limiteMm)} mm`}</strong>
                                  </div>
                                  <div>
                                    <span className="block text-[#8e8c9a]">Lâmina sugerida hoje</span>
                                    <strong className="text-white">
                                      {linha.laminaSugeridaMm === null ? "—" : `${formatMM(linha.laminaSugeridaMm)} mm`}
                                    </strong>
                                    <span className="block text-[10px] text-[#777584]">já considera a eficiência de {Math.round(linha.eficiencia * 100)}%</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="block text-[#8e8c9a]">Quando irrigar</span>
                                    <strong className="text-white">
                                      {linha.erro ? "—" : quandoIrrigar(linha.diasAteLimite, linha.dataLimite)}
                                    </strong>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#393842] px-1 pt-3 text-[10px] text-[#92909f]">
                  <span>{linhas.length} áreas exibidas</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[#777584]">Déficit em relação ao limite de irrigação:</span>
                    <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-emerald-500" /> até 25%</span>
                    <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-lime-500" /> até 50%</span>
                    <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-yellow-400" /> até 75%</span>
                    <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-orange-500" /> até 100%</span>
                    <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-red-600" /> limite atingido</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === "analisar" && (
              <section className="mt-5 rounded-md border border-[#3d3b46] bg-[#292832] p-6">
                <h2 className="text-base font-semibold text-white">Análise hídrica</h2>
                <p className="mt-2 text-sm text-[#aaa8b6]">Área visual reservada para análise detalhada da necessidade de irrigação por talhão.</p>
              </section>
            )}
            {activeTab === "planejar" && (
              <section className="mt-5 rounded-md border border-[#3d3b46] bg-[#292832] p-6">
                <h2 className="text-base font-semibold text-white">Planejamento de irrigação</h2>
                <p className="mt-2 text-sm text-[#aaa8b6]">Área visual reservada para programação e organização das irrigações.</p>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
