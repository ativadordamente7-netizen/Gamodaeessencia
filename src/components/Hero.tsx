import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, MessageCircle } from 'lucide-react';
import { createGeneralWhatsAppLink } from '../utils/whatsapp';
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from '../utils/instagram';
import { PRODUCTS_DATA } from '../data/catalogo';
import { thumb, altProduto } from '../utils/img';

interface HeroProps {
  whatsappNumber: string;
}

// Destaques do topo: produto (id do produtos.json) + cor da foto
export const DESTAQUES: [string, string][] = [
  ['nike-dunk-low', 'Panda (preto/branco)'],
  ['new-balance-9060', 'Off white/castor'],
  ['adidas-samba', 'Branco/preto'],
];

/** Parallax discreto: escreve o scroll numa variável CSS (desligado para quem prefere menos movimento). */
function useParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 900);
        ref.current?.style.setProperty('--sy', String(y));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return ref;
}

export const Hero: React.FC<HeroProps> = ({ whatsappNumber }) => {
  const whatsappUrl = createGeneralWhatsAppLink(whatsappNumber);
  const ref = useParallax<HTMLElement>();
  const fotos = DESTAQUES.flatMap(([id, cor]) => {
    const p = PRODUCTS_DATA.find((x) => x.id === id);
    return p ? [{ ...p, foto: p.colorImages?.[cor] ?? p.image, cor }] : [];
  });
  // velocidade de parallax diferente por camada = profundidade
  const camada = (f: number): React.CSSProperties => ({ transform: `translate3d(0, calc(var(--sy, 0) * ${f}px), 0)` });

  return (
    <section ref={ref} aria-labelledby="hero-titulo" className="relative overflow-hidden bg-[#242322] text-[#F7F3ED]">
      {/* halos de luz no tom da logo */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 -left-32 w-[640px] h-[640px] rounded-full ga-halo" style={camada(0.12)} />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-56 right-[-10%] w-[720px] h-[720px] rounded-full ga-halo opacity-70" style={camada(-0.08)} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D8B98A]/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 sm:pt-14 sm:pb-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 text-center lg:text-left">
            <img
              src="/logo-ga-transparente.webp"
              alt="GA Moda & Essência — Serra Gaúcha"
              width={220}
              height={220}
              fetchPriority="high"
              className="ga-logo-in mx-auto lg:mx-0 w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 -my-2"
            />

            <p className="ga-hero-in mt-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#D8B98A]" style={{ animationDelay: '.25s' }}>
              Serra Gaúcha · Curadoria semanal
            </p>

            <h1 id="hero-titulo" className="ga-rise mt-4 font-serif text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl font-semibold tracking-tight">
              Estilo selecionado,
              <span className="block italic font-normal text-[#D8B98A]">toda semana.</span>
            </h1>

            <p className="ga-rise mt-6 text-[#F7F3ED]/80 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Tênis e moda com curadoria da GA, com fotos reais de cada peça. Escolha na vitrine e fale com a gente: confirmamos cor, numeração e disponibilidade pelo WhatsApp.
            </p>

            <div className="ga-hero-in mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3" style={{ animationDelay: '.7s' }}>
              <a href="#vitrine" className="ga-press w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#D8B98A] hover:bg-[#E4C99E] px-8 py-4 text-sm font-semibold text-[#242322]">
                Explorar a coleção <ArrowDown className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ga-press w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/25 hover:border-white/60 px-8 py-4 text-sm font-semibold text-white"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" aria-hidden="true" /> Atendimento no WhatsApp
              </a>
            </div>

            <p className="ga-hero-in mt-6 text-xs text-white/70" style={{ animationDelay: '.85s' }}>
              Siga{' '}
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-[#D8B98A]/60 hover:text-white">
                {INSTAGRAM_HANDLE}
              </a>
            </p>
          </div>

          {/* Destaques: faixa deslizável no celular, composição em camadas no computador */}
          <div className="lg:col-span-6">
            <ul aria-label="Destaques" className="ga-faixa flex lg:grid lg:grid-cols-2 gap-3 sm:gap-4 overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0">
              {fotos.map((p, i) => (
                <li
                  key={p.id}
                  className={`ga-hero-in shrink-0 w-[62%] sm:w-[40%] lg:w-auto ${i === 0 ? 'lg:row-span-2 lg:self-center' : ''}`}
                  style={{ animationDelay: `${0.5 + i * 0.15}s` }}
                >
                  <div style={camada(i === 0 ? -0.06 : i === 1 ? -0.12 : -0.02)}>
                    <Link
                      to={`/produto/${p.id}`}
                      className="group relative block rounded-[24px] overflow-hidden aspect-[4/5] ring-1 ring-white/10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]"
                    >
                      <img
                        src={thumb(p.foto)}
                        alt={altProduto(p.name, p.cor)}
                        width={480}
                        height={600}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        className="w-full h-full object-cover transition duration-700 ease-[var(--ease-ga)] motion-safe:group-hover:scale-105"
                      />
                      <span className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="block text-[10px] uppercase tracking-[0.2em] text-[#D8B98A]">{p.marca}</span>
                        <span className="block font-serif text-base sm:text-lg text-white">{p.name}</span>
                      </span>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
