# Graph Report - cardapio-online  (2026-10-16)

## Corpus Check
- 224 files · ~356,279 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .csv 11, .css 2, .example 1)

## Summary
- 1018 nodes · 2704 edges · 79 communities (43 shown, 36 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `62eafd64`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- painel/actions.ts
- fotoMaquininha.ts
- next
- payload-types.ts
- cliente-actions.ts
- brl
- (frontend)/actions.ts
- gruposDoProduto
- package.json
- payload.config.ts
- planilha.ts
- compilerOptions
- @payloadcms/next
- dependencies
- (frontend)/layout.tsx
- sessao
- exemplo.ts
- pedido.ts
- next
- Cadastrar um cliente novo
- devDependencies
- ContaDaMesa.tsx
- lerMesas
- SeusPedidos.tsx
- scripts
- painel.ts
- FormLoja.tsx
- carrinhos/page.tsx
- [loja]/page.tsx
- Cardapio
- sugestoes.ts
- loja/page.tsx
- LojaAoVivo.tsx
- next.config.ts
- cupons/page.tsx
- index.ts
- seed.ts
- @payloadcms/db-postgres
- [...slug]/route.ts
- eslint.config.mjs
- .prettierrc.json
- Backup do banco
- exemplo/page.tsx
- Lojas.ts
- engines
- vitest.config.mts
- graphql/route.ts
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- LEIA-ME.md
- criarPedido
- dotenv

## God Nodes (most connected - your core abstractions)
1. `sessao()` - 74 edges
2. `next` - 47 edges
3. `brl()` - 47 edges
4. `Cardapio()` - 34 edges
5. `lerPreco()` - 32 edges
6. `@payloadcms/db-postgres` - 31 edges
7. `vitest` - 31 edges
8. `planejar()` - 30 edges
9. `react` - 29 edges
10. `gruposDoProduto()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `produtos()` --calls--> `gruposDoProduto()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/opcoes.ts
- `grupos()` --calls--> `gruposDoProduto()`  [EXTRACTED]
  tests/int/opcoes.int.spec.ts → src/lib/opcoes.ts
- `repetir()` --calls--> `repetirUltimoPedido()`  [EXTRACTED]
  src/components/Cardapio.tsx → src/app/(frontend)/actions.ts
- `copiar()` --indirect_call--> `chave()`  [INFERRED]
  src/components/Cardapio.tsx → src/components/ContaDaMesa.tsx
- `confirmar()` --indirect_call--> `chave()`  [INFERRED]
  src/components/painel/Apagar.tsx → src/components/ContaDaMesa.tsx

## Import Cycles
- None detected.

## Communities (79 total, 36 thin omitted)

### Community 0 - "painel/actions.ts"
Cohesion: 0.08
Nodes (54): baixarLancamento(), chaveGoogle(), DadosPedidoPainel, entrar(), imagem(), lerHorarioDoForm(), ligarGarcom(), marcado() (+46 more)

### Community 1 - "fotoMaquininha.ts"
Cohesion: 0.11
Nodes (33): lerFotoNoGoogle(), ResultadoFoto, totalCartaoDoDia(), dataBr(), Foto, FotoMaquininha(), adicionar(), compararTotais() (+25 more)

### Community 2 - "next"
Cohesion: 0.11
Nodes (35): atribuirEntregador(), mudarStatus(), Rota, Cozinha(), metadata, metadata, Pedidos(), ConferirCodigo() (+27 more)

### Community 3 - "payload-types.ts"
Cohesion: 0.05
Nodes (39): Acerto, AcertosSelect, Auth, Carrinho, CarrinhosSelect, Categoria, CategoriasSelect, Cliente (+31 more)

### Community 4 - "cliente-actions.ts"
Cohesion: 0.16
Nodes (23): adicionarEndereco(), buscarLoja(), cadastrarCliente(), corrigirEndereco(), EnderecoResumo, Identificacao, identificarCliente(), lerEndereco() (+15 more)

### Community 5 - "brl"
Cohesion: 0.11
Nodes (34): fazerAcerto(), fecharContaDaMesa(), ligarEntregador(), pendentesDoAcerto(), Entregadores(), metadata, Garcons(), metadata (+26 more)

### Community 6 - "(frontend)/actions.ts"
Cohesion: 0.19
Nodes (19): aplicarCupom(), buscarCupom(), conferirItens(), criarPedido(), criarPedidoMesa(), DadosPedido, guardarCarrinho(), ItemParaConferir (+11 more)

### Community 7 - "gruposDoProduto"
Cohesion: 0.25
Nodes (13): criarPedidoDaMesa(), criarPedidoPainel(), editarPedido(), EditarPedido(), metadata, metadata, NovoPedidoPagina(), chaveDe() (+5 more)

### Community 8 - "package.json"
Cohesion: 0.08
Nodes (24): description, license, name, private, type, version, cross-env, eslint (+16 more)

### Community 9 - "payload.config.ts"
Cohesion: 0.19
Nodes (16): payload, ehAdmin(), logado(), soAdmin(), Acertos, Carrinhos, Clientes, Cupons (+8 more)

### Community 10 - "planilha.ts"
Cohesion: 0.08
Nodes (42): conferirMaquininha(), ConferirMaquininha(), dataBr(), hora(), Retorno, Importador(), confirmar(), escolher() (+34 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 12 - "@payloadcms/next"
Cohesion: 0.13
Nodes (8): @payloadcms/next, @payloadcms/plugin-multi-tenant, @payloadcms/storage-vercel-blob, importMap, Args, Args, GET, Args

### Community 13 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, cross-env, dotenv, graphql, next, payload, @payloadcms/db-postgres, @payloadcms/live-preview-react (+11 more)

### Community 14 - "(frontend)/layout.tsx"
Cohesion: 0.25
Nodes (5): classica, leve, metadata, moderna, tradicional

### Community 15 - "sessao"
Cohesion: 0.14
Nodes (21): apagarCategoria(), apagarCupom(), apagarLancamento(), apagarProduto(), ligarCupom(), marcarEsgotado(), moverCategoria(), moverProduto() (+13 more)

### Community 16 - "exemplo.ts"
Cohesion: 0.07
Nodes (51): importarExemplo(), permitido(), relatorioMaquininhaExemplo(), ImportarExemplo(), baixarRelatorio(), importar(), Retorno, ATENDIMENTOS (+43 more)

### Community 17 - "pedido.ts"
Cohesion: 0.14
Nodes (17): ResultadoMesa, ResultadoPedido, Foto, Linha, LojaView, ProdutoView, textoEntrega(), GrupoOpcao (+9 more)

### Community 18 - "next"
Cohesion: 0.10
Nodes (10): next, passos, recursos, metadata, Maquininha(), metadata, Importar(), metadata (+2 more)

### Community 19 - "Cadastrar um cliente novo"
Cohesion: 0.13
Nodes (13): 1. Criar a loja (5 min), 2. Criar o login do dono (2 min), 3. Importar os produtos (5 a 15 min), 4. Conferir o cardápio (5 min), 5. Entregar ao cliente, Antes de começar, peça ao cliente, Cadastrar um cliente novo, Cadastrar um cliente novo (+5 more)

### Community 20 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, jsdom, prettier, @testing-library/react, tsx, @types/node (+7 more)

### Community 21 - "ContaDaMesa.tsx"
Cohesion: 0.36
Nodes (9): contaAberta(), contaDaMesa, lojaEMesa(), pedirContaDaMesa(), PagarComPix(), copiar(), chave(), ContaDaMesa() (+1 more)

### Community 22 - "lerMesas"
Cohesion: 0.18
Nodes (14): qrcode, MesaDoGarcom(), metadata, metadata, TelaDoGarcom(), metadata, QrDasMesas(), Imprimir() (+6 more)

### Community 23 - "SeusPedidos.tsx"
Cohesion: 0.27
Nodes (10): inscrever(), SeusPedidos(), usePedidosLocais(), Escolhas, comPedidoNovo(), ehNumero(), lerPedidosLocais(), MAX_PEDIDOS_LOCAIS (+2 more)

### Community 24 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, dev, devsafe, generate:importmap, generate:types, lint, payload (+5 more)

### Community 25 - "painel.ts"
Cohesion: 0.17
Nodes (14): trocarLoja(), LayoutLogado(), MENU_GARCOM, metadata, SemAcesso(), Menu(), lerPermissoes(), Permissao (+6 more)

### Community 26 - "FormLoja.tsx"
Cohesion: 0.07
Nodes (52): react, Estado, Entrar(), metadata, metadata, Produto(), adiar(), ApagavelLinha() (+44 more)

### Community 27 - "carrinhos/page.tsx"
Cohesion: 0.28
Nodes (10): apagarCarrinho(), Carrinhos(), metadata, APAGAR_APOS_DIAS, emMinutosAtras(), mensagemRecuperacao(), PARADO_APOS_MINUTOS, resumoDosItens() (+2 more)

### Community 28 - "[loja]/page.tsx"
Cohesion: 0.27
Nodes (9): buscarLoja, generateMetadata(), PaginaDaLoja(), Props, revalidate, Pixels(), scriptGoogle(), scriptMeta() (+1 more)

### Community 29 - "Cardapio"
Cohesion: 0.24
Nodes (8): pedirDeNovo(), Cardapio(), enviar(), enviarMesa(), pedirOutraVez(), repetir(), chaveDe(), registrarCompra()

### Community 30 - "sugestoes.ts"
Cohesion: 0.22
Nodes (6): vitest, textoDoArquivo(), C, P, sugerir(), cardapio

### Community 31 - "loja/page.tsx"
Cohesion: 0.27
Nodes (8): metadata, MinhaLoja(), url(), lerSelos(), rotulosDosSelos(), Selo, SELOS, Media

### Community 32 - "LojaAoVivo.tsx"
Cohesion: 0.33
Nodes (6): @payloadcms/live-preview-react, CategoriaView, LojaAoVivo(), LojaDados, url(), Loja

### Community 33 - "next.config.ts"
Cohesion: 0.33
Nodes (3): dirname, __filename, nextConfig

### Community 34 - "cupons/page.tsx"
Cohesion: 0.39
Nodes (7): brl(), centavos(), Cupom, descontoDoCupom(), fimDoDia(), normalizarCodigo(), base

### Community 36 - "seed.ts"
Cohesion: 0.29
Nodes (3): cardapio, fotos, pasta

### Community 38 - "[...slug]/route.ts"
Cohesion: 0.29
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 40 - ".prettierrc.json"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

### Community 41 - "Backup do banco"
Cohesion: 0.50
Nodes (3): Backup do banco, Ligar (uma vez), Restaurar

### Community 42 - "exemplo/page.tsx"
Cohesion: 0.40
Nodes (4): Exemplo(), maxDuration, metadata, SLUG_EXEMPLO

### Community 43 - "Lojas.ts"
Cohesion: 0.24
Nodes (6): todos(), Categorias, Lojas, Media, Produtos, hooksDeCardapio

### Community 44 - "engines"
Cohesion: 0.67
Nodes (3): engines, node, pnpm

### Community 77 - "criarPedido"
Cohesion: 0.36
Nodes (6): lerAgendamento(), limitesDoCampo(), MAX_DIAS, MIN_MINUTOS, rotuloAgendamento(), agora

## Knowledge Gaps
- **14 isolated node(s):** `@payloadcms/ui`, `cross-env`, `graphql`, `react-dom`, `@testing-library/react` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 376 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `painel/actions.ts`, `next`, `brl`, `gruposDoProduto`, `package.json`, `planilha.ts`, `@payloadcms/next`, `(frontend)/layout.tsx`, `sessao`, `exemplo.ts`, `pedido.ts`, `lerMesas`, `SeusPedidos.tsx`, `painel.ts`, `FormLoja.tsx`, `carrinhos/page.tsx`, `[loja]/page.tsx`, `loja/page.tsx`, `next.config.ts`, `exemplo/page.tsx`, `Lojas.ts`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **What connects `@payloadcms/ui`, `cross-env`, `graphql` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `painel/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07936507936507936 - nodes in this community are weakly interconnected._
- **Why does `@payloadcms/db-postgres` connect `@payloadcms/db-postgres` to `package.json`, `payload.config.ts`, `exemplo.ts`, `index.ts`, `20261008_112229_capa_da_loja.ts`, `20261008_123138_formas_pagamento.ts`, `20261008_123734_clientes.ts`, `20261008_125107_aceite_cliente.ts`, `20261008_132134_chave_pix.ts`, `20261008_134615_codigo_retirada.ts`, `20261008_171019_bairros_entrega.ts`, `20261008_171738_opcoes_produto.ts`, `20261008_182549_selos_produto.ts`, `20261008_182940_repetir_pedido.ts`, `20261008_184808_cupons.ts`, `20261008_185816_agendamento_pedidos.ts`, `20261008_190223_carrinhos_abandonados.ts`, `20261008_190612_pixels_anuncios.ts`, `20261008_192057_pedido_balcao.ts`, `20261008_192626_mesas_qrcode.ts`, `20261008_193017_entregadores.ts`, `20261008_202042_garcons.ts`, `20261008_202353_garcom_no_pedido.ts`, `20261008_202743_mesa_sem_garcom.ts`, `20261008_203548_fechar_conta.ts`, `20261008_204852_acerto_entregador.ts`, `20261008_205540_financeiro.ts`, `20261016_154305_permissoes_usuario.ts`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Should `fotoMaquininha.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10897435897435898 - nodes in this community are weakly interconnected._
- **Why does `react` connect `FormLoja.tsx` to `fotoMaquininha.ts`, `next`, `cliente-actions.ts`, `brl`, `gruposDoProduto`, `package.json`, `planilha.ts`, `@payloadcms/next`, `(frontend)/layout.tsx`, `exemplo.ts`, `pedido.ts`, `ContaDaMesa.tsx`, `SeusPedidos.tsx`, `painel.ts`, `[loja]/page.tsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.10631229235880399 - nodes in this community are weakly interconnected._