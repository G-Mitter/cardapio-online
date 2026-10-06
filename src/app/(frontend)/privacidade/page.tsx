import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Política de privacidade' }

// Texto em linguagem simples, seguindo a LGPD (Lei 13.709/2018). Atualize a data ao mudar o texto.
export default function Privacidade() {
  return (
    <main className="wrap texto">
      <h1>Política de privacidade</h1>
      <p className="vazio">Atualizada em 6 de outubro de 2026.</p>

      <h2>Quem cuida dos seus dados</h2>
      <p>
        Ao fazer um pedido, seus dados vão para a <b>loja</b> do cardápio, que é a responsável por
        eles (controladora, nos termos da LGPD). O Cardápio online é o sistema que a loja usa para
        receber pedidos e guarda os dados em nome dela.
      </p>

      <h2>Quais dados guardamos</h2>
      <ul>
        <li>Nome, para a loja saber de quem é o pedido.</li>
        <li>Endereço, só quando você escolhe entrega.</li>
        <li>Itens, valores e observações do pedido.</li>
        <li>Data e hora do pedido.</li>
      </ul>
      <p>
        Não pedimos CPF, telefone, e-mail nem dados de cartão. O pagamento é combinado direto com a
        loja. A conversa no WhatsApp segue as regras do próprio WhatsApp.
      </p>

      <h2>Para que usamos</h2>
      <p>
        Só para a loja preparar e entregar o seu pedido. Os dados não são vendidos, não são usados
        para propaganda e não são passados para outras empresas, a não ser os serviços que mantêm o
        sistema no ar (hospedagem e banco de dados).
      </p>

      <h2>Por quanto tempo</h2>
      <p>
        Enquanto a loja usar o Cardápio online, para ela consultar o histórico de pedidos. A loja
        pode apagar pedidos a qualquer momento.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir para ver, corrigir ou apagar seus dados. Fale com a loja onde fez o pedido,
        pelo mesmo WhatsApp do pedido.
      </p>

      <p>
        <Link href="/termos">Termos de uso</Link>
      </p>
    </main>
  )
}
