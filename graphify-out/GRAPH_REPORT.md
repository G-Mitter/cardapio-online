# Graph Report - cardapio-online  (2026-10-16)

## Corpus Check
- 279 files · ~474,970 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .csv 11, .css 2, .example 1)

## Summary
- 1249 nodes · 3458 edges · 94 communities (48 shown, 46 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ebb0b72a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- texto
- fotoMaquininha.ts
- PainelPedidos.tsx
- payload-types.ts
- vitest
- FecharConta.tsx
- pedido.ts
- texto
- package.json
- payload.config.ts
- planilha.ts
- compilerOptions
- @payloadcms/next
- dependencies
- exemplo-db.ts
- painel/actions.ts
- cozinha/page.tsx
- next
- exemplo.ts
- Cadastrar um cliente novo
- devDependencies
- (frontend)/actions.ts
- financeiro/page.tsx
- SeusPedidos.tsx
- scripts
- caixa/page.tsx
- react
- Apagar.tsx
- [loja]/page.tsx
- Cardapio.tsx
- maquininha.ts
- Impressao.tsx
- next
- next.config.ts
- brl
- seed.ts
- @payloadcms/db-postgres
- [...slug]/route.ts
- eslint.config.mjs
- .prettierrc.json
- Backup do banco
- painel/layout.tsx
- Lojas.ts
- engines
- impressao/page.tsx
- [loja]/page.tsx
- montarRota
- index.ts
- (frontend)/layout.tsx
- registrarCompra
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- LEIA-ME.md
- entrar/page.tsx
- dotenv
- pedidosDoDia.ts
- loginDoGarcom
- Config

## God Nodes (most connected - your core abstractions)
1. `sessao()` - 106 edges
2. `brl()` - 59 edges
3. `next` - 56 edges
4. `@payloadcms/db-postgres` - 43 edges
5. `vitest` - 39 edges
6. `lerPreco()` - 37 edges
7. `Cardapio()` - 34 edges
8. `payload` - 33 edges
9. `react` - 33 edges
10. `Formulario()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `copiar()` --indirect_call--> `chave()`  [INFERRED]
  src/components/Cardapio.tsx → src/components/ContaDaMesa.tsx
- `lerOk()` --calls--> `lerItensCompra()`  [EXTRACTED]
  tests/int/compras.int.spec.ts → src/lib/compras.ts
- `grupos()` --calls--> `lerOpcoes()`  [EXTRACTED]
  tests/int/opcoes.int.spec.ts → src/lib/opcoes.ts
- `produtos()` --calls--> `gruposDoProduto()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/opcoes.ts
- `Entrar()` --calls--> `Formulario()`  [EXTRACTED]
  src/app/(frontend)/painel/entrar/page.tsx → src/components/painel/Formulario.tsx

## Import Cycles
- None detected.

## Communities (94 total, 46 thin omitted)

### Community 0 - "texto"
Cohesion: 0.22
Nodes (17): imagem(), lerHorarioDoForm(), marcado(), mensagem(), salvarCategoria(), salvarCupom(), salvarEntregador(), salvarFornecedor() (+9 more)

### Community 1 - "fotoMaquininha.ts"
Cohesion: 0.08
Nodes (41): lerFotoNoGoogle(), ResultadoFoto, totalCartaoDoDia(), Maquininha(), metadata, ConferirMaquininha(), dataBr(), hora() (+33 more)

### Community 2 - "PainelPedidos.tsx"
Cohesion: 0.12
Nodes (24): mudarStatus(), Rota, ConferirCodigo(), EntregadorView, hora(), PainelPedidos(), mudar(), PedidoView (+16 more)

### Community 3 - "payload-types.ts"
Cohesion: 0.04
Nodes (48): Acerto, AcertosSelect, Auth, Caixa, CaixasSelect, Carrinho, CarrinhosSelect, Categoria (+40 more)

### Community 4 - "vitest"
Cohesion: 0.08
Nodes (42): vitest, adicionarEndereco(), buscarLoja(), cadastrarCliente(), corrigirEndereco(), EnderecoResumo, Identificacao, identificarCliente() (+34 more)

### Community 5 - "FecharConta.tsx"
Cohesion: 0.10
Nodes (31): qrcode, fecharContaDaMesa(), MesaDoGarcom(), metadata, metadata, TelaDoGarcom(), Mesas(), metadata (+23 more)

### Community 6 - "pedido.ts"
Cohesion: 0.18
Nodes (12): centavos(), formatarCpf(), ItemEscolhido, lerCpf(), MAX_QUANTIDADE, mensagemPedido(), Modo, centavos() (+4 more)

### Community 7 - "texto"
Cohesion: 0.14
Nodes (26): aplicarCupom(), criarPedido(), criarPedidoMesa(), guardarCarrinho(), texto(), criarPedidoDaMesa(), criarPedidoPainel(), editarPedido() (+18 more)

### Community 8 - "package.json"
Cohesion: 0.08
Nodes (25): description, license, name, private, type, version, cross-env, eslint (+17 more)

### Community 9 - "payload.config.ts"
Cohesion: 0.15
Nodes (21): payload, ehAdmin(), logado(), soAdmin(), Acertos, Caixas, Carrinhos, Clientes (+13 more)

### Community 10 - "planilha.ts"
Cohesion: 0.09
Nodes (41): read-excel-file, Importar(), metadata, Importador(), confirmar(), converter(), escolher(), lerArquivo() (+33 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 12 - "@payloadcms/next"
Cohesion: 0.11
Nodes (10): @payloadcms/next, @payloadcms/plugin-multi-tenant, @payloadcms/storage-vercel-blob, importMap, Args, Args, GET, OPTIONS (+2 more)

### Community 13 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, cross-env, dotenv, graphql, next, payload, @payloadcms/db-postgres, @payloadcms/live-preview-react (+11 more)

### Community 14 - "exemplo-db.ts"
Cohesion: 0.11
Nodes (27): importarExemplo(), permitido(), relatorioMaquininhaExemplo(), Exemplo(), maxDuration, metadata, ImportarExemplo(), baixarRelatorio() (+19 more)

### Community 15 - "painel/actions.ts"
Cohesion: 0.17
Nodes (22): apagarCarrinho(), apagarCategoria(), apagarCupom(), apagarFornecedor(), apagarIngrediente(), apagarLancamento(), apagarProduto(), Contexto (+14 more)

### Community 16 - "cozinha/page.tsx"
Cohesion: 0.38
Nodes (9): Cozinha(), metadata, ComSetor, filtrarPorSetor(), lerSetor(), mesmo(), SETOR_PADRAO, setorDaCategoria() (+1 more)

### Community 17 - "next"
Cohesion: 0.14
Nodes (10): next, passos, recursos, metadata, Pedidos(), metadata, metadata, COOKIE_LOJA (+2 more)

### Community 18 - "exemplo.ts"
Cohesion: 0.11
Nodes (32): Bairro, bairrosComoTexto(), lerBairros(), taxaDoBairro(), ATENDIMENTOS, ContextoPlano, escolhasPorNome(), inteiro() (+24 more)

### Community 19 - "Cadastrar um cliente novo"
Cohesion: 0.13
Nodes (13): 1. Criar a loja (5 min), 2. Criar o login do dono (2 min), 3. Importar os produtos (5 a 15 min), 4. Conferir o cardápio (5 min), 5. Entregar ao cliente, Antes de começar, peça ao cliente, Cadastrar um cliente novo, Cadastrar um cliente novo (+5 more)

### Community 20 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, jsdom, prettier, @testing-library/react, tsx, @types/node (+7 more)

### Community 21 - "(frontend)/actions.ts"
Cohesion: 0.21
Nodes (15): buscarCupom(), contaAberta(), contaDaMesa, DadosPedido, ItemParaConferir, lojaEMesa(), pedirContaDaMesa(), ResultadoCupom (+7 more)

### Community 22 - "financeiro/page.tsx"
Cohesion: 0.14
Nodes (26): baixarLancamento(), voltarAoFinanceiro(), dataBr(), Financeiro(), metadata, ROTULO_SITUACAO, dataBr(), metadata (+18 more)

### Community 23 - "SeusPedidos.tsx"
Cohesion: 0.27
Nodes (10): inscrever(), SeusPedidos(), usePedidosLocais(), Escolhas, comPedidoNovo(), ehNumero(), lerPedidosLocais(), MAX_PEDIDOS_LOCAIS (+2 more)

### Community 24 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, dev, devsafe, generate:importmap, generate:types, lint, payload (+5 more)

### Community 25 - "caixa/page.tsx"
Cohesion: 0.22
Nodes (17): abrirCaixa(), caixaAberto(), fecharCaixa(), movimentarCaixa(), Caixa(), metadata, quando(), c() (+9 more)

### Community 26 - "react"
Cohesion: 0.07
Nodes (58): ajustarEstoque(), metadata, Produto(), metadata, Produtos(), BotaoApagar(), CampoDinheiro(), CampoImagem() (+50 more)

### Community 27 - "Apagar.tsx"
Cohesion: 0.18
Nodes (16): LayoutLogado(), MENU_GARCOM, adiar(), ApagavelLinha(), assinar(), Aviso, avisos, AvisosDeApagar() (+8 more)

### Community 28 - "[loja]/page.tsx"
Cohesion: 0.14
Nodes (20): buscarLoja, generateMetadata(), PaginaDaLoja(), Props, revalidate, metadata, MinhaLoja(), url() (+12 more)

### Community 29 - "Cardapio.tsx"
Cohesion: 0.10
Nodes (22): conferirItens(), pedirDeNovo(), repetirUltimoPedido(), ResultadoPedido, Cardapio(), enviar(), enviarMesa(), pedirOutraVez() (+14 more)

### Community 30 - "maquininha.ts"
Cohesion: 0.21
Nodes (15): conferirMaquininha(), acharColuna(), centavos(), COLUNAS, conferir(), LeituraRelatorio, lerDataHora(), lerRelatorio() (+7 more)

### Community 31 - "Impressao.tsx"
Cohesion: 0.26
Nodes (10): react-dom, reservarImpressao(), hora(), Impressao(), PedidoImpressao, TESTE, Ticket(), rotuloTipo() (+2 more)

### Community 32 - "next"
Cohesion: 0.17
Nodes (21): alvoDoUsuario(), apagarUsuario(), avisoUsuarios(), ligarUsuario(), salvarUsuario(), trocarSenhaUsuario(), usuariosDaLoja(), metadata (+13 more)

### Community 33 - "next.config.ts"
Cohesion: 0.33
Nodes (3): dirname, __filename, nextConfig

### Community 34 - "brl"
Cohesion: 0.07
Nodes (52): react, Estado, fazerAcerto(), mudarPagamentoDoPedido(), pendentesDoAcerto(), Categorias(), metadata, Compras() (+44 more)

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

### Community 43 - "Lojas.ts"
Cohesion: 0.24
Nodes (6): todos(), Categorias, Lojas, Media, Produtos, hooksDeCardapio

### Community 44 - "engines"
Cohesion: 0.67
Nodes (3): engines, node, pnpm

### Community 45 - "impressao/page.tsx"
Cohesion: 0.18
Nodes (16): salvarImpressao(), metadata, PaginaImpressao(), Dados, entraAceito(), Origem, origemDoPedido(), ORIGENS (+8 more)

### Community 46 - "[loja]/page.tsx"
Cohesion: 0.39
Nodes (6): Pixels(), ComPixels, lerPixelMeta(), lerTagGoogle(), scriptGoogle(), scriptMeta()

### Community 51 - "montarRota"
Cohesion: 0.27
Nodes (8): atribuirEntregador(), chaveGoogle(), montarRota(), ordemGoogle(), MontarRota(), comCidade(), linkMaps(), MAX_PARADAS

### Community 55 - "(frontend)/layout.tsx"
Cohesion: 0.25
Nodes (5): classica, leve, metadata, moderna, tradicional

### Community 64 - "registrarCompra"
Cohesion: 0.48
Nodes (5): registrarCompra(), ItemCompra, lerItensCompra(), totalDaCompra(), lerOk()

### Community 77 - "entrar/page.tsx"
Cohesion: 0.40
Nodes (5): entrar(), sair(), tokenCookie(), Entrar(), metadata

### Community 86 - "pedidosDoDia.ts"
Cohesion: 0.48
Nodes (5): ANTECEDENCIA_COZINHA_MIN, avisoDeStatus(), inicioDoDia(), naCozinha(), ordenar()

## Knowledge Gaps
- **13 isolated node(s):** `@payloadcms/ui`, `cross-env`, `graphql`, `@testing-library/react`, `@types/node` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 445 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **46 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@payloadcms/db-postgres` connect `@payloadcms/db-postgres` to `package.json`, `payload.config.ts`, `exemplo-db.ts`, `painel/actions.ts`, `react`, `20261008_124359_pagamento_pedido.ts`, `20261008_112229_capa_da_loja.ts`, `20261008_123138_formas_pagamento.ts`, `20261008_123734_clientes.ts`, `20261008_125107_aceite_cliente.ts`, `20261008_134615_codigo_retirada.ts`, `index.ts`, `20261008_171738_opcoes_produto.ts`, `20261008_182940_repetir_pedido.ts`, `20261008_184808_cupons.ts`, `20261008_185816_agendamento_pedidos.ts`, `20261008_190223_carrinhos_abandonados.ts`, `20261008_190612_pixels_anuncios.ts`, `20261008_192057_pedido_balcao.ts`, `20261008_192626_mesas_qrcode.ts`, `20261008_193017_entregadores.ts`, `20261008_202353_garcom_no_pedido.ts`, `20261008_202743_mesa_sem_garcom.ts`, `20261008_110821_alt_opcional.ts`, `20261008_204852_acerto_entregador.ts`, `20261008_205540_financeiro.ts`, `20261016_154305_permissoes_usuario.ts`, `20261008_185332_promocao_quantidade.ts`, `20261016_174955_estoque_ingredientes.ts`, `20261016_175513_ficha_tecnica.ts`, `20261016_175645_modo_preparo.ts`, `vitest`, `20261016_180008_aceite_origem.ts`, `20261016_180316_impressao.ts`, `20261008_202042_garcons.ts`, `20261008_203548_fechar_conta.ts`, `20261016_184524_caixa.ts`, `20261016_201352_custo_ingrediente.ts`, `20261016_202253_compras_fornecedores.ts`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **What connects `@payloadcms/ui`, `cross-env`, `graphql` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `fotoMaquininha.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08235294117647059 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `fotoMaquininha.ts`, `PainelPedidos.tsx`, `vitest`, `FecharConta.tsx`, `texto`, `package.json`, `planilha.ts`, `@payloadcms/next`, `exemplo-db.ts`, `painel/actions.ts`, `cozinha/page.tsx`, `financeiro/page.tsx`, `SeusPedidos.tsx`, `caixa/page.tsx`, `react`, `Apagar.tsx`, `[loja]/page.tsx`, `Cardapio.tsx`, `Impressao.tsx`, `next`, `next.config.ts`, `brl`, `painel/layout.tsx`, `Lojas.ts`, `impressao/page.tsx`, `[loja]/page.tsx`, `(frontend)/layout.tsx`, `entrar/page.tsx`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Should `PainelPedidos.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12433862433862433 - nodes in this community are weakly interconnected._
- **Why does `react` connect `brl` to `fotoMaquininha.ts`, `PainelPedidos.tsx`, `vitest`, `FecharConta.tsx`, `texto`, `package.json`, `planilha.ts`, `@payloadcms/next`, `exemplo-db.ts`, `next`, `SeusPedidos.tsx`, `(frontend)/actions.ts`, `(frontend)/layout.tsx`, `react`, `Apagar.tsx`, `[loja]/page.tsx`, `Cardapio.tsx`, `Impressao.tsx`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `payload-types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._