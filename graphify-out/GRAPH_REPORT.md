# Graph Report - cardapio-online  (2026-10-16)

## Corpus Check
- 291 files · ~500,609 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .csv 11, .css 2, .example 1)

## Summary
- 1282 nodes · 3553 edges · 99 communities (54 shown, 45 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a23ccab5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- painel/actions.ts
- fotoMaquininha.ts
- estoque.ts
- payload-types.ts
- vitest
- Pedidos.ts
- PainelPedidos.tsx
- lerPreco
- package.json
- payload.config.ts
- planilha.ts
- compilerOptions
- @payloadcms/next
- dependencies
- exemplo.ts
- react
- cadastrar/actions.ts
- next
- loja/page.tsx
- Cadastrar um cliente novo
- devDependencies
- sessao
- financeiro/page.tsx
- cozinha/page.tsx
- scripts
- pedido.ts
- FormLoja.tsx
- Apagar.tsx
- [loja]/page.tsx
- Cardapio.tsx
- (logado)/page.tsx
- compras/page.tsx
- permissoes.ts
- next.config.ts
- TelaCozinha.tsx
- seed.ts
- @payloadcms/db-postgres
- [...slug]/route.ts
- eslint.config.mjs
- .prettierrc.json
- Backup do banco
- Impressao.tsx
- payload
- engines
- impressao/page.tsx
- carrinhos/page.tsx
- montarRota
- ListaBairros.tsx
- financeiro/page.tsx
- index.ts
- (frontend)/layout.tsx
- registrarCompra
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- LEIA-ME.md
- react
- dotenv
- agendamento.ts
- tema.ts
- vitest
- entrega.ts

## God Nodes (most connected - your core abstractions)
1. `sessao()` - 107 edges
2. `next` - 59 edges
3. `brl()` - 59 edges
4. `@payloadcms/db-postgres` - 45 edges
5. `vitest` - 41 edges
6. `lerPreco()` - 37 edges
7. `payload` - 34 edges
8. `react` - 34 edges
9. `Cardapio()` - 34 edges
10. `Formulario()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `lerOk()` --calls--> `lerItensCompra()`  [EXTRACTED]
  tests/int/compras.int.spec.ts → src/lib/compras.ts
- `feitos()` --calls--> `primeirosPassos()`  [EXTRACTED]
  tests/int/primeirosPassos.int.spec.ts → src/lib/primeirosPassos.ts
- `copiar()` --indirect_call--> `chave()`  [INFERRED]
  src/components/Cardapio.tsx → src/components/ContaDaMesa.tsx
- `confirmar()` --indirect_call--> `chave()`  [INFERRED]
  src/components/painel/Apagar.tsx → src/components/ContaDaMesa.tsx
- `produtos()` --calls--> `lerTabela()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/exemplo.ts

## Import Cycles
- None detected.

## Communities (99 total, 45 thin omitted)

### Community 0 - "painel/actions.ts"
Cohesion: 0.15
Nodes (30): Contexto, entrar(), imagem(), lerHorarioDoForm(), ligarGarcom(), marcado(), mensagem(), mudarGarcom() (+22 more)

### Community 1 - "fotoMaquininha.ts"
Cohesion: 0.09
Nodes (40): tesseract.js, lerFotoNoGoogle(), ResultadoFoto, totalCartaoDoDia(), ConferirMaquininha(), dataBr(), hora(), Retorno (+32 more)

### Community 2 - "estoque.ts"
Cohesion: 0.18
Nodes (22): ajustarEstoque(), salvarIngrediente(), consumo(), acertarEstoque(), fichasDe(), idDe(), itensAtivos(), pausarPelaFicha() (+14 more)

### Community 3 - "payload-types.ts"
Cohesion: 0.04
Nodes (49): Acerto, AcertosSelect, Auth, Caixa, CaixasSelect, Carrinho, CarrinhosSelect, Categoria (+41 more)

### Community 4 - "vitest"
Cohesion: 0.12
Nodes (33): adicionarEndereco(), buscarLoja(), cadastrarCliente(), corrigirEndereco(), EnderecoResumo, Identificacao, identificarCliente(), lerEndereco() (+25 more)

### Community 5 - "Pedidos.ts"
Cohesion: 0.40
Nodes (3): Fechamentos, Pedidos, FORMAS_PAGAMENTO

### Community 6 - "PainelPedidos.tsx"
Cohesion: 0.25
Nodes (12): atribuirEntregador(), Rota, ConferirCodigo(), EntregadorView, hora(), MontarRota(), PainelPedidos(), PedidoView (+4 more)

### Community 7 - "lerPreco"
Cohesion: 0.22
Nodes (17): abrirCaixa(), caixaAberto(), fecharCaixa(), movimentarCaixa(), Caixa(), metadata, quando(), c() (+9 more)

### Community 8 - "package.json"
Cohesion: 0.08
Nodes (24): description, license, name, private, type, version, cross-env, eslint (+16 more)

### Community 9 - "payload.config.ts"
Cohesion: 0.13
Nodes (16): logado(), Acertos, Caixas, Carrinhos, Clientes, Compras, Contatos, Cupons (+8 more)

### Community 10 - "planilha.ts"
Cohesion: 0.10
Nodes (36): read-excel-file, Importador(), confirmar(), converter(), escolher(), lerArquivo(), Loja, Tabela (+28 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 12 - "@payloadcms/next"
Cohesion: 0.11
Nodes (10): @payloadcms/next, @payloadcms/plugin-multi-tenant, @payloadcms/storage-vercel-blob, importMap, Args, Args, GET, OPTIONS (+2 more)

### Community 13 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, cross-env, dotenv, graphql, next, payload, @payloadcms/db-postgres, @payloadcms/live-preview-react (+11 more)

### Community 14 - "exemplo.ts"
Cohesion: 0.06
Nodes (74): conferirMaquininha(), importarExemplo(), permitido(), relatorioMaquininhaExemplo(), Exemplo(), maxDuration, metadata, ImportarExemplo() (+66 more)

### Community 15 - "react"
Cohesion: 0.17
Nodes (18): react, marcarEsgotado(), metadata, Produto(), metadata, Produtos(), BotaoApagar(), Contador() (+10 more)

### Community 16 - "cadastrar/actions.ts"
Cohesion: 0.15
Nodes (15): cadastrarLoja(), texto(), Cadastrar(), metadata, metadata, FormCadastro(), erroDoSlug(), lerCnpj() (+7 more)

### Community 17 - "next"
Cohesion: 0.18
Nodes (5): next, passos, recursos, metadata, metadata

### Community 18 - "loja/page.tsx"
Cohesion: 0.29
Nodes (8): metadata, MinhaLoja(), url(), bairrosComoTexto(), lerSelos(), rotulosDosSelos(), Selo, SELOS

### Community 19 - "Cadastrar um cliente novo"
Cohesion: 0.13
Nodes (13): 1. Criar a loja (5 min), 2. Criar o login do dono (2 min), 3. Importar os produtos (5 a 15 min), 4. Conferir o cardápio (5 min), 5. Entregar ao cliente, Antes de começar, peça ao cliente, Cadastrar um cliente novo, Cadastrar um cliente novo (+5 more)

### Community 20 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, jsdom, prettier, @testing-library/react, tsx, @types/node (+7 more)

### Community 21 - "sessao"
Cohesion: 0.18
Nodes (15): apagarCarrinho(), apagarCategoria(), apagarCupom(), apagarFornecedor(), apagarProduto(), moverCategoria(), Categorias(), metadata (+7 more)

### Community 22 - "financeiro/page.tsx"
Cohesion: 0.27
Nodes (10): baixarLancamento(), voltarAoFinanceiro(), Lancamentos, CATEGORIAS, dois(), intervaloDoMes(), lerData(), proximoVencimento() (+2 more)

### Community 23 - "cozinha/page.tsx"
Cohesion: 0.27
Nodes (13): Cozinha(), metadata, idDoGarcom(), nomesDosGarcons(), naCozinha(), ComSetor, filtrarPorSetor(), lerSetor() (+5 more)

### Community 24 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, dev, devsafe, generate:importmap, generate:types, lint, payload (+5 more)

### Community 25 - "pedido.ts"
Cohesion: 0.05
Nodes (72): criarPedidoDaMesa(), criarPedidoPainel(), DadosPedidoPainel, editarPedido(), fazerAcerto(), fecharContaDaMesa(), ligarEntregador(), mudarPagamentoDoPedido() (+64 more)

### Community 26 - "FormLoja.tsx"
Cohesion: 0.24
Nodes (14): CampoImagem(), reduzir(), bairrosDaPrevia(), DadosLoja, FormLoja(), Bairro, DIAS, EnderecoLoja (+6 more)

### Community 27 - "Apagar.tsx"
Cohesion: 0.16
Nodes (18): trocarLoja(), LayoutLogado(), MENU_GARCOM, adiar(), ApagavelLinha(), assinar(), Aviso, avisos (+10 more)

### Community 28 - "[loja]/page.tsx"
Cohesion: 0.17
Nodes (15): @payloadcms/live-preview-react, buscarLoja, generateMetadata(), PaginaDaLoja(), Props, revalidate, CategoriaView, LojaAoVivo() (+7 more)

### Community 29 - "Cardapio.tsx"
Cohesion: 0.05
Nodes (65): aplicarCupom(), buscarCupom(), conferirItens(), contaAberta(), contaDaMesa, criarPedido(), criarPedidoMesa(), DadosPedido (+57 more)

### Community 30 - "(logado)/page.tsx"
Cohesion: 0.24
Nodes (10): dispensarPassos(), metadata, Pedidos(), PrimeirosPassos(), inicioDoDia(), ordenar(), DadosDaLoja, PassoPainel (+2 more)

### Community 31 - "compras/page.tsx"
Cohesion: 0.14
Nodes (18): apagarIngrediente(), ligarCupom(), Compras(), dataBr(), metadata, Cupons(), dataBr(), metadata (+10 more)

### Community 32 - "permissoes.ts"
Cohesion: 0.16
Nodes (19): alvoDoUsuario(), apagarUsuario(), avisoUsuarios(), ligarUsuario(), salvarUsuario(), trocarSenhaUsuario(), usuariosDaLoja(), metadata (+11 more)

### Community 33 - "next.config.ts"
Cohesion: 0.33
Nodes (3): dirname, __filename, nextConfig

### Community 34 - "TelaCozinha.tsx"
Cohesion: 0.21
Nodes (13): mudarStatus(), mudar(), apitar(), COLUNAS, hora(), PedidoCozinha, TelaCozinha(), ativarSom() (+5 more)

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

### Community 42 - "Impressao.tsx"
Cohesion: 0.29
Nodes (10): react-dom, reservarImpressao(), hora(), Impressao(), TESTE, Ticket(), mensagemPedido(), rotuloPagamento() (+2 more)

### Community 43 - "payload"
Cohesion: 0.29
Nodes (8): payload, adminOuDonoDaLoja(), ehAdmin(), soAdmin(), todos(), Categorias, Produtos, hooksDeCardapio

### Community 44 - "engines"
Cohesion: 0.67
Nodes (3): engines, node, pnpm

### Community 45 - "impressao/page.tsx"
Cohesion: 0.15
Nodes (17): metadata, PaginaImpressao(), PedidoImpressao, Dados, entraAceito(), Origem, origemDoPedido(), ORIGENS (+9 more)

### Community 46 - "carrinhos/page.tsx"
Cohesion: 0.35
Nodes (8): Carrinhos(), metadata, APAGAR_APOS_DIAS, emMinutosAtras(), mensagemRecuperacao(), PARADO_APOS_MINUTOS, resumoDosItens(), ItemPedido

### Community 51 - "montarRota"
Cohesion: 0.36
Nodes (6): chaveGoogle(), montarRota(), ordemGoogle(), comCidade(), linkMaps(), MAX_PARADAS

### Community 55 - "ListaBairros.tsx"
Cohesion: 0.42
Nodes (7): CampoDinheiro(), deTexto(), Linha, ListaBairros(), paraTexto(), centavosDoTexto(), dinheiroDeCentavos()

### Community 58 - "financeiro/page.tsx"
Cohesion: 0.31
Nodes (9): apagarLancamento(), dataBr(), Financeiro(), metadata, ROTULO_SITUACAO, alertas(), c(), resumoDoMes() (+1 more)

### Community 63 - "(frontend)/layout.tsx"
Cohesion: 0.25
Nodes (5): classica, leve, metadata, moderna, tradicional

### Community 64 - "registrarCompra"
Cohesion: 0.53
Nodes (4): ItemCompra, lerItensCompra(), totalDaCompra(), lerOk()

### Community 77 - "react"
Cohesion: 0.23
Nodes (11): Estado, Entrar(), metadata, metadata, QrDasMesas(), metadata, Usuarios(), Formulario() (+3 more)

### Community 81 - "agendamento.ts"
Cohesion: 0.36
Nodes (6): lerAgendamento(), limitesDoCampo(), MAX_DIAS, MIN_MINUTOS, rotuloAgendamento(), agora

### Community 86 - "tema.ts"
Cohesion: 0.40
Nodes (5): COR_PADRAO, corValida(), Fonte, FONTES, temaDaLoja()

### Community 87 - "vitest"
Cohesion: 0.24
Nodes (5): vitest, moverProduto(), textoDoArquivo(), loginDoGarcom(), mover()

### Community 94 - "entrega.ts"
Cohesion: 0.60
Nodes (3): lerBairros(), taxaDoBairro(), bairros

## Knowledge Gaps
- **13 isolated node(s):** `@payloadcms/ui`, `cross-env`, `graphql`, `@testing-library/react`, `@types/node` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 451 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@payloadcms/db-postgres` connect `@payloadcms/db-postgres` to `painel/actions.ts`, `estoque.ts`, `package.json`, `payload.config.ts`, `exemplo.ts`, `20261008_124359_pagamento_pedido.ts`, `20261008_112229_capa_da_loja.ts`, `20261008_123138_formas_pagamento.ts`, `20261008_123734_clientes.ts`, `20261008_125107_aceite_cliente.ts`, `20261008_134615_codigo_retirada.ts`, `20261008_171019_bairros_entrega.ts`, `20261008_171738_opcoes_produto.ts`, `20261008_182940_repetir_pedido.ts`, `20261008_184808_cupons.ts`, `20261008_190223_carrinhos_abandonados.ts`, `20261008_190612_pixels_anuncios.ts`, `index.ts`, `20261008_192626_mesas_qrcode.ts`, `20261008_202353_garcom_no_pedido.ts`, `20261008_202743_mesa_sem_garcom.ts`, `20261008_110821_alt_opcional.ts`, `20261008_204852_acerto_entregador.ts`, `20261008_182549_selos_produto.ts`, `20261016_154305_permissoes_usuario.ts`, `20261008_185332_promocao_quantidade.ts`, `20261016_174955_estoque_ingredientes.ts`, `20261016_175645_modo_preparo.ts`, `20261016_175830_setor_categoria.ts`, `20261016_180008_aceite_origem.ts`, `20261016_180316_impressao.ts`, `20261008_202042_garcons.ts`, `20261008_132134_chave_pix.ts`, `20261016_184524_caixa.ts`, `20261016_201352_custo_ingrediente.ts`, `20261016_202253_compras_fornecedores.ts`, `20261016_222300_cadastro_da_loja.ts`, `20261008_203548_fechar_conta.ts`, `20261008_205540_financeiro.ts`, `20261016_203004_contatos_promocoes.ts`, `20261016_223106_passos_dispensados.ts`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **What connects `@payloadcms/ui`, `cross-env`, `graphql` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `painel/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14583333333333334 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `painel/actions.ts`, `vitest`, `PainelPedidos.tsx`, `lerPreco`, `package.json`, `planilha.ts`, `@payloadcms/next`, `exemplo.ts`, `react`, `cadastrar/actions.ts`, `loja/page.tsx`, `sessao`, `cozinha/page.tsx`, `pedido.ts`, `Apagar.tsx`, `[loja]/page.tsx`, `Cardapio.tsx`, `(logado)/page.tsx`, `compras/page.tsx`, `permissoes.ts`, `next.config.ts`, `TelaCozinha.tsx`, `Impressao.tsx`, `payload`, `impressao/page.tsx`, `carrinhos/page.tsx`, `financeiro/page.tsx`, `(frontend)/layout.tsx`, `react`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Should `fotoMaquininha.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0858843537414966 - nodes in this community are weakly interconnected._
- **Why does `sessao()` connect `sessao` to `painel/actions.ts`, `fotoMaquininha.ts`, `estoque.ts`, `vitest`, `PainelPedidos.tsx`, `lerPreco`, `planilha.ts`, `exemplo.ts`, `react`, `loja/page.tsx`, `financeiro/page.tsx`, `cozinha/page.tsx`, `pedido.ts`, `Apagar.tsx`, `(logado)/page.tsx`, `compras/page.tsx`, `permissoes.ts`, `TelaCozinha.tsx`, `Impressao.tsx`, `impressao/page.tsx`, `carrinhos/page.tsx`, `montarRota`, `financeiro/page.tsx`, `react`, `vitest`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `payload-types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._