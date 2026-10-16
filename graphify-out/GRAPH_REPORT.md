# Graph Report - cardapio-online  (2026-10-16)

## Corpus Check
- 217 files · ~346,088 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .csv 11, .css 2, .example 1)

## Summary
- 997 nodes · 2638 edges · 80 communities (42 shown, 38 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `36a9ffa0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- painel/actions.ts
- fotoMaquininha.ts
- next
- payload-types.ts
- cliente-actions.ts
- FecharConta.tsx
- Cardapio
- gruposDoProduto
- package.json
- payload.config.ts
- planilha.ts
- compilerOptions
- @payloadcms/next
- dependencies
- (frontend)/layout.tsx
- exemplo.ts
- exemplo.ts
- brl
- pedido.ts
- Cadastrar um cliente novo
- devDependencies
- (frontend)/actions.ts
- [loja]/page.tsx
- SeusPedidos.tsx
- scripts
- loja/page.tsx
- financeiro/page.tsx
- FormLoja.tsx
- Users.ts
- montarRota
- sugestoes.ts
- payload
- garcons/page.tsx
- exemplo-db.ts
- cupons/page.tsx
- index.ts
- seed.ts
- @payloadcms/db-postgres
- [...slug]/route.ts
- next.config.ts
- .prettierrc.json
- Backup do banco
- next
- carrinhos/page.tsx
- eslint.config.mjs
- engines
- LojaAoVivo.tsx
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- dotenv
- LEIA-ME.md
- privacidade/page.tsx
- Users.ts
- (frontend)/page.tsx

## God Nodes (most connected - your core abstractions)
1. `sessao()` - 72 edges
2. `brl()` - 47 edges
3. `next` - 46 edges
4. `Cardapio()` - 34 edges
5. `lerPreco()` - 32 edges
6. `@payloadcms/db-postgres` - 30 edges
7. `planejar()` - 30 edges
8. `react` - 29 edges
9. `vitest` - 29 edges
10. `gruposDoProduto()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `copiar()` --indirect_call--> `chave()`  [INFERRED]
  src/components/Cardapio.tsx → src/components/ContaDaMesa.tsx
- `produtos()` --calls--> `lerTabela()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/exemplo.ts
- `grupos()` --calls--> `lerOpcoes()`  [EXTRACTED]
  tests/int/opcoes.int.spec.ts → src/lib/opcoes.ts
- `produtos()` --calls--> `gruposDoProduto()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/opcoes.ts
- `Entrar()` --calls--> `Formulario()`  [EXTRACTED]
  src/app/(frontend)/painel/entrar/page.tsx → src/components/painel/Formulario.tsx

## Import Cycles
- None detected.

## Communities (80 total, 38 thin omitted)

### Community 0 - "painel/actions.ts"
Cohesion: 0.13
Nodes (35): apagarCategoria(), apagarCupom(), apagarLancamento(), apagarProduto(), baixarLancamento(), entrar(), imagem(), lerHorarioDoForm() (+27 more)

### Community 1 - "fotoMaquininha.ts"
Cohesion: 0.06
Nodes (55): tesseract.js, conferirMaquininha(), lerFotoNoGoogle(), ResultadoFoto, totalCartaoDoDia(), Maquininha(), metadata, ConferirMaquininha() (+47 more)

### Community 2 - "next"
Cohesion: 0.10
Nodes (37): next, atribuirEntregador(), mudarStatus(), Rota, Cozinha(), metadata, metadata, NovoPedidoPagina() (+29 more)

### Community 3 - "payload-types.ts"
Cohesion: 0.05
Nodes (39): Acerto, AcertosSelect, Auth, Carrinho, CarrinhosSelect, Categoria, CategoriasSelect, Cliente (+31 more)

### Community 4 - "cliente-actions.ts"
Cohesion: 0.12
Nodes (32): vitest, adicionarEndereco(), buscarLoja(), cadastrarCliente(), corrigirEndereco(), EnderecoResumo, Identificacao, identificarCliente() (+24 more)

### Community 5 - "FecharConta.tsx"
Cohesion: 0.08
Nodes (35): qrcode, fecharContaDaMesa(), trocarLoja(), MesaDoGarcom(), metadata, metadata, TelaDoGarcom(), LayoutLogado() (+27 more)

### Community 6 - "Cardapio"
Cohesion: 0.15
Nodes (16): pedirDeNovo(), repetirUltimoPedido(), Cardapio(), enviar(), enviarMesa(), pedirOutraVez(), repetir(), chaveDe() (+8 more)

### Community 7 - "gruposDoProduto"
Cohesion: 0.13
Nodes (27): aplicarCupom(), conferirItens(), criarPedidoMesa(), guardarCarrinho(), texto(), criarPedidoDaMesa(), criarPedidoPainel(), DadosPedidoPainel (+19 more)

### Community 8 - "package.json"
Cohesion: 0.08
Nodes (24): description, license, name, private, type, version, cross-env, eslint (+16 more)

### Community 9 - "payload.config.ts"
Cohesion: 0.15
Nodes (14): logado(), Acertos, Carrinhos, Categorias, Cupons, Entregadores, Fechamentos, Lancamentos (+6 more)

### Community 10 - "planilha.ts"
Cohesion: 0.11
Nodes (26): read-excel-file, Importar(), metadata, Importador(), confirmar(), escolher(), lerArquivo(), Loja (+18 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 12 - "@payloadcms/next"
Cohesion: 0.11
Nodes (10): @payloadcms/next, @payloadcms/plugin-multi-tenant, @payloadcms/storage-vercel-blob, importMap, Args, Args, GET, OPTIONS (+2 more)

### Community 13 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, cross-env, dotenv, graphql, next, payload, @payloadcms/db-postgres, @payloadcms/live-preview-react (+11 more)

### Community 14 - "(frontend)/layout.tsx"
Cohesion: 0.25
Nodes (5): classica, leve, metadata, moderna, tradicional

### Community 15 - "exemplo.ts"
Cohesion: 0.13
Nodes (31): fimDoDia(), Bairro, lerBairros(), taxaDoBairro(), ATENDIMENTOS, ContextoPlano, escolhasPorNome(), inteiro() (+23 more)

### Community 16 - "exemplo.ts"
Cohesion: 0.20
Nodes (13): importarExemplo(), permitido(), relatorioMaquininhaExemplo(), Exemplo(), maxDuration, metadata, ImportarExemplo(), baixarRelatorio() (+5 more)

### Community 17 - "brl"
Cohesion: 0.27
Nodes (16): fazerAcerto(), mudarPagamentoDoPedido(), pendentesDoAcerto(), Entregadores(), metadata, AcertoEntregador(), calcularAcerto(), diferencaDoAcerto() (+8 more)

### Community 18 - "pedido.ts"
Cohesion: 0.18
Nodes (12): centavos(), ItemEscolhido, lerCpf(), MAX_QUANTIDADE, Modo, Pedido, centavos(), descontoDePromocoes() (+4 more)

### Community 19 - "Cadastrar um cliente novo"
Cohesion: 0.13
Nodes (13): 1. Criar a loja (5 min), 2. Criar o login do dono (2 min), 3. Importar os produtos (5 a 15 min), 4. Conferir o cardápio (5 min), 5. Entregar ao cliente, Antes de começar, peça ao cliente, Cadastrar um cliente novo, Cadastrar um cliente novo (+5 more)

### Community 20 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, jsdom, prettier, @testing-library/react, tsx, @types/node (+7 more)

### Community 21 - "(frontend)/actions.ts"
Cohesion: 0.22
Nodes (13): contaAberta(), contaDaMesa, DadosPedido, ItemParaConferir, lojaEMesa(), pedirContaDaMesa(), ResultadoCupom, ResultadoMesa (+5 more)

### Community 22 - "[loja]/page.tsx"
Cohesion: 0.26
Nodes (9): buscarLoja, generateMetadata(), PaginaDaLoja(), Props, revalidate, Pixels(), ComPixels, scriptGoogle() (+1 more)

### Community 23 - "SeusPedidos.tsx"
Cohesion: 0.31
Nodes (9): inscrever(), SeusPedidos(), usePedidosLocais(), comPedidoNovo(), ehNumero(), lerPedidosLocais(), MAX_PEDIDOS_LOCAIS, PedidoLocal (+1 more)

### Community 24 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, dev, devsafe, generate:importmap, generate:types, lint, payload (+5 more)

### Community 25 - "loja/page.tsx"
Cohesion: 0.29
Nodes (8): metadata, MinhaLoja(), url(), bairrosComoTexto(), lerSelos(), rotulosDosSelos(), Selo, SELOS

### Community 26 - "financeiro/page.tsx"
Cohesion: 0.21
Nodes (17): dataBr(), Financeiro(), metadata, ROTULO_SITUACAO, alertas(), c(), CATEGORIAS, dois() (+9 more)

### Community 27 - "FormLoja.tsx"
Cohesion: 0.07
Nodes (56): react, Estado, Categorias(), metadata, Cupons(), dataBr(), metadata, metadata (+48 more)

### Community 28 - "Users.ts"
Cohesion: 0.20
Nodes (13): hojeEmBrasilia(), datar(), Dono, emParalelo(), gravarExemplo(), montarRelatorioExemplo(), dm(), Erro (+5 more)

### Community 29 - "montarRota"
Cohesion: 0.36
Nodes (6): chaveGoogle(), montarRota(), ordemGoogle(), comCidade(), linkMaps(), MAX_PARADAS

### Community 30 - "sugestoes.ts"
Cohesion: 0.33
Nodes (4): C, P, sugerir(), cardapio

### Community 31 - "payload"
Cohesion: 0.35
Nodes (6): payload, ehAdmin(), soAdmin(), todos(), Clientes, hooksDeCardapio

### Community 32 - "garcons/page.tsx"
Cohesion: 0.36
Nodes (6): ligarGarcom(), mudarGarcom(), trocarSenhaGarcom(), Garcons(), metadata, CampoUsuario()

### Community 33 - "exemplo-db.ts"
Cohesion: 0.33
Nodes (7): criarPedido(), lerAgendamento(), limitesDoCampo(), MAX_DIAS, MIN_MINUTOS, rotuloAgendamento(), agora

### Community 34 - "cupons/page.tsx"
Cohesion: 0.33
Nodes (8): buscarCupom(), brl(), centavos(), Cupom, descontoDoCupom(), normalizarCodigo(), rotuloDoCupom(), base

### Community 36 - "seed.ts"
Cohesion: 0.29
Nodes (3): cardapio, fotos, pasta

### Community 38 - "[...slug]/route.ts"
Cohesion: 0.29
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 39 - "next.config.ts"
Cohesion: 0.33
Nodes (3): dirname, __filename, nextConfig

### Community 40 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 41 - "Backup do banco"
Cohesion: 0.50
Nodes (3): Backup do banco, Ligar (uma vez), Restaurar

### Community 45 - "engines"
Cohesion: 0.67
Nodes (3): engines, node, pnpm

### Community 46 - "LojaAoVivo.tsx"
Cohesion: 0.33
Nodes (6): @payloadcms/live-preview-react, CategoriaView, LojaAoVivo(), LojaDados, url(), Loja

## Knowledge Gaps
- **14 isolated node(s):** `@payloadcms/ui`, `cross-env`, `graphql`, `react-dom`, `@testing-library/react` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 371 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `painel/actions.ts`, `fotoMaquininha.ts`, `cliente-actions.ts`, `FecharConta.tsx`, `Cardapio`, `gruposDoProduto`, `package.json`, `planilha.ts`, `@payloadcms/next`, `(frontend)/layout.tsx`, `exemplo.ts`, `brl`, `[loja]/page.tsx`, `SeusPedidos.tsx`, `loja/page.tsx`, `financeiro/page.tsx`, `FormLoja.tsx`, `payload`, `garcons/page.tsx`, `next.config.ts`, `next`, `privacidade/page.tsx`, `(frontend)/page.tsx`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **What connects `@payloadcms/ui`, `cross-env`, `graphql` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `painel/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12955465587044535 - nodes in this community are weakly interconnected._
- **Why does `@payloadcms/db-postgres` connect `@payloadcms/db-postgres` to `package.json`, `payload.config.ts`, `Users.ts`, `index.ts`, `20261008_112229_capa_da_loja.ts`, `20261008_123138_formas_pagamento.ts`, `20261008_123734_clientes.ts`, `20261008_125107_aceite_cliente.ts`, `20261008_132134_chave_pix.ts`, `20261008_134615_codigo_retirada.ts`, `20261008_171019_bairros_entrega.ts`, `20261008_171738_opcoes_produto.ts`, `20261008_182549_selos_produto.ts`, `20261008_182940_repetir_pedido.ts`, `20261008_184808_cupons.ts`, `20261008_185816_agendamento_pedidos.ts`, `20261008_190223_carrinhos_abandonados.ts`, `20261008_190612_pixels_anuncios.ts`, `20261008_192057_pedido_balcao.ts`, `20261008_192626_mesas_qrcode.ts`, `20261008_193017_entregadores.ts`, `20261008_202042_garcons.ts`, `20261008_202353_garcom_no_pedido.ts`, `20261008_202743_mesa_sem_garcom.ts`, `20261008_203548_fechar_conta.ts`, `20261008_204852_acerto_entregador.ts`, `20261008_205540_financeiro.ts`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Should `fotoMaquininha.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06293706293706294 - nodes in this community are weakly interconnected._
- **Why does `react` connect `FormLoja.tsx` to `garcons/page.tsx`, `fotoMaquininha.ts`, `next`, `cliente-actions.ts`, `FecharConta.tsx`, `Cardapio`, `gruposDoProduto`, `package.json`, `planilha.ts`, `@payloadcms/next`, `(frontend)/layout.tsx`, `exemplo.ts`, `brl`, `(frontend)/actions.ts`, `[loja]/page.tsx`, `SeusPedidos.tsx`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.09805735430157261 - nodes in this community are weakly interconnected._