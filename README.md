# HireFlow

Plataforma Full Stack para organizar candidaturas, acompanhar processos seletivos e transformar a busca por emprego em um fluxo claro e mensurável.

> Status: **Etapa 22 implementada no código — preparação estruturada de entrevistas, além das etapas anteriores.** Para usar os fluxos reais, ainda é necessário criar/conectar um projeto Supabase HireFlow, aplicar as migrations e preencher o `.env.local`.

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
- Preparação estruturada por entrevista com pesquisa, histórias, perguntas e logística
- Timeline agregada e auditável com criação, mudanças de status, entrevistas e interações manuais
- Upload, listagem, visualização, download, renomeação e exclusão de documentos privados por candidatura
- Biblioteca central de documentos com busca, filtros, ordenação e paginação
- Busca e filtros combináveis no Kanban, representados na URL
- Dashboard com identidade, métricas e candidaturas recentes reais
- Analytics com período/empresa, KPIs de conversão, funil, tendências, fontes, salários e cobertura dos dados
- Lembretes com prazo, filtros de situação, conclusão, reabertura e vínculo seguro com candidaturas
- Resumo de pendências e próximo follow-up no dashboard
- Tecnologias estruturadas, reutilizáveis e normalizadas por usuário
- Ranking de tecnologias e cobertura das tags no Analytics
- Busca global por candidaturas, empresas, contatos, lembretes, documentos, tecnologias, interações e propostas
- Navegação rápida para a busca com `Ctrl+K` ou `Cmd+K`
- Backup JSON dos registros privados e exportação CSV das candidaturas
- Importação CSV com prévia, validação, deduplicação e transação atômica
- Agenda unificada de entrevistas e lembretes com download em iCalendar
- Registro manual de anotações, e-mails, ligações, LinkedIn e outras interações por candidatura
- Arquivamento e restauração de candidaturas sem excluir histórico ou registros relacionados
- Registro de propostas e comparação de remuneração, bônus e condições
- Central de prioridades com prazos críticos, entrevistas próximas e candidaturas paradas
- Metas privadas de candidaturas, follow-ups e contatos com janela comparativa de sete dias
- Schema versionado com quinze tabelas, RLS, índices e constraints
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

| Tabela                     | Responsabilidade                                               |
| -------------------------- | -------------------------------------------------------------- |
| `profiles`                 | Perfil e preferências privadas do usuário autenticado          |
| `companies`                | Empresas pertencentes ao usuário                               |
| `applications`             | Candidaturas e estágio do processo                             |
| `contacts`                 | Contatos vinculados a empresas                                 |
| `interviews`               | Entrevistas vinculadas a candidaturas                          |
| `interview_preparations`   | Preparação privada e estruturada de cada entrevista            |
| `application_contacts`     | Associação muitos-para-muitos entre candidaturas e contatos    |
| `application_history`      | Histórico de mudanças de status                                |
| `interview_events`         | Eventos append-only da evolução das entrevistas                |
| `documents`                | Metadados dos arquivos privados de cada candidatura            |
| `reminders`                | Follow-ups e tarefas com prazo vinculados às candidaturas      |
| `technologies`             | Catálogo privado e normalizado de tecnologias do usuário       |
| `application_technologies` | Associação muitos-para-muitos entre candidaturas e tecnologias |
| `application_activities`   | Interações manuais registradas por candidatura                 |
| `application_offers`       | Propostas recebidas e condições de remuneração                 |

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

A timeline usa fontes especializadas em vez de uma tabela genérica com JSON: deriva a criação de `applications.created_at`, lê mudanças de status em `application_history`, eventos imutáveis de entrevistas em `interview_events` e interações explícitas em `application_activities`. O trigger `interviews_record_event` registra criação, reagendamento e transições de resultado sem duplicar o reagendamento quando data e resultado mudam juntos. A UI agrega e ordena tudo do evento mais recente para o mais antigo, com desempate determinístico.

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
| Tecnologias          | Quais tecnologias aparecem em mais candidaturas?    | Ranking de barras horizontais |
| Média salarial       | Qual a referência salarial por moeda?               | Lista de valores exatos       |
| Cobertura dos dados  | Quão confiáveis são os campos analíticos?           | Barras de completude          |

Não há dependência de gráficos adicionada: os visuais simples são renderizados no servidor com HTML semântico e CSS, possuem valores textuais, tabela acessível para a série mensal e continuam utilizáveis no mobile. Tecnologias não são inferidas de descrições livres; o ranking usa exclusivamente as tags estruturadas implementadas na Etapa 11.

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

## Etapa 10: lembretes e follow-ups

`/dashboard/lembretes` reúne os próximos passos de cada processo seletivo. Cada lembrete pertence obrigatoriamente a uma candidatura, possui título, observações opcionais, prazo em `TIMESTAMPTZ` e um marcador de conclusão. A listagem separa próximos, atrasados, concluídos e todos os registros sem persistir um status derivado que poderia ficar desatualizado.

O usuário pode criar, editar, concluir, reabrir e excluir lembretes. A tela de detalhes da candidatura expõe os mesmos registros e permite iniciar um lembrete com a candidatura já selecionada. O dashboard mostra a quantidade de pendências, quantas estão fora do prazo e o primeiro lembrete ainda não concluído.

### Segurança e modelagem

- `user_id` sempre vem da sessão no servidor e nunca do formulário.
- A FK composta `(application_id, user_id)` impede vínculo com candidatura de outra conta e remove os lembretes em cascata quando a candidatura é excluída.
- RLS restringe `SELECT`, `INSERT`, `UPDATE` e `DELETE` ao proprietário; usuários anônimos não recebem privilégios.
- O cliente autenticado só pode atualizar `title`, `notes`, `due_at` e `completed_at`, portanto não consegue trocar ownership ou mover o lembrete para outra candidatura.
- Um índice parcial cobre a fila de pendências por usuário e prazo; outro índice atende a leitura por candidatura e o cascade da FK.
- O estado “atrasado” é calculado comparando o prazo com o horário corrente. O timezone local é usado somente para entrada e exibição; o banco armazena instantes absolutos.

Esta etapa implementa lembretes dentro do HireFlow. Não há envio automático de e-mail, push, execução agendada ou integração com calendários externos.

## Etapa 11: tecnologias estruturadas e Analytics

A tela de detalhes da candidatura permite vincular tecnologias como React, TypeScript, PostgreSQL ou AWS. O campo oferece sugestões do catálogo privado do usuário e também aceita uma nova tecnologia. Espaços são normalizados e a unicidade por `(user_id, normalized_name)` impede duplicidades causadas por diferenças de caixa, como `React` e `react`.

O Analytics carrega as associações de forma paginada junto das demais fontes e aplica o mesmo recorte de período e empresa. O ranking mostra até oito tecnologias, contando no máximo uma ocorrência por candidatura graças à PK composta da associação. O percentual usa todas as candidaturas do recorte como denominador; como uma candidatura pode possuir várias tags, os percentuais das tecnologias não precisam somar 100%. A cobertura informa quantas candidaturas possuem ao menos uma tecnologia estruturada.

### Segurança e relacionamentos

- `technologies` e `application_technologies` possuem RLS e privilégios mínimos; `anon` não possui acesso.
- FKs compostas com `user_id` exigem que candidatura e tecnologia pertençam ao mesmo usuário.
- `user_id` sempre é derivado da sessão autenticada pelas Server Actions.
- A associação possui somente `SELECT`, `INSERT` e `DELETE`; não existe atualização capaz de mover um vínculo para outra candidatura ou conta.
- Exclusões de candidatura, tecnologia ou usuário removem somente os vínculos dependentes por cascade.
- A aplicação valida a candidatura antes de criar uma tecnologia e trata corridas de unicidade reutilizando o registro já existente.

Não existe extração automática de descrições, scraping ou inferência por IA. As métricas representam somente dados que o usuário cadastrou explicitamente.

## Etapa 12: busca global e navegação rápida

`/dashboard/busca` reúne resultados de candidaturas, empresas, contatos, lembretes, documentos e tecnologias. O formulário usa query string e renderização no servidor, portanto funciona sem JavaScript e pode ser compartilhado ou recarregado preservando o termo. `Ctrl+K` no Windows/Linux e `Cmd+K` no macOS abrem a busca; quando a tela já está aberta, o mesmo atalho move o foco para o campo.

As categorias são consultadas em paralelo e exibem no máximo seis itens cada. Candidaturas também são encontradas pelo nome da empresa e tecnologias apontam para as candidaturas às quais estão vinculadas. A solução favorece consultas pequenas e previsíveis para o escopo atual do produto; um índice de texto completo pode substituir os filtros parciais caso o volume cresça significativamente.

### Segurança e limites

- O usuário autenticado vem da sessão SSR; nenhum identificador de conta é aceito pela URL.
- Todas as consultas repetem `user_id` explicitamente e permanecem protegidas pelas policies RLS existentes.
- O termo é normalizado, limitado a 80 caracteres e tem caracteres reservados dos filtros removidos antes de chegar ao PostgREST.
- A busca exige dois caracteres úteis, seleciona somente os campos necessários e limita cada categoria a seis resultados.
- Documentos são encontrados apenas por metadados; o conteúdo dos arquivos privados não é lido nem indexado.
- Não há endpoint público, cache compartilhado entre usuários ou exposição de dados no bundle do cliente.

## Etapa 13: exportação e portabilidade dos dados

A seção de configurações oferece duas exportações geradas sob demanda. O backup JSON é versionado e contém perfil, empresas, candidaturas, contatos, vínculos, entrevistas, preparações, eventos, histórico, metadados de documentos, lembretes, tecnologias, interações manuais e propostas. O CSV traz uma visão das candidaturas enriquecida com nome da empresa e tecnologias, usa UTF-8 com BOM e pode ser aberto em planilhas.

Os dados são lidos em páginas de 500 registros usando cursores determinísticos, evitando o limite padrão de linhas da Data API. As tabelas são carregadas em paralelo e cada sequência avança pela chave primária. Como não existe uma transação única entre todas as consultas HTTP, alterações feitas durante o download podem aparecer apenas parcialmente no arquivo; recomenda-se evitar edições simultâneas durante backups grandes.

### Segurança e privacidade

- A rota de download exige sessão válida e deriva o proprietário dos claims verificados no servidor.
- Cada consulta repete o filtro de ownership e continua sujeita às policies RLS.
- As respostas usam `private, no-store`, `nosniff` e `Content-Disposition: attachment`.
- Valores CSV iniciados por caracteres de fórmula são neutralizados para evitar execução ao abrir o arquivo em uma planilha.
- Os arquivos são montados em memória, enviados diretamente na resposta e não são persistidos no servidor ou no Storage.
- O JSON inclui o `storage_path`, as metas do profile, as preparações de entrevista e outros metadados privados, mas não contém os arquivos privados, signed URLs, senhas, tokens ou chaves. A inclusão das preparações avança o formato para o schema 6.
- A restauração completa do backup JSON não faz parte desta etapa; a importação controlada do CSV de candidaturas é descrita na Etapa 20.

## Etapa 14: agenda unificada e iCalendar

`/dashboard/agenda` reúne entrevistas agendadas ou reagendadas e lembretes ainda não concluídos. O usuário pode combinar tipo e período pela URL, escolhendo os próximos 7, 30 ou 90 dias, itens atrasados ou todos os compromissos ativos. A leitura das duas fontes ocorre em paralelo e é limitada aos primeiros 300 itens ordenados cronologicamente.

O recorte usa instantes absolutos no servidor, enquanto os componentes de data exibem cada horário no locale e fuso do navegador. Essa abordagem evita impor um timezone global. A exportação `.ics` mantém timestamps UTC e permite que Google Calendar, Outlook, Apple Calendar e outros clientes façam a conversão local durante a importação.

### Calendário e segurança

- O arquivo iCalendar inclui entrevistas e lembretes visíveis no recorte atual, preservando os filtros selecionados.
- Entrevistas recebem duração padrão de 60 minutos e lembretes de 30 minutos apenas no arquivo exportado; esses valores não alteram os registros do banco.
- Textos são escapados e linhas são dobradas no limite de 75 octetos previsto pelo formato iCalendar, inclusive com caracteres UTF-8.
- A rota exige sessão, deriva `user_id` no servidor e mantém as consultas sob RLS com filtro explícito de ownership.
- A resposta usa `private, no-store`, `nosniff` e download por `Content-Disposition`; nenhum calendário é salvo no servidor.
- Não existe sincronização automática, OAuth com calendários externos, envio de convites ou atualização bidirecional nesta etapa.

## Etapa 15: histórico manual de interações

Os detalhes de cada candidatura permitem registrar anotações, e-mails, ligações, contatos pelo LinkedIn e outras interações. Cada registro guarda título, detalhes opcionais e o instante em que aconteceu; a data local do dispositivo é convertida para ISO 8601 antes de chegar à Server Action. As interações entram na timeline unificada e na busca global, além de fazerem parte do backup JSON versionado.

### Segurança e escopo

- A sessão SSR fornece o `user_id`; o cliente envia somente a candidatura, o tipo e o conteúdo validado.
- A FK composta `(application_id, user_id)` impede vincular uma interação a uma candidatura de outra conta, mesmo fora da interface.
- RLS concede apenas `SELECT`, `INSERT` e `DELETE` ao proprietário; não há edição silenciosa de um registro existente.
- Título, tipo, UUID, data e limites de texto são validados novamente na Server Action, e as consultas repetem o filtro de ownership.
- O recurso apenas documenta ações realizadas pelo usuário. Não envia e-mails, mensagens no LinkedIn, ligações ou follow-ups automáticos.
- Exclusões exigem confirmação na interface. O backup continua sendo o mecanismo disponível para portabilidade e retenção externa.

## Etapa 16: arquivamento reversível

Candidaturas encerradas podem ser arquivadas nos detalhes sem apagar nenhum dado. A listagem usa “Ativas” como recorte padrão e permite alternar para “Arquivadas” ou “Ativas e arquivadas”; o Kanban e os registros recentes do dashboard mostram somente processos ativos. Restaurar devolve a candidatura imediatamente às telas operacionais.

O Analytics, os totais históricos, a busca global, a agenda e o backup continuam incluindo candidaturas arquivadas. Resultados da busca identificam o estado arquivado, e o backup JSON passa ao schema 3 por incluir `archived_at`. Entrevistas e lembretes existentes não são cancelados implicitamente, evitando perda silenciosa de compromissos.

### Consistência e performance

- A Server Action recebe apenas UUID e o estado desejado, deriva o proprietário da sessão e repete `user_id` na atualização.
- A mutation compara o estado atual de `archived_at`, evitando sobrescrita silenciosa entre abas e tratando operações repetidas como idempotentes.
- O arquivamento reutiliza a policy RLS de `UPDATE`, com `USING` e `WITH CHECK`; nenhum privilégio anônimo foi adicionado.
- `archived_at` é `TIMESTAMPTZ` anulável: `NULL` significa ativa e um instante identifica quando foi arquivada.
- Índices parciais por criação e atualização cobrem lista, Kanban e recentes que exigem `archived_at IS NULL`, sem ampliá-los com registros arquivados.
- A operação é reversível e não usa soft delete: exclusão definitiva permanece uma ação separada, com remoção dos documentos privados antes do cascade relacional.

## Etapa 17: propostas e comparação de ofertas

Cada candidatura pode armazenar uma proposta com salário-base mensal ou anual, moeda, bônus, participação, benefícios, data de recebimento, prazo de decisão e observações. A tela `/dashboard/ofertas` compara os valores anuais equivalentes e o caixa anual com bônus, mantendo cada moeda separada e sem sugerir uma conversão cambial implícita.

Salvar ou excluir uma proposta não altera o status do pipeline. Candidaturas arquivadas continuam visíveis na comparação com identificação própria, e textos de benefícios, participação e observações passam a integrar a busca global. O backup JSON avança para o schema 4 e inclui todas as propostas da conta.

### Consistência, segurança e limites

- Existe no máximo uma proposta por candidatura; a FK composta `(application_id, user_id)` impede vínculos entre contas e remove a proposta no cascade da candidatura.
- O `user_id` é sempre derivado dos claims da sessão no servidor. Server Actions validam UUIDs, moeda, valores, datas e limites de texto antes da escrita.
- RLS restringe `SELECT`, `INSERT`, `UPDATE` e `DELETE` ao proprietário, com privilégios explícitos apenas para `authenticated`.
- Datas de recebimento e decisão usam o tipo civil `date`, evitando deslocamento de dia por fuso horário.
- O equivalente anual multiplica salários mensais por 12 e soma somente o bônus informado. Benefícios, impostos, participação e moedas diferentes não são convertidos em um ranking financeiro automático.

## Etapa 18: central de prioridades

`/dashboard/prioridades` transforma os registros existentes em uma fila semanal de ações. A central reúne lembretes vencidos, propostas com decisão atrasada ou nos próximos sete dias, entrevistas agendadas para os próximos sete dias e candidaturas ativas sem atualização há pelo menos 14 dias. Filtros por categoria ficam na URL e preservam navegação, recarga e compartilhamento interno.

As regras atribuem severidade crítica a lembretes vencidos e propostas expiradas. Propostas com até dois dias, entrevistas em até 24 horas e candidaturas paradas exigem atenção; os demais compromissos da janela ficam planejados. Uma candidatura parada não é repetida quando já possui outro item concreto na fila.

### Escopo, segurança e performance

- A central é somente leitura e não cria uma tabela ou estado derivado que possa ficar desatualizado.
- Todas as consultas derivam `user_id` da sessão, repetem o filtro de ownership e continuam sob as policies RLS das tabelas de origem.
- Candidaturas arquivadas ou em estados finais não aparecem, mesmo que ainda possuam lembretes, entrevistas ou propostas relacionadas.
- Propostas vencidas usam uma janela retroativa de 30 dias; cada fonte lê no máximo 100 registros e a interface informa quando o limite é atingido.
- Prazos civis de propostas permanecem no formato `date`; entrevistas e lembretes usam instantes absolutos e são exibidos no fuso do navegador.
- A central não envia notificações, mensagens, e-mails nem altera automaticamente o pipeline.

## Etapa 19: biblioteca central de documentos

`/dashboard/documentos` reúne os arquivos privados de todas as candidaturas do usuário. A busca encontra o nome de exibição, o nome original, a vaga ou a empresa; os filtros combinam tipo de documento, empresa e situação de arquivamento da candidatura. A ordenação e a paginação de 12 itens também ficam na URL, preservando recarga e navegação.

Visualização, download, renomeação e exclusão reutilizam as Server Actions da candidatura. A listagem recebe somente os metadados necessários; o `storage_path` permanece no servidor e cada acesso gera uma URL assinada válida por 60 segundos apenas após o clique. A exclusão continua removendo primeiro o objeto do Storage e depois o registro.

### Escopo, segurança e performance

- Todas as consultas derivam `user_id` da sessão, repetem o filtro de ownership e permanecem protegidas por RLS.
- A relação interna com a candidatura impede documentos órfãos ou pertencentes a outra conta; uploads continuam no detalhe da candidatura para manter esse vínculo explícito.
- A busca relacionada limita a 100 resultados cada consulta auxiliar de vagas, empresas e candidaturas. A consulta final mantém contagem exata e paginação no banco.
- Conteúdo de PDF ou DOCX não é lido nem indexado, e URLs assinadas nunca são persistidas.
- A etapa reutiliza a tabela `documents` e o bucket privado existentes; não exige migration, tabela ou variável de ambiente adicional.

## Etapa 20: importação CSV segura de candidaturas

A seção de configurações aceita o mesmo CSV UTF-8 exportado pelo HireFlow. O usuário seleciona o arquivo, recebe uma prévia das primeiras oito linhas e precisa confirmar antes de qualquer escrita. A confirmação reabre e revalida o arquivo no servidor, portanto a prévia não funciona como autorização para conteúdo alterado.

Empresa, vaga, status, modalidade, contrato, localização, salários, moeda, data, fonte, URL e tecnologias são importados. IDs e timestamps do arquivo são ignorados e novos UUIDs são gerados pelo banco. Empresas e tecnologias já existentes na mesma conta são reutilizadas; uma candidatura com a mesma empresa, vaga e data é tratada como duplicada e não é atualizada ou mesclada silenciosamente.

### Transação, segurança e limites

- O parser suporta células entre aspas, vírgulas, aspas escapadas, quebras de linha, delimitadores escapados nas tecnologias e o prefixo usado para neutralizar fórmulas na exportação.
- Arquivos são limitados a 1 MiB, 200 candidaturas e 20 tecnologias por linha. Cabeçalho, enums, URLs HTTP(S), datas civis e faixas salariais são validados antes da chamada ao banco.
- A função `import_applications_csv(jsonb)` usa `SECURITY INVOKER`, deriva o proprietário de `auth.uid()` e executa sob as policies RLS existentes; `anon` não recebe `EXECUTE`.
- Todo o lote é processado em uma única transação PostgreSQL. Um erro desfaz empresas, candidaturas e vínculos criados naquela confirmação.
- Nenhum `user_id`, ID de empresa ou ID de tecnologia vindo do CSV é aceito como autoridade. Service Role não é utilizada.
- A migration é `20260820214203_implement_stage_20_csv_application_import.sql`; o teste pgTAP cobre execução autorizada, isolamento entre dois usuários, deduplicação e limite do lote.

## Etapa 21: metas de produtividade e ritmo de busca

`/dashboard/metas` acompanha três comportamentos configuráveis: candidaturas com data de envio, lembretes concluídos e contatos registrados como e-mail, ligação ou LinkedIn. Cada cartão compara a janela atual — hoje e os seis dias anteriores — com os sete dias imediatamente anteriores, mostra o progresso e oferece um atalho para registrar a próxima ação.

As metas ficam no profile privado e aceitam valores inteiros de 0 a 100. Zero pausa apenas o alvo visual; nenhum registro histórico é apagado. Os resultados são sempre derivados das tabelas operacionais existentes, portanto não há snapshot, tabela agregada ou contador que possa divergir silenciosamente dos dados de origem.

### Escopo, segurança e consistência

- A página é um Server Component e consulta somente contagens; registros individuais e detalhes privados não atravessam a fronteira do cliente.
- A Server Action revalida os valores, deriva o usuário da sessão e atualiza somente o profile correspondente. A policy RLS existente continua impondo `id = auth.uid()`.
- Privilégios de coluna permitem alterar apenas nome, preferências e metas; identidade, avatar e timestamps continuam protegidos contra update pela Data API.
- As duas janelas usam limites civis em UTC para produzir resultados determinísticos no servidor. Candidaturas usam `applied_at`; follow-ups e contatos usam seus timestamps de conclusão ou ocorrência.
- Candidaturas arquivadas continuam contando o esforço realizado. A página não dispara e-mails, mensagens, notificações nem mudanças automáticas no pipeline.
- A migration `20260823181921_implement_stage_21_productivity_goals.sql` adiciona constraints e índices para as novas consultas. O teste pgTAP cobre defaults, limites, privilégios e isolamento entre dois usuários.
- O backup JSON passa ao schema 5 porque o registro de profile agora inclui as três metas.

## Etapa 22: preparação estruturada de entrevistas

Cada entrevista possui um espaço próprio em `/dashboard/entrevistas/[id]/preparacao`, acessível tanto pela agenda de entrevistas quanto pelo detalhe da candidatura. A preparação organiza pesquisa da empresa, aderência à vaga, histórias no formato STAR, perguntas para o entrevistador e observações de logística. Um indicador calculado no cliente mostra quantas das cinco seções já possuem conteúdo, sem persistir um contador que possa ficar desatualizado.

### Dados, segurança e limites

- Existe no máximo uma preparação por entrevista. A FK composta `(interview_id, user_id)` impede que uma conta relacione conteúdo a uma entrevista de outra conta e remove a preparação por cascade quando a entrevista é excluída.
- Leituras e escritas repetem o filtro de ownership, a Server Action revalida o UUID e todos os textos, e a autorização é confirmada novamente no servidor antes da mutation.
- A tabela exposta possui RLS para `SELECT`, `INSERT` e `UPDATE`; `anon` não recebe privilégios e clientes autenticados não podem alterar `user_id`, `interview_id`, UUIDs ou timestamps.
- As quatro seções gerais aceitam até 4.000 caracteres e logística aceita até 2.000. Os mesmos limites existem no formulário, no schema Zod e em constraints PostgreSQL.
- O conteúdo é manual e privado. Não há IA, geração automática, scraping da empresa, mensagens ou compartilhamento público.
- A migration `20260823183104_implement_stage_22_interview_preparation.sql` cria a tabela, o índice de ownership, o trigger de atualização e as policies. O teste pgTAP cobre privilégios, limites, isolamento entre usuários, FK composta e cascade.
- O backup JSON passa ao schema 6 e inclui `interview_preparations`; agora ele cobre as quinze tabelas privadas.

## Row Level Security

RLS nasce habilitado em todas as tabelas de dados do usuário.

- `profiles`: somente `SELECT` e `UPDATE` do próprio `id`.
- Demais tabelas recebem apenas as operações necessárias e sempre exigem `user_id = (select auth.uid())`.
- Updates possuem `USING` e `WITH CHECK`.
- Inserts não aceitam `user_id` de terceiros.
- FKs compostas reforçam a propriedade também nos relacionamentos.
- `anon` não recebe privilégios sobre as tabelas privadas.
- `application_history` e `interview_events` são append-only para clientes; somente triggers internos registram eventos.
- `application_activities` não concede `UPDATE`; interações manuais podem ser criadas, lidas ou excluídas pelo proprietário.
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
| `npm run db:test`      | Executa os testes pgTAP do banco local    |
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
- validação, janelas civis consecutivas e progresso das metas de produtividade;
- validação, normalização e progresso das cinco seções de preparação de entrevista;
- schema de lembretes, limites de texto e datas ISO;
- schema de interações manuais, tipos controlados, limites de texto e identificadores;
- filtros de arquivamento, URLs paginadas e mutation validada de arquivar/restaurar;
- normalização dos filtros de lembretes e classificação determinística entre próximo, atrasado e concluído;
- normalização, limites e identificadores de tecnologias vinculadas;
- ranking de tecnologias por candidatura e cobertura das tags dentro do recorte analítico;
- normalização, limite e neutralização de caracteres reservados da busca global;
- serialização JSON versionada, escaping CSV e neutralização de fórmulas de planilha;
- filtros determinísticos da agenda, ordenação unificada e serialização iCalendar;
- classificação, deduplicação e filtros determinísticos da central de prioridades;
- normalização segura, defaults e URLs determinísticas da biblioteca de documentos;
- parsing CSV, campos escapados, validação e normalização da importação;
- importação transacional, deduplicação e isolamento entre usuários em pgTAP;
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
- [x] **Etapa 10:** lembretes e follow-ups vinculados às candidaturas
- [x] **Etapa 11:** tecnologias estruturadas por candidatura e ranking no Analytics
- [x] **Etapa 12:** busca global privada e navegação rápida
- [x] **Etapa 13:** exportação e portabilidade dos dados
- [x] **Etapa 14:** agenda unificada e exportação iCalendar
- [x] **Etapa 15:** histórico manual de interações por candidatura
- [x] **Etapa 16:** arquivamento e restauração de candidaturas
- [x] **Etapa 17:** propostas e comparação de ofertas
- [x] **Etapa 18:** central de prioridades acionáveis
- [x] **Etapa 19:** biblioteca central de documentos
- [x] **Etapa 20:** importação CSV segura de candidaturas
- [x] **Etapa 21:** metas de produtividade e comparação do ritmo de busca
- [x] **Etapa 22:** preparação estruturada de entrevistas

## Licença

Projeto criado para fins de estudo e portfólio. A definição de licença poderá ser adicionada antes da publicação.
