# Dados de exemplo da Cantina Dona Lurdes

Planilhas (CSV com `;`, UTF-8) que a importação de exemplo lê (painel, "Dados de exemplo", só para o administrador na Cantina). Para mudar algo, edite uma planilha e envie-a na mesma tela: as que você não enviar seguem estas. Datas são relativas ao dia da importação:
`dia` 0 = hoje, -1 = ontem, -2 = anteontem. Assim as telas "do dia" sempre têm o que mostrar.

| Arquivo | O que tem |
|---|---|
| loja.csv | Mesas (8), atendimento "os dois", taxa de serviço 10%, chave Pix e 5 bairros com taxa |
| produtos.csv | Opções (tamanho, borda, molho, sabor, adicionais), selos e "leve 3 pague 2" no pão de queijo, "leve 4 pague 3" no refrigerante |
| cupons.csv | 2 válidos, 1 vencido e 1 com limite esgotado (para testar a recusa) |
| garcons.csv | Marcos e Juliana (ativos), Pedro (desligado). Senha de todos: garcom123. Login: usuario.cantina-dona-lurdes |
| entregadores.csv | Carlos e Renata (ativos), Zé (desligado) |
| clientes.csv | 8 clientes fictícios (telefones 31 90000-0001 a 0008) com endereço nos bairros cadastrados |
| pedidos.csv | 46 pedidos: entrega, retirada, balcão, mesa e agendados; cupons, opções, CPF na nota, cancelado; hoje com pedidos em todas as colunas da cozinha, 3 mesas abertas (uma pediu a conta) |
| fechamentos.csv | 7 contas de mesa fechadas, com taxa de serviço, pagamento dividido e troco. `resto` = o que falta para o total |
| acertos.csv | 3 acertos de entregador (confere, faltou R$ 10, sobrou R$ 5). Renata ontem fica sem acerto para você testar |
| lancamentos.csv | 13 contas a pagar e a receber: pagas, vencidas, vencendo hoje, próximos 7 dias e fixas |
| carrinhos.csv | 4 carrinhos abandonados (um com menos de 30 min, que ainda não aparece) |

Itens do pedido: `2x Produto (Grupo: Opção; Grupo: Opção) | 1x Outro`. Preços, promoções, cupom e taxa do bairro
são calculados pelo sistema na importação, como num pedido de verdade.

Atalhos: `troco_para` = `auto` (pedidos) é a próxima nota de R$ 50 acima do total; em `pagamentos` (fechamentos), `metade` e `resto`
completam a conta, e `troco` = `auto` faz o pagamento em dinheiro vir em nota de R$ 10; em `acertos`, `entregou` pode ser `esperado`,
`esperado-10` ou `esperado+5`.

O relatório da maquininha de exemplo sai da própria tela de importação, gerado a partir dos pedidos em cartão
importados (com uma venda a mais e uma a menos, para a conferência ter o que mostrar).
