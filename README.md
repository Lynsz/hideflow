# HireFlow

Plataforma Full Stack para organizar candidaturas, acompanhar processos seletivos e transformar a busca por emprego em um fluxo claro e mensurável.

> Status: **Etapa 5 implementada no código — contatos, entrevistas e timeline completa, além das etapas anteriores.** Para usar os fluxos reais, ainda é necessário criar/conectar um projeto Supabase HireFlow, aplicar as migrations e preencher o `.env.local`.

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
- CRUD completo de empresas com busca e bloqueio de exclusão quando há candidaturas
- CRUD completo de candidaturas com detalhes, busca, filtros, ordenação e paginação
- Histórico automático e append-only de mudanças de status
- Kanban responsivo com as 11 etapas oficiais, contadores e estados vazios
- Drag-and-drop por ponteiro e teclado, com alternativa acessível por select
- Mudança otimista de status com rollback em falhas e proteção contra conflitos entre abas
- CRUD de contatos com busca, filtros, vínculos com empresas e candidaturas
- CRUD de entrevistas com contatos opcionais, nome manual, agenda e resultados controlados
- Timeline agregada e auditável com criação, mudanças de status e eventos de entrevista
- Busca e filtros combináveis no Kanban, representados na URL
- Dashboard com identidade, métricas e candidaturas recentes reais
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

| Tabela                 | Responsabilidade                                            |
| ---------------------- | ----------------------------------------------------------- |
| `profiles`             | Dados públicos mínimos do usuário autenticado               |
| `companies`            | Empresas pertencentes ao usuário                            |
| `applications`         | Candidaturas e estágio do processo                          |
| `contacts`             | Contatos vinculados a empresas                              |
| `interviews`           | Entrevistas vinculadas a candidaturas                       |
| `application_contacts` | Associação muitos-para-muitos entre candidaturas e contatos |
| `application_history`  | Histórico de mudanças de status                             |
| `interview_events`     | Eventos append-only da evolução das entrevistas             |
| `documents`            | Metadados de documentos; Storage será implementado depois   |

Todas as chaves são UUID. FKs compostas com `user_id` impedem que registros de um usuário sejam relacionados aos de outro usuário. Exclusões de usuário propagam por `ON DELETE CASCADE`; exclusões de candidaturas também removem seus registros dependentes. Empresas com candidaturas não podem ser removidas antes de desvincular ou tratar essas candidaturas.

Contatos permanecem ligados à empresa e podem participar de várias candidaturas por `application_contacts`, evitando duplicação. `interviews.contact_id` é opcional: quando o contato é excluído, somente o vínculo fica nulo e a entrevista permanece. Triggers validam que contato, candidatura e empresa pertencem ao mesmo usuário e à mesma empresa.

### Status de candidatura

`application_status` é um ENUM PostgreSQL compartilhado entre candidaturas e histórico:

```text
saved, applied, screening, hr_interview, technical_interview,
technical_challenge, final_interview, offer, hired, rejected, withdrawn
```

O ENUM foi escolhido porque o domínio é fechado, reutilizado e central para a aplicação. Modalidade e tipo de contrato usam `CHECK`, pois são atributos auxiliares que podem evoluir com mais frequência.

## Etapa 3: empresas e candidaturas

### Empresas

- `/dashboard/empresas`: pesquisa server-side por nome e listagem responsiva.
- `/dashboard/empresas/nova`: cadastro com React Hook Form, Zod e Server Action.
- `/dashboard/empresas/[id]/editar`: edição com ownership verificado no servidor.
- A exclusão consulta candidaturas associadas e é bloqueada quando a empresa está em uso; a FK também usa `ON DELETE RESTRICT`.

### Candidaturas

- `/dashboard/candidaturas`: busca por vaga ou empresa, filtros por status, modalidade, contrato e empresa.
- Ordenação por criação, empresa ou vaga.
- Paginação server-side de 10 registros com filtros representados na URL.
- `/dashboard/candidaturas/nova`: cadastro vinculado a uma empresa do usuário.
- `/dashboard/candidaturas/[id]`: detalhes, mudança de status, histórico e exclusão.
- `/dashboard/candidaturas/[id]/editar`: reutiliza o formulário completo.
- Registros inexistentes ou pertencentes a outra conta retornam o mesmo estado 404.

As leituras acontecem em Server Components por meio de serviços em `features/*/services`. Todas as mutations usam Server Actions, validam novamente com Zod e derivam `user_id` da sessão autenticada — nenhum formulário aceita esse campo.

### Histórico de status

A migration `20260814224241_implement_stage_3_companies_applications.sql` adiciona o trigger `applications_record_status_change`. Um evento é inserido em `application_history` somente quando `old.status IS DISTINCT FROM new.status`. A tabela permanece legível pelo proprietário via RLS, mas inserts, updates e deletes diretos foram revogados dos clientes autenticados.

## Etapa 4: Kanban e pipeline

- `/dashboard/kanban` mantém a página como Server Component para autenticação e leitura inicial; somente o board interativo é Client Component.
- As 11 colunas usam `APPLICATION_STATUSES` e `APPLICATION_STATUS_LABELS`, a mesma fonte central dos formulários e detalhes.
- Os cards exibem vaga, empresa, modalidade, contratação e, quando disponíveis, localização, salário e data da candidatura.
- O board usa scroll horizontal contido, com colunas de largura estável em desktop, tablet e mobile.
- Busca por vaga ou empresa e filtros de modalidade, contrato e empresa funcionam juntos e são refletidos na URL.
- O link `+ Adicionar` reutiliza o formulário existente e apenas pré-seleciona o status da coluna.

### Drag-and-drop e acessibilidade

O projeto usa `@dnd-kit/react` 0.5.0, versão compatível com React 19 e com sensores de ponteiro e teclado. O card possui um puxador dedicado, evitando conflito com o link para detalhes. Cada card também oferece um select “Mover para”, portanto arrastar nunca é a única forma de alterar o status.

### Persistência, histórico e rollback

Kanban e detalhes chamam a mesma Server Action `changeApplicationStatus`. Ela valida a sessão e os status no servidor e atualiza somente a coluna `status`, sempre com `user_id` e o status anterior esperado no filtro. O trigger PostgreSQL cria o histórico na mesma transação da atualização. Drops na coluna atual são ignorados e não chegam ao banco.

A interface move o card imediatamente. Se a mutation falhar, o snapshot anterior do card é restaurado e uma mensagem é exibida. Se outra aba já tiver alterado a candidatura, a comparação com o status anterior impede sobrescrita silenciosa e solicita uma atualização dos dados.

### Estratégia de carregamento

Uma única query traz até 300 candidaturas, ordenadas por `updated_at DESC`, com somente os campos necessários para os cards e o relacionamento mínimo da empresa. Não há uma query por coluna nem carregamento de descrição, observações ou histórico. Acima desse limite, o board informa que está exibindo as 300 candidaturas atualizadas mais recentemente; paginação incremental pode ser avaliada quando houver volume real que justifique a complexidade.

### Migration incremental

Além do histórico, a migration da Etapa 3:

- torna `applications.company_id` obrigatório;
- amplia `employment_type` com `temporary` e `other`;
- adiciona índices compostos/condicionais para ownership, empresa, criação, modalidade, contrato e histórico;
- preserva todas as policies RLS criadas na Etapa 2.

## Etapa 5: contatos, entrevistas e timeline

- `/dashboard/contatos` oferece busca server-side por nome, cargo, email ou empresa e filtros por empresa e tipo.
- Criação e edição reutilizam um formulário React Hook Form + Zod; detalhes expõem email, telefone e LinkedIn com links seguros.
- A edição da empresa lista seus contatos e permite iniciar um cadastro já com a empresa selecionada.
- A candidatura permite associar ou remover contatos da mesma empresa sem duplicar o registro original.
- `/dashboard/entrevistas` separa próximas entrevistas das anteriores e permite criar, editar, excluir e registrar resultados.
- O entrevistador pode ser um contato da empresa da candidatura ou um nome manual. O banco reforça essa consistência além da validação da interface.
- O dashboard mantém “Candidaturas em entrevista” como métrica do pipeline e adiciona “Entrevistas próximas” baseada nos registros reais da agenda.

### Timeline e auditoria

A timeline usa fontes especializadas em vez de uma tabela genérica com JSON: deriva a criação de `applications.created_at`, lê mudanças de status em `application_history` e eventos imutáveis de entrevistas em `interview_events`. O trigger `interviews_record_event` registra criação, reagendamento e transições de resultado sem duplicar o reagendamento quando data e resultado mudam juntos. A UI agrega e ordena tudo do evento mais recente para o mais antigo, com desempate determinístico.

### Tipos, constraints e índices

A migration `20260815224928_implement_stage_5_contacts_interviews_timeline.sql` adiciona:

- tipos controlados de contato, entrevista e resultado por `CHECK`;
- FKs compostas de ownership para `application_contacts`, contatos das entrevistas e eventos;
- índices para filtros de tipo, agenda/resultado, contatos de entrevistas e leitura cronológica da timeline;
- RLS por proprietário nas novas tabelas, eventos somente para leitura e privilégios explícitos para a Data API.

### Datas e timezone

`scheduled_at` continua como `TIMESTAMPTZ`. O `datetime-local` é convertido no navegador para ISO 8601 antes da Server Action; datas armazenadas são exibidas por um Client Component com `Intl.DateTimeFormat("pt-BR")`, usando o timezone local do dispositivo. Nenhum horário formatado é persistido.

## Row Level Security

RLS nasce habilitado em todas as tabelas de dados do usuário.

- `profiles`: somente `SELECT` e `UPDATE` do próprio `id`.
- Demais tabelas: `SELECT`, `INSERT`, `UPDATE` e `DELETE` somente quando `user_id = (select auth.uid())`.
- Updates possuem `USING` e `WITH CHECK`.
- Inserts não aceitam `user_id` de terceiros.
- FKs compostas reforçam a propriedade também nos relacionamentos.
- `anon` não recebe privilégios sobre as tabelas privadas.
- `application_history` e `interview_events` são append-only para clientes; somente triggers internos registram eventos.
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
│   ├── applications/
│   ├── companies/
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
- schemas de empresa e candidatura;
- URLs opcionais, enums e regras salariais;
- normalização segura dos filtros e preservação na paginação;
- labels e formatação crítica de candidaturas.
- agrupamento, busca, filtros, alteração sem efeito no mesmo status e rollback do Kanban.
- schemas de contato e entrevista, incluindo emails, URLs, tipos, resultados e datas.
- agregação e ordenação da timeline, inclusive timestamps iguais e fontes ausentes.

Os testes de RLS devem ser executados contra a stack local ou projeto de desenvolvimento após a migration ser aplicada, preferencialmente com dois usuários distintos.

## Roadmap

- [x] **Etapa 1:** bootstrap, arquitetura e UI base
- [x] **Etapa 2:** migrations, RLS e autenticação SSR
- [x] **Etapa 3:** CRUD de empresas e candidaturas
- [x] **Etapa 4:** Kanban interativo e pipeline de candidaturas
- [x] **Etapa 5:** entrevistas, contatos e timeline completa da candidatura
- [ ] **Etapa 6:** documentos, Supabase Storage e gerenciamento de currículos e arquivos da candidatura

## Licença

Projeto criado para fins de estudo e portfólio. A definição de licença poderá ser adicionada antes da publicação.
