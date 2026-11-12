
import { Construction } from "lucide-react";

interface ModulePageProps {
  title: string;
  description: string;
}

export default function ModulePage({
  title,
  description,
}: ModulePageProps) {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-[#153C2B]">
          {title}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">

        <div className="rounded-2xl bg-green-50 p-5 text-green-700">
          <Construction size={35} strokeWidth={1.5} />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-[#153C2B]">
          Estamos preparando este módulo
        </h2>

        <p className="mt-2 max-w-md text-sm text-gray-500">
          Esta área fará parte do sistema TERA.
          Em breve teremos as funcionalidades disponíveis.
        </p>

      </div>
    </div>
  );
}
