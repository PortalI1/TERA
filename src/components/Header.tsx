
import { Bell, Search, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">
      <div>
        <h2 className="text-lg font-semibold text-[#153C2B]">
          Bem-vindo ao TERA
        </h2>
        <p className="text-sm text-gray-500">
          Gestão inteligente de irrigação
        </p>
      </div>

      <div className="flex items-center gap-5">
        <button className="text-gray-500">
          <Search size={20} />
        </button>

        <button className="relative text-gray-500">
          <Bell size={20} />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-semibold text-[#153C2B]">
          W
        </div>

        <ChevronDown size={16} />
      </div>
    </header>
  );
}
