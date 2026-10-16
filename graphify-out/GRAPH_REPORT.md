# Graph Report - cardapio-online  (2026-10-16)

## Corpus Check
- 253 files · ~423,040 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .csv 11, .css 2, .example 1)

## Summary
- 1153 nodes · 3141 edges · 86 communities (45 shown, 41 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4e6bc61c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- painel/actions.ts
- fotoMaquininha.ts
- PainelPedidos.tsx
- payload-types.ts
- cliente-actions.ts
- vitest
- pedido.ts
- opcoes.ts
- package.json
- payload.config.ts
- planilha.ts
- compilerOptions
- @payloadcms/next
- dependencies
- estoque/page.tsx
- sessao
- painel.ts
- next
- exemplo.ts
- Cadastrar um cliente novo
- devDependencies
- ContaDaMesa.tsx
- financeiro/page.tsx
- SeusPedidos.tsx
- scripts
- lerMesas
- FormLoja.tsx
- brl
- [loja]/page.tsx
- Cardapio.tsx
- promocao.ts
- loja/page.tsx
- permissoes.ts
- next.config.ts
- cupons/page.tsx
- seed.ts
- @payloadcms/db-postgres
- [...slug]/route.ts
- eslint.config.mjs
- .prettierrc.json
- Backup do banco
- (frontend)/page.tsx
- Lojas.ts
- engines
- Pedidos.ts
- pixel.ts
- index.ts
- graphql/route.ts
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- LEIA-ME.md
- Formulario
- dotenv

## God Nodes (most connected - your core abstractions)
1. `sessao()` - 91 edges
2. `next` - 52 edges
3. `brl()` - 49 edges
4. `@payloadcms/db-postgres` - 39 edges
5. `vitest` - 35 edges
6. `Cardapio()` - 34 edges
7. `react` - 32 edges
8. `lerPreco()` - 32 edges
9. `planejar()` - 30 edges
10. `gruposDoProduto()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `produtos()` --calls--> `gruposDoProduto()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/opcoes.ts
- `grupos()` --calls--> `gruposDoProduto()`  [EXTRACTED]
  tests/int/opcoes.int.spec.ts → src/lib/opcoes.ts
- `copiar()` --indirect_call--> `chave()`  [INFERRED]
  src/components/Cardapio.tsx → src/components/ContaDaMesa.tsx
- `confirmar()` --indirect_call--> `chave()`  [INFERRED]
  src/components/painel/Apagar.tsx → src/components/ContaDaMesa.tsx
- `produtos()` --calls--> `lerTabela()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/exemplo.ts

## Import Cycles
- None detected.

## Communities (86 total, 41 thin omitted)

### Community 0 - "painel/actions.ts"
Cohesion: 0.13
Nodes (29): chaveGoogle(), Contexto, DadosPedidoPainel, entrar(), imagem(), lerHorarioDoForm(), marcado(), mensagem() (+21 more)

### Community 1 - "fotoMaquininha.ts"
Cohesion: 0.06
Nodes (55): tesseract.js, conferirMaquininha(), lerFotoNoGoogle(), ResultadoFoto, totalCartaoDoDia(), ConferirMaquininha(), dataBr(), hora() (+47 more)

### Community 2 - "PainelPedidos.tsx"
Cohesion: 0.07
Nodes (51): react-dom, atribuirEntregador(), mudarStatus(), reservarImpressao(), Rota, metadata, Pedidos(), hora() (+43 more)

### Community 3 - "payload-types.ts"
Cohesion: 0.05
Nodes (41): Acerto, AcertosSelect, Auth, Carrinho, CarrinhosSelect, Categoria, CategoriasSelect, Cliente (+33 more)

### Community 4 - "cliente-actions.ts"
Cohesion: 0.19
Nodes (22): adicionarEndereco(), buscarLoja(), cadastrarCliente(), corrigirEndereco(), EnderecoResumo, Identificacao, identificarCliente(), lerEndereco() (+14 more)

### Community 5 - "vitest"
Cohesion: 0.15
Nodes (17): vitest, fecharContaDaMesa(), textoDoArquivo(), FecharConta(), centavos(), ContaFechada, fecharPagamento(), lerTaxaServico() (+9 more)

### Community 6 - "pedido.ts"
Cohesion: 0.17
Nodes (12): Mesas(), metadata, Conta, ContasMesas(), centavos(), FormaPagamento, ItemEscolhido, ItemPedido (+4 more)

### Community 7 - "opcoes.ts"
Cohesion: 0.17
Nodes (20): criarPedidoDaMesa(), criarPedidoPainel(), editarPedido(), EditarPedido(), metadata, metadata, NovoPedidoPagina(), chaveDe() (+12 more)

### Community 8 - "package.json"
Cohesion: 0.08
Nodes (23): description, license, name, private, type, version, cross-env, eslint (+15 more)

### Community 9 - "payload.config.ts"
Cohesion: 0.20
Nodes (15): payload, ehAdmin(), logado(), soAdmin(), Acertos, Carrinhos, Clientes, Cupons (+7 more)

### Community 10 - "planilha.ts"
Cohesion: 0.10
Nodes (35): read-excel-file, Importador(), confirmar(), converter(), escolher(), lerArquivo(), Loja, Tabela (+27 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 12 - "@payloadcms/next"
Cohesion: 0.13
Nodes (8): @payloadcms/next, @payloadcms/plugin-multi-tenant, @payloadcms/storage-vercel-blob, importMap, Args, Args, GET, Args

### Community 13 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, cross-env, dotenv, graphql, next, payload, @payloadcms/db-postgres, @payloadcms/live-preview-react (+11 more)

### Community 14 - "estoque/page.tsx"
Cohesion: 0.15
Nodes (26): ajustarEstoque(), salvarIngrediente(), AVISO, Estoque(), metadata, ORDEM, consumo(), acertarEstoque() (+18 more)

### Community 15 - "sessao"
Cohesion: 0.12
Nodes (22): apagarCarrinho(), apagarCategoria(), apagarCupom(), apagarIngrediente(), apagarLancamento(), apagarProduto(), marcarEsgotado(), moverCategoria() (+14 more)

### Community 16 - "painel.ts"
Cohesion: 0.19
Nodes (18): Cozinha(), metadata, metadata, PaginaImpressao(), COOKIE_LOJA, idDoGarcom(), nomesDosGarcons(), naCozinha() (+10 more)

### Community 17 - "next"
Cohesion: 0.16
Nodes (8): next, qrcode, metadata, QrDasMesas(), metadata, metadata, Imprimir(), INSTRUCOES_PADRAO

### Community 18 - "exemplo.ts"
Cohesion: 0.05
Nodes (75): fazerAcerto(), ligarEntregador(), Entregadores(), metadata, importarExemplo(), permitido(), relatorioMaquininhaExemplo(), Exemplo() (+67 more)

### Community 19 - "Cadastrar um cliente novo"
Cohesion: 0.13
Nodes (13): 1. Criar a loja (5 min), 2. Criar o login do dono (2 min), 3. Importar os produtos (5 a 15 min), 4. Conferir o cardápio (5 min), 5. Entregar ao cliente, Antes de começar, peça ao cliente, Cadastrar um cliente novo, Cadastrar um cliente novo (+5 more)

### Community 20 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, jsdom, prettier, @testing-library/react, tsx, @types/node (+7 more)

### Community 21 - "ContaDaMesa.tsx"
Cohesion: 0.36
Nodes (9): contaAberta(), contaDaMesa, lojaEMesa(), pedirContaDaMesa(), PagarComPix(), copiar(), chave(), ContaDaMesa() (+1 more)

### Community 22 - "financeiro/page.tsx"
Cohesion: 0.22
Nodes (18): baixarLancamento(), voltarAoFinanceiro(), dataBr(), Financeiro(), metadata, ROTULO_SITUACAO, hojeEmBrasilia(), alertas() (+10 more)

### Community 23 - "SeusPedidos.tsx"
Cohesion: 0.31
Nodes (9): inscrever(), SeusPedidos(), usePedidosLocais(), comPedidoNovo(), ehNumero(), lerPedidosLocais(), MAX_PEDIDOS_LOCAIS, PedidoLocal (+1 more)

### Community 24 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, dev, devsafe, generate:importmap, generate:types, lint, payload (+5 more)

### Community 25 - "lerMesas"
Cohesion: 0.33
Nodes (8): MesaDoGarcom(), metadata, metadata, TelaDoGarcom(), agruparMesas(), lerMesas(), PedidoDeMesa, sessaoGarcom

### Community 26 - "FormLoja.tsx"
Cohesion: 0.05
Nodes (61): react, classica, leve, metadata, moderna, tradicional, trocarLoja(), LayoutLogado() (+53 more)

### Community 27 - "brl"
Cohesion: 0.40
Nodes (8): Carrinhos(), metadata, APAGAR_APOS_DIAS, emMinutosAtras(), mensagemRecuperacao(), PARADO_APOS_MINUTOS, resumoDosItens(), brl()

### Community 28 - "[loja]/page.tsx"
Cohesion: 0.19
Nodes (10): @payloadcms/live-preview-react, buscarLoja, generateMetadata(), Props, revalidate, CategoriaView, LojaDados, url() (+2 more)

### Community 29 - "Cardapio.tsx"
Cohesion: 0.12
Nodes (29): aplicarCupom(), buscarCupom(), conferirItens(), criarPedido(), criarPedidoMesa(), DadosPedido, guardarCarrinho(), ItemParaConferir (+21 more)

### Community 30 - "promocao.ts"
Cohesion: 0.29
Nodes (7): PaginaDaLoja(), LojaAoVivo(), centavos(), descontoDePromocoes(), Promocao, promocaoDoProduto(), rotuloPromocao()

### Community 31 - "loja/page.tsx"
Cohesion: 0.29
Nodes (8): metadata, MinhaLoja(), url(), bairrosComoTexto(), lerSelos(), rotulosDosSelos(), Selo, SELOS

### Community 32 - "permissoes.ts"
Cohesion: 0.15
Nodes (21): alvoDoUsuario(), apagarUsuario(), avisoUsuarios(), ligarUsuario(), salvarUsuario(), trocarSenhaUsuario(), usuariosDaLoja(), metadata (+13 more)

### Community 33 - "next.config.ts"
Cohesion: 0.33
Nodes (3): dirname, __filename, nextConfig

### Community 34 - "cupons/page.tsx"
Cohesion: 0.23
Nodes (14): ligarCupom(), salvarCupom(), Cupons(), dataBr(), metadata, brl(), centavos(), Cupom (+6 more)

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

### Community 42 - "(frontend)/page.tsx"
Cohesion: 0.21
Nodes (3): passos, recursos, metadata

### Community 43 - "Lojas.ts"
Cohesion: 0.24
Nodes (6): todos(), Categorias, Lojas, Media, Produtos, hooksDeCardapio

### Community 44 - "engines"
Cohesion: 0.67
Nodes (3): engines, node, pnpm

### Community 45 - "Pedidos.ts"
Cohesion: 0.43
Nodes (5): Pedidos, Dados, entraAceito(), origemDoPedido(), ORIGENS

### Community 46 - "pixel.ts"
Cohesion: 0.60
Nodes (4): Pixels(), ComPixels, scriptGoogle(), scriptMeta()

### Community 77 - "Formulario"
Cohesion: 0.18
Nodes (16): Estado, ligarGarcom(), mudarGarcom(), pendentesDoAcerto(), trocarSenhaGarcom(), Entrar(), metadata, Garcons() (+8 more)

## Knowledge Gaps
- **13 isolated node(s):** `@payloadcms/ui`, `cross-env`, `graphql`, `@testing-library/react`, `@types/node` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 416 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `painel/actions.ts`, `PainelPedidos.tsx`, `vitest`, `pedido.ts`, `opcoes.ts`, `package.json`, `planilha.ts`, `@payloadcms/next`, `estoque/page.tsx`, `sessao`, `painel.ts`, `exemplo.ts`, `financeiro/page.tsx`, `SeusPedidos.tsx`, `lerMesas`, `FormLoja.tsx`, `brl`, `[loja]/page.tsx`, `Cardapio.tsx`, `loja/page.tsx`, `permissoes.ts`, `next.config.ts`, `cupons/page.tsx`, `(frontend)/page.tsx`, `Lojas.ts`, `pixel.ts`, `Formulario`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **What connects `@payloadcms/ui`, `cross-env`, `graphql` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `painel/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13277310924369748 - nodes in this community are weakly interconnected._
- **Why does `@payloadcms/db-postgres` connect `@payloadcms/db-postgres` to `painel/actions.ts`, `package.json`, `payload.config.ts`, `estoque/page.tsx`, `exemplo.ts`, `20261008_124359_pagamento_pedido.ts`, `20261008_112229_capa_da_loja.ts`, `20261008_123138_formas_pagamento.ts`, `20261008_123734_clientes.ts`, `20261008_125107_aceite_cliente.ts`, `20261008_132134_chave_pix.ts`, `20261008_134615_codigo_retirada.ts`, `index.ts`, `20261008_171738_opcoes_produto.ts`, `20261008_182549_selos_produto.ts`, `20261008_182940_repetir_pedido.ts`, `20261008_184808_cupons.ts`, `20261008_185816_agendamento_pedidos.ts`, `20261008_190223_carrinhos_abandonados.ts`, `20261008_190612_pixels_anuncios.ts`, `20261008_192057_pedido_balcao.ts`, `20261008_192626_mesas_qrcode.ts`, `20261008_193017_entregadores.ts`, `20261008_202353_garcom_no_pedido.ts`, `20261008_202743_mesa_sem_garcom.ts`, `20261008_110821_alt_opcional.ts`, `20261008_204852_acerto_entregador.ts`, `20261008_205540_financeiro.ts`, `20261016_154305_permissoes_usuario.ts`, `20261008_185332_promocao_quantidade.ts`, `20261016_174955_estoque_ingredientes.ts`, `20261016_175513_ficha_tecnica.ts`, `20261016_175645_modo_preparo.ts`, `20261016_175830_setor_categoria.ts`, `20261016_180008_aceite_origem.ts`, `20261016_180316_impressao.ts`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Should `fotoMaquininha.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06340326340326341 - nodes in this community are weakly interconnected._
- **Why does `react` connect `FormLoja.tsx` to `fotoMaquininha.ts`, `PainelPedidos.tsx`, `cliente-actions.ts`, `vitest`, `opcoes.ts`, `package.json`, `planilha.ts`, `@payloadcms/next`, `Formulario`, `painel.ts`, `exemplo.ts`, `ContaDaMesa.tsx`, `SeusPedidos.tsx`, `[loja]/page.tsx`, `Cardapio.tsx`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `PainelPedidos.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06502816180235535 - nodes in this community are weakly interconnected._