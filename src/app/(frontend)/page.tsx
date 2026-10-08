import Link from 'next/link'

/**
 * Página de vendas do produto, no endereço principal. Cada loja tem o próprio
 * endereço (/nome-da-loja); a Cantina é o exemplo ao vivo.
 */
const EXEMPLO = '/cantina-dona-lurdes'

// Número que recebe os interessados (só dígitos, com DDI e DDD: 5511999999999).
// Sem ele, o botão de contato não aparece.
const contato = process.env.CONTATO_WHATSAPP
  ? `https://wa.me/${process.env.CONTATO_WHATSAPP}?text=${encodeURIComponent('Olá! Quero o cardápio online para a minha loja.')}`
  : null

const passos = [
  ['Você monta o cardápio', 'Cadastre produtos, fotos e preços no painel, ou importe a planilha que já usa.'],
  ['O cliente escolhe', 'Ele abre o link no celular, monta o pedido e escolhe entrega ou retirada.'],
  ['O pedido chega no WhatsApp', 'Itens, total, taxa e endereço chegam numa mensagem pronta, no seu número.'],
]

const recursos = [
  'Logo, foto de capa, cor e fonte da sua marca',
  'Busca e categorias para achar tudo rápido',
  'Marcar produto esgotado com um clique',
  'Aberto ou fechado, horário e taxa de entrega',
  'Lista dos pedidos de hoje no painel',
  'Importação de planilha (Excel ou CSV)',
]

export default function Home() {
  return (
    <main className="vitrine">
      <section className="abertura">
        <div className="chamada">
          <p className="selo">Cardápio online</p>
          <h1>Seu cardápio no celular do cliente, e o pedido pronto no seu WhatsApp.</h1>
          <p>Sem aplicativo para baixar e sem comissão por pedido. Você manda o link, o cliente pede.</p>
          <div className="acoes">
            <Link href={EXEMPLO} className="botao">
              Ver um cardápio de exemplo
            </Link>
            {contato && (
              <a href={contato} className="botao secundario" target="_blank" rel="noreferrer">
                Quero para minha loja
              </a>
            )}
          </div>
        </div>
        <div className="celular">
          <iframe src={EXEMPLO} title="Cardápio de exemplo: Cantina Dona Lurdes" loading="lazy" />
        </div>
      </section>

      <section>
        <h2>Como funciona</h2>
        <ol className="passos">
          {passos.map(([titulo, texto]) => (
            <li key={titulo}>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>O que vem junto</h2>
        <ul className="recursos">
          {recursos.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Duas formas de ter</h2>
        <div className="planos">
          <div>
            <h3>Assinatura mensal</h3>
            <p>Seu cardápio no nosso endereço. A gente cuida do servidor, das atualizações e do backup.</p>
          </div>
          <div>
            <h3>Sistema próprio</h3>
            <p>O sistema instalado no seu domínio, pago uma vez. Bom para quem já tem site e equipe.</p>
          </div>
        </div>
        {contato && (
          <a href={contato} className="botao" target="_blank" rel="noreferrer">
            Conversar no WhatsApp
          </a>
        )}
      </section>

      <footer className="rodape">
        <Link href="/termos">Termos de uso</Link>
        <Link href="/privacidade">Privacidade</Link>
      </footer>
    </main>
  )
}
