# Graph Report - cardapio-online  (2026-10-16)

## Corpus Check
- 286 files · ~488,393 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .csv 11, .css 2, .example 1)

## Summary
- 1270 nodes · 3525 edges · 94 communities (49 shown, 45 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8ff0b1ab`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- painel/actions.ts
- fotoMaquininha.ts
- estoque.ts
- payload-types.ts
- vitest
- brl
- pedido.ts
- opcoes.ts
- package.json
- payload.config.ts
- planilha.ts
- compilerOptions
- @payloadcms/next
- dependencies
- exemplo.ts
- produtos/page.tsx
- cadastrar/actions.ts
- next
- loja/page.tsx
- Cadastrar um cliente novo
- devDependencies
- ContaDaMesa.tsx
- financeiro/page.tsx
- SeusPedidos.tsx
- scripts
- entregadores.ts
- FormLoja.tsx
- (logado)/layout.tsx
- [loja]/page.tsx
- Cardapio.tsx
- painel.ts
- compras/page.tsx
- permissoes.ts
- next.config.ts
- cupons/page.tsx
- seed.ts
- @payloadcms/db-postgres
- [...slug]/route.ts
- eslint.config.mjs
- .prettierrc.json
- Backup do banco
- qr/page.tsx
- Produtos.ts
- engines
- PainelPedidos.tsx
- pixel.ts
- montarRota
- sugestoes.ts
- registrarCompra
- index.ts
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- LEIA-ME.md
- react
- dotenv
- tema.ts
- loginDoGarcom

## God Nodes (most connected - your core abstractions)
1. `sessao()` - 106 edges
2. `brl()` - 59 edges
3. `next` - 58 edges
4. `@payloadcms/db-postgres` - 44 edges
5. `vitest` - 40 edges
6. `lerPreco()` - 37 edges
7. `payload` - 34 edges
8. `react` - 34 edges
9. `Cardapio()` - 34 edges
10. `Formulario()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `lerOk()` --calls--> `lerItensCompra()`  [EXTRACTED]
  tests/int/compras.int.spec.ts → src/lib/compras.ts
- `produtos()` --calls--> `lerOpcoes()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/opcoes.ts
- `produtos()` --calls--> `gruposDoProduto()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/opcoes.ts
- `copiar()` --indirect_call--> `chave()`  [INFERRED]
  src/components/Cardapio.tsx → src/components/ContaDaMesa.tsx
- `confirmar()` --indirect_call--> `chave()`  [INFERRED]
  src/components/painel/Apagar.tsx → src/components/ContaDaMesa.tsx

## Import Cycles
- None detected.

## Communities (94 total, 45 thin omitted)

### Community 0 - "painel/actions.ts"
Cohesion: 0.14
Nodes (41): abrirCaixa(), apagarCarrinho(), apagarCupom(), apagarLancamento(), apagarProduto(), caixaAberto(), Contexto, entrar() (+33 more)

### Community 1 - "fotoMaquininha.ts"
Cohesion: 0.06
Nodes (57): tesseract.js, conferirMaquininha(), lerFotoNoGoogle(), ResultadoFoto, totalCartaoDoDia(), Maquininha(), metadata, ConferirMaquininha() (+49 more)

### Community 2 - "estoque.ts"
Cohesion: 0.13
Nodes (28): ajustarEstoque(), apagarIngrediente(), AVISO, Estoque(), metadata, ORDEM, Ingrediente, Linha (+20 more)

### Community 3 - "payload-types.ts"
Cohesion: 0.04
Nodes (49): Acerto, AcertosSelect, Auth, Caixa, CaixasSelect, Carrinho, CarrinhosSelect, Categoria (+41 more)

### Community 4 - "vitest"
Cohesion: 0.08
Nodes (43): vitest, adicionarEndereco(), buscarLoja(), cadastrarCliente(), corrigirEndereco(), EnderecoResumo, Identificacao, identificarCliente() (+35 more)

### Community 5 - "brl"
Cohesion: 0.19
Nodes (16): MesaDoGarcom(), metadata, metadata, TelaDoGarcom(), Mesas(), metadata, Conta, ContasMesas() (+8 more)

### Community 6 - "pedido.ts"
Cohesion: 0.18
Nodes (12): centavos(), formatarCpf(), ItemEscolhido, MAX_QUANTIDADE, mensagemPedido(), Modo, centavos(), descontoDePromocoes() (+4 more)

### Community 7 - "opcoes.ts"
Cohesion: 0.15
Nodes (23): criarPedidoDaMesa(), criarPedidoPainel(), DadosPedidoPainel, editarPedido(), EditarPedido(), metadata, metadata, NovoPedidoPagina() (+15 more)

### Community 8 - "package.json"
Cohesion: 0.08
Nodes (24): description, license, name, private, type, version, cross-env, eslint (+16 more)

### Community 9 - "payload.config.ts"
Cohesion: 0.14
Nodes (22): payload, adminOuDonoDaLoja(), ehAdmin(), logado(), soAdmin(), Acertos, Caixas, Carrinhos (+14 more)

### Community 10 - "planilha.ts"
Cohesion: 0.09
Nodes (39): read-excel-file, Importar(), metadata, Importador(), confirmar(), converter(), escolher(), lerArquivo() (+31 more)

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
Nodes (64): fecharContaDaMesa(), importarExemplo(), permitido(), relatorioMaquininhaExemplo(), Exemplo(), maxDuration, metadata, ImportarExemplo() (+56 more)

### Community 15 - "produtos/page.tsx"
Cohesion: 0.15
Nodes (15): apagarCategoria(), marcarEsgotado(), moverCategoria(), moverProduto(), Categorias(), metadata, metadata, Produtos() (+7 more)

### Community 16 - "cadastrar/actions.ts"
Cohesion: 0.25
Nodes (12): cadastrarLoja(), texto(), Cadastrar(), metadata, FormCadastro(), erroDoSlug(), lerCnpj(), lerDocumento() (+4 more)

### Community 17 - "next"
Cohesion: 0.09
Nodes (11): next, classica, leve, metadata, moderna, tradicional, passos, recursos (+3 more)

### Community 18 - "loja/page.tsx"
Cohesion: 0.29
Nodes (8): metadata, MinhaLoja(), url(), bairrosComoTexto(), lerSelos(), rotulosDosSelos(), Selo, SELOS

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
Cohesion: 0.27
Nodes (10): inscrever(), SeusPedidos(), usePedidosLocais(), Escolhas, comPedidoNovo(), ehNumero(), lerPedidosLocais(), MAX_PEDIDOS_LOCAIS (+2 more)

### Community 24 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, dev, devsafe, generate:importmap, generate:types, lint, payload (+5 more)

### Community 25 - "entregadores.ts"
Cohesion: 0.10
Nodes (36): fazerAcerto(), Caixa(), metadata, quando(), Entregadores(), metadata, dataBr(), metadata (+28 more)

### Community 26 - "FormLoja.tsx"
Cohesion: 0.09
Nodes (42): metadata, Produto(), adiar(), ApagavelLinha(), assinar(), Aviso, avisos, BotaoApagar() (+34 more)

### Community 27 - "(logado)/layout.tsx"
Cohesion: 0.33
Nodes (7): sair(), tokenCookie(), LayoutLogado(), MENU_GARCOM, AvisosDeApagar(), Menu(), telasDoUsuario()

### Community 28 - "[loja]/page.tsx"
Cohesion: 0.22
Nodes (11): buscarLoja, generateMetadata(), PaginaDaLoja(), Props, revalidate, CategoriaView, LojaAoVivo(), LojaDados (+3 more)

### Community 29 - "Cardapio.tsx"
Cohesion: 0.11
Nodes (33): aplicarCupom(), buscarCupom(), conferirItens(), criarPedido(), criarPedidoMesa(), DadosPedido, guardarCarrinho(), ItemParaConferir (+25 more)

### Community 30 - "painel.ts"
Cohesion: 0.36
Nodes (8): metadata, Pedidos(), metadata, SemAcesso(), COOKIE_LOJA, sessaoGarcom, primeiraTela(), temPermissao()

### Community 31 - "compras/page.tsx"
Cohesion: 0.31
Nodes (7): apagarFornecedor(), Compras(), dataBr(), metadata, Ingrediente, Linha, ListaCompra()

### Community 32 - "permissoes.ts"
Cohesion: 0.19
Nodes (18): alvoDoUsuario(), apagarUsuario(), avisoUsuarios(), ligarUsuario(), salvarUsuario(), trocarSenhaUsuario(), usuariosDaLoja(), metadata (+10 more)

### Community 33 - "next.config.ts"
Cohesion: 0.33
Nodes (3): dirname, __filename, nextConfig

### Community 34 - "cupons/page.tsx"
Cohesion: 0.27
Nodes (11): Cupons(), dataBr(), metadata, brl(), centavos(), Cupom, descontoDoCupom(), diaDoFim() (+3 more)

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

### Community 42 - "qr/page.tsx"
Cohesion: 0.38
Nodes (5): qrcode, metadata, QrDasMesas(), Imprimir(), INSTRUCOES_PADRAO

### Community 43 - "Produtos.ts"
Cohesion: 0.36
Nodes (4): todos(), Categorias, Produtos, hooksDeCardapio

### Community 44 - "engines"
Cohesion: 0.67
Nodes (3): engines, node, pnpm

### Community 45 - "PainelPedidos.tsx"
Cohesion: 0.06
Nodes (59): react-dom, mudarStatus(), Rota, Cozinha(), metadata, metadata, PaginaImpressao(), Pedidos (+51 more)

### Community 46 - "pixel.ts"
Cohesion: 0.39
Nodes (6): Pixels(), ComPixels, lerPixelMeta(), lerTagGoogle(), scriptGoogle(), scriptMeta()

### Community 51 - "montarRota"
Cohesion: 0.27
Nodes (8): atribuirEntregador(), chaveGoogle(), montarRota(), ordemGoogle(), MontarRota(), comCidade(), linkMaps(), MAX_PARADAS

### Community 55 - "sugestoes.ts"
Cohesion: 0.33
Nodes (4): C, P, sugerir(), cardapio

### Community 64 - "registrarCompra"
Cohesion: 0.48
Nodes (5): registrarCompra(), ItemCompra, lerItensCompra(), totalDaCompra(), lerOk()

### Community 77 - "react"
Cohesion: 0.25
Nodes (11): react, Estado, Entrar(), metadata, Garcons(), metadata, Usuarios(), CampoUsuario() (+3 more)

### Community 86 - "tema.ts"
Cohesion: 0.40
Nodes (5): COR_PADRAO, corValida(), Fonte, FONTES, temaDaLoja()

## Knowledge Gaps
- **13 isolated node(s):** `@payloadcms/ui`, `cross-env`, `graphql`, `@testing-library/react`, `@types/node` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 448 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `painel/actions.ts`, `fotoMaquininha.ts`, `estoque.ts`, `vitest`, `brl`, `opcoes.ts`, `package.json`, `planilha.ts`, `@payloadcms/next`, `exemplo.ts`, `produtos/page.tsx`, `cadastrar/actions.ts`, `loja/page.tsx`, `financeiro/page.tsx`, `SeusPedidos.tsx`, `entregadores.ts`, `FormLoja.tsx`, `(logado)/layout.tsx`, `[loja]/page.tsx`, `Cardapio.tsx`, `painel.ts`, `compras/page.tsx`, `permissoes.ts`, `next.config.ts`, `cupons/page.tsx`, `qr/page.tsx`, `Produtos.ts`, `PainelPedidos.tsx`, `pixel.ts`, `react`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **What connects `@payloadcms/ui`, `cross-env`, `graphql` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `painel/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13821138211382114 - nodes in this community are weakly interconnected._
- **Why does `@payloadcms/db-postgres` connect `@payloadcms/db-postgres` to `painel/actions.ts`, `estoque.ts`, `package.json`, `payload.config.ts`, `exemplo.ts`, `20261008_124359_pagamento_pedido.ts`, `20261008_112229_capa_da_loja.ts`, `20261008_123138_formas_pagamento.ts`, `20261008_123734_clientes.ts`, `20261008_125107_aceite_cliente.ts`, `20261008_134615_codigo_retirada.ts`, `20261008_171019_bairros_entrega.ts`, `20261008_171738_opcoes_produto.ts`, `20261008_182940_repetir_pedido.ts`, `20261008_184808_cupons.ts`, `20261008_185816_agendamento_pedidos.ts`, `20261008_190223_carrinhos_abandonados.ts`, `20261008_190612_pixels_anuncios.ts`, `20261008_192057_pedido_balcao.ts`, `20261008_192626_mesas_qrcode.ts`, `20261008_193017_entregadores.ts`, `20261008_202353_garcom_no_pedido.ts`, `20261008_202743_mesa_sem_garcom.ts`, `20261008_110821_alt_opcional.ts`, `20261008_204852_acerto_entregador.ts`, `index.ts`, `20261016_154305_permissoes_usuario.ts`, `20261008_185332_promocao_quantidade.ts`, `20261016_174955_estoque_ingredientes.ts`, `20261016_175513_ficha_tecnica.ts`, `20261016_175645_modo_preparo.ts`, `20261016_175830_setor_categoria.ts`, `20261016_180008_aceite_origem.ts`, `20261016_180316_impressao.ts`, `20261008_202042_garcons.ts`, `20261008_132134_chave_pix.ts`, `20261016_184524_caixa.ts`, `20261016_201352_custo_ingrediente.ts`, `20261016_202253_compras_fornecedores.ts`, `20261016_222300_cadastro_da_loja.ts`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Should `fotoMaquininha.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06010230179028133 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `fotoMaquininha.ts`, `estoque.ts`, `brl`, `pedido.ts`, `opcoes.ts`, `package.json`, `planilha.ts`, `exemplo.ts`, `produtos/page.tsx`, `cadastrar/actions.ts`, `loja/page.tsx`, `financeiro/page.tsx`, `SeusPedidos.tsx`, `entregadores.ts`, `FormLoja.tsx`, `Cardapio.tsx`, `permissoes.ts`, `cupons/page.tsx`, `PainelPedidos.tsx`, `pixel.ts`, `montarRota`, `sugestoes.ts`, `registrarCompra`, `loginDoGarcom`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `estoque.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1268939393939394 - nodes in this community are weakly interconnected._