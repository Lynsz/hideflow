# HireFlow

Plataforma Full Stack para organizar candidaturas, acompanhar processos seletivos e transformar a busca por emprego em um fluxo claro e mensurável.

> Status: **Etapa 1 concluída — bootstrap e fundação da interface.** Os dados do dashboard são demonstrativos; banco e autenticação serão implementados na Etapa 2.

## Objetivo

O HireFlow é um projeto de portfólio com padrão de produção. A aplicação será evoluída para reunir candidaturas, empresas, contatos, entrevistas, documentos, histórico e analytics, mantendo os dados de cada pessoa isolados por autenticação e Row Level Security.

## Stack

- Next.js 16 com App Router e Server Components por padrão
- React 19 e TypeScript em modo estrito
- Tailwind CSS 4
- Supabase (`@supabase/supabase-js` + `@supabase/ssr`)
- Zod e React Hook Form
- ESLint 9 e Prettier 3
- Lucide React para ícones

## O que existe nesta etapa

- Landing page responsiva em `/`
- Estruturas de acesso em `/login` e `/cadastro`
- Validação local e acessível dos formulários com Zod + React Hook Form
- Dashboard em `/dashboard` com dados mockados, indicadores e funil
- Sidebar para desktop e navegação adaptada para dispositivos móveis
- Clientes Supabase separados para browser e servidor
- Validação centralizada das variáveis de ambiente
- Estados de loading, erro e página 404
- Headers HTTP básicos de segurança
- Alias de importação `@/*`
- Configurações de lint, formatação, typecheck e build

## Funcionalidades planejadas

- Autenticação completa e recuperação de senha
- CRUD de candidaturas, empresas, contatos e entrevistas
- Kanban com movimentação entre etapas
- Upload privado de documentos no Supabase Storage
- Histórico automático de alterações
- Dashboard e analytics baseados em dados reais
- Testes unitários, de integração e E2E

## Requisitos

- Node.js 22 ou superior
- npm 10 ou superior
- Um projeto Supabase (necessário a partir da integração da Etapa 2)

## Instalação

```bash
git clone <url-do-repositorio>
cd HireFlow
npm install
cp .env.example .env.local
npm run dev
```

No Windows PowerShell, copie o arquivo de ambiente com:

```powershell
Copy-Item .env.example .env.local
```

A aplicação ficará disponível em `http://localhost:3000`.

## Variáveis de ambiente

Preencha o `.env.local` com os valores encontrados no diálogo **Connect** do projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

A publishable key pode ser exposta ao navegador e será protegida pelas policies de RLS. Nunca adicione uma secret key ou `service_role` a uma variável `NEXT_PUBLIC_*`.

## Comandos

| Comando                | Finalidade                                 |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Inicia o ambiente de desenvolvimento       |
| `npm run build`        | Gera o build de produção                   |
| `npm run start`        | Executa o build de produção                |
| `npm run lint`         | Analisa o código com ESLint                |
| `npm run typecheck`    | Valida os tipos sem gerar arquivos         |
| `npm run format`       | Formata os arquivos com Prettier           |
| `npm run format:check` | Verifica a formatação sem alterar arquivos |

## Estrutura básica

```text
src/
├── app/                     # Rotas, layouts e estados do App Router
│   ├── (auth)/              # Login e cadastro
│   ├── (marketing)/         # Landing page
│   └── dashboard/           # Área privada (mock na Etapa 1)
├── components/
│   ├── brand/               # Identidade visual
│   ├── layout/              # Navegação e shells de página
│   └── ui/                  # Componentes reutilizáveis
├── features/
│   ├── auth/                # Formulários e schemas de autenticação
│   └── dashboard/           # Tipos, serviços e componentes do dashboard
├── lib/
│   └── supabase/            # Clientes e validação de ambiente
└── types/                   # Tipos compartilhados
```

## Segurança

Nenhum segredo é incluído no repositório. Arquivos `.env*` são ignorados, com exceção do `.env.example`, que contém somente os nomes das variáveis.

O isolamento de dados não será delegado ao front-end. Na Etapa 2, todas as tabelas privadas terão RLS habilitado e policies de `SELECT`, `INSERT`, `UPDATE` e `DELETE` baseadas em `(select auth.uid()) = user_id`. Updates terão `USING` e `WITH CHECK`.

## Deploy na Vercel

O projeto usa apenas recursos compatíveis com a Vercel. Para publicar:

1. Importe o repositório na Vercel.
2. Cadastre as variáveis do `.env.example` no projeto.
3. Use o comando de build padrão `npm run build`.
4. Configure as URLs de redirecionamento no Supabase Auth quando a autenticação for adicionada.

## Roadmap

- [x] **Etapa 1:** bootstrap, arquitetura inicial, UI base e integração preparada
- [ ] **Etapa 2:** banco de dados + autenticação com Supabase
- [ ] **Etapa 3:** CRUD de candidaturas e empresas
- [ ] **Etapa 4:** Kanban, contatos e entrevistas
- [ ] **Etapa 5:** documentos, histórico e analytics
- [ ] **Etapa 6:** suíte de testes, observabilidade e deploy final

## Licença

Projeto criado para fins de estudo e portfólio. A definição de licença poderá ser adicionada antes da publicação.
