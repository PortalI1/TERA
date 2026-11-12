
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Droplets,
  ChartNoAxesCombined,
  CalendarDays,
  ClipboardList,
  CloudSun,
  Tractor,
  Map,
  Sprout,
  Layers,
  Calculator,
  FileChartColumn,
  Settings,
} from "lucide-react";

const menuGroups = [
  {
    title: "PRINCIPAL",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Preciso irrigar?", href: "/recomendacoes", icon: Droplets },
      { name: "Analisar", href: "/analisar", icon: ChartNoAxesCombined },
      { name: "Planejar", href: "/planejar", icon: CalendarDays },
      { name: "Lançamentos", href: "/lancamentos", icon: ClipboardList },
    ],
  },
  {
    title: "GESTÃO AGRÍCOLA",
    items: [
      { name: "Meteorologia", href: "/meteorologia", icon: CloudSun },
      { name: "Propriedades", href: "/propriedades", icon: Tractor },
      { name: "Pivôs e talhões", href: "/pivos", icon: Map },
      { name: "Culturas e safras", href: "/culturas", icon: Sprout },
      { name: "Cadastro de solos", href: "/solos", icon: Layers },
      {
        name: "Parâmetros agronômicos",
        href: "/parametros-agronomicos",
        icon: Calculator,
      },
    ],
  },
  {
    title: "SISTEMA",
    items: [
      { name: "Relatórios", href: "/relatorios", icon: FileChartColumn },
      { name: "Configurações", href: "/configuracoes", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#153C2B] text-white">

      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Sprout size={25} />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-wide">TERA</h1>
          <p className="text-[9px] tracking-widest text-green-200">
            GESTÃO DE IRRIGAÇÃO
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-3 px-3 text-[10px] font-semibold tracking-widest text-green-200/60">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href + "/"));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-white/15 font-semibold text-white shadow-sm"
                        : "text-green-50/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 font-semibold">
            W
          </div>

          <div>
            <p className="text-sm font-medium">Administrador</p>
            <p className="text-xs text-green-200/60">
              Conta principal
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
