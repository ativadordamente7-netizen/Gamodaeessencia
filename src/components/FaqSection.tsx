import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { createGeneralWhatsAppLink } from '../utils/whatsapp';

interface FaqSectionProps {
  whatsappNumber: string;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ whatsappNumber }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Como faço meu pedido?',
      answer: 'Escolha o produto na vitrine, selecione a cor e a numeração e toque em "Quero esse produto". A mensagem já vai pronta com o modelo, a cor, a numeração e o link. Se quiser vários produtos, junte na sacola de interesses e envie a lista de uma vez.'
    },
    {
      question: 'Quais são as formas de pagamento?',
      answer: 'As formas de pagamento são combinadas no atendimento pelo WhatsApp.'
    },
    {
      question: 'Como funciona a entrega?',
      answer: 'Atendemos Canela, Gramado e região e estamos estruturando os envios para outras cidades do Brasil. O valor do frete e o prazo são informados no atendimento, de acordo com o seu CEP.'
    },
    {
      question: 'Como escolher a numeração?',
      answer: 'Cada produto mostra as cores e as numerações disponíveis. Se tiver dúvida, fale com a gente pelo WhatsApp antes de pedir.'
    },
    {
      question: 'E se não servir? Posso trocar?',
      answer: 'Sim. Você tem garantia de 7 dias, a partir do recebimento, para pedir a troca pelo WhatsApp. Veja os detalhes na página Trocas e devoluções.'
    },
    {
      question: 'Posso tirar dúvidas sobre a linha ou a procedência de um modelo?',
      answer: 'Pode sim. Pergunte pelo WhatsApp antes de fechar o pedido.'
    }
  ];

  const whatsappUrl = createGeneralWhatsAppLink(whatsappNumber);

  return (
    <section className="py-16 sm:py-24 text-[#242322]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-semibold text-[#7A5530] uppercase tracking-widest flex items-center justify-center gap-1">
            <HelpCircle className="w-4 h-4 text-[#D8B98A]" /> Tira-Dúvidas
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#242322]">
            Perguntas Frequentes
          </h2>
          <p className="text-stone-600 text-sm">
            Tudo o que você precisa saber antes de fazer seu pedido na GA Moda & Essência.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="frosted-glass-card rounded-2xl overflow-hidden transition shadow-xs"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-5 text-left font-serif font-bold text-sm sm:text-base text-[#242322] hover:text-[#D8B98A] flex items-center justify-between gap-4 transition"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#D8B98A] transition-transform duration-300 shrink-0 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === idx && (
                <div className="px-5 pb-5 pt-1 text-stone-700 text-xs sm:text-sm font-sans leading-relaxed border-t border-stone-200/60">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Direct WhatsApp Callout */}
        <div className="mt-10 text-center frosted-glass p-6 sm:p-8 rounded-3xl border border-white/80 space-y-3 shadow-sm">
          <p className="text-xs text-stone-700 font-medium">Ainda tem alguma dúvida específica?</p>
          <a
            href={whatsappUrl} data-origem="faq"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0F7A40] hover:bg-[#0B6334] text-white font-bold text-xs py-3 px-6 rounded-full transition shadow-sm"
          >
            <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
            <span>Tirar Dúvida no WhatsApp Agora</span>
          </a>
        </div>

      </div>
    </section>
  );
};
