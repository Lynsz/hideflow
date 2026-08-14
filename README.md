# HireFlow

Plataforma Full Stack para organizar candidaturas, acompanhar processos seletivos e transformar a busca por emprego em um fluxo claro e mensurável.

> Status: **Etapa 2 implementada no código — banco e autenticação Supabase.** Para usar o fluxo real, ainda é necessário criar/conectar um projeto Supabase, aplicar as migrations e preencher o `.env.local`.

## Stack

- Next.js 16 com App Router, Server Components e Server Actions
- React 19 e TypeScript em modo estrito
- Tailwind CSS 4
- Supabase PostgreSQL, Auth, SSR e Row Level Security
- Zod e React Hook Form
- Vitest, ESLint e Prettier

## Funcionalidades atuais

- Landing page responsiva em `/`
- Cadastro real com nome em `user_metadata.full_name`
- Login e logout com mensagens amigáveis
- Sessão SSR persistida em cookies pelo `@supabase/ssr`
- Callback PKCE em `/auth/callback`
- Proteção server-side do dashboard
- Redirect de usuários autenticados para `/dashboard`
- Profile criado automaticamente por trigger após o cadastro
- Dashboard com identidade real e cards ainda mockados
- Schema versionado com sete tabelas, RLS, índices e constraints
- Loading, error boundary, 404 e navegação responsiva

## Requisitos

- Node.js 22 ou superior
- npm 10 ou superior
- Projeto Supabase
- Docker Desktop somente para executar a stack Supabase local

## Instalação

```bash
git clone <url-do-repositorio>
cd HireFlow
npm install
cp .env.example .env.local
npm run dev
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

## Configuração do Supabase

### Variáveis de ambiente

Preencha o `.env.local` com dados públicos do diálogo **Connect** do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` deve receber uma chave permitida para clientes: a chave `anon` legada ou a publishable key atual. O nome foi mantido conforme a especificação do projeto. Nunca utilize `service_role` ou uma secret key em variáveis `NEXT_PUBLIC_*`.

### Aplicar migrations em um projeto remoto

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npm run db:push
```

O `db:push` aplica os arquivos de `supabase/migrations` e registra o histórico. Não é necessário copiar SQL para o Dashboard.

### Ambiente local

Com Docker Desktop em execução:

```bash
npm run db:start
npm run db:reset
npm run db:lint
```

Use os valores retornados por `npx supabase status` no `.env.local`.

### Tipos TypeScript

O tipo central está em `src/types/database.ts`. Para regenerá-lo a partir da stack local:

```bash
npm run db:types
```

Para gerar a partir de um projeto remoto sem alterar o script:

```powershell
$env:SUPABASE_PROJECT_ID="seu-project-ref"
npm run db:types
```

## Configuração no Supabase Dashboard

Em **Authentication > URL Configuration**, configure:

- Site URL local: `http://localhost:3000`
- Redirect URL local: `http://localhost:3000/auth/callback`
- Site URL de produção: a URL da Vercel
- Redirect URL de produção: `https://seu-dominio/auth/callback`

Se a confirmação de e-mail estiver habilitada, o cadastro exibe uma instrução para conferir a caixa de entrada. Se estiver desabilitada, a sessão é criada imediatamente e o usuário segue para o dashboard.

## Fluxo de autenticação

1. O formulário é validado no navegador com React Hook Form + Zod.
2. A Server Action valida novamente os dados.
3. O Supabase Auth cria ou autentica o usuário.
4. No cadastro, o nome é enviado em `full_name` nos metadados.
5. O trigger `private.handle_new_user()` cria o registro em `profiles`.
6. O `proxy.ts` renova tokens e sincroniza cookies antes das rotas protegidas.
7. O layout do dashboard valida claims novamente no servidor e carrega o profile.
8. O logout encerra a sessão local e redireciona para `/login`.

## Arquitetura do banco

| Tabela                | Responsabilidade                                          |
| --------------------- | --------------------------------------------------------- |
| `profiles`            | Dados públicos mínimos do usuário autenticado             |
| `companies`           | Empresas pertencentes ao usuário                          |
| `applications`        | Candidaturas e estágio do processo                        |
| `contacts`            | Contatos vinculados a empresas                            |
| `interviews`          | Entrevistas vinculadas a candidaturas                     |
| `application_history` | Histórico de mudanças de status                           |
| `documents`           | Metadados de documentos; Storage será implementado depois |

Todas as chaves são UUID. FKs compostas com `user_id` impedem que registros de um usuário sejam relacionados aos de outro usuário. Exclusões de usuário propagam por `ON DELETE CASCADE`; exclusões de candidaturas também removem seus registros dependentes. Empresas com candidaturas não podem ser removidas antes de desvincular ou tratar essas candidaturas.

### Status de candidatura

`application_status` é um ENUM PostgreSQL compartilhado entre candidaturas e histórico:

```text
saved, applied, screening, hr_interview, technical_interview,
technical_challenge, final_interview, offer, hired, rejected, withdrawn
```

O ENUM foi escolhido porque o domínio é fechado, reutilizado e central para a aplicação. Modalidade e tipo de contrato usam `CHECK`, pois são atributos auxiliares que podem evoluir com mais frequência.

## Row Level Security

RLS nasce habilitado nas sete tabelas.

- `profiles`: somente `SELECT` e `UPDATE` do próprio `id`.
- Demais tabelas: `SELECT`, `INSERT`, `UPDATE` e `DELETE` somente quando `user_id = (select auth.uid())`.
- Updates possuem `USING` e `WITH CHECK`.
- Inserts não aceitam `user_id` de terceiros.
- FKs compostas reforçam a propriedade também nos relacionamentos.
- `anon` não recebe privilégios sobre as tabelas privadas.
- A função privilegiada de criação de profile fica no schema não exposto `private`, usa `search_path = ''` e não pode ser executada diretamente pelos clientes.

Metadados editáveis do usuário são usados apenas para o nome de exibição, nunca para autorização.

## Comandos

| Comando                | Finalidade                                |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Inicia o Next.js em desenvolvimento       |
| `npm run build`        | Gera o build de produção                  |
| `npm run start`        | Executa o build de produção               |
| `npm run lint`         | Executa ESLint                            |
| `npm run typecheck`    | Valida TypeScript                         |
| `npm test`             | Executa os testes com Vitest              |
| `npm run format:check` | Verifica formatação                       |
| `npm run db:start`     | Inicia Supabase local                     |
| `npm run db:reset`     | Recria o banco local aplicando migrations |
| `npm run db:lint`      | Analisa o banco local                     |
| `npm run db:push`      | Aplica migrations ao projeto vinculado    |
| `npm run db:types`     | Regenera os tipos do banco                |

## Estrutura principal

```text
supabase/
├── config.toml
└── migrations/

src/
├── app/
│   ├── (auth)/
│   ├── auth/callback/
│   └── dashboard/
├── components/
├── features/
│   ├── auth/
│   └── dashboard/
├── lib/supabase/
└── types/database.ts
```

## Testes

Os testes unitários cobrem:

- normalização e validação dos schemas de login/cadastro;
- requisitos e confirmação de senha;
- tradução segura de erros de autenticação;
- bloqueio de open redirects.

Os testes de RLS devem ser executados contra a stack local ou projeto de desenvolvimento após a migration ser aplicada, preferencialmente com dois usuários distintos.

## Roadmap

- [x] **Etapa 1:** bootstrap, arquitetura e UI base
- [x] **Etapa 2:** migrations, RLS e autenticação SSR
- [ ] **Etapa 3:** CRUD de empresas e candidaturas
- [ ] **Etapa 4:** Kanban, contatos e entrevistas
- [ ] **Etapa 5:** documentos, histórico e analytics
- [ ] **Etapa 6:** suíte E2E, observabilidade e deploy final

## Licença

Projeto criado para fins de estudo e portfólio. A definição de licença poderá ser adicionada antes da publicação.
