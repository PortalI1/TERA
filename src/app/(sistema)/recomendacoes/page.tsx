import { carregarDados } from "@/lib/irrigacao/dados";
import RecomendacoesView from "./RecomendacoesView";

// Os dados mudam todo dia (clima, lançamentos), então a página nunca fica em cache.
export const dynamic = "force-dynamic";

export default async function RecomendacoesPage() {
  const resultado = await carregarDados();
  return <RecomendacoesView resultado={resultado} />;
}
