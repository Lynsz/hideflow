# HireFlow

Plataforma Full Stack para organizar candidaturas, acompanhar processos seletivos e transformar a busca por emprego em um fluxo claro e mensurável.

> Status: **Etapa 7 implementada no código — Analytics avançado com métricas e gráficos do processo seletivo, além das etapas anteriores.** Para usar os fluxos reais, ainda é necessário criar/conectar um projeto Supabase HireFlow, aplicar as migrations e preencher o `.env.local`.

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
- Upload, listagem, visualização, download, renomeação e exclusão de documentos privados por candidatura
- Busca e filtros combináveis no Kanban, representados na URL
- Dashboard com identidade, métricas e candidaturas recentes reais
- Analytics com período/empresa, KPIs de conversão, funil, tendências, fontes, salários e cobertura dos dados
- Schema versionado com nove tabelas, RLS, índices e constraints
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
SITE_URL=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` deve receber uma chave permitida para clientes: a chave `anon` legada ou a publishable key atual. O nome foi mantido conforme a especificação do projeto. Nunca utilize `service_role` ou uma secret key em variáveis `NEXT_PUBLIC_*`.

`SITE_URL` é server-only e opcional localmente. Em produção, defina a URL canônica HTTPS do projeto. Quando ela não existe, o app usa `VERCEL_PROJECT_PRODUCTION_URL` fornecida pela Vercel e mantém `http://localhost:3000` apenas como fallback local.

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
8. A recuperação de senha usa PKCE: o callback valida o código, cria uma sessão temporária e libera `/redefinir-senha` por dez minutos.
9. O logout comum encerra somente a sessão local; alterações de senha revogam as sessões da conta e exigem um novo login.

## Arquitetura do banco

| Tabela                 | Responsabilidade                                            |
| ---------------------- | ----------------------------------------------------------- |
| `profiles`             | Perfil e preferências privadas do usuário autenticado       |
| `companies`            | Empresas pertencentes ao usuário                            |
| `applications`         | Candidaturas e estágio do processo                          |
| `contacts`             | Contatos vinculados a empresas                              |
| `interviews`           | Entrevistas vinculadas a candidaturas                       |
| `application_contacts` | Associação muitos-para-muitos entre candidaturas e contatos |
| `application_history`  | Histórico de mudanças de status                             |
| `interview_events`     | Eventos append-only da evolução das entrevistas             |
| `documents`            | Metadados dos arquivos privados de cada candidatura         |

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

## Etapa 6: documentos e Supabase Storage

A tela de detalhes da candidatura reúne o envio e o gerenciamento dos seus documentos. São aceitos PDF e DOCX de até 10 MiB, com tipo controlado, nome de exibição opcional e preservação separada do nome original. A validação ocorre novamente no servidor e verifica extensão, MIME, tamanho e assinatura básica do conteúdo antes do upload.

Os objetos ficam no bucket privado `application-documents`, no caminho gerado exclusivamente pelo servidor:

```text
{user_id}/{application_id}/{uuid}-{nome-sanitizado}.{extensão}
```

O navegador nunca envia um caminho de Storage como autoridade. Visualizações e downloads partem do `document_id`; a Server Action consulta os metadados com o `user_id` da sessão e só então cria uma URL assinada válida por 60 segundos. URLs assinadas não são persistidas. A substituição é intencionalmente explícita: exclua o arquivo atual e envie outro, sem `upsert` ou sobrescrita silenciosa.

### Políticas e consistência

- O bucket é privado e limita os mesmos MIME types e tamanho também na camada Storage.
- Policies de `storage.objects` exigem usuário autenticado, `owner_id` igual à sessão e a primeira pasta igual ao `auth.uid()` em `SELECT`, `INSERT`, `UPDATE` e `DELETE`.
- A tabela `documents` mantém RLS e FK composta de ownership com `applications`; clientes autenticados só podem atualizar a coluna `name`.
- Falha ao inserir os metadados após o upload aciona a remoção compensatória do objeto.
- A exclusão remove o objeto antes dos metadados. A exclusão da candidatura também tenta remover todos os objetos antes do cascade relacional e interrompe a operação se o Storage falhar.
- Storage e PostgreSQL não compartilham uma transação atômica; qualquer falha na etapa compensatória é devolvida explicitamente em vez de ser ignorada.

A migration da etapa é `20260816161935_implement_stage_6_private_application_documents.sql`. O bucket também está declarado em `supabase/config.toml` para a stack local. Nenhuma variável de ambiente ou chave privilegiada adicional é necessária: o servidor usa a sessão do usuário e a chave pública configurada para aplicar RLS.

Documentos não entram na timeline nesta etapa. A timeline atual agrega eventos auditáveis de fontes especializadas; criar uma tabela de eventos exclusiva para arquivos adicionaria outra fonte específica sem um modelo geral de auditoria.

## Etapa 7: Analytics avançado

`/dashboard/analytics` transforma os dados privados já existentes em uma visão analítica server-side. O usuário pode selecionar os últimos 3, 6 ou 12 meses, todo o histórico e uma empresa específica. Todos os indicadores e gráficos respondem ao mesmo recorte.

### Definições das métricas

- **Candidaturas no período:** registros criados no HireFlow dentro do recorte selecionado.
- **Candidaturas enviadas:** registros que estão ou já passaram por qualquer status diferente de `saved`; é o denominador das conversões.
- **Taxa de resposta:** candidaturas enviadas que chegaram a triagem ou etapa posterior, incluindo rejeição.
- **Taxa de entrevista:** candidaturas enviadas que chegaram a uma etapa de entrevista/desafio, proposta ou contratação, ou que possuem entrevista registrada.
- **Taxa de proposta:** candidaturas enviadas que chegaram a `offer` ou `hired`.
- **Taxa de contratação:** candidaturas enviadas que chegaram a `hired`.
- **Tempo até a primeira resposta:** diferença entre `applied_at` — com `created_at` como fallback — e o primeiro evento mensurável de resposta. Registros com cronologia inválida não entram na média.
- **Média salarial:** ponto médio da faixa informada, calculado separadamente por moeda. Quando há somente um limite, ele é usado como referência.

O funil força uma progressão monotônica: alcançar uma etapa posterior também conta como alcance das anteriores. Cards exibem numeradores, denominadores e amostra sempre que isso muda a interpretação. Quando não há denominador válido, a interface mostra `—`, não um `0%` enganoso.

### Mapa dos gráficos

| Visual               | Pergunta respondida                                 | Forma                         |
| -------------------- | --------------------------------------------------- | ----------------------------- |
| Candidaturas por mês | Como o volume registrado evoluiu?                   | Barras verticais cronológicas |
| Funil de avanço      | Quantas candidaturas alcançaram cada marco?         | Barras horizontais ordenadas  |
| Status atual         | Onde estão as candidaturas hoje?                    | Barras por ordem do pipeline  |
| Principais fontes    | Quais canais concentram candidaturas identificadas? | Ranking de barras horizontais |
| Média salarial       | Qual a referência salarial por moeda?               | Lista de valores exatos       |
| Cobertura dos dados  | Quão confiáveis são os campos analíticos?           | Barras de completude          |

Não há dependência de gráficos adicionada: os visuais simples são renderizados no servidor com HTML semântico e CSS, possuem valores textuais, tabela acessível para a série mensal e continuam utilizáveis no mobile. Tecnologias não são inferidas de descrições livres; uma análise desse tipo exige tags estruturadas para não criar resultados enganosos.

### Leitura e performance

As consultas selecionam somente os campos analíticos necessários de `applications`, `application_history` e `interviews`, sempre com `user_id` da sessão e RLS. As três fontes são carregadas em paralelo e paginadas deterministicamente em lotes de 1.000 linhas para evitar truncamento silencioso da Data API. Apenas agregados seguros chegam aos componentes visuais. Não foi necessária uma nova migration: a modelagem das etapas anteriores já contém as fontes de verdade usadas pelos cálculos.

## Etapa 8: conta, preferências e recuperação de senha

`/dashboard/configuracoes` centraliza nome de exibição, moeda padrão, período inicial de Analytics e alteração autenticada de senha. A moeda escolhida passa a ser o valor inicial de novas candidaturas; o período preferido é usado somente quando a URL de Analytics não define um filtro explícito. BRL, USD e EUR são os domínios aceitos para manter validação idêntica na interface, no servidor e no banco.

A migration `20260817001900_add_account_preferences.sql` adiciona as preferências ao `profiles`, com `NOT NULL`, defaults e constraints. O privilégio amplo de `UPDATE` é revogado e concedido novamente apenas para `full_name`, `default_currency` e `analytics_period`; identidade, avatar e timestamps não podem ser enviados como alterações pelo cliente. A policy existente continua limitando leitura e escrita ao próprio `auth.uid()`.

### Segurança da senha

- `/recuperar-senha` responde da mesma forma para e-mails existentes ou não, evitando enumeração de contas.
- O link retorna ao callback SSR e usa o fluxo PKCE oficial do Supabase; códigos são de uso único e precisam ser trocados no mesmo navegador que iniciou o pedido.
- `/redefinir-senha` exige sessão válida e o marcador HTTP-only, `SameSite=Strict` e temporário criado exclusivamente após um callback de recuperação.
- A troca de senha dentro das configurações exige a senha atual. Após uma troca ou redefinição bem-sucedida, as sessões são revogadas globalmente e o usuário volta ao login.
- O domínio do projeto e `/auth/callback` precisam permanecer autorizados em **Authentication > URL Configuration** no Supabase. Para produção, configure também SMTP próprio se o plano/provedor exigir entrega confiável dos e-mails.

## Etapa 9: qualidade, E2E, CI e preparação para deploy

O projeto possui smoke tests com Playwright em Chromium para desktop e mobile. A suíte valida a navegação pública, a validação do formulário de recuperação, o redirecionamento de visitantes que tentam acessar o dashboard e o endpoint de liveness. Os testes locais constroem e iniciam a versão de produção automaticamente em `127.0.0.1:3100`; para validar um preview ou produção já publicados, defina `PLAYWRIGHT_TEST_BASE_URL` antes do comando.

`/api/health` retorna apenas `{ "status": "ok", "service": "hireflow" }` com `Cache-Control: no-store`. Ele confirma que a aplicação responde, mas deliberadamente não consulta o Supabase nem expõe configuração, usuários ou detalhes da infraestrutura.

### Integração contínua

O workflow `.github/workflows/ci.yml` roda em pushes para `main` e pull requests com permissões somente de leitura. A sequência usa instalação reproduzível com `npm ci`, valida o contrato do ambiente, executa Prettier, ESLint, TypeScript, Vitest e o build, instala somente o Chromium headless e roda os smoke tests. O relatório do Playwright fica disponível como artefato por 14 dias.

Os valores de Supabase usados nesse workflow são placeholders públicos e servem somente para jornadas sem sessão ou acesso a dados. Eles não apontam para produção e não substituem testes autenticados contra um projeto de desenvolvimento isolado.

### Checklist de deploy

1. Aplique todas as migrations no projeto correto com `npm run db:push` e revise o resultado antes de publicar a aplicação.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` separadamente nos ambientes Development, Preview e Production da Vercel, preferindo um projeto Supabase isolado para previews. Defina `SITE_URL` no ambiente de produção; previews podem usar o fallback seguro de `VERCEL_PROJECT_PRODUCTION_URL`. Nunca use uma secret ou `service_role` key.
3. Execute `npm run env:check` e `npm run validate` antes do envio.
4. Configure a Site URL e os Redirect URLs do Supabase para o domínio de produção e para os previews autorizados.
5. Conecte o repositório à Vercel para gerar previews por branch e produção a partir de `main`; o CI valida o commit independentemente do deploy.
6. Após publicar, valide `https://seu-dominio/api/health` e execute os smoke tests com `PLAYWRIGHT_TEST_BASE_URL` apontando para a URL implantada.

Nenhum deploy é disparado pelo workflow e nenhum token da Vercel é necessário no repositório. A promoção para produção permanece uma ação explícita depois da migration e da validação do preview.

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
| `npm run test:e2e`     | Executa smoke tests desktop/mobile        |
| `npm run test:e2e:ui`  | Abre a interface local do Playwright      |
| `npm run format:check` | Verifica formatação                       |
| `npm run env:check`    | Valida variáveis sem imprimir valores     |
| `npm run validate`     | Executa qualidade, testes e build         |
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

A suíte automatizada cobre:

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
- validação de tipo, MIME, extensão, tamanho e assinatura básica de PDF/DOCX;
- geração de paths exclusivos e sanitizados sem confiar em caminhos do navegador;
- formatação dos tamanhos exibidos na interface.
- normalização segura dos filtros de Analytics;
- taxas e funil com denominadores explícitos e progressão monotônica;
- série mensal com meses sem registros, agrupamento de fontes e salários por moeda;
- cobertura das informações e tempo médio de resposta com amostra mensurável.
- validação de perfil, preferências e alteração de senha;
- normalização do e-mail e requisitos da nova senha no fluxo de recuperação;
- aplicação do período preferido quando Analytics não recebe filtro na URL.
- smoke tests públicos em Chromium desktop e mobile;
- redirecionamento de visitante em rota protegida e resposta mínima do liveness.

Os testes de RLS devem ser executados contra a stack local ou projeto de desenvolvimento após a migration ser aplicada, preferencialmente com dois usuários distintos.

## Roadmap

- [x] **Etapa 1:** bootstrap, arquitetura e UI base
- [x] **Etapa 2:** migrations, RLS e autenticação SSR
- [x] **Etapa 3:** CRUD de empresas e candidaturas
- [x] **Etapa 4:** Kanban interativo e pipeline de candidaturas
- [x] **Etapa 5:** entrevistas, contatos e timeline completa da candidatura
- [x] **Etapa 6:** documentos, Supabase Storage e gerenciamento de currículos e arquivos da candidatura
- [x] **Etapa 7:** Analytics avançado + métricas + gráficos do processo seletivo
- [x] **Etapa 8:** configurações da conta, preferências e recuperação de senha
- [x] **Etapa 9:** qualidade, E2E, CI e preparação para deploy

## Licença

Projeto criado para fins de estudo e portfólio. A definição de licença poderá ser adicionada antes da publicação.
