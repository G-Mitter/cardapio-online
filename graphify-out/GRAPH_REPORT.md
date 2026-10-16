# Graph Report - cardapio-online  (2026-10-16)

## Corpus Check
- 226 files · ~358,098 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: .csv 11, .css 2, .example 1)

## Summary
- 1036 nodes · 2791 edges · 81 communities (46 shown, 35 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7eccd997`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- painel/actions.ts
- fotoMaquininha.ts
- next
- payload-types.ts
- cliente-actions.ts
- FecharConta.tsx
- pedido.ts
- gruposDoProduto
- package.json
- payload.config.ts
- planilha.ts
- compilerOptions
- @payloadcms/next
- dependencies
- montarRota
- sessao
- exemplo-db.ts
- opcoes.ts
- lerPreco
- Cadastrar um cliente novo
- devDependencies
- ContaDaMesa.tsx
- financeiro/page.tsx
- SeusPedidos.tsx
- scripts
- Apagar.tsx
- FormLoja.tsx
- brl
- [loja]/page.tsx
- Cardapio
- sugestoes.ts
- loja/page.tsx
- permissoes.ts
- next.config.ts
- cupons/page.tsx
- index.ts
- seed.ts
- @payloadcms/db-postgres
- [...slug]/route.ts
- eslint.config.mjs
- .prettierrc.json
- Backup do banco
- exemplo/actions.ts
- Lojas.ts
- engines
- agendamento.ts
- pixel.ts
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- LEIA-ME.md
- garcons/page.tsx
- dotenv
- lerPreco
- Media.ts

## God Nodes (most connected - your core abstractions)
1. `sessao()` - 80 edges
2. `next` - 48 edges
3. `brl()` - 47 edges
4. `Cardapio()` - 34 edges
5. `lerPreco()` - 32 edges
6. `@payloadcms/db-postgres` - 31 edges
7. `vitest` - 31 edges
8. `react` - 30 edges
9. `planejar()` - 30 edges
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

## Communities (81 total, 35 thin omitted)

### Community 0 - "painel/actions.ts"
Cohesion: 0.17
Nodes (23): avisoUsuarios(), Contexto, entrar(), imagem(), lerHorarioDoForm(), marcado(), mensagem(), mudarPagamentoDoPedido() (+15 more)

### Community 1 - "fotoMaquininha.ts"
Cohesion: 0.06
Nodes (54): conferirMaquininha(), lerFotoNoGoogle(), ResultadoFoto, totalCartaoDoDia(), Maquininha(), metadata, ConferirMaquininha(), dataBr() (+46 more)

### Community 2 - "next"
Cohesion: 0.06
Nodes (48): next, vitest, passos, recursos, atribuirEntregador(), mudarStatus(), Rota, metadata (+40 more)

### Community 3 - "payload-types.ts"
Cohesion: 0.05
Nodes (39): Acerto, AcertosSelect, Auth, Carrinho, CarrinhosSelect, Categoria, CategoriasSelect, Cliente (+31 more)

### Community 4 - "cliente-actions.ts"
Cohesion: 0.21
Nodes (21): adicionarEndereco(), buscarLoja(), cadastrarCliente(), corrigirEndereco(), EnderecoResumo, Identificacao, identificarCliente(), lerEndereco() (+13 more)

### Community 5 - "FecharConta.tsx"
Cohesion: 0.12
Nodes (26): qrcode, fecharContaDaMesa(), MesaDoGarcom(), metadata, Mesas(), metadata, metadata, QrDasMesas() (+18 more)

### Community 6 - "pedido.ts"
Cohesion: 0.17
Nodes (13): centavos(), formatarCpf(), ItemEscolhido, lerCpf(), MAX_QUANTIDADE, mensagemPedido(), Modo, rotuloPagamento() (+5 more)

### Community 7 - "gruposDoProduto"
Cohesion: 0.20
Nodes (17): conferirItens(), criarPedidoDaMesa(), criarPedidoPainel(), DadosPedidoPainel, editarPedido(), EditarPedido(), metadata, metadata (+9 more)

### Community 8 - "package.json"
Cohesion: 0.08
Nodes (25): description, license, name, private, type, version, cross-env, eslint (+17 more)

### Community 9 - "payload.config.ts"
Cohesion: 0.19
Nodes (16): payload, ehAdmin(), logado(), soAdmin(), Acertos, Carrinhos, Clientes, Cupons (+8 more)

### Community 10 - "planilha.ts"
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

### Community 14 - "montarRota"
Cohesion: 0.36
Nodes (6): chaveGoogle(), montarRota(), ordemGoogle(), comCidade(), linkMaps(), MAX_PARADAS

### Community 15 - "sessao"
Cohesion: 0.15
Nodes (17): apagarCarrinho(), apagarCategoria(), apagarCupom(), apagarProduto(), ligarCupom(), ligarEntregador(), marcarEsgotado(), moverCategoria() (+9 more)

### Community 16 - "exemplo-db.ts"
Cohesion: 0.22
Nodes (10): datar(), Dono, emParalelo(), gravarExemplo(), Erro, momento(), Nome, Planilhas (+2 more)

### Community 17 - "opcoes.ts"
Cohesion: 0.32
Nodes (6): GrupoDaTela, GrupoNovo, GrupoOpcao, ItemOpcao, lerOpcoes(), grupos()

### Community 18 - "lerPreco"
Cohesion: 0.12
Nodes (26): Recebido, ATENDIMENTOS, ContextoPlano, dm(), escolhasPorNome(), inteiro(), ItemLido, lerEntregue() (+18 more)

### Community 19 - "Cadastrar um cliente novo"
Cohesion: 0.13
Nodes (13): 1. Criar a loja (5 min), 2. Criar o login do dono (2 min), 3. Importar os produtos (5 a 15 min), 4. Conferir o cardápio (5 min), 5. Entregar ao cliente, Antes de começar, peça ao cliente, Cadastrar um cliente novo, Cadastrar um cliente novo (+5 more)

### Community 20 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, jsdom, prettier, @testing-library/react, tsx, @types/node (+7 more)

### Community 21 - "ContaDaMesa.tsx"
Cohesion: 0.20
Nodes (15): contaAberta(), contaDaMesa, DadosPedido, ItemParaConferir, lojaEMesa(), pedirContaDaMesa(), ResultadoCupom, ResultadoMesa (+7 more)

### Community 22 - "financeiro/page.tsx"
Cohesion: 0.20
Nodes (20): apagarLancamento(), baixarLancamento(), voltarAoFinanceiro(), dataBr(), Financeiro(), metadata, ROTULO_SITUACAO, hojeEmBrasilia() (+12 more)

### Community 23 - "SeusPedidos.tsx"
Cohesion: 0.19
Nodes (15): Foto, Linha, LojaView, ProdutoView, ClienteEscolhido, inscrever(), SeusPedidos(), usePedidosLocais() (+7 more)

### Community 24 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, dev, devsafe, generate:importmap, generate:types, lint, payload (+5 more)

### Community 25 - "Apagar.tsx"
Cohesion: 0.18
Nodes (16): LayoutLogado(), MENU_GARCOM, adiar(), ApagavelLinha(), assinar(), Aviso, avisos, AvisosDeApagar() (+8 more)

### Community 26 - "FormLoja.tsx"
Cohesion: 0.08
Nodes (40): react, classica, leve, metadata, moderna, tradicional, metadata, Produto() (+32 more)

### Community 27 - "brl"
Cohesion: 0.17
Nodes (23): fazerAcerto(), pendentesDoAcerto(), Carrinhos(), metadata, Entregadores(), metadata, AcertoEntregador(), APAGAR_APOS_DIAS (+15 more)

### Community 28 - "[loja]/page.tsx"
Cohesion: 0.20
Nodes (12): @payloadcms/live-preview-react, buscarLoja, generateMetadata(), PaginaDaLoja(), Props, revalidate, CategoriaView, LojaAoVivo() (+4 more)

### Community 29 - "Cardapio"
Cohesion: 0.18
Nodes (16): aplicarCupom(), buscarCupom(), criarPedido(), criarPedidoMesa(), guardarCarrinho(), pedirDeNovo(), repetirUltimoPedido(), texto() (+8 more)

### Community 30 - "sugestoes.ts"
Cohesion: 0.33
Nodes (4): C, P, sugerir(), cardapio

### Community 31 - "loja/page.tsx"
Cohesion: 0.27
Nodes (9): metadata, MinhaLoja(), url(), bairrosComoTexto(), promocaoDoProduto(), lerSelos(), rotulosDosSelos(), Selo (+1 more)

### Community 32 - "permissoes.ts"
Cohesion: 0.21
Nodes (19): alvoDoUsuario(), apagarUsuario(), ligarUsuario(), salvarUsuario(), trocarSenhaUsuario(), metadata, Usuarios(), contido() (+11 more)

### Community 33 - "next.config.ts"
Cohesion: 0.33
Nodes (3): dirname, __filename, nextConfig

### Community 34 - "cupons/page.tsx"
Cohesion: 0.25
Nodes (13): salvarCupom(), Cupons(), dataBr(), metadata, brl(), centavos(), Cupom, descontoDoCupom() (+5 more)

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

### Community 42 - "exemplo/actions.ts"
Cohesion: 0.19
Nodes (14): importarExemplo(), permitido(), relatorioMaquininhaExemplo(), Exemplo(), maxDuration, metadata, ImportarExemplo(), baixarRelatorio() (+6 more)

### Community 43 - "Lojas.ts"
Cohesion: 0.31
Nodes (5): todos(), Categorias, Lojas, Produtos, hooksDeCardapio

### Community 44 - "engines"
Cohesion: 0.67
Nodes (3): engines, node, pnpm

### Community 45 - "agendamento.ts"
Cohesion: 0.38
Nodes (5): lerAgendamento(), limitesDoCampo(), MAX_DIAS, MIN_MINUTOS, agora

### Community 46 - "pixel.ts"
Cohesion: 0.39
Nodes (6): Pixels(), ComPixels, lerPixelMeta(), lerTagGoogle(), scriptGoogle(), scriptMeta()

### Community 77 - "garcons/page.tsx"
Cohesion: 0.24
Nodes (11): Estado, ligarGarcom(), mudarGarcom(), trocarSenhaGarcom(), Entrar(), Garcons(), metadata, CampoUsuario() (+3 more)

### Community 79 - "lerPreco"
Cohesion: 0.21
Nodes (13): Bairro, lerBairros(), taxaDoBairro(), COLUNAS, Leitura, lerCsv(), lerPreco(), lerProdutos() (+5 more)

## Knowledge Gaps
- **14 isolated node(s):** `@payloadcms/ui`, `cross-env`, `graphql`, `react-dom`, `@testing-library/react` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 378 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `painel/actions.ts`, `fotoMaquininha.ts`, `FecharConta.tsx`, `gruposDoProduto`, `package.json`, `planilha.ts`, `@payloadcms/next`, `sessao`, `financeiro/page.tsx`, `SeusPedidos.tsx`, `Apagar.tsx`, `FormLoja.tsx`, `brl`, `[loja]/page.tsx`, `loja/page.tsx`, `permissoes.ts`, `next.config.ts`, `cupons/page.tsx`, `exemplo/actions.ts`, `Lojas.ts`, `pixel.ts`, `garcons/page.tsx`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **What connects `@payloadcms/ui`, `cross-env`, `graphql` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `fotoMaquininha.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06442307692307692 - nodes in this community are weakly interconnected._
- **Why does `@payloadcms/db-postgres` connect `@payloadcms/db-postgres` to `package.json`, `payload.config.ts`, `exemplo-db.ts`, `index.ts`, `20261008_112229_capa_da_loja.ts`, `20261008_123138_formas_pagamento.ts`, `20261008_123734_clientes.ts`, `20261008_125107_aceite_cliente.ts`, `20261008_132134_chave_pix.ts`, `20261008_134615_codigo_retirada.ts`, `20261008_171019_bairros_entrega.ts`, `20261008_171738_opcoes_produto.ts`, `20261008_182549_selos_produto.ts`, `20261008_182940_repetir_pedido.ts`, `20261008_184808_cupons.ts`, `20261008_185816_agendamento_pedidos.ts`, `20261008_190223_carrinhos_abandonados.ts`, `20261008_190612_pixels_anuncios.ts`, `20261008_192057_pedido_balcao.ts`, `20261008_192626_mesas_qrcode.ts`, `20261008_193017_entregadores.ts`, `20261008_202042_garcons.ts`, `20261008_202353_garcom_no_pedido.ts`, `20261008_202743_mesa_sem_garcom.ts`, `20261008_203548_fechar_conta.ts`, `20261008_204852_acerto_entregador.ts`, `20261008_205540_financeiro.ts`, `20261016_154305_permissoes_usuario.ts`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.06189640035118525 - nodes in this community are weakly interconnected._
- **Why does `react` connect `FormLoja.tsx` to `fotoMaquininha.ts`, `next`, `cliente-actions.ts`, `FecharConta.tsx`, `gruposDoProduto`, `package.json`, `planilha.ts`, `exemplo/actions.ts`, `@payloadcms/next`, `garcons/page.tsx`, `ContaDaMesa.tsx`, `SeusPedidos.tsx`, `Apagar.tsx`, `brl`, `[loja]/page.tsx`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `payload-types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._