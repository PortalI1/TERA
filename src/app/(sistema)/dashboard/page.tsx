
import {
  Tractor,
  Sprout,
  Droplets,
  CloudRain,
} from "lucide-react";

const indicators = [
  {
    title: "Propriedades",
    value: "08",
    description: "Propriedades cadastradas",
    icon: Tractor,
  },
  {
    title: "Áreas irrigadas",
    value: "24",
    description: "Pivôs e talhões",
    icon: Sprout,
  },
  {
    title: "Área total",
    value: "1.240 ha",
    description: "Área cadastrada",
    icon: Sprout,
  },
  {
    title: "Irrigações previstas",
    value: "12",
    description: "Próximos dias",
    icon: Droplets,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-7">

      <div>
        <h1 className="text-2xl font-bold text-[#153C2B]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Acompanhe a situação geral das suas propriedades.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {item.title}
                </p>

                <div className="rounded-lg bg-green-50 p-2 text-green-700">
                  <Icon size={20} />
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-bold text-[#153C2B]">
                {item.value}
              </h2>

              <p className="mt-2 text-xs text-gray-400">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-[#153C2B]">
            Situação hídrica
          </h3>
          <p className="mt-3 text-sm text-gray-500">
            Acompanhamento do déficit hídrico das áreas cadastradas.
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <CloudRain className="text-blue-600" size={25} />
            <h3 className="font-semibold text-[#153C2B]">
              Meteorologia
            </h3>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Acompanhamento das condições meteorológicas.
          </p>
        </div>

      </div>
    </div>
  );
}
