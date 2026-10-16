@AGENTS.md

## Regras de trabalho (Guilherme)

- Responder em português do Brasil, com frases curtas e sem travessão.
- Antes de editar arquivos, rodar comandos que alterem algo ou abrir PR, enviar um plano curto (o que muda, onde, riscos, o que fica de fora) e esperar o OK. Pesquisa e leitura são livres.
- Uma issue por PR, com "Closes #N". O Guilherme cria as issues e faz os merges.
- Ao sugerir uma issue, enviar o título e a descrição prontos para copiar e colar, no formato Para que serve, O que fazer, Fora desta issue e Pronto quando.
- Antes de abrir o PR: rodar `npx tsc --noEmit`, `npx eslint src tests` e `npx vitest run tests/int`, e conferir a tela no navegador quando houver tela.
- Rodar `graphify update .` em cada PR de código e incluir `graphify-out/` no mesmo PR. Com dois PRs abertos ao mesmo tempo, atualizar o grafo só depois do merge, para não dar conflito no `graph.json`.
- Registrar na memória do projeto o que a próxima thread precisaria perguntar de novo.
- Não inventar: o que não foi verificado deve ser dito como "não verificado".

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
