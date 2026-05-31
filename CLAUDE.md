# Axion Cycle — App Clientes

## Branch de produção

**Sempre desenvolver no branch:** `claude/wonderful-clarke-nc5UI`

Este branch está conectado ao ambiente de **Production** no Vercel.
Não desenvolver em branches separados sem depois fazer merge para este branch.

## Stack

- Next.js 14 App Router
- Supabase (projeto `kfcsguazzgfgnumxklty`)
- Tailwind CSS
- TypeScript

## Estrutura

- `/src/app/` — rotas Next.js
- `/src/app/clientes/` — módulo CRM (funil, tags, clientes, follow-ups)
- `/src/app/financeiro/` — wrapper do módulo Financeiro (iframe)
- `/src/components/` — componentes compartilhados
- `/src/lib/` — supabase client, types

## Módulo Financeiro

O Financeiro é um SPA HTML hospedado em `https://financeiro-ten-kappa.vercel.app`.
Ele é embutido via iframe em `/financeiro` usando um Next.js rewrite (`/financeiro-app` → Financeiro).
O arquivo fonte fica em `axioncycle/Financeiro` (repo separado).

## Vercel

- Production URL: branch `claude/wonderful-clarke-nc5UI` → deploy automático
- Não usar URLs de preview (hash na URL) para testar funcionalidades finais

## Comandos úteis

```bash
npm run dev      # dev local
npm run build    # verificar build antes de push
npm run lint     # checar erros TypeScript/ESLint
```
