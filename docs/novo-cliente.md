# Cadastrar um cliente novo

Passo a passo para colocar o cardápio de uma loja nova no ar. Meta: menos de 30 minutos.

## Antes de começar, peça ao cliente

- [ ] Nome da loja, como deve aparecer no cardápio
- [ ] Número do WhatsApp que recebe os pedidos (com DDD)
- [ ] Logo (PNG ou JPG) e a cor principal da marca, se tiver
- [ ] Horário de funcionamento e endereço
- [ ] Se faz entrega (e a taxa) e se aceita retirada
- [ ] Lista de produtos com nome, preço e categoria. Uma planilha é o ideal; use a [planilha modelo](#3-importar-os-produtos-5-a-15-min) para pedir no formato certo
- [ ] E-mail do dono, para o login do painel

## 1. Criar a loja (5 min)

1. Entre no painel em `/admin` com o seu usuário de administrador.
2. Abra **Lojas** e clique em **Criar novo**.
3. Preencha:
   - **Nome da loja**: como o cliente pediu.
   - **Endereço do cardápio**: só letras minúsculas, números e hífen, por exemplo `pizzaria-do-ze`. O cardápio fica em `seu-endereco/pizzaria-do-ze`.
   - **WhatsApp que recebe os pedidos**: com DDD.
   - **Cor principal**: no formato `#rrggbb`. Sem cor da marca, deixe a padrão.
   - **Fonte dos títulos**: escolha a que combina com a loja (Clássica para restaurante tradicional, Moderna para lanchonete e pizzaria, Tradicional para empório, Leve para cafeteria).
   - **Logo**, **Foto de capa** (opcional, uma foto deitada), **Horário**, **Endereço da loja**, **Faz entrega**, **Taxa de entrega**, **Aceita retirada** e **Formas de pagamento aceitas** (Pix, cartão, dinheiro). Com Pix marcado, preencha a **Chave Pix**: o cliente copia depois de finalizar o pedido. O **Endereço da loja** precisa terminar com a cidade (ex.: "Rua dos Timbiras, 1200, Belo Horizonte"): a rota do entregador sai dele.
4. Salve.

## 2. Criar o login do dono (2 min)

1. Abra **Usuários** e clique em **Criar novo**.
2. Preencha o e-mail do dono e uma senha provisória.
3. Em **Tipo de usuário**, deixe só **Dono de loja**.
4. Em **Lojas**, clique em **Adicionar Loja** e escolha a loja criada no passo 1.
5. Salve.

O dono usa o painel próprio, em `seu-endereco/painel` (o `/admin` é só seu). Ele só vê e edita a loja dele: Pedidos, Produtos, Categorias, Minha loja, Importar planilha e o link **Ver meu cardápio**.

## 3. Importar os produtos (5 a 15 min)

1. Abra `seu-endereco/painel` (com o seu login de administrador dá para escolher a loja no topo) e vá em **Importar planilha**.
2. Envie a planilha (`.csv` ou `.xlsx`). Ela precisa de uma linha de títulos com `nome`, `preco` e `categoria`; `descricao` e `esgotado` são opcionais. O link **Baixar planilha modelo** na mesma tela traz um exemplo.
3. Confira a prévia: produtos novos, categorias novas e linhas com erro. Corrija as linhas com erro na planilha e envie de novo, se quiser.
4. Clique em **Importar**.

Sem planilha, cadastre em **Categorias** e depois em **Produtos**, no mesmo painel. Para mudar a ordem no cardápio, use o campo **Ordem** (menor aparece primeiro).

## 4. Conferir o cardápio (5 min)

1. Abra `seu-endereco/endereco-do-cardapio` no celular.
2. Confira nome, cores, logo, horário, preços e categorias.
3. Faça um pedido de teste com o seu nome. Confira se ele aparece em **Pedidos** no painel e se o botão "Acompanhar pelo WhatsApp" abre a conversa com a loja.
4. No painel (`/painel`), abra **Pedidos** e marque o pedido de teste como **Cancelado**.

## 5. Entregar ao cliente

Mande ao dono:

- o link do cardápio, para divulgar no Instagram, no WhatsApp Business e no Google;
- o endereço do painel (`seu-endereco/painel`), o e-mail e a senha provisória;
- como usar no dia a dia: **Pedidos** para acompanhar os pedidos, **Produtos** para marcar algo como esgotado ou mudar preço, **Importar planilha** para atualizar vários preços de uma vez.
