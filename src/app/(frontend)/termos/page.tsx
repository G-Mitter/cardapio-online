import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Termos de uso' }

// Atualize a data ao mudar o texto.
export default function Termos() {
  return (
    <main className="wrap texto">
      <h1>Termos de uso</h1>
      <p className="vazio">Atualizados em 6 de outubro de 2026.</p>

      <h2>O que é este serviço</h2>
      <p>
        O Cardápio online mostra o cardápio de uma loja e monta o seu pedido para você enviar pelo
        WhatsApp. Quem vende, prepara e entrega é a loja.
      </p>

      <h2>Preços, produtos e entrega</h2>
      <p>
        Preços, fotos, disponibilidade, horário, taxa e área de entrega são definidos pela loja e
        podem mudar sem aviso. O pedido só está confirmado quando a loja responde no WhatsApp.
      </p>

      <h2>Pagamento</h2>
      <p>
        O pagamento é combinado direto com a loja. Este site não recebe nem guarda dados de
        pagamento.
      </p>

      <h2>Problemas com o pedido</h2>
      <p>
        Atraso, troca, cancelamento ou reembolso são resolvidos com a loja, pelo mesmo WhatsApp do
        pedido.
      </p>

      <h2>Uso correto</h2>
      <p>
        Não envie pedidos falsos nem tente atrapalhar o funcionamento do site. Pedidos em excesso
        podem ser bloqueados.
      </p>

      <p>
        <Link href="/privacidade">Política de privacidade</Link>
      </p>
    </main>
  )
}
