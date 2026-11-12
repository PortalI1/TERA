// Acesso ao banco de dados (Supabase) pelo servidor do Next.js.
//
// Este arquivo só deve ser usado em código de servidor (páginas sem "use client").
// As chaves vêm de variáveis de ambiente SEM o prefixo NEXT_PUBLIC_, então o Next.js
// não as envia para o navegador. Veja o README para configurar.

/** Verdadeiro quando as duas variáveis de ambiente do banco estão preenchidas. */
export function bancoConfigurado(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Lê linhas de uma tabela pela API REST do Supabase (PostgREST).
 * Exemplo: consultar<{ id: string }>("propriedades?select=id&order=nome")
 */
export async function consultar<T>(caminho: string): Promise<T[]> {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) {
    throw new Error("Banco não configurado: faltam SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  }

  const resposta = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/${caminho}`, {
    headers: {
      apikey: chave,
      Authorization: `Bearer ${chave}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!resposta.ok) {
    const tabela = caminho.split("?")[0];
    const detalhe = (await resposta.text()).slice(0, 300);
    throw new Error(`Falha ao ler "${tabela}" (HTTP ${resposta.status}): ${detalhe}`);
  }

  return (await resposta.json()) as T[];
}
