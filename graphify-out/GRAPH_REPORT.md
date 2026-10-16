# Graph Report - cardapio-online  (2026-10-16)

## Corpus Check
- 205 files · ~341,501 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .csv 11, .css 2, .example 1)

## Summary
- 944 nodes · 2433 edges · 77 communities (41 shown, 36 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8b8ff495`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- painel/actions.ts
- fotoMaquininha.ts
- PainelPedidos.tsx
- payload-types.ts
- cliente-actions.ts
- painel.ts
- Cardapio.tsx
- gruposDoProduto
- package.json
- payload.config.ts
- normalizar
- compilerOptions
- @payloadcms/next
- dependencies
- next
- planejar
- exemplo/actions.ts
- exemplo.ts
- pedido.ts
- Cadastrar um cliente novo
- devDependencies
- (frontend)/actions.ts
- [loja]/page.tsx
- SeusPedidos.tsx
- scripts
- loja/page.tsx
- react
- FormLoja.tsx
- exemplo-db.ts
- lerPreco
- vitest
- Lojas.ts
- pixel.ts
- agendamento.ts
- cupom.ts
- index.ts
- seed.ts
- @payloadcms/db-postgres
- [...slug]/route.ts
- next.config.ts
- .prettierrc.json
- Backup do banco
- painel/layout.tsx
- Media.ts
- eslint.config.mjs
- engines
- graphql/route.ts
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- dotenv
- LEIA-ME.md

## God Nodes (most connected - your core abstractions)
1. `sessao()` - 72 edges
2. `brl()` - 47 edges
3. `next` - 45 edges
4. `Cardapio()` - 34 edges
5. `lerPreco()` - 31 edges
6. `@payloadcms/db-postgres` - 30 edges
7. `planejar()` - 30 edges
8. `gruposDoProduto()` - 29 edges
9. `payload` - 26 edges
10. `vitest` - 26 edges

## Surprising Connections (you probably didn't know these)
- `produtos()` --calls--> `lerTabela()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/exemplo.ts
- `grupos()` --calls--> `lerOpcoes()`  [EXTRACTED]
  tests/int/opcoes.int.spec.ts → src/lib/opcoes.ts
- `produtos()` --calls--> `gruposDoProduto()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/opcoes.ts
- `grupos()` --calls--> `gruposDoProduto()`  [EXTRACTED]
  tests/int/opcoes.int.spec.ts → src/lib/opcoes.ts
- `copiar()` --indirect_call--> `chave()`  [INFERRED]
  src/components/Cardapio.tsx → src/components/ContaDaMesa.tsx

## Import Cycles
- None detected.

## Communities (77 total, 36 thin omitted)

### Community 0 - "painel/actions.ts"
Cohesion: 0.06
Nodes (88): qrcode, apagarCarrinho(), apagarCategoria(), apagarCupom(), apagarLancamento(), apagarProduto(), baixarLancamento(), chaveGoogle() (+80 more)

### Community 1 - "fotoMaquininha.ts"
Cohesion: 0.06
Nodes (55): tesseract.js, conferirMaquininha(), lerFotoNoGoogle(), ResultadoFoto, totalCartaoDoDia(), Maquininha(), metadata, ConferirMaquininha() (+47 more)

### Community 2 - "PainelPedidos.tsx"
Cohesion: 0.10
Nodes (34): atribuirEntregador(), mudarStatus(), Rota, Cozinha(), metadata, metadata, Pedidos(), ConferirCodigo() (+26 more)

### Community 3 - "payload-types.ts"
Cohesion: 0.05
Nodes (39): Acerto, AcertosSelect, Auth, Carrinho, CarrinhosSelect, Categoria, CategoriasSelect, Cliente (+31 more)

### Community 4 - "cliente-actions.ts"
Cohesion: 0.13
Nodes (29): adicionarEndereco(), buscarLoja(), cadastrarCliente(), corrigirEndereco(), EnderecoResumo, Identificacao, identificarCliente(), lerEndereco() (+21 more)

### Community 5 - "painel.ts"
Cohesion: 0.11
Nodes (27): fecharContaDaMesa(), metadata, TelaDoGarcom(), LayoutLogado(), MENU, MENU_GARCOM, Mesas(), metadata (+19 more)

### Community 6 - "Cardapio.tsx"
Cohesion: 0.12
Nodes (27): aplicarCupom(), buscarCupom(), conferirItens(), criarPedido(), criarPedidoMesa(), guardarCarrinho(), pedirDeNovo(), repetirUltimoPedido() (+19 more)

### Community 7 - "gruposDoProduto"
Cohesion: 0.16
Nodes (23): criarPedidoDaMesa(), criarPedidoPainel(), DadosPedidoPainel, editarPedido(), EditarPedido(), metadata, MesaDoGarcom(), metadata (+15 more)

### Community 8 - "package.json"
Cohesion: 0.08
Nodes (24): description, license, name, private, type, version, cross-env, eslint (+16 more)

### Community 9 - "payload.config.ts"
Cohesion: 0.20
Nodes (15): payload, ehAdmin(), logado(), soAdmin(), Acertos, Carrinhos, Clientes, Cupons (+7 more)

### Community 10 - "normalizar"
Cohesion: 0.17
Nodes (18): read-excel-file, Importar(), metadata, Importador(), confirmar(), escolher(), lerArquivo(), Loja (+10 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 12 - "@payloadcms/next"
Cohesion: 0.13
Nodes (8): @payloadcms/next, @payloadcms/plugin-multi-tenant, @payloadcms/storage-vercel-blob, importMap, Args, Args, GET, Args

### Community 13 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, cross-env, dotenv, graphql, next, payload, @payloadcms/db-postgres, @payloadcms/live-preview-react (+11 more)

### Community 14 - "next"
Cohesion: 0.11
Nodes (10): next, classica, leve, metadata, moderna, tradicional, passos, recursos (+2 more)

### Community 15 - "planejar"
Cohesion: 0.17
Nodes (16): escolhasPorNome(), inteiro(), lerEntregue(), lerItens(), lerProdutosExemplo(), lerRecebido(), planejar(), Planilhas (+8 more)

### Community 16 - "exemplo/actions.ts"
Cohesion: 0.19
Nodes (14): importarExemplo(), permitido(), relatorioMaquininhaExemplo(), Exemplo(), maxDuration, metadata, ImportarExemplo(), baixarRelatorio() (+6 more)

### Community 17 - "exemplo.ts"
Cohesion: 0.16
Nodes (15): Bairro, lerBairros(), taxaDoBairro(), ATENDIMENTOS, ContextoPlano, dm(), Erro, ItemLido (+7 more)

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
Cohesion: 0.26
Nodes (11): contaAberta(), contaDaMesa, DadosPedido, ItemParaConferir, lojaEMesa(), pedirContaDaMesa(), ResultadoCupom, ResultadoRepetir (+3 more)

### Community 22 - "[loja]/page.tsx"
Cohesion: 0.21
Nodes (11): @payloadcms/live-preview-react, buscarLoja, generateMetadata(), PaginaDaLoja(), Props, revalidate, CategoriaView, LojaAoVivo() (+3 more)

### Community 23 - "SeusPedidos.tsx"
Cohesion: 0.27
Nodes (10): inscrever(), SeusPedidos(), usePedidosLocais(), Escolhas, comPedidoNovo(), ehNumero(), lerPedidosLocais(), MAX_PEDIDOS_LOCAIS (+2 more)

### Community 24 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, dev, devsafe, generate:importmap, generate:types, lint, payload (+5 more)

### Community 25 - "loja/page.tsx"
Cohesion: 0.27
Nodes (9): metadata, MinhaLoja(), url(), bairrosComoTexto(), promocaoDoProduto(), lerSelos(), rotulosDosSelos(), Selo (+1 more)

### Community 26 - "react"
Cohesion: 0.33
Nodes (8): react, metadata, Produto(), reais(), CampoComExemplo(), CampoImagem(), reduzir(), opcoesComoTexto()

### Community 27 - "FormLoja.tsx"
Cohesion: 0.31
Nodes (9): bairrosDaPrevia(), DadosLoja, FormLoja(), reais(), COR_PADRAO, corValida(), Fonte, FONTES (+1 more)

### Community 28 - "exemplo-db.ts"
Cohesion: 0.29
Nodes (9): datar(), Dono, emParalelo(), gravarExemplo(), lerTabela(), momento(), Nome, VendaCartao (+1 more)

### Community 29 - "lerPreco"
Cohesion: 0.25
Nodes (9): COLUNAS, ErroLinha, Leitura, lerCsv(), lerPreco(), lerProdutos(), LinhaProduto, MAX_LINHAS (+1 more)

### Community 30 - "vitest"
Cohesion: 0.22
Nodes (6): vitest, C, P, sugerir(), grupos(), cardapio

### Community 31 - "Lojas.ts"
Cohesion: 0.31
Nodes (5): todos(), Categorias, Lojas, Produtos, hooksDeCardapio

### Community 32 - "pixel.ts"
Cohesion: 0.39
Nodes (6): Pixels(), ComPixels, lerPixelMeta(), lerTagGoogle(), scriptGoogle(), scriptMeta()

### Community 33 - "agendamento.ts"
Cohesion: 0.36
Nodes (6): lerAgendamento(), limitesDoCampo(), MAX_DIAS, MIN_MINUTOS, rotuloAgendamento(), agora

### Community 34 - "cupom.ts"
Cohesion: 0.43
Nodes (6): brl(), centavos(), Cupom, descontoDoCupom(), rotuloDoCupom(), base

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

## Knowledge Gaps
- **14 isolated node(s):** `@payloadcms/ui`, `cross-env`, `graphql`, `react-dom`, `@testing-library/react` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 362 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `painel/actions.ts`, `fotoMaquininha.ts`, `PainelPedidos.tsx`, `cliente-actions.ts`, `painel.ts`, `Cardapio.tsx`, `gruposDoProduto`, `package.json`, `normalizar`, `@payloadcms/next`, `exemplo/actions.ts`, `[loja]/page.tsx`, `SeusPedidos.tsx`, `loja/page.tsx`, `react`, `Lojas.ts`, `pixel.ts`, `next.config.ts`, `painel/layout.tsx`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **What connects `@payloadcms/ui`, `cross-env`, `graphql` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `painel/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.056064690026954175 - nodes in this community are weakly interconnected._
- **Why does `@payloadcms/db-postgres` connect `@payloadcms/db-postgres` to `package.json`, `payload.config.ts`, `exemplo-db.ts`, `index.ts`, `20261008_112229_capa_da_loja.ts`, `20261008_123138_formas_pagamento.ts`, `20261008_123734_clientes.ts`, `20261008_125107_aceite_cliente.ts`, `20261008_132134_chave_pix.ts`, `20261008_134615_codigo_retirada.ts`, `20261008_171019_bairros_entrega.ts`, `20261008_171738_opcoes_produto.ts`, `20261008_182549_selos_produto.ts`, `20261008_182940_repetir_pedido.ts`, `20261008_184808_cupons.ts`, `20261008_185816_agendamento_pedidos.ts`, `20261008_190223_carrinhos_abandonados.ts`, `20261008_190612_pixels_anuncios.ts`, `20261008_192057_pedido_balcao.ts`, `20261008_192626_mesas_qrcode.ts`, `20261008_193017_entregadores.ts`, `20261008_202042_garcons.ts`, `20261008_202353_garcom_no_pedido.ts`, `20261008_202743_mesa_sem_garcom.ts`, `20261008_203548_fechar_conta.ts`, `20261008_204852_acerto_entregador.ts`, `20261008_205540_financeiro.ts`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Should `fotoMaquininha.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06293706293706294 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `painel/actions.ts`, `fotoMaquininha.ts`, `PainelPedidos.tsx`, `cliente-actions.ts`, `painel.ts`, `Cardapio.tsx`, `gruposDoProduto`, `package.json`, `normalizar`, `@payloadcms/next`, `next`, `exemplo/actions.ts`, `(frontend)/actions.ts`, `[loja]/page.tsx`, `SeusPedidos.tsx`, `FormLoja.tsx`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `PainelPedidos.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10336817653890824 - nodes in this community are weakly interconnected._