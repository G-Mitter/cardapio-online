import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Política de privacidade' }

// Texto em linguagem simples, seguindo a LGPD (Lei 13.709/2018). Atualize a data ao mudar o texto.
export default function Privacidade() {
  return (
    <main className="wrap texto">
      <h1>Política de privacidade</h1>
      <p className="vazio">Atualizada em 8 de outubro de 2026 (carrinhos abandonados).</p>

      <h2>Quem cuida dos seus dados</h2>
      <p>
        Há duas partes. O <b>seu cadastro</b> (telefone, nome e endereços) fica com o Cardápio
        online, para você não precisar digitar tudo de novo em cada loja que usa o sistema. Cada{' '}
        <b>pedido</b> vai para a loja onde você comprou, que é a responsável por ele (controladora,
        nos termos da LGPD).
      </p>

      <h2>Quais dados guardamos</h2>
      <ul>
        <li>Telefone, que identifica o seu cadastro.</li>
        <li>Nome, para a loja saber de quem é o pedido.</li>
        <li>Endereços de entrega que você cadastrar.</li>
        <li>
          Em cada pedido: itens, valores, forma de pagamento, troco, observações, data e hora.
        </li>
        <li>
          O carrinho, enquanto você não finaliza: depois que você informa o telefone, guardamos
          nome, telefone e itens do carrinho para a loja poder te chamar no WhatsApp. Ele é apagado
          quando o pedido é feito e, em todo caso, em 7 dias.
        </li>
        <li>
          CPF, só se você marcar &quot;CPF na nota&quot;. Ele fica apenas naquele pedido, para a
          loja emitir a nota, e não entra no seu cadastro.
        </li>
      </ul>
      <p>
        Não pedimos e-mail, senha nem dados de cartão. O pagamento é feito direto com a loja, na
        entrega ou na retirada. A conversa no WhatsApp segue as regras do próprio WhatsApp.
      </p>

      <h2>Anúncios</h2>
      <p>
        Algumas lojas usam o Pixel da Meta (Facebook e Instagram) e a tag do Google para medir
        visitas e pedidos e criar anúncios. Nesse caso, o seu navegador envia à Meta e ao Google
        dados de navegação e o valor do pedido, e eles seguem as próprias políticas. Não enviamos o
        seu nome, telefone nem endereço.
      </p>

      <h2>Quem vê o quê</h2>
      <p>
        A loja vê o nome, telefone, endereço e CPF (se marcado) dos pedidos feitos nela, e só deles.
        Quem digita o seu telefone em outro aparelho vê apenas o seu primeiro nome e o começo dos
        endereços, para você reconhecer o seu cadastro.
      </p>

      <h2>Para que usamos</h2>
      <p>
        Para preparar e entregar os seus pedidos, preencher o cadastro nas próximas compras e
        permitir que a loja te chame se você deixar o carrinho sem finalizar. Os dados não são
        vendidos, não são usados para propaganda e não são passados para outras empresas, a não ser
        os serviços que mantêm o sistema no ar (hospedagem e banco de dados). A base legal é a
        execução do pedido que você fez e o seu consentimento ao criar o cadastro.
      </p>

      <h2>Por quanto tempo</h2>
      <p>
        O cadastro fica guardado até você pedir para apagar. Os pedidos ficam enquanto a loja usar o
        Cardápio online, para ela consultar o histórico; a loja pode apagar pedidos a qualquer
        momento.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir para ver, corrigir ou apagar seus dados e retirar o consentimento. Sobre um
        pedido, fale com a loja onde comprou, pelo WhatsApp do pedido. Para apagar o seu cadastro
        (que vale em todas as lojas), fale com o Cardápio online pelo contato da{' '}
        <Link href="/">página inicial</Link>.
      </p>

      <p>
        <Link href="/termos">Termos de uso</Link>
      </p>
    </main>
  )
}
