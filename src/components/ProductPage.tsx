import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Heart, MessageCircle, Share2, ShoppingBag } from 'lucide-react';
import { Product, ProductSize } from '../types';
import { PRODUCTS_DATA, PUBLICO_LABEL } from '../data/catalogo';
import { CATEGORIAS } from '../data/categorias';
import { createProductWhatsAppLink, productUrl } from '../utils/whatsapp';
import { useSeo } from '../utils/seo';
import { ProductExperience } from './experience/ProductExperience';
import { ProductCard } from './ProductCard';
import { Reveal } from './Reveal';

interface Props {
  whatsappNumber: string;
  wishlistIds: string[];
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product, size: ProductSize, color: string) => void;
  onQuickAdd: (p: Product) => void;
  onQuickView: (p: Product) => void;
}

export const ProductPage: React.FC<Props> = (props) => {
  const { pathname } = useLocation();
  const id = decodeURIComponent(pathname.replace(/^\/produto\//, '').replace(/\/$/, ''));
  const product = PRODUCTS_DATA.find((p) => p.id === id);
  if (!product) return <NaoEncontrado />;
  return <Conteudo key={product.id} product={product} {...props} />;
};

const NaoEncontrado: React.FC = () => {
  useSeo({ title: 'Produto não encontrado' });
  return (
    <section className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
      <h1 className="font-serif text-3xl font-bold text-[#242322]">Este produto não está mais na vitrine</h1>
      <p className="text-stone-600">Ele pode ter esgotado. Veja as novidades ou pergunte pelo WhatsApp se ainda temos.</p>
      <Link to="/" className="inline-block rounded-full bg-[#242322] px-6 py-3 text-sm font-semibold text-white">Ver a vitrine</Link>
    </section>
  );
};

const Conteudo: React.FC<Props & { product: Product }> = ({ product, whatsappNumber, wishlistIds, onToggleWishlist, onAddToCart, onQuickAdd, onQuickView }) => {
  const [cor, setCor] = useState(product.colors[0]?.name ?? '');
  const tamanhos = product.sizesByColor?.[cor] ?? product.sizes;
  const tamanhoUnico = tamanhos.length <= 1;
  const [tamanho, setTamanho] = useState<ProductSize>('');
  const tamanhoFinal = tamanhoUnico ? tamanhos[0] ?? '' : tamanho;
  const [aviso, setAviso] = useState('');
  const [adicionado, setAdicionado] = useState(false);
  const favorito = wishlistIds.includes(product.id);
  const categoria = CATEGORIAS.find((c) => c.id === product.category);
  const publico = product.publico ? PUBLICO_LABEL[product.publico] : undefined;
  const whatsapp = createProductWhatsAppLink(whatsappNumber, product, tamanhoFinal, cor);

  const relacionados = useMemo(
    () => PRODUCTS_DATA.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4),
    [product]
  );

  useSeo({
    title: product.name,
    description: `${product.subtitle ? product.subtitle + '. ' : ''}${product.description}`.slice(0, 158),
    path: `/produto/${product.id}`,
    image: product.image.replace(/\.webp$/, '-480.webp'),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: (product.gallery ?? [product.image]).map((s) => 'https://gamodaeessencia.com.br' + s),
      ...(product.marca ? { brand: { '@type': 'Brand', name: product.marca } } : {}),
      ...(product.colors.length ? { color: product.colors.map((c) => c.name).join(', ') } : {}),
    },
  });

  const compartilhar = async () => {
    const url = productUrl(product);
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: `${product.name} na GA Moda & Essência`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setAviso('Link copiado!');
    } catch {
      setAviso('');
    }
    setTimeout(() => setAviso(''), 2500);
  };

  const adicionar = () => {
    if (!tamanhoFinal) { setAviso('Escolha a numeração para adicionar à lista.'); return; }
    onAddToCart(product, tamanhoFinal, cor || 'Única');
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  };

  return (
    <article className="pb-28 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav aria-label="Você está em" className="text-xs text-stone-600 flex items-center gap-2">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-[#242322]"><ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Vitrine</Link>
          {categoria && (<><span aria-hidden="true">/</span><Link to={`/${categoria.rota}`} className="hover:text-[#242322]">{categoria.label}</Link></>)}
          <span aria-hidden="true">/</span><span aria-current="page" className="text-[#242322] font-medium truncate">{product.name}</span>
        </nav>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          <div className="lg:col-span-7">
            <ProductExperience product={product} cor={cor} onCorPelaFoto={setCor} priority />
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-28 self-start space-y-6">
            <div>
              <p className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#7A5530]">{[product.marca, publico].filter(Boolean).join(' · ')}</p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#242322] mt-2 leading-tight">{product.name}</h1>
              {product.subtitle && <p className="text-[#7A5530] mt-2 font-medium">{product.subtitle}</p>}
              <p className="text-stone-700 mt-4 leading-relaxed">{product.description}</p>
            </div>

            {product.colors.length > 0 && (
              <fieldset>
                <legend className="text-xs font-semibold text-[#242322] mb-2">Cor: <span className="text-[#7A5530]">{cor}</span></legend>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      aria-pressed={cor === c.name}
                      onClick={() => { setCor(c.name); setAviso(''); const l = product.sizesByColor?.[c.name]; if (l && tamanho && !l.includes(tamanho)) setTamanho(''); }}
                      className={`ga-press flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs transition ${cor === c.name ? 'border-[#242322] bg-white font-semibold' : 'border-[#E6DCCB] bg-white/60 hover:border-stone-500'}`}
                    >
                      <span className="w-4 h-4 rounded-full border border-stone-300" style={{ backgroundColor: c.hex }} aria-hidden="true" />
                      {c.name}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {!tamanhoUnico && (
              <fieldset>
                <legend className="text-xs font-semibold text-[#242322] mb-2">Numeração{tamanho && <>: <span className="text-[#7A5530]">{tamanho}</span></>}</legend>
                <div className="flex flex-wrap gap-2">
                  {tamanhos.map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={tamanho === t}
                      onClick={() => { setTamanho(t); setAviso(''); }}
                      className={`ga-press min-w-11 h-11 px-3 rounded-xl border text-sm font-semibold transition ${tamanho === t ? 'bg-[#242322] text-white border-[#242322]' : 'bg-white border-[#E6DCCB] text-stone-800 hover:border-[#7A5530]'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-stone-600 mt-2">Em dúvida sobre a numeração? Pergunte no WhatsApp antes de fechar.</p>
              </fieldset>
            )}

            <div className="hidden lg:flex flex-col gap-2.5">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="ga-press ga-cta-whats">
                <MessageCircle className="w-5 h-5" aria-hidden="true" /> Consultar este modelo no WhatsApp
              </a>
              <div className="grid grid-cols-2 gap-2.5">
                <button type="button" onClick={adicionar} className="ga-press ga-cta-sec">
                  {adicionado ? <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" /> : <ShoppingBag className="w-4 h-4" aria-hidden="true" />}
                  {adicionado ? 'Na lista!' : 'Adicionar à lista'}
                </button>
                <button type="button" onClick={compartilhar} className="ga-press ga-cta-sec">
                  <Share2 className="w-4 h-4" aria-hidden="true" /> Compartilhar
                </button>
              </div>
            </div>

            <p role="status" className="text-xs text-[#7A5530] min-h-4">{aviso}</p>

            <button type="button" onClick={() => onToggleWishlist(product)} aria-pressed={favorito} className="text-xs text-stone-700 hover:text-rose-700 inline-flex items-center gap-1.5">
              <Heart className={`w-4 h-4 ${favorito ? 'fill-current text-rose-600' : ''}`} aria-hidden="true" />
              {favorito ? 'Nos seus favoritos' : 'Salvar nos favoritos'}
            </button>

            {product.details && product.details.length > 0 && (
              <div className="rounded-2xl border border-[#E6DCCB] bg-white p-5">
                <h2 className="text-sm font-semibold text-[#242322] mb-2">Ficha do produto</h2>
                <ul className="space-y-1 text-sm text-stone-700 list-disc pl-4 marker:text-[#D8B98A]">
                  {product.details.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </div>
            )}

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
              <li className="rounded-xl bg-[#EFE8DD] px-3 py-2.5">📷 Mais fotos e vídeos pelo WhatsApp</li>
              <li className="rounded-xl bg-[#EFE8DD] px-3 py-2.5">💬 Atendimento por pessoa, no WhatsApp</li>
            </ul>
          </div>
        </div>

        {relacionados.length > 0 && (
          <Reveal as="section" className="mt-20" aria-labelledby="relacionados">
            <h2 id="relacionados" className="font-serif text-2xl sm:text-3xl font-bold text-[#242322]">Você também pode gostar</h2>
            <ul className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relacionados.map((p) => (
                <li key={p.id}>
                  <ProductCard
                    product={p}
                    whatsappNumber={whatsappNumber}
                    isWishlisted={wishlistIds.includes(p.id)}
                    onToggleWishlist={onToggleWishlist}
                    onQuickView={onQuickView}
                    onAddToCart={onQuickAdd}
                    headingLevel={3}
                  />
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>

      {/* Barra fixa no celular: a ação principal sempre à mão */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[#E6DCCB] bg-[#F7F3ED]/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-2">
        <button type="button" onClick={compartilhar} aria-label="Compartilhar produto" className="ga-press shrink-0 w-12 h-12 rounded-full border border-[#E6DCCB] bg-white flex items-center justify-center">
          <Share2 className="w-5 h-5 text-[#242322]" aria-hidden="true" />
        </button>
        <button type="button" onClick={adicionar} aria-label="Adicionar à lista de pedidos" className="ga-press shrink-0 w-12 h-12 rounded-full border border-[#E6DCCB] bg-white flex items-center justify-center">
          {adicionado ? <Check className="w-5 h-5 text-emerald-600" aria-hidden="true" /> : <ShoppingBag className="w-5 h-5 text-[#242322]" aria-hidden="true" />}
        </button>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="ga-press ga-cta-whats flex-1">
          <MessageCircle className="w-5 h-5" aria-hidden="true" /> Consultar no WhatsApp
        </a>
      </div>
    </article>
  );
};
