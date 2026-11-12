# TERA

Sistema de gestão de irrigação.

A tela **Preciso irrigar?** calcula o balanço hídrico de cada pivô/talhão (método FAO-56) e mostra quando o déficit de água chega ao limite de irrigação. Os cálculos ficam em `src/lib/irrigacao/`.

## Dois modos de funcionamento

| Modo | Quando acontece | O que aparece |
|---|---|---|
| **Demonstração** | As chaves do banco não estão configuradas | Dados de exemplo (Fazenda Modelo), com um aviso amarelo no topo da tela |
| **Banco de dados** | `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` preenchidas | Os dados reais da fazenda. Se o banco der erro, a tela mostra o erro e **não** troca por dados de exemplo |

## Rodar no seu computador

Precisa do [Node.js](https://nodejs.org) (versão 20 ou mais nova).

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Sem configurar o banco, a tela abre em modo demonstração.

## Conectar o banco de dados (Supabase)

1. Crie uma conta gratuita em https://supabase.com e clique em **New project**. Guarde a senha do banco.
2. No projeto, abra **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**. Isso cria as tabelas.
3. (Opcional) Para carregar os dados de exemplo no banco, rode também `supabase/seed.sql` do mesmo jeito.
4. Abra **Project Settings → API** e copie:
   - **Project URL**
   - a chave **service_role** (em *Project API keys*)
5. Na raiz do projeto, crie um arquivo chamado `.env.local` com:

   ```
   SUPABASE_URL=cole-aqui-a-Project-URL
   SUPABASE_SERVICE_ROLE_KEY=cole-aqui-a-chave-service_role
   ```

6. Pare o `npm run dev` (Ctrl+C) e rode de novo. O aviso amarelo some e a tela passa a ler do banco.

**Cuidado com a chave `service_role`:** ela dá acesso total ao banco. Nunca a coloque no código, no GitHub nem em variável com prefixo `NEXT_PUBLIC_`. O arquivo `.env.local` já está no `.gitignore`. Ela só é lida no servidor.

## O que cada tabela guarda

| Tabela | Conteúdo |
|---|---|
| `propriedades` | Fazendas |
| `solos` | Capacidade de campo e ponto de murcha (% de volume) |
| `culturas` e `cultura_estagios` | Fator p e as fases do ciclo, com Kc e profundidade de raiz |
| `areas_irrigadas` | Pivôs e talhões: solo, área (ha) e eficiência do sistema |
| `plantios` | O que está plantado em cada área, data de plantio e o ponto de partida do balanço |
| `meteorologia_diaria` | ETo, chuva e probabilidade de chuva por dia (observado e previsto) |
| `lancamentos` | Irrigação feita e chuva medida em cada plantio |

## Como o cálculo funciona

```
ETc            = Kc da cultura × ETo do dia
déficit do dia = déficit de ontem + ETc − chuva efetiva − irrigação   (nunca abaixo de zero)
limite (RAW)   = água disponível do solo × profundidade da raiz × fator p
lâmina sugerida = déficit atual ÷ eficiência do sistema
```

- Kc e profundidade de raiz variam dia a dia dentro de cada fase da cultura.
- Chuva abaixo de 2 mm é ignorada (não chega ao solo).
- Chuva lançada no talhão vale mais que a da previsão.
- A previsão dos próximos dias **não** inclui irrigação: mostra quando vai precisar irrigar se nada for feito.
- A cor de cada célula é o déficit em relação ao limite: verde até 25%, vermelho quando atinge o limite.

Os valores de Kc, raiz e fator p do exemplo seguem a referência da FAO-56 e servem de ponto de partida. Confirme com o agrônomo da fazenda antes de decidir irrigação com base neles.

## Ainda falta

- **Clima automático.** Hoje o clima (`meteorologia_diaria`) é preenchido à mão ou por script. O próximo passo natural é buscar ETo e previsão de chuva de um serviço de meteorologia (por exemplo, Open-Meteo) a cada dia.
- **Telas de cadastro e lançamentos.** Propriedades, pivôs, culturas, solos e lançamentos ainda são editados direto no Supabase. As telas desses módulos estão como "Estamos preparando este módulo".
- **Login de usuários.** Hoje só o servidor acessa o banco. Para vários usuários, é preciso criar login e regras de acesso por usuário.
