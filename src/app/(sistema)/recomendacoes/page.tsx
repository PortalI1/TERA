"use client";

import { Fragment, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cloud,
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

type Parcel = {
  name: string;
  crop: string;
  property: string;
  initial: number;
  history: number[];
  forecast: number[];
  irrigation: number;
  lastUpdate: string;
};

const dates = ["07/11", "08/11", "09/11", "10/11", "11/11", "12/11", "13/11", "14/11", "15/11", "16/11"];

// Dados demonstrativos para desenvolvimento do front-end.
const parcels: Parcel[] = [
  { name: "Pivô 01 - Gleba 01", crop: "Soja 2026/27", property: "Fazenda Modelo", initial: 16, history: [3, 0, 0], forecast: [4.61, 6.79, 8.89, 10.92, 12.88, 14.77], irrigation: 0, lastUpdate: "07/11" },
  { name: "Pivô 01 - Gleba 02", crop: "Milho Semente Bayer (970165M4V2726)", property: "Fazenda Modelo", initial: 16, history: [3, 0, 0], forecast: [5.87, 8.73, 11.55, 14.31, 17.02, 19.67], irrigation: 0, lastUpdate: "07/11" },
  { name: "Pivô 01 - Gleba 03", crop: "Milho Semente Bayer (970165M4V2726)", property: "Fazenda Modelo", initial: 16, history: [3, 0, 0], forecast: [5.79, 8.66, 11.47, 14.24, 16.95, 19.60], irrigation: 0, lastUpdate: "07/11" },
  { name: "Pivô 02 - Gleba 05", crop: "Milho Semente Bayer (970165M4V2725)", property: "Fazenda Modelo", initial: 16, history: [3, 0, 0], forecast: [5.91, 8.79, 11.62, 14.40, 17.12, 19.79], irrigation: 0, lastUpdate: "07/11" },
  { name: "Pivô 02 - Gleba 06", crop: "Feijão 2026/26", property: "Fazenda Modelo", initial: 16, history: [3, 0, 0], forecast: [5.90, 8.76, 11.56, 14.29, 16.35, 18.26], irrigation: 0, lastUpdate: "07/11" },
  { name: "Pivô 03 - Gleba 04", crop: "Feijão 2026/26", property: "Fazenda Modelo", initial: 16, history: [3, 0, 0], forecast: [5.88, 8.74, 11.53, 14.26, 16.92, 19.50], irrigation: 0, lastUpdate: "07/11" },
  { name: "Pivô 05", crop: "Feijão 2026/26", property: "Fazenda Modelo", initial: 16, history: [3, 0, 0], forecast: [5.97, 8.87, 11.70, 14.47, 17.17, 19.80], irrigation: 0, lastUpdate: "07/11" },
  { name: "Pivô 06", crop: "Milho Semente Bayer (970127M4V2724)", property: "Fazenda Modelo", initial: 16, history: [0, 0, 0], forecast: [6.01, 8.94, 11.81, 14.64, 17.41, 20.12], irrigation: 0, lastUpdate: "07/11" },
  { name: "Pivô 08", crop: "Soja 2026/27", property: "Fazenda Modelo", initial: 16, history: [0, 0, 0], forecast: [4.53, 6.68, 8.76, 10.78, 12.73, 14.61], irrigation: 0, lastUpdate: "07/11" },
  { name: "Pivô 09", crop: "Soja 2026/27", property: "Fazenda Modelo", initial: 16, history: [0, 0, 0], forecast: [4.70, 6.93, 9.08, 11.15, 13.15, 15.08], irrigation: 0, lastUpdate: "07/11" },
  { name: "Pivô 10", crop: "Soja 2026/27", property: "Fazenda Modelo", initial: 16, history: [0, 0, 0], forecast: [4.20, 6.22, 8.20, 10.12, 12.00, 13.83], irrigation: 0, lastUpdate: "07/11" },
  { name: "Pivô 12", crop: "Milho Semente Bayer (970165M4V2725)", property: "Fazenda Modelo", initial: 36, history: [0, 0, 0], forecast: [5.93, 8.83, 11.67, 14.46, 17.20, 19.88], irrigation: 0, lastUpdate: "07/11" },
  { name: "Pivô Pista", crop: "Milho Semente Bayer (959608M4V2744)", property: "Fazenda Modelo", initial: 36, history: [0, 0, 7.72], forecast: [5.50, 8.23, 10.95, 13.65, 16.34, 19.01], irrigation: 7.72, lastUpdate: "07/11" },
  { name: "Pivô Represa", crop: "Soja 2026/27", property: "Fazenda Modelo", initial: 36, history: [0, 0, 2.65], forecast: [5.24, 7.71, 10.08, 12.36, 14.55, 16.65], irrigation: 2.65, lastUpdate: "07/11" },
];

const weather = [
  { label: "0,00 mm | 0%", Icon: Cloud },
  { label: "1,00 mm | 35%", Icon: CloudSun },
  { label: "6,00 mm | 90%", Icon: CloudRain },
  { label: "1,00 mm | 75%", Icon: CloudDrizzle },
  { label: "4,00 mm | 35%", Icon: Sun },
  { label: "6,00 mm | 75%", Icon: CloudRain },
  { label: "3,00 mm | 90%", Icon: CloudDrizzle },
];

const formatMM = (value: number) => value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function valueColor(value: number) {
  if (value < 5) return "bg-emerald-500 text-white";
  if (value < 9) return "bg-lime-500 text-white";
  if (value < 12) return "bg-yellow-400 text-zinc-950";
  if (value < 17) return "bg-orange-500 text-white";
  return "bg-red-600 text-white";
}

export default function RecomendacoesPage() {
  const [activeTab, setActiveTab] = useState("irrigar");
  const [rain, setRain] = useState("10");
  const [simulated, setSimulated] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [week, setWeek] = useState(0);
  const [property, setProperty] = useState("Todas");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const visibleParcels = useMemo(() => parcels.filter((p) => property === "Todas" || p.property === property), [property]);
  const tableData = useMemo(() => visibleParcels.map((parcel) => {
    const historical = [parcel.initial, parcel.history[0], parcel.history[1]];
    const forecast = parcel.forecast.map((value) => simulated ? Math.max(0, value - Math.max(0, Number(rain) || 0)) : value);
    return { ...parcel, historical, currentValue: parcel.history[2], forecastValues: forecast };
  }), [visibleParcels, rain, simulated]);

  const shiftedDates = dates.map((date, index) => {
    if (week === 0) return date;
    const [day, month] = date.split("/").map(Number);
    const shifted = new Date(2026, month - 1, day + week * 7);
    return `${String(shifted.getDate()).padStart(2, "0")}/${String(shifted.getMonth() + 1).padStart(2, "0")}`;
  });

  const resetSimulation = () => { setRain("10"); setSimulated(false); setShowSimulation(false); };

  return (
    <main className="-mx-3 -my-4 min-h-[calc(100vh-5rem)] overflow-hidden bg-[#1f1e27] text-[#f4f3f7] sm:-mx-5 sm:-my-5">
      <div className="min-h-full px-3 pb-5 pt-3 sm:px-5">
        {/* Cabeçalho da página */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#373641] pb-3">
          <div className="flex items-center gap-2 text-xs text-[#aaa9b8]">
            <span className="text-emerald-500">⌂</span><ChevronRight size={13} />
            <span className="text-white">Preciso irrigar?</span><ChevronRight size={13} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Laranja II</span>
            <button aria-label="Imprimir" className="text-[#d5d4df] hover:text-white"><Printer size={18} /></button>
            <button aria-label="Filtros" onClick={() => setShowFilters(!showFilters)} className={`hover:text-white ${showFilters ? "text-emerald-400" : "text-[#d5d4df]"}`}><Filter size={18} /></button>
            <button aria-label="Configurações" className="text-[#d5d4df] hover:text-white"><Settings size={18} /></button>
            <button aria-label="Fechar" className="rounded-full border border-[#858391] p-1 text-[#d5d4df] hover:bg-white/10"><X size={15} /></button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-3 flex flex-wrap items-center gap-3 rounded-md border border-[#454451] bg-[#292833] px-4 py-3">
            <label className="text-xs text-[#b8b7c4]">Propriedade</label>
            <select value={property} onChange={(e) => setProperty(e.target.value)} className="rounded border border-[#555361] bg-[#1f1e27] px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500">
              <option value="Todas">Todas as propriedades</option>
              <option value="Fazenda Modelo">Fazenda Modelo</option>
            </select>
            <span className="text-[11px] text-[#888795]">Filtro demonstrativo</span>
          </div>
        )}

        {/* Abas */}
        <nav className="mb-2 flex items-center gap-4 overflow-x-auto" aria-label="Seções de recomendação">
          {[{ id: "irrigar", label: "Preciso irrigar?" }, { id: "analisar", label: "Analisar" }, { id: "planejar", label: "Planejar" }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`min-w-[114px] border-b-[4px] px-3 pb-2 pt-1 text-xs font-semibold transition ${activeTab === tab.id ? "border-[#19a83b] text-white" : "border-transparent text-[#b2b0bd] hover:text-white"}`}>
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "irrigar" && (
          <>
            {/* Previsão meteorológica e controle de simulação */}
            <div className="grid grid-cols-[minmax(300px,42%),repeat(7,minmax(76px,1fr)),minmax(100px,0.8fr)] items-end gap-1 border-b border-[#3b3945] pb-2">
              <div className="hidden sm:block" />
              {weather.map(({ label, Icon }, i) => (
                <div key={i} className="flex min-w-0 flex-col items-center justify-end gap-1 text-center text-[10px] font-medium text-[#aaa8b8]">
                  <Icon size={22} strokeWidth={1.4} className={i === 2 || i === 5 ? "text-sky-300" : "text-[#d6d5df]"} />
                  <span className="whitespace-nowrap">{label}</span>
                </div>
              ))}
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
                <label htmlFor="rain-mm" className="text-xs text-[#c6c4d0]">Chuva simulada (mm)</label>
                <input id="rain-mm" type="number" min="0" step="0.1" value={rain} onChange={(e) => setRain(e.target.value)} className="w-24 rounded border border-[#555361] bg-[#1d1c25] px-2 py-1 text-xs text-white outline-none focus:border-sky-400" />
                <button onClick={() => setSimulated(true)} className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500">Aplicar simulação</button>
                <button onClick={resetSimulation} className="rounded border border-[#5b5966] px-3 py-1.5 text-xs text-[#d0ced8] hover:bg-white/5">Limpar</button>
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
                  {Array.from({ length: 6 }).map((_, i) => <col key={i} style={{ width: "6.5%" }} />)}
                  <col style={{ width: "4%" }} />
                </colgroup>
                <thead>
                  <tr className="h-7 bg-[#34333b] text-[10px] font-semibold text-white">
                    <th colSpan={2} className="border-r border-[#46444e]" />
                    <th colSpan={3} className="border-r border-[#46444e] text-center">Entrada de água</th>
                    <th className="bg-[#2c2b34]" />
                    <th colSpan={6} className="text-center">Simulação para os próximos dias</th>
                    <th />
                  </tr>
                  <tr className="h-[52px] border-b border-[#44424c] text-[11px] font-semibold text-[#e6e5eb]">
                    <th className="px-2 text-left"> </th>
                    <th className="text-center text-[10px] text-[#c3c1cc]">Última atualização</th>
                    {shiftedDates.slice(0, 3).map((date) => <th key={date} className="text-center">{date}</th>)}
                    <th className="bg-[#302f38] px-1 text-center">
                      <div className="flex items-center justify-center gap-1"><button onClick={() => setWeek(week - 1)} aria-label="Semana anterior" className="hover:text-emerald-300"><ChevronLeft size={17} /></button><span className="whitespace-nowrap">{shiftedDates[3]}</span><button onClick={() => setWeek(week + 1)} aria-label="Próxima semana" className="hover:text-emerald-300"><ChevronRight size={17} /></button></div>
                    </th>
                    {shiftedDates.slice(4).map((date) => <th key={date} className="text-center">{date}</th>)}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((parcel) => (
                    <Fragment key={parcel.name}>
                      <tr className="h-[54px] border-b border-[#373640] text-[11px] hover:bg-white/[0.035]">
                        <td className="truncate px-2 font-medium text-white" title={`${parcel.name} - ${parcel.crop}`}>
                          {parcel.name} - {parcel.crop}
                        </td>
                        <td className="text-center"><CheckCircle2 size={15} className="mx-auto text-green-500" /></td>
                        {parcel.historical.map((value, i) => (
                          <td key={i} className="text-center text-[10px] text-[#b9b7d0]">
                            <span className="block">{formatMM(value)}</span><span className="text-[9px] text-[#777584]">mm</span>
                          </td>
                        ))}
                        <td className="bg-[#302f38] text-center">
                          <span className={`mx-auto flex h-[39px] w-[39px] flex-col items-center justify-center rounded-[9px] text-[10px] font-bold leading-tight ${valueColor(parcel.currentValue)}`}><span>{formatMM(parcel.currentValue)}</span><span>mm</span></span>
                        </td>
                        {parcel.forecastValues.map((value, i) => (
                          <td key={i} className={`text-center ${simulated ? "bg-sky-950/10" : ""}`}>
                            <span className={`mx-auto flex h-[39px] w-[39px] flex-col items-center justify-center rounded-[9px] text-[10px] font-bold leading-tight ${valueColor(value)}`}><span>{formatMM(value)}</span><span>mm</span></span>
                          </td>
                        ))}
                        <td className="text-center">
                          <button onClick={() => setExpanded(expanded === parcel.name ? null : parcel.name)} aria-label={`Detalhes de ${parcel.name}`} aria-expanded={expanded === parcel.name} className="rounded-full text-white hover:text-emerald-300"><ChevronDown size={16} className={`fill-white text-[#24232b] transition-transform ${expanded === parcel.name ? "rotate-180" : ""}`} /></button>
                        </td>
                      </tr>
                      {expanded === parcel.name && (
                        <tr className="border-b border-[#45434e] bg-[#292832]">
                          <td colSpan={13} className="px-4 py-3">
                            <div className="grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-4">
                              <div><span className="block text-[#8e8c9a]">Cultura</span><strong className="text-white">{parcel.crop}</strong></div>
                              <div><span className="block text-[#8e8c9a]">Propriedade</span><strong className="text-white">{parcel.property}</strong></div>
                              <div><span className="block text-[#8e8c9a]">Irrigação lançada</span><strong className="text-white">{formatMM(parcel.irrigation)} mm</strong></div>
                              <div><span className="block text-[#8e8c9a]">Última atualização</span><strong className="text-white">{parcel.lastUpdate}</strong></div>
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
              <span>{tableData.length} talhões exibidos</span>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-emerald-500" /> Baixa</span>
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-lime-500" /> Moderada</span>
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-yellow-400" /> Atenção</span>
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-orange-500" /> Alta</span>
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-red-600" /> Muito alta</span>
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
      </div>
    </main>
  );
}
