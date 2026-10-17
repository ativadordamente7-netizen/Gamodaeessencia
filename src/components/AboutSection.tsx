import React from 'react';
import { Sparkles, ShieldCheck, Truck, Clock, Heart, Award, MessageCircle } from 'lucide-react';
import { createGeneralWhatsAppLink } from '../utils/whatsapp';

interface AboutSectionProps {
  whatsappNumber: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ whatsappNumber }) => {
  const whatsappUrl = createGeneralWhatsAppLink(whatsappNumber);

  const highlights = [
    {
      icon: <Award className="w-6 h-6 text-[#D8B98A]" />,
      title: 'Curadoria semanal',
      desc: 'Toda semana chegam modelos e cores novas. O que está na vitrine é o que a gente tem para mostrar.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#D8B98A]" />,
      title: 'Fotos reais',
      desc: 'As fotos são dos próprios produtos, tiradas na loja. Quer ver de outro ângulo? É só pedir no WhatsApp.'
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-[#25D366]" />,
      title: 'Atendimento via WhatsApp',
      desc: 'Sem burocracias. Converse diretamente com nossa equipe para tirar dúvidas de medidas e cores.'
    },
    {
      icon: <Truck className="w-6 h-6 text-[#D8B98A]" />,
      title: 'Entrega combinada',
      desc: 'Prazo, forma de entrega e frete são combinados no atendimento, de acordo com a sua cidade.'
    }
  ];

  return (
    <section id="sobre" className="py-16 sm:py-24 text-[#242322]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Quem está por trás da loja */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center frosted-glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm mb-12 sm:mb-16">
          <div className="lg:col-span-4 max-w-xs sm:max-w-sm mx-auto w-full">
            <img
              src="/dono.webp"
              alt="Proprietário da GA Moda & Essência com um chimarrão em uma rua de outono"
              width={1024}
              height={1536}
              loading="lazy"
              className="w-full aspect-[4/5] object-cover object-top rounded-2xl shadow-md"
            />
          </div>
          <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#242322] leading-tight">
              Por trás da GA tem uma pessoa de verdade
            </h2>
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              Aqui você é atendido direto, pelo WhatsApp, por gente de verdade: tire dúvidas de medida, cor e disponibilidade antes de pedir. Loja da Serra Gaúcha.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0F7A40] hover:bg-[#0B6334] text-white font-bold text-sm py-3.5 px-7 rounded-full transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-5 frosted-glass p-8 sm:p-10 rounded-3xl border border-white/80 shadow-sm">
            <span className="text-xs font-semibold text-[#7A5530] uppercase tracking-widest">
              Nossa Essência
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#242322] leading-tight">
              Moda Unissex Sem Rótulos & Perfumaria de Nicho
            </h2>
            <p className="text-stone-700 text-sm sm:text-base font-sans leading-relaxed">
              A <strong>GA Moda & Essência</strong> nasceu na Serra Gaúcha com um propósito simples: trazer os modelos mais desejados do momento, com atendimento próximo e honesto, de quem conversa com cada cliente pelo nome.
            </p>
            <p className="text-stone-600 text-sm leading-relaxed">
              Aliamos a curadoria de vestuário unissex — como camisetas heavy cotton, blazers desestruturados, moletons flanelados e calças parachute — a uma linha de perfumaria.
            </p>

            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0F7A40] hover:bg-[#0B6334] text-white font-bold text-xs py-3 px-6 rounded-full transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                <span>Conversar no WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Grid of Highlights */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="frosted-glass-card p-5 sm:p-6 rounded-2xl space-y-2.5 transition shadow-sm"
              >
                <div className="p-2.5 bg-white/80 w-fit rounded-xl border border-white shadow-xs">
                  {item.icon}
                </div>
                <h3 className="font-serif text-base font-bold text-[#242322]">{item.title}</h3>
                <p className="text-stone-600 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
