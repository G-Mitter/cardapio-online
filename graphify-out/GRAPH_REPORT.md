# Graph Report - cardapio-online  (2026-10-16)

## Corpus Check
- 219 files · ~346,521 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .csv 11, .css 2, .example 1)

## Summary
- 1001 nodes · 2648 edges · 81 communities (47 shown, 34 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a46e227f`
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
- financeiro/page.tsx
- carrinhos/page.tsx
- exemplo.ts
- brl
- brl
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
- lerPreco
- sugestoes.ts
- Lojas.ts
- maquininha.ts
- planilha.ts
- cupons/page.tsx
- index.ts
- seed.ts
- @payloadcms/db-postgres
- [...slug]/route.ts
- next.config.ts
- .prettierrc.json
- Backup do banco
- exemplo/actions.ts
- vitest
- eslint.config.mjs
- engines
- montarRota
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- dotenv
- LEIA-ME.md
- criarPedido
- produtos/page.tsx
- garcons/page.tsx
- exemplo/page.tsx

## God Nodes (most connected - your core abstractions)
1. `sessao()` - 73 edges
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
- `grupos()` --calls--> `lerOpcoes()`  [EXTRACTED]
  tests/int/opcoes.int.spec.ts → src/lib/opcoes.ts
- `produtos()` --calls--> `gruposDoProduto()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/opcoes.ts
- `confirmar()` --indirect_call--> `chave()`  [INFERRED]
  src/components/painel/Apagar.tsx → src/components/ContaDaMesa.tsx
- `produtos()` --calls--> `lerTabela()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/exemplo.ts

## Import Cycles
- None detected.

## Communities (81 total, 34 thin omitted)

### Community 0 - "painel/actions.ts"
Cohesion: 0.16
Nodes (30): apagarCategoria(), apagarCupom(), apagarLancamento(), apagarProduto(), DadosPedidoPainel, entrar(), imagem(), lerHorarioDoForm() (+22 more)

### Community 1 - "fotoMaquininha.ts"
Cohesion: 0.09
Nodes (40): tesseract.js, lerFotoNoGoogle(), ResultadoFoto, totalCartaoDoDia(), Maquininha(), metadata, ConferirMaquininha(), dataBr() (+32 more)

### Community 2 - "next"
Cohesion: 0.06
Nodes (42): next, classica, leve, metadata, moderna, tradicional, passos, recursos (+34 more)

### Community 3 - "payload-types.ts"
Cohesion: 0.05
Nodes (39): Acerto, AcertosSelect, Auth, Carrinho, CarrinhosSelect, Categoria, CategoriasSelect, Cliente (+31 more)

### Community 4 - "cliente-actions.ts"
Cohesion: 0.19
Nodes (22): adicionarEndereco(), buscarLoja(), cadastrarCliente(), corrigirEndereco(), EnderecoResumo, Identificacao, identificarCliente(), lerEndereco() (+14 more)

### Community 5 - "FecharConta.tsx"
Cohesion: 0.11
Nodes (29): qrcode, fecharContaDaMesa(), MesaDoGarcom(), metadata, metadata, TelaDoGarcom(), Mesas(), metadata (+21 more)

### Community 6 - "Cardapio"
Cohesion: 0.13
Nodes (24): aplicarCupom(), buscarCupom(), conferirItens(), criarPedidoMesa(), guardarCarrinho(), pedirDeNovo(), repetirUltimoPedido(), texto() (+16 more)

### Community 7 - "gruposDoProduto"
Cohesion: 0.13
Nodes (27): criarPedidoDaMesa(), criarPedidoPainel(), editarPedido(), EditarPedido(), metadata, metadata, NovoPedidoPagina(), chaveDe() (+19 more)

### Community 8 - "package.json"
Cohesion: 0.08
Nodes (24): description, license, name, private, type, version, cross-env, eslint (+16 more)

### Community 9 - "payload.config.ts"
Cohesion: 0.18
Nodes (16): payload, logado(), soAdmin(), Acertos, Carrinhos, Clientes, Cupons, Entregadores (+8 more)

### Community 10 - "Importador.tsx"
Cohesion: 0.16
Nodes (18): read-excel-file, Importar(), metadata, Importador(), confirmar(), escolher(), lerArquivo(), Loja (+10 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 12 - "@payloadcms/next"
Cohesion: 0.11
Nodes (10): @payloadcms/next, @payloadcms/plugin-multi-tenant, @payloadcms/storage-vercel-blob, importMap, Args, Args, GET, OPTIONS (+2 more)

### Community 13 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, cross-env, dotenv, graphql, next, payload, @payloadcms/db-postgres, @payloadcms/live-preview-react (+11 more)

### Community 14 - "financeiro/page.tsx"
Cohesion: 0.24
Nodes (17): baixarLancamento(), dataBr(), Financeiro(), metadata, ROTULO_SITUACAO, hojeEmBrasilia(), alertas(), c() (+9 more)

### Community 15 - "carrinhos/page.tsx"
Cohesion: 0.25
Nodes (10): apagarCarrinho(), Carrinhos(), metadata, APAGAR_APOS_DIAS, emMinutosAtras(), mensagemRecuperacao(), PARADO_APOS_MINUTOS, resumoDosItens() (+2 more)

### Community 16 - "exemplo.ts"
Cohesion: 0.12
Nodes (23): ATENDIMENTOS, ContextoPlano, datar(), Dono, emParalelo(), gravarExemplo(), montarRelatorioExemplo(), dm() (+15 more)

### Community 17 - "brl"
Cohesion: 0.39
Nodes (5): centavos(), descontoDePromocoes(), Promocao, promocaoDoProduto(), rotuloPromocao()

### Community 18 - "brl"
Cohesion: 0.27
Nodes (16): fazerAcerto(), mudarPagamentoDoPedido(), Entregadores(), metadata, AcertoEntregador(), calcularAcerto(), diferencaDoAcerto(), EntregaFeita (+8 more)

### Community 19 - "Cadastrar um cliente novo"
Cohesion: 0.13
Nodes (13): 1. Criar a loja (5 min), 2. Criar o login do dono (2 min), 3. Importar os produtos (5 a 15 min), 4. Conferir o cardápio (5 min), 5. Entregar ao cliente, Antes de começar, peça ao cliente, Cadastrar um cliente novo, Cadastrar um cliente novo (+5 more)

### Community 20 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, jsdom, prettier, @testing-library/react, tsx, @types/node (+7 more)

### Community 21 - "(frontend)/actions.ts"
Cohesion: 0.22
Nodes (14): contaAberta(), contaDaMesa, DadosPedido, ItemParaConferir, lojaEMesa(), pedirContaDaMesa(), ResultadoCupom, ResultadoMesa (+6 more)

### Community 22 - "[loja]/page.tsx"
Cohesion: 0.38
Nodes (5): buscarLoja, generateMetadata(), PaginaDaLoja(), Props, revalidate

### Community 23 - "SeusPedidos.tsx"
Cohesion: 0.31
Nodes (9): inscrever(), SeusPedidos(), usePedidosLocais(), comPedidoNovo(), ehNumero(), lerPedidosLocais(), MAX_PEDIDOS_LOCAIS, PedidoLocal (+1 more)

### Community 24 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, dev, devsafe, generate:importmap, generate:types, lint, payload (+5 more)

### Community 25 - "loja/page.tsx"
Cohesion: 0.27
Nodes (8): metadata, MinhaLoja(), url(), lerSelos(), rotulosDosSelos(), Selo, SELOS, Media

### Community 26 - "financeiro/page.tsx"
Cohesion: 0.07
Nodes (53): react, Estado, Entrar(), Categorias(), metadata, LayoutLogado(), MENU, MENU_GARCOM (+45 more)

### Community 27 - "FormLoja.tsx"
Cohesion: 0.21
Nodes (11): @payloadcms/live-preview-react, CategoriaView, LojaAoVivo(), LojaDados, url(), COR_PADRAO, corValida(), Fonte (+3 more)

### Community 29 - "lerPreco"
Cohesion: 0.19
Nodes (17): escolhasPorNome(), inteiro(), lerEntregue(), lerItens(), lerProdutosExemplo(), lerRecebido(), lerTabela(), planejar() (+9 more)

### Community 30 - "sugestoes.ts"
Cohesion: 0.33
Nodes (4): C, P, sugerir(), cardapio

### Community 31 - "Lojas.ts"
Cohesion: 0.31
Nodes (5): todos(), Categorias, Lojas, Produtos, hooksDeCardapio

### Community 32 - "maquininha.ts"
Cohesion: 0.20
Nodes (16): conferirMaquininha(), acharColuna(), centavos(), COLUNAS, conferir(), LeituraRelatorio, lerDataHora(), lerRelatorio() (+8 more)

### Community 33 - "planilha.ts"
Cohesion: 0.19
Nodes (12): Bairro, bairrosComoTexto(), lerBairros(), taxaDoBairro(), COLUNAS, Leitura, lerProdutos(), LinhaProduto (+4 more)

### Community 34 - "cupons/page.tsx"
Cohesion: 0.27
Nodes (11): Cupons(), dataBr(), metadata, brl(), centavos(), Cupom, descontoDoCupom(), diaDoFim() (+3 more)

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

### Community 42 - "exemplo/actions.ts"
Cohesion: 0.29
Nodes (9): importarExemplo(), permitido(), relatorioMaquininhaExemplo(), ImportarExemplo(), baixarRelatorio(), importar(), Retorno, ResultadoExemplo (+1 more)

### Community 43 - "vitest"
Cohesion: 0.26
Nodes (8): vitest, textoDoArquivo(), Pixels(), ComPixels, lerPixelMeta(), lerTagGoogle(), scriptGoogle(), scriptMeta()

### Community 45 - "engines"
Cohesion: 0.67
Nodes (3): engines, node, pnpm

### Community 46 - "montarRota"
Cohesion: 0.27
Nodes (8): atribuirEntregador(), chaveGoogle(), montarRota(), ordemGoogle(), MontarRota(), comCidade(), linkMaps(), MAX_PARADAS

### Community 77 - "criarPedido"
Cohesion: 0.33
Nodes (7): criarPedido(), lerAgendamento(), limitesDoCampo(), MAX_DIAS, MIN_MINUTOS, rotuloAgendamento(), agora

### Community 78 - "produtos/page.tsx"
Cohesion: 0.28
Nodes (6): marcarEsgotado(), moverProduto(), metadata, Produtos(), Apagavel(), mover()

### Community 79 - "garcons/page.tsx"
Cohesion: 0.36
Nodes (6): ligarGarcom(), mudarGarcom(), trocarSenhaGarcom(), Garcons(), metadata, CampoUsuario()

### Community 80 - "exemplo/page.tsx"
Cohesion: 0.50
Nodes (4): ehAdmin(), Exemplo(), maxDuration, metadata

## Knowledge Gaps
- **14 isolated node(s):** `@payloadcms/ui`, `cross-env`, `graphql`, `react-dom`, `@testing-library/react` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 371 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `painel/actions.ts`, `fotoMaquininha.ts`, `FecharConta.tsx`, `Cardapio`, `gruposDoProduto`, `package.json`, `Importador.tsx`, `@payloadcms/next`, `financeiro/page.tsx`, `carrinhos/page.tsx`, `brl`, `[loja]/page.tsx`, `SeusPedidos.tsx`, `loja/page.tsx`, `financeiro/page.tsx`, `Lojas.ts`, `cupons/page.tsx`, `next.config.ts`, `exemplo/actions.ts`, `vitest`, `produtos/page.tsx`, `garcons/page.tsx`, `exemplo/page.tsx`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **What connects `@payloadcms/ui`, `cross-env`, `graphql` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `fotoMaquininha.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08503401360544217 - nodes in this community are weakly interconnected._
- **Why does `@payloadcms/db-postgres` connect `@payloadcms/db-postgres` to `package.json`, `payload.config.ts`, `exemplo.ts`, `index.ts`, `20261008_112229_capa_da_loja.ts`, `20261008_123138_formas_pagamento.ts`, `20261008_123734_clientes.ts`, `20261008_125107_aceite_cliente.ts`, `20261008_132134_chave_pix.ts`, `20261008_134615_codigo_retirada.ts`, `20261008_171019_bairros_entrega.ts`, `20261008_171738_opcoes_produto.ts`, `20261008_182549_selos_produto.ts`, `20261008_182940_repetir_pedido.ts`, `20261008_184808_cupons.ts`, `20261008_185816_agendamento_pedidos.ts`, `20261008_190223_carrinhos_abandonados.ts`, `20261008_190612_pixels_anuncios.ts`, `20261008_192057_pedido_balcao.ts`, `20261008_192626_mesas_qrcode.ts`, `20261008_193017_entregadores.ts`, `20261008_202042_garcons.ts`, `20261008_202353_garcom_no_pedido.ts`, `20261008_202743_mesa_sem_garcom.ts`, `20261008_203548_fechar_conta.ts`, `20261008_204852_acerto_entregador.ts`, `20261008_205540_financeiro.ts`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.06120218579234973 - nodes in this community are weakly interconnected._
- **Why does `react` connect `financeiro/page.tsx` to `fotoMaquininha.ts`, `next`, `cliente-actions.ts`, `FecharConta.tsx`, `Cardapio`, `gruposDoProduto`, `package.json`, `Importador.tsx`, `exemplo/actions.ts`, `@payloadcms/next`, `garcons/page.tsx`, `brl`, `(frontend)/actions.ts`, `[loja]/page.tsx`, `SeusPedidos.tsx`, `FormLoja.tsx`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `payload-types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._