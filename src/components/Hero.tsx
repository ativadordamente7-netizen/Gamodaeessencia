import React from 'react';
import { MessageCircle, ArrowDown, Sparkles, HeartHandshake, MapPin } from 'lucide-react';
import { createGeneralWhatsAppLink } from '../utils/whatsapp';
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from '../utils/instagram';
import { PRODUCTS_DATA } from '../data/catalogo';
import { thumb, altProduto } from '../utils/img';

interface HeroProps {
  whatsappNumber: string;
}

// Fotos do mosaico: produto (id do produtos.json) + cor escolhida para a foto
const DESTAQUES: [string, string][] = [
  ['nike-dunk-low', 'Panda (preto/branco)'],
  ['new-balance-9060', 'Off white/castor'],
  ['adidas-samba', 'Branco/preto'],
  ['tommy-hilfiger', 'Preto'],
];

export const Hero: React.FC<HeroProps> = ({ whatsappNumber }) => {
  const whatsappUrl = createGeneralWhatsAppLink(whatsappNumber);
  const fotos = DESTAQUES.flatMap(([id, cor]) => {
    const p = PRODUCTS_DATA.find((x) => x.id === id);
    return p ? [{ ...p, foto: p.colorImages?.[cor] ?? p.image, cor }] : [];
  });

  return (
    <section aria-labelledby="hero-titulo" className="relative overflow-hidden py-10 sm:py-16 text-[#2D2D2D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <p className="inline-flex items-center gap-2 bg-white border border-[#D4A373]/50 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5C4733]">
              <MapPin className="w-3.5 h-3.5 text-[#7A5C40]" aria-hidden="true" />
              Serra Gaúcha · Envio a combinar
            </p>

            <h1 id="hero-titulo" className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-[#1F1F1F] leading-[1.05] tracking-tight">
              Seu próximo tênis
              <span className="block text-[#7A5C40] italic font-semibold">chegou essa semana.</span>
            </h1>

            <p className="text-stone-700 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Curadoria de tênis das marcas mais desejadas, com <strong>novidades toda semana</strong>. Escolha na vitrine, e a gente confirma valor, cor e numeração direto no WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <a
                href="#vitrine"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1F1F1F] hover:bg-black text-[#FAF7F2] font-semibold text-sm px-8 py-4 rounded-full transition"
              >
                Ver a vitrine
                <ArrowDown className="w-4 h-4 text-[#D4A373]" aria-hidden="true" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-[#1F1F1F]/15 hover:border-[#25D366] text-[#1F1F1F] font-semibold text-sm px-8 py-4 rounded-full transition"
              >
                <MessageCircle className="w-5 h-5 text-[#1EBE5A]" aria-hidden="true" />
                Falar no WhatsApp
              </a>
            </div>

            <ul className="pt-5 border-t border-[#E8DFD2] flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-stone-700">
              <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#7A5C40]" aria-hidden="true" />Reposição toda semana</li>
              <li className="flex items-center gap-2"><HeartHandshake className="w-4 h-4 text-[#7A5C40]" aria-hidden="true" />Atendimento de pessoa real</li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-[#D4A373] hover:text-[#1F1F1F]">
                  {INSTAGRAM_HANDLE}
                </a>
              </li>
            </ul>
          </div>

          {/* Mosaico de produtos reais */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {fotos.map((p, i) => (
                <a
                  key={p.id}
                  href="#vitrine"
                  className={`relative block rounded-2xl overflow-hidden aspect-[4/5] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.5)] ${i % 2 === 1 ? 'translate-y-6' : ''}`}
                >
                  <img
                    src={thumb(p.foto)}
                    alt={altProduto(p.name, p.cor)}
                    width={480}
                    height={600}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 right-2 bg-white/90 rounded-xl px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-[#1F1F1F] truncate">
                    {p.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
