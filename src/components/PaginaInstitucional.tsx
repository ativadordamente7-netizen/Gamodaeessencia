import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { createGeneralWhatsAppLink } from '../utils/whatsapp';
import { useSeo } from '../utils/seo';

/**
 * Páginas institucionais (trocas, entregas, privacidade).
 * Regra: só escrever o que a loja confirmou. O que ainda não está definido fica como "combinado no atendimento".
 */
type Pagina = { titulo: string; descricao: string; secoes: { titulo: string; texto: React.ReactNode }[] };

export const PAGINAS: Record<string, Pagina> = {
  'trocas-e-devolucoes': {
    titulo: 'Trocas e devoluções',
    descricao: 'Garantia de 7 dias para troca na GA Moda & Essência. Veja como pedir pelo WhatsApp.',
    secoes: [
      {
        titulo: 'Garantia de 7 dias para troca',
        texto: 'Você tem 7 dias, a partir do recebimento do produto, para pedir a troca. É só chamar a gente no WhatsApp.',
      },
      {
        titulo: 'Como pedir a troca',
        texto: 'Envie uma mensagem pelo WhatsApp com o nome do produto e o motivo da troca (tamanho, cor ou modelo). A gente confere a disponibilidade e combina com você o próximo passo.',
      },
      {
        titulo: 'Frete e condições da troca',
        texto: 'A forma de envio da troca e quem paga o frete são combinados no atendimento, de acordo com a sua cidade. Pergunte antes de enviar o produto.',
      },
      {
        titulo: 'Seu direito de arrependimento',
        texto: 'Compras feitas fora da loja física, como pela internet ou pelo WhatsApp, também têm o direito de arrependimento de 7 dias a partir do recebimento, previsto no artigo 49 do Código de Defesa do Consumidor.',
      },
    ],
  },
  entregas: {
    titulo: 'Entregas e frete',
    descricao: 'Como funciona a entrega da GA Moda & Essência: frete e prazo consultados pelo WhatsApp, de acordo com a sua cidade.',
    secoes: [
      {
        titulo: 'Onde atendemos',
        texto: 'Atendemos Canela, Gramado e região, e estamos estruturando os envios para outras cidades do Brasil. Chame no WhatsApp e informe a sua cidade e o seu CEP: a gente confirma se consegue entregar.',
      },
      {
        titulo: 'Valor do frete e prazo',
        texto: 'O valor do frete, o prazo e a forma de envio são informados no atendimento, antes de você fechar o pedido. Nada é cobrado pelo site.',
      },
      {
        titulo: 'Como fechar o pedido',
        texto: 'Escolha os produtos, toque em "Quero esse produto" ou envie a sua sacola de interesses pelo WhatsApp. Valor, pagamento e entrega são combinados na conversa.',
      },
    ],
  },
  privacidade: {
    titulo: 'Privacidade',
    descricao: 'Como a GA Moda & Essência trata os seus dados no site: sem cadastro, sem cookies de rastreamento.',
    secoes: [
      {
        titulo: 'O site não pede seus dados',
        texto: 'Não pedimos cadastro, CPF, endereço nem cartão no site. Nenhum pagamento é feito aqui.',
      },
      {
        titulo: 'Favoritos e sacola',
        texto: 'Os produtos que você favorita ou coloca na sacola ficam guardados só no seu navegador, neste aparelho. Eles não são enviados para nós, a não ser que você mande a lista pelo WhatsApp.',
      },
      {
        titulo: 'Conversas no WhatsApp',
        texto: 'Ao tocar em um botão do WhatsApp, você é levado ao aplicativo com uma mensagem pronta, que você pode editar antes de enviar. A conversa segue as regras de privacidade do próprio WhatsApp. Usamos o que você nos contar ali apenas para atender o seu pedido.',
      },
      {
        titulo: 'Estatísticas de visitas',
        texto: 'Podemos medir visitas e cliques de forma agregada, com uma ferramenta que não usa cookies e não identifica você. Isso nos ajuda a saber quais produtos interessam mais.',
      },
      {
        titulo: 'Seus direitos (LGPD)',
        texto: 'Você pode pedir a qualquer momento informações sobre os seus dados, ou que eles sejam apagados das nossas conversas. É só falar com a gente pelo WhatsApp.',
      },
    ],
  },
};

export const PaginaInstitucional: React.FC<{ slug: string; whatsappNumber: string }> = ({ slug, whatsappNumber }) => {
  const pagina = PAGINAS[slug];
  useSeo({ title: pagina.titulo, description: pagina.descricao, path: `/${slug}` });
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-[#242322]">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Voltar para a vitrine
      </Link>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-semibold text-[#242322]">{pagina.titulo}</h1>
      <div className="mt-8 space-y-6">
        {pagina.secoes.map((s) => (
          <section key={s.titulo} className="rounded-2xl bg-white border border-[#E6DCCB] p-5 sm:p-6">
            <h2 className="font-serif text-xl font-semibold text-[#242322]">{s.titulo}</h2>
            <p className="mt-2 text-stone-700 leading-relaxed">{s.texto}</p>
          </section>
        ))}
      </div>
      <a
        href={createGeneralWhatsAppLink(whatsappNumber)}
        target="_blank"
        rel="noopener noreferrer"
        data-origem={`pagina-${slug}`}
        className="ga-press ga-cta-whats mt-8 w-full sm:w-auto"
      >
        <MessageCircle className="w-5 h-5" aria-hidden="true" /> Falar com um consultor
      </a>
    </article>
  );
};
