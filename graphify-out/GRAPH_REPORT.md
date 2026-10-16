# Graph Report - cardapio-online  (2026-10-16)

## Corpus Check
- 219 files · ~346,669 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .csv 11, .css 2, .example 1)

## Summary
- 1002 nodes · 2649 edges · 68 communities (35 shown, 33 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `13672f61`
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
- Importador.tsx
- compilerOptions
- @payloadcms/next
- dependencies
- (frontend)/layout.tsx
- opcoes.ts
- exemplo.ts
- pedido.ts
- Cadastrar um cliente novo
- devDependencies
- ContaDaMesa.tsx
- SeusPedidos.tsx
- scripts
- FormLoja.tsx
- Users.ts
- normalizar
- sugestoes.ts
- maquininha.ts
- lerPreco
- cupons/page.tsx
- index.ts
- seed.ts
- @payloadcms/db-postgres
- [...slug]/route.ts
- .prettierrc.json
- Backup do banco
- exemplo/actions.ts
- Media.ts
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- LEIA-ME.md
- criarPedido

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
- `produtos()` --calls--> `lerOpcoes()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/opcoes.ts
- `produtos()` --calls--> `gruposDoProduto()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/opcoes.ts
- `grupos()` --calls--> `gruposDoProduto()`  [EXTRACTED]
  tests/int/opcoes.int.spec.ts → src/lib/opcoes.ts
- `copiar()` --indirect_call--> `chave()`  [INFERRED]
  src/components/Cardapio.tsx → src/components/ContaDaMesa.tsx
- `confirmar()` --indirect_call--> `chave()`  [INFERRED]
  src/components/painel/Apagar.tsx → src/components/ContaDaMesa.tsx

## Import Cycles
- None detected.

## Communities (68 total, 33 thin omitted)

### Community 0 - "painel/actions.ts"
Cohesion: 0.05
Nodes (87): react, apagarCarrinho(), apagarCategoria(), apagarCupom(), apagarLancamento(), apagarProduto(), baixarLancamento(), chaveGoogle() (+79 more)

### Community 1 - "fotoMaquininha.ts"
Cohesion: 0.05
Nodes (70): Estado, Carrinhos(), metadata, Categorias(), Cupons(), dataBr(), metadata, lerFotoNoGoogle() (+62 more)

### Community 2 - "next"
Cohesion: 0.07
Nodes (43): next, passos, recursos, atribuirEntregador(), mudarStatus(), Rota, metadata, Cozinha() (+35 more)

### Community 3 - "payload-types.ts"
Cohesion: 0.05
Nodes (39): Acerto, AcertosSelect, Auth, Carrinho, CarrinhosSelect, Categoria, CategoriasSelect, Cliente (+31 more)

### Community 4 - "cliente-actions.ts"
Cohesion: 0.21
Nodes (21): adicionarEndereco(), buscarLoja(), cadastrarCliente(), corrigirEndereco(), EnderecoResumo, Identificacao, identificarCliente(), lerEndereco() (+13 more)

### Community 5 - "FecharConta.tsx"
Cohesion: 0.09
Nodes (35): qrcode, fecharContaDaMesa(), MesaDoGarcom(), metadata, metadata, TelaDoGarcom(), LayoutLogado(), MENU (+27 more)

### Community 6 - "Cardapio"
Cohesion: 0.14
Nodes (23): aplicarCupom(), conferirItens(), criarPedidoMesa(), DadosPedido, guardarCarrinho(), ItemParaConferir, pedirDeNovo(), repetirUltimoPedido() (+15 more)

### Community 7 - "gruposDoProduto"
Cohesion: 0.21
Nodes (14): criarPedidoDaMesa(), criarPedidoPainel(), DadosPedidoPainel, EditarPedido(), metadata, metadata, NovoPedidoPagina(), chaveDe() (+6 more)

### Community 8 - "package.json"
Cohesion: 0.06
Nodes (31): eslintConfig, description, engines, node, pnpm, license, name, private (+23 more)

### Community 9 - "payload.config.ts"
Cohesion: 0.15
Nodes (20): payload, ehAdmin(), logado(), soAdmin(), todos(), Acertos, Carrinhos, Categorias (+12 more)

### Community 10 - "Importador.tsx"
Cohesion: 0.15
Nodes (19): read-excel-file, Importar(), metadata, Importador(), confirmar(), escolher(), lerArquivo(), Loja (+11 more)

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

### Community 15 - "opcoes.ts"
Cohesion: 0.38
Nodes (5): GrupoDaTela, GrupoNovo, ItemOpcao, lerOpcoes(), grupos()

### Community 16 - "exemplo.ts"
Cohesion: 0.10
Nodes (35): ATENDIMENTOS, ContextoPlano, datar(), Dono, emParalelo(), gravarExemplo(), montarRelatorioExemplo(), dm() (+27 more)

### Community 17 - "pedido.ts"
Cohesion: 0.19
Nodes (11): centavos(), ItemEscolhido, lerCpf(), MAX_QUANTIDADE, Modo, centavos(), descontoDePromocoes(), Promocao (+3 more)

### Community 19 - "Cadastrar um cliente novo"
Cohesion: 0.13
Nodes (13): 1. Criar a loja (5 min), 2. Criar o login do dono (2 min), 3. Importar os produtos (5 a 15 min), 4. Conferir o cardápio (5 min), 5. Entregar ao cliente, Antes de começar, peça ao cliente, Cadastrar um cliente novo, Cadastrar um cliente novo (+5 more)

### Community 20 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, jsdom, prettier, @testing-library/react, tsx, @types/node (+7 more)

### Community 21 - "ContaDaMesa.tsx"
Cohesion: 0.36
Nodes (9): contaAberta(), contaDaMesa, lojaEMesa(), pedirContaDaMesa(), PagarComPix(), copiar(), chave(), ContaDaMesa() (+1 more)

### Community 23 - "SeusPedidos.tsx"
Cohesion: 0.19
Nodes (15): Foto, Linha, LojaView, ProdutoView, ClienteEscolhido, inscrever(), SeusPedidos(), usePedidosLocais() (+7 more)

### Community 24 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, dev, devsafe, generate:importmap, generate:types, lint, payload (+5 more)

### Community 26 - "FormLoja.tsx"
Cohesion: 0.06
Nodes (53): @payloadcms/live-preview-react, buscarLoja, generateMetadata(), PaginaDaLoja(), Props, revalidate, metadata, MinhaLoja() (+45 more)

### Community 29 - "normalizar"
Cohesion: 0.48
Nodes (5): lerBairros(), taxaDoBairro(), sim(), normalizar(), bairros

### Community 30 - "sugestoes.ts"
Cohesion: 0.29
Nodes (5): vitest, C, P, sugerir(), cardapio

### Community 32 - "maquininha.ts"
Cohesion: 0.21
Nodes (15): conferirMaquininha(), acharColuna(), centavos(), COLUNAS, conferir(), LeituraRelatorio, lerDataHora(), lerRelatorio() (+7 more)

### Community 33 - "lerPreco"
Cohesion: 0.24
Nodes (12): fazerAcerto(), AcertoEntregador(), calcularAcerto(), diferencaDoAcerto(), EntregaParaAcerto, COLUNAS, Leitura, lerPreco() (+4 more)

### Community 34 - "cupons/page.tsx"
Cohesion: 0.33
Nodes (8): buscarCupom(), brl(), centavos(), Cupom, descontoDoCupom(), normalizarCodigo(), rotuloDoCupom(), base

### Community 36 - "seed.ts"
Cohesion: 0.29
Nodes (3): cardapio, fotos, pasta

### Community 38 - "[...slug]/route.ts"
Cohesion: 0.14
Nodes (9): dirname, __filename, nextConfig, DELETE, GET, OPTIONS, PATCH, POST (+1 more)

### Community 40 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 41 - "Backup do banco"
Cohesion: 0.50
Nodes (3): Backup do banco, Ligar (uma vez), Restaurar

### Community 42 - "exemplo/actions.ts"
Cohesion: 0.20
Nodes (13): importarExemplo(), permitido(), relatorioMaquininhaExemplo(), Exemplo(), maxDuration, metadata, ImportarExemplo(), baixarRelatorio() (+5 more)

### Community 77 - "criarPedido"
Cohesion: 0.33
Nodes (7): criarPedido(), lerAgendamento(), limitesDoCampo(), MAX_DIAS, MIN_MINUTOS, rotuloAgendamento(), agora

## Knowledge Gaps
- **14 isolated node(s):** `@payloadcms/ui`, `cross-env`, `graphql`, `react-dom`, `@testing-library/react` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 371 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `painel/actions.ts`, `fotoMaquininha.ts`, `lerPreco`, `FecharConta.tsx`, `[...slug]/route.ts`, `gruposDoProduto`, `package.json`, `payload.config.ts`, `exemplo/actions.ts`, `Importador.tsx`, `@payloadcms/next`, `(frontend)/layout.tsx`, `SeusPedidos.tsx`, `FormLoja.tsx`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **What connects `@payloadcms/ui`, `cross-env`, `graphql` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `painel/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05037531276063386 - nodes in this community are weakly interconnected._
- **Why does `@payloadcms/db-postgres` connect `@payloadcms/db-postgres` to `package.json`, `payload.config.ts`, `exemplo.ts`, `index.ts`, `20261008_112229_capa_da_loja.ts`, `20261008_123138_formas_pagamento.ts`, `20261008_123734_clientes.ts`, `20261008_125107_aceite_cliente.ts`, `20261008_132134_chave_pix.ts`, `20261008_134615_codigo_retirada.ts`, `20261008_171019_bairros_entrega.ts`, `20261008_171738_opcoes_produto.ts`, `20261008_182549_selos_produto.ts`, `20261008_182940_repetir_pedido.ts`, `20261008_184808_cupons.ts`, `20261008_185816_agendamento_pedidos.ts`, `20261008_190223_carrinhos_abandonados.ts`, `20261008_190612_pixels_anuncios.ts`, `20261008_192057_pedido_balcao.ts`, `20261008_192626_mesas_qrcode.ts`, `20261008_193017_entregadores.ts`, `20261008_202042_garcons.ts`, `20261008_202353_garcom_no_pedido.ts`, `20261008_202743_mesa_sem_garcom.ts`, `20261008_203548_fechar_conta.ts`, `20261008_204852_acerto_entregador.ts`, `20261008_205540_financeiro.ts`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Should `fotoMaquininha.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05070028011204482 - nodes in this community are weakly interconnected._
- **Why does `react` connect `painel/actions.ts` to `lerPreco`, `fotoMaquininha.ts`, `next`, `cliente-actions.ts`, `FecharConta.tsx`, `gruposDoProduto`, `package.json`, `Importador.tsx`, `exemplo/actions.ts`, `@payloadcms/next`, `(frontend)/layout.tsx`, `ContaDaMesa.tsx`, `SeusPedidos.tsx`, `FormLoja.tsx`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.06838106370543542 - nodes in this community are weakly interconnected._