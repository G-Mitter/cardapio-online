import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Termos de uso' }

// Atualize a data ao mudar o texto.
export default function Termos() {
  return (
    <main className="wrap texto">
      <h1>Termos de uso</h1>
      <p className="vazio">Atualizados em 8 de outubro de 2026.</p>

      <h2>O que é este serviço</h2>
      <p>
        O Cardápio online mostra o cardápio de uma loja e leva o seu pedido até ela. Quem vende,
        prepara e entrega é a loja.
      </p>

      <h2>Preços, produtos e entrega</h2>
      <p>
        Preços, fotos, disponibilidade, horário, taxa e área de entrega são definidos pela loja e
        podem mudar sem aviso. A loja pode recusar ou cancelar um pedido; para acompanhar, use o
        botão &quot;Acompanhar pelo WhatsApp&quot; que aparece depois de finalizar.
      </p>

      <h2>Pagamento</h2>
      <p>
        Você escolhe uma das formas que a loja aceita e paga direto a ela, na entrega ou na
        retirada. Este site não recebe pagamento nem guarda dados de cartão.
      </p>

      <h2>Problemas com o pedido</h2>
      <p>
        Atraso, troca, cancelamento ou reembolso são resolvidos com a loja, pelo mesmo WhatsApp do
        pedido.
      </p>

      <h2>Seu cadastro</h2>
      <p>
        O cadastro é pelo telefone e vale em todas as lojas que usam o Cardápio online. Use só o seu
        próprio telefone e dados verdadeiros. Como funciona a guarda dos dados está na política de
        privacidade.
      </p>

      <h2>Uso correto</h2>
      <p>
        Não envie pedidos falsos, não use o telefone de outra pessoa e não tente atrapalhar o
        funcionamento do site. Pedidos em excesso podem ser bloqueados.
      </p>

      <p>
        <Link href="/privacidade">Política de privacidade</Link>
      </p>
    </main>
  )
}
