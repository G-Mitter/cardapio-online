# Graph Report - cardapio-online  (2026-10-16)

## Corpus Check
- 219 files · ~345,906 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .csv 11, .css 2, .example 1)

## Summary
- 999 nodes · 2637 edges · 82 communities (44 shown, 38 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5bec5a35`
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
- brl
- Apagar.tsx
- exemplo.ts
- financeiro/page.tsx
- pedido.ts
- Cadastrar um cliente novo
- devDependencies
- (frontend)/actions.ts
- pixel.ts
- SeusPedidos.tsx
- scripts
- loja/page.tsx
- FormLoja.tsx
- [loja]/page.tsx
- Users.ts
- exemplo/actions.ts
- sugestoes.ts
- payload
- opcoes.ts
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
- produtos/[id]/page.tsx
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- dotenv
- LEIA-ME.md
- cupom.ts
- (frontend)/page.tsx
- painel/layout.tsx
- privacidade/page.tsx
- termos/page.tsx

## God Nodes (most connected - your core abstractions)
1. `sessao()` - 74 edges
2. `brl()` - 47 edges
3. `next` - 46 edges
4. `Cardapio()` - 34 edges
5. `lerPreco()` - 32 edges
6. `@payloadcms/db-postgres` - 30 edges
7. `vitest` - 30 edges
8. `planejar()` - 30 edges
9. `react` - 29 edges
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
- `grupos()` --calls--> `gruposDoProduto()`  [EXTRACTED]
  tests/int/opcoes.int.spec.ts → src/lib/opcoes.ts

## Import Cycles
- None detected.

## Communities (82 total, 38 thin omitted)

### Community 0 - "painel/actions.ts"
Cohesion: 0.16
Nodes (29): apagarLancamento(), entrar(), imagem(), lerHorarioDoForm(), ligarEntregador(), ligarGarcom(), marcado(), mensagem() (+21 more)

### Community 1 - "fotoMaquininha.ts"
Cohesion: 0.06
Nodes (55): tesseract.js, conferirMaquininha(), lerFotoNoGoogle(), ResultadoFoto, totalCartaoDoDia(), Maquininha(), metadata, ConferirMaquininha() (+47 more)

### Community 2 - "next"
Cohesion: 0.07
Nodes (49): vitest, atribuirEntregador(), chaveGoogle(), montarRota(), mudarStatus(), ordemGoogle(), Rota, Cozinha() (+41 more)

### Community 3 - "payload-types.ts"
Cohesion: 0.05
Nodes (39): Acerto, AcertosSelect, Auth, Carrinho, CarrinhosSelect, Categoria, CategoriasSelect, Cliente (+31 more)

### Community 4 - "cliente-actions.ts"
Cohesion: 0.21
Nodes (21): adicionarEndereco(), buscarLoja(), cadastrarCliente(), corrigirEndereco(), EnderecoResumo, Identificacao, identificarCliente(), lerEndereco() (+13 more)

### Community 5 - "FecharConta.tsx"
Cohesion: 0.13
Nodes (23): fecharContaDaMesa(), metadata, TelaDoGarcom(), Mesas(), metadata, Conta, ContasMesas(), FecharConta() (+15 more)

### Community 6 - "Cardapio"
Cohesion: 0.17
Nodes (13): conferirItens(), pedirDeNovo(), repetirUltimoPedido(), Cardapio(), enviar(), enviarMesa(), pedirOutraVez(), repetir() (+5 more)

### Community 7 - "gruposDoProduto"
Cohesion: 0.20
Nodes (18): aplicarCupom(), buscarCupom(), criarPedido(), criarPedidoMesa(), guardarCarrinho(), texto(), criarPedidoDaMesa(), criarPedidoPainel() (+10 more)

### Community 8 - "package.json"
Cohesion: 0.08
Nodes (25): description, license, name, private, type, version, cross-env, eslint (+17 more)

### Community 9 - "payload.config.ts"
Cohesion: 0.19
Nodes (16): payload, ehAdmin(), logado(), soAdmin(), Acertos, Carrinhos, Clientes, Cupons (+8 more)

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

### Community 14 - "brl"
Cohesion: 0.23
Nodes (17): fazerAcerto(), pendentesDoAcerto(), Entregadores(), metadata, Garcons(), metadata, AcertoEntregador(), CampoUsuario() (+9 more)

### Community 15 - "Apagar.tsx"
Cohesion: 0.14
Nodes (22): apagarCategoria(), Estado, marcarEsgotado(), Categorias(), metadata, metadata, Produtos(), adiar() (+14 more)

### Community 16 - "exemplo.ts"
Cohesion: 0.13
Nodes (31): fimDoDia(), Bairro, lerBairros(), taxaDoBairro(), ATENDIMENTOS, ContextoPlano, escolhasPorNome(), inteiro() (+23 more)

### Community 17 - "financeiro/page.tsx"
Cohesion: 0.25
Nodes (16): baixarLancamento(), voltarAoFinanceiro(), dataBr(), Financeiro(), metadata, ROTULO_SITUACAO, alertas(), c() (+8 more)

### Community 18 - "pedido.ts"
Cohesion: 0.17
Nodes (12): centavos(), ItemEscolhido, lerCpf(), MAX_QUANTIDADE, mensagemPedido(), Modo, Pedido, centavos() (+4 more)

### Community 19 - "Cadastrar um cliente novo"
Cohesion: 0.13
Nodes (13): 1. Criar a loja (5 min), 2. Criar o login do dono (2 min), 3. Importar os produtos (5 a 15 min), 4. Conferir o cardápio (5 min), 5. Entregar ao cliente, Antes de começar, peça ao cliente, Cadastrar um cliente novo, Cadastrar um cliente novo (+5 more)

### Community 20 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, jsdom, prettier, @testing-library/react, tsx, @types/node (+7 more)

### Community 21 - "(frontend)/actions.ts"
Cohesion: 0.20
Nodes (14): contaAberta(), contaDaMesa, DadosPedido, ItemParaConferir, lojaEMesa(), pedirContaDaMesa(), ResultadoCupom, ResultadoMesa (+6 more)

### Community 22 - "pixel.ts"
Cohesion: 0.39
Nodes (6): Pixels(), ComPixels, lerPixelMeta(), lerTagGoogle(), scriptGoogle(), scriptMeta()

### Community 23 - "SeusPedidos.tsx"
Cohesion: 0.20
Nodes (14): Foto, Linha, LojaView, ProdutoView, ClienteEscolhido, inscrever(), SeusPedidos(), usePedidosLocais() (+6 more)

### Community 24 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, dev, devsafe, generate:importmap, generate:types, lint, payload (+5 more)

### Community 25 - "loja/page.tsx"
Cohesion: 0.43
Nodes (7): PaginaDaLoja(), metadata, MinhaLoja(), url(), bairrosComoTexto(), promocaoDoProduto(), rotulosDosSelos()

### Community 26 - "FormLoja.tsx"
Cohesion: 0.09
Nodes (34): react, classica, leve, metadata, moderna, tradicional, CampoDinheiro(), CampoImagem() (+26 more)

### Community 27 - "[loja]/page.tsx"
Cohesion: 0.20
Nodes (11): @payloadcms/live-preview-react, buscarLoja, generateMetadata(), Props, revalidate, CategoriaView, LojaAoVivo(), LojaDados (+3 more)

### Community 29 - "exemplo/actions.ts"
Cohesion: 0.20
Nodes (13): importarExemplo(), permitido(), relatorioMaquininhaExemplo(), Exemplo(), maxDuration, metadata, ImportarExemplo(), baixarRelatorio() (+5 more)

### Community 30 - "sugestoes.ts"
Cohesion: 0.33
Nodes (4): C, P, sugerir(), cardapio

### Community 31 - "payload"
Cohesion: 0.24
Nodes (6): todos(), Categorias, Lojas, Media, Produtos, hooksDeCardapio

### Community 32 - "opcoes.ts"
Cohesion: 0.18
Nodes (12): DadosPedidoPainel, metadata, chaveDe(), Linha, Produto, Escolhas, GrupoNovo, GrupoOpcao (+4 more)

### Community 33 - "exemplo-db.ts"
Cohesion: 0.20
Nodes (13): hojeEmBrasilia(), datar(), Dono, emParalelo(), gravarExemplo(), montarRelatorioExemplo(), dm(), Erro (+5 more)

### Community 34 - "cupons/page.tsx"
Cohesion: 0.19
Nodes (12): apagarCupom(), ligarCupom(), Entrar(), metadata, Cupons(), dataBr(), metadata, metadata (+4 more)

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

### Community 42 - "next"
Cohesion: 0.27
Nodes (8): next, trocarLoja(), LayoutLogado(), MENU, MENU_GARCOM, Menu(), COOKIE_LOJA, sessaoGarcom

### Community 43 - "carrinhos/page.tsx"
Cohesion: 0.33
Nodes (8): apagarCarrinho(), Carrinhos(), metadata, APAGAR_APOS_DIAS, emMinutosAtras(), mensagemRecuperacao(), PARADO_APOS_MINUTOS, ItemPedido

### Community 45 - "engines"
Cohesion: 0.67
Nodes (3): engines, node, pnpm

### Community 46 - "produtos/[id]/page.tsx"
Cohesion: 0.25
Nodes (7): apagarProduto(), metadata, Produto(), CampoComExemplo(), lerSelos(), Selo, SELOS

### Community 77 - "cupom.ts"
Cohesion: 0.39
Nodes (7): brl(), centavos(), Cupom, descontoDoCupom(), normalizarCodigo(), rotuloDoCupom(), base

## Knowledge Gaps
- **14 isolated node(s):** `@payloadcms/ui`, `cross-env`, `graphql`, `react-dom`, `@testing-library/react` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 368 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `painel/actions.ts`, `fotoMaquininha.ts`, `next`, `FecharConta.tsx`, `gruposDoProduto`, `package.json`, `planilha.ts`, `@payloadcms/next`, `brl`, `Apagar.tsx`, `financeiro/page.tsx`, `pixel.ts`, `SeusPedidos.tsx`, `loja/page.tsx`, `FormLoja.tsx`, `[loja]/page.tsx`, `exemplo/actions.ts`, `payload`, `opcoes.ts`, `cupons/page.tsx`, `next.config.ts`, `carrinhos/page.tsx`, `produtos/[id]/page.tsx`, `(frontend)/page.tsx`, `painel/layout.tsx`, `privacidade/page.tsx`, `termos/page.tsx`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **What connects `@payloadcms/ui`, `cross-env`, `graphql` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `fotoMaquininha.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06293706293706294 - nodes in this community are weakly interconnected._
- **Why does `@payloadcms/db-postgres` connect `@payloadcms/db-postgres` to `package.json`, `payload.config.ts`, `exemplo-db.ts`, `index.ts`, `20261008_112229_capa_da_loja.ts`, `20261008_123138_formas_pagamento.ts`, `20261008_123734_clientes.ts`, `20261008_125107_aceite_cliente.ts`, `20261008_132134_chave_pix.ts`, `20261008_134615_codigo_retirada.ts`, `20261008_171019_bairros_entrega.ts`, `20261008_171738_opcoes_produto.ts`, `20261008_182549_selos_produto.ts`, `20261008_182940_repetir_pedido.ts`, `20261008_184808_cupons.ts`, `20261008_185816_agendamento_pedidos.ts`, `20261008_190223_carrinhos_abandonados.ts`, `20261008_190612_pixels_anuncios.ts`, `20261008_192057_pedido_balcao.ts`, `20261008_192626_mesas_qrcode.ts`, `20261008_193017_entregadores.ts`, `20261008_202042_garcons.ts`, `20261008_202353_garcom_no_pedido.ts`, `20261008_202743_mesa_sem_garcom.ts`, `20261008_203548_fechar_conta.ts`, `20261008_204852_acerto_entregador.ts`, `20261008_205540_financeiro.ts`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.06874669487043893 - nodes in this community are weakly interconnected._
- **Why does `react` connect `FormLoja.tsx` to `opcoes.ts`, `fotoMaquininha.ts`, `cupons/page.tsx`, `next`, `cliente-actions.ts`, `FecharConta.tsx`, `package.json`, `planilha.ts`, `next`, `@payloadcms/next`, `brl`, `Apagar.tsx`, `produtos/[id]/page.tsx`, `(frontend)/actions.ts`, `SeusPedidos.tsx`, `[loja]/page.tsx`, `exemplo/actions.ts`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `payload-types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._