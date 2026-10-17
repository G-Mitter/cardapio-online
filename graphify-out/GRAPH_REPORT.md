# Graph Report - cardapio-online  (2026-10-17)

## Corpus Check
- 294 files · ~515,193 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .csv 11, .css 2, .example 1)

## Summary
- 1304 nodes · 3632 edges · 107 communities (58 shown, 49 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dd8183b7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- painel/actions.ts
- fotoMaquininha.ts
- estoque.ts
- payload-types.ts
- vitest
- pedido.ts
- PainelPedidos.tsx
- lerPreco
- package.json
- payload.config.ts
- planilha.ts
- compilerOptions
- @payloadcms/next
- dependencies
- exemplo-db.ts
- react
- cadastrar/actions.ts
- next
- loja/page.tsx
- Cadastrar um cliente novo
- devDependencies
- sessao
- opcoes.ts
- cozinha/page.tsx
- scripts
- financeiro/page.tsx
- FormLoja.tsx
- Apagar.tsx
- [loja]/page.tsx
- Cardapio.tsx
- (logado)/page.tsx
- compras/page.tsx
- permissoes.ts
- maquininha.ts
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
- garcons/page.tsx
- index.ts
- (frontend)/layout.tsx
- registrarCompra
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- LEIA-ME.md
- react
- dotenv
- SeusPedidos.tsx
- cupom.ts
- ContaDaMesa.tsx
- loginDoGarcom
- exemplo.ts
- (logado)/layout.tsx
- promocao.ts
- pixel.ts
- sugestoes.ts
- Media.ts
- mover

## God Nodes (most connected - your core abstractions)
1. `sessao()` - 111 edges
2. `next` - 60 edges
3. `brl()` - 59 edges
4. `@payloadcms/db-postgres` - 46 edges
5. `vitest` - 41 edges
6. `lerPreco()` - 37 edges
7. `payload` - 35 edges
8. `react` - 34 edges
9. `Cardapio()` - 34 edges
10. `Formulario()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `lerOk()` --calls--> `lerItensCompra()`  [EXTRACTED]
  tests/int/compras.int.spec.ts → src/lib/compras.ts
- `grupos()` --calls--> `lerOpcoes()`  [EXTRACTED]
  tests/int/opcoes.int.spec.ts → src/lib/opcoes.ts
- `produtos()` --calls--> `gruposDoProduto()`  [EXTRACTED]
  tests/int/exemplo.int.spec.ts → src/lib/opcoes.ts
- `feitos()` --calls--> `primeirosPassos()`  [EXTRACTED]
  tests/int/primeirosPassos.int.spec.ts → src/lib/primeirosPassos.ts
- `avancar()` --calls--> `mudarStatus()`  [EXTRACTED]
  src/components/painel/TelaCozinha.tsx → src/app/(frontend)/painel/actions.ts

## Import Cycles
- None detected.

## Communities (107 total, 49 thin omitted)

### Community 0 - "painel/actions.ts"
Cohesion: 0.18
Nodes (26): Contexto, DadosPedidoPainel, imagem(), lerHorarioDoForm(), ligarGarcom(), marcado(), mensagem(), mudarGarcom() (+18 more)

### Community 1 - "fotoMaquininha.ts"
Cohesion: 0.10
Nodes (36): tesseract.js, lerFotoNoGoogle(), ResultadoFoto, totalCartaoDoDia(), dataBr(), Foto, FotoMaquininha(), adicionar() (+28 more)

### Community 2 - "estoque.ts"
Cohesion: 0.14
Nodes (28): ajustarEstoque(), AVISO, Estoque(), metadata, ORDEM, Produtos(), consumo(), custoDoPrato (+20 more)

### Community 3 - "payload-types.ts"
Cohesion: 0.04
Nodes (51): Acerto, AcertosSelect, Auth, Caixa, CaixasCadastrado, CaixasCadastradosSelect, CaixasSelect, Carrinho (+43 more)

### Community 4 - "vitest"
Cohesion: 0.12
Nodes (33): adicionarEndereco(), buscarLoja(), cadastrarCliente(), corrigirEndereco(), EnderecoResumo, Identificacao, identificarCliente(), lerEndereco() (+25 more)

### Community 5 - "pedido.ts"
Cohesion: 0.15
Nodes (21): MesaDoGarcom(), metadata, metadata, TelaDoGarcom(), Mesas(), metadata, Conta, ContasMesas() (+13 more)

### Community 6 - "PainelPedidos.tsx"
Cohesion: 0.26
Nodes (12): atribuirEntregador(), mudarStatus(), ConferirCodigo(), EntregadorView, hora(), MontarRota(), PainelPedidos(), mudar() (+4 more)

### Community 7 - "lerPreco"
Cohesion: 0.15
Nodes (28): abrirCaixa(), atribuirVendasSemCaixa(), caixaDaTela(), fecharCaixa(), ligarCaixaCadastrado(), movimentarCaixa(), quandoAbriu(), trabalharNoCaixa() (+20 more)

### Community 8 - "package.json"
Cohesion: 0.08
Nodes (25): description, license, name, private, type, version, cross-env, eslint (+17 more)

### Community 9 - "payload.config.ts"
Cohesion: 0.15
Nodes (16): payload, logado(), Acertos, Caixas, CaixasCadastrados, Carrinhos, Clientes, Compras (+8 more)

### Community 10 - "planilha.ts"
Cohesion: 0.10
Nodes (36): Importador(), confirmar(), converter(), escolher(), lerArquivo(), Loja, Tabela, analisar() (+28 more)

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
Nodes (26): importarExemplo(), permitido(), relatorioMaquininhaExemplo(), Exemplo(), maxDuration, metadata, ImportarExemplo(), baixarRelatorio() (+18 more)

### Community 15 - "react"
Cohesion: 0.23
Nodes (12): metadata, Produto(), BotaoApagar(), Contador(), Ingrediente, Linha, ListaFicha(), Grupo (+4 more)

### Community 16 - "cadastrar/actions.ts"
Cohesion: 0.18
Nodes (13): cadastrarLoja(), texto(), Cadastrar(), metadata, entrar(), metadata, FormCadastro(), erroDoSlug() (+5 more)

### Community 17 - "next"
Cohesion: 0.12
Nodes (9): next, passos, recursos, Importar(), metadata, metadata, NovoPedidoPagina(), metadata (+1 more)

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
Cohesion: 0.15
Nodes (22): apagarCarrinho(), apagarCategoria(), apagarCupom(), apagarFornecedor(), apagarIngrediente(), apagarLancamento(), apagarProduto(), apagarUsuario() (+14 more)

### Community 22 - "opcoes.ts"
Cohesion: 0.17
Nodes (20): caixaDaVenda(), criarPedidoDaMesa(), criarPedidoPainel(), editarPedido(), EditarPedido(), metadata, chaveDe(), Linha (+12 more)

### Community 23 - "cozinha/page.tsx"
Cohesion: 0.31
Nodes (11): Cozinha(), metadata, naCozinha(), ComSetor, filtrarPorSetor(), lerSetor(), mesmo(), SETOR_PADRAO (+3 more)

### Community 24 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, dev, devsafe, generate:importmap, generate:types, lint, payload (+5 more)

### Community 25 - "financeiro/page.tsx"
Cohesion: 0.09
Nodes (43): baixarLancamento(), fazerAcerto(), ligarEntregador(), mudarPagamentoDoPedido(), pendentesDoAcerto(), voltarAoFinanceiro(), Entregadores(), metadata (+35 more)

### Community 26 - "FormLoja.tsx"
Cohesion: 0.26
Nodes (13): CampoImagem(), reduzir(), bairrosDaPrevia(), DadosLoja, FormLoja(), DIAS, EnderecoLoja, hora() (+5 more)

### Community 27 - "Apagar.tsx"
Cohesion: 0.26
Nodes (12): adiar(), ApagavelLinha(), assinar(), Aviso, avisos, confirmar(), emitir(), escondidos (+4 more)

### Community 28 - "[loja]/page.tsx"
Cohesion: 0.14
Nodes (16): @payloadcms/live-preview-react, buscarLoja, generateMetadata(), Props, revalidate, CategoriaView, LojaAoVivo(), LojaDados (+8 more)

### Community 29 - "Cardapio.tsx"
Cohesion: 0.12
Nodes (30): aplicarCupom(), buscarCupom(), conferirItens(), criarPedido(), criarPedidoMesa(), DadosPedido, guardarCarrinho(), ItemParaConferir (+22 more)

### Community 30 - "(logado)/page.tsx"
Cohesion: 0.19
Nodes (14): vitest, dispensarPassos(), metadata, Pedidos(), PrimeirosPassos(), idDoGarcom(), nomesDosGarcons(), inicioDoDia() (+6 more)

### Community 31 - "compras/page.tsx"
Cohesion: 0.36
Nodes (6): Compras(), dataBr(), metadata, Ingrediente, Linha, ListaCompra()

### Community 32 - "permissoes.ts"
Cohesion: 0.18
Nodes (17): alvoDoUsuario(), avisoUsuarios(), ligarUsuario(), salvarUsuario(), usuariosDaLoja(), metadata, SemAcesso(), contido() (+9 more)

### Community 33 - "maquininha.ts"
Cohesion: 0.15
Nodes (21): conferirMaquininha(), Maquininha(), metadata, ConferirMaquininha(), dataBr(), hora(), Retorno, acharColuna() (+13 more)

### Community 34 - "TelaCozinha.tsx"
Cohesion: 0.23
Nodes (11): apitar(), COLUNAS, hora(), PedidoCozinha, TelaCozinha(), ativarSom(), avancar(), ANTECEDENCIA_COZINHA_MIN (+3 more)

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

### Community 42 - "Impressao.tsx"
Cohesion: 0.18
Nodes (15): react-dom, reservarImpressao(), hora(), Impressao(), TESTE, Ticket(), lerAgendamento(), limitesDoCampo() (+7 more)

### Community 43 - "payload"
Cohesion: 0.20
Nodes (11): adminOuDonoDaLoja(), ehAdmin(), soAdmin(), todos(), Categorias, Fechamentos, Lojas, Produtos (+3 more)

### Community 44 - "engines"
Cohesion: 0.67
Nodes (3): engines, node, pnpm

### Community 45 - "impressao/page.tsx"
Cohesion: 0.14
Nodes (19): salvarImpressao(), metadata, PaginaImpressao(), Pedidos, PedidoImpressao, Dados, entraAceito(), Origem (+11 more)

### Community 46 - "carrinhos/page.tsx"
Cohesion: 0.38
Nodes (7): Carrinhos(), metadata, APAGAR_APOS_DIAS, emMinutosAtras(), mensagemRecuperacao(), PARADO_APOS_MINUTOS, ItemPedido

### Community 51 - "montarRota"
Cohesion: 0.36
Nodes (6): chaveGoogle(), montarRota(), ordemGoogle(), comCidade(), linkMaps(), MAX_PARADAS

### Community 55 - "ListaBairros.tsx"
Cohesion: 0.32
Nodes (9): CampoDinheiro(), CampoTelefone(), deTexto(), Linha, ListaBairros(), paraTexto(), centavosDoTexto(), dinheiroDeCentavos() (+1 more)

### Community 58 - "garcons/page.tsx"
Cohesion: 0.26
Nodes (13): fecharContaDaMesa(), Garcons(), metadata, FecharConta(), centavos(), ContaFechada, fecharPagamento(), lerTaxaServico() (+5 more)

### Community 63 - "(frontend)/layout.tsx"
Cohesion: 0.25
Nodes (5): classica, leve, metadata, moderna, tradicional

### Community 64 - "registrarCompra"
Cohesion: 0.53
Nodes (4): ItemCompra, lerItensCompra(), totalDaCompra(), lerOk()

### Community 77 - "react"
Cohesion: 0.20
Nodes (13): react, Estado, Entrar(), metadata, metadata, QrDasMesas(), metadata, Usuarios() (+5 more)

### Community 81 - "SeusPedidos.tsx"
Cohesion: 0.27
Nodes (10): inscrever(), SeusPedidos(), usePedidosLocais(), Escolhas, comPedidoNovo(), ehNumero(), lerPedidosLocais(), MAX_PEDIDOS_LOCAIS (+2 more)

### Community 82 - "cupom.ts"
Cohesion: 0.33
Nodes (9): brl(), centavos(), Cupom, descontoDoCupom(), diaDoFim(), fimDoDia(), normalizarCodigo(), rotuloDoCupom() (+1 more)

### Community 86 - "ContaDaMesa.tsx"
Cohesion: 0.36
Nodes (9): contaAberta(), contaDaMesa, lojaEMesa(), pedirContaDaMesa(), PagarComPix(), copiar(), chave(), ContaDaMesa() (+1 more)

### Community 94 - "exemplo.ts"
Cohesion: 0.12
Nodes (32): Bairro, lerBairros(), taxaDoBairro(), ATENDIMENTOS, ContextoPlano, escolhasPorNome(), inteiro(), ItemLido (+24 more)

### Community 99 - "(logado)/layout.tsx"
Cohesion: 0.29
Nodes (8): sair(), tokenCookie(), trocarLoja(), LayoutLogado(), MENU_GARCOM, AvisosDeApagar(), Menu(), telasDoUsuario()

### Community 100 - "promocao.ts"
Cohesion: 0.33
Nodes (6): PaginaDaLoja(), centavos(), descontoDePromocoes(), Promocao, promocaoDoProduto(), rotuloPromocao()

### Community 101 - "pixel.ts"
Cohesion: 0.39
Nodes (6): Pixels(), ComPixels, lerPixelMeta(), lerTagGoogle(), scriptGoogle(), scriptMeta()

### Community 102 - "sugestoes.ts"
Cohesion: 0.33
Nodes (4): C, P, sugerir(), cardapio

## Knowledge Gaps
- **13 isolated node(s):** `@payloadcms/ui`, `cross-env`, `graphql`, `@testing-library/react`, `@types/node` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 456 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@payloadcms/db-postgres` connect `@payloadcms/db-postgres` to `painel/actions.ts`, `estoque.ts`, `package.json`, `payload.config.ts`, `exemplo-db.ts`, `20261008_124359_pagamento_pedido.ts`, `20261008_112229_capa_da_loja.ts`, `20261008_123138_formas_pagamento.ts`, `20261008_123734_clientes.ts`, `20261008_125107_aceite_cliente.ts`, `20261008_134615_codigo_retirada.ts`, `20261008_171019_bairros_entrega.ts`, `20261008_171738_opcoes_produto.ts`, `20261008_182940_repetir_pedido.ts`, `20261008_184808_cupons.ts`, `20261008_190223_carrinhos_abandonados.ts`, `20261008_190612_pixels_anuncios.ts`, `index.ts`, `20261008_192626_mesas_qrcode.ts`, `20261008_202353_garcom_no_pedido.ts`, `20261008_202743_mesa_sem_garcom.ts`, `20261008_110821_alt_opcional.ts`, `20261008_204852_acerto_entregador.ts`, `20261008_182549_selos_produto.ts`, `20261016_154305_permissoes_usuario.ts`, `20261008_185332_promocao_quantidade.ts`, `20261016_174955_estoque_ingredientes.ts`, `20261016_175830_setor_categoria.ts`, `20261016_180008_aceite_origem.ts`, `20261016_180316_impressao.ts`, `20261008_202042_garcons.ts`, `20261008_132134_chave_pix.ts`, `20261016_184524_caixa.ts`, `20261016_201352_custo_ingrediente.ts`, `20261016_202253_compras_fornecedores.ts`, `20261016_222300_cadastro_da_loja.ts`, `20261008_203548_fechar_conta.ts`, `20261008_205540_financeiro.ts`, `20261016_203004_contatos_promocoes.ts`, `20261016_223106_passos_dispensados.ts`, `20261016_175513_ficha_tecnica.ts`, `20261017_144625_caixas_cadastrados.ts`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **What connects `@payloadcms/ui`, `cross-env`, `graphql` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `fotoMaquininha.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09725158562367865 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `painel/actions.ts`, `estoque.ts`, `vitest`, `pedido.ts`, `PainelPedidos.tsx`, `lerPreco`, `package.json`, `planilha.ts`, `@payloadcms/next`, `exemplo-db.ts`, `react`, `cadastrar/actions.ts`, `loja/page.tsx`, `sessao`, `opcoes.ts`, `cozinha/page.tsx`, `financeiro/page.tsx`, `Apagar.tsx`, `[loja]/page.tsx`, `Cardapio.tsx`, `(logado)/page.tsx`, `compras/page.tsx`, `permissoes.ts`, `maquininha.ts`, `TelaCozinha.tsx`, `[...slug]/route.ts`, `Impressao.tsx`, `payload`, `impressao/page.tsx`, `carrinhos/page.tsx`, `garcons/page.tsx`, `(frontend)/layout.tsx`, `react`, `SeusPedidos.tsx`, `(logado)/layout.tsx`, `pixel.ts`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Should `estoque.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13709677419354838 - nodes in this community are weakly interconnected._
- **Why does `sessao()` connect `sessao` to `painel/actions.ts`, `fotoMaquininha.ts`, `estoque.ts`, `vitest`, `pedido.ts`, `PainelPedidos.tsx`, `lerPreco`, `planilha.ts`, `exemplo-db.ts`, `react`, `next`, `loja/page.tsx`, `opcoes.ts`, `cozinha/page.tsx`, `financeiro/page.tsx`, `(logado)/page.tsx`, `compras/page.tsx`, `permissoes.ts`, `maquininha.ts`, `Impressao.tsx`, `impressao/page.tsx`, `carrinhos/page.tsx`, `montarRota`, `garcons/page.tsx`, `react`, `(logado)/layout.tsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `payload-types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0392156862745098 - nodes in this community are weakly interconnected._