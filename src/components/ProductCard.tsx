import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, MessageCircle, Plus } from 'lucide-react';
import { Product } from '../types';
import { createProductWhatsAppLink } from '../utils/whatsapp';
import { srcSet, altProduto } from '../utils/img';
import { isNovidade, isChegouHoje, PUBLICO_LABEL } from '../data/catalogo';

interface ProductCardProps {
  product: Product;
  whatsappNumber: string;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  /** As primeiras fotos carregam na hora; as demais só quando aparecem na tela */
  priority?: boolean;
  headingLevel?: 2 | 3;
}

const podeInclinar = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  whatsappNumber,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  priority = false,
  headingLevel = 3,
}) => {
  const [cor, setCor] = useState<string | undefined>(product.colors[0]?.name);
  const [carregada, setCarregada] = useState(false);
  const foto = (cor && product.colorImages?.[cor]) || product.image;
  const cardRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) setCarregada(true);
  }, [foto]);
  const directWhatsAppUrl = createProductWhatsAppLink(whatsappNumber, product, undefined, product.colors.length === 1 ? cor : undefined);
  const chegouHoje = isChegouHoje(product);
  const novidade = !chegouHoje && isNovidade(product);
  const faixa =
    product.sizes.length > 1 && product.category !== 'eletronicos'
      ? `${/^\d/.test(product.sizes[0]) ? 'Nº' : 'Tam.'} ${product.sizes[0]} ao ${product.sizes[product.sizes.length - 1]}`
      : product.sizes[0];
  const publico = product.publico ? PUBLICO_LABEL[product.publico] : product.category === 'eletronicos' ? 'Eletrônicos' : '';
  const Titulo = `h${headingLevel}` as 'h2' | 'h3';
  const url = `/produto/${product.id}`;

  // Profundidade 3D discreta (só mouse; no celular não existe hover)
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !podeInclinar() || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    cardRef.current.style.setProperty('--rx', `${(-py * 4).toFixed(2)}deg`);
    cardRef.current.style.setProperty('--ry', `${(px * 4).toFixed(2)}deg`);
  };
  const onLeave = () => {
    cardRef.current?.style.setProperty('--rx', '0deg');
    cardRef.current?.style.setProperty('--ry', '0deg');
  };

  return (
    <article
      ref={cardRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="ga-card group relative flex flex-col h-full rounded-[22px] overflow-hidden bg-white border border-[#E6DCCB]"
      aria-labelledby={`p-${product.id}`}
    >
      {/* Foto */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#EFE8DD]">
        <Link to={url} className="block w-full h-full" tabIndex={-1} aria-hidden="true">
          {!carregada && <span className="absolute inset-0 ga-skeleton" />}
          <img
            key={foto}
            ref={imgRef}
            src={foto}
            srcSet={srcSet(foto)}
            sizes="(min-width:1280px) 300px, (min-width:1024px) 30vw, 50vw"
            alt={altProduto(product.name, cor)}
            width={960}
            height={1200}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setCarregada(true)}
            className={`relative w-full h-full object-cover transition duration-700 ease-[var(--ease-ga)] motion-safe:group-hover:scale-[1.05] ${carregada || priority ? 'opacity-100' : 'opacity-0'}`}
          />
        </Link>

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start pointer-events-none">
          {chegouHoje && <span className="ga-selo">Chegou hoje</span>}
          {novidade && <span className="ga-selo">Novidade</span>}
        </div>

        <button
          type="button"
          onClick={() => onToggleWishlist(product)}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
          className={`ga-press absolute top-2 right-2 p-2.5 rounded-full shadow-sm transition ${isWishlisted ? 'bg-rose-600 text-white' : 'bg-white/90 text-stone-700 hover:text-rose-600'}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} aria-hidden="true" />
        </button>

        {/* Visualização rápida: aparece no hover (computador) e fica sempre visível no toque */}
        <button
          type="button"
          onClick={() => onQuickView(product)}
          className="ga-press ga-quick absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-[11px] font-semibold text-[#242322] shadow-sm"
          aria-label={`Visualização rápida de ${product.name}`}
        >
          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Ver rápido</span>
        </button>
      </div>

      {/* Informações */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-[#7A5530]">
          {[product.marca, publico].filter(Boolean).join(' · ')}
        </p>
        <Titulo id={`p-${product.id}`} className="font-serif text-[15px] sm:text-lg font-bold text-[#242322] leading-snug mt-1">
          <Link to={url} className="hover:text-[#7A5530] transition-colors">
            {product.name}
          </Link>
        </Titulo>
        {product.subtitle && <p className="text-xs text-stone-600 mt-0.5 line-clamp-2 hidden sm:block">{product.subtitle}</p>}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {product.colors.length > 1 ? (
            <ul className="flex items-center gap-1" aria-label="Cores disponíveis">
              {product.colors.slice(0, 5).map((c) => (
                <li key={c.name}>
                  <button
                    type="button"
                    onClick={() => setCor(c.name)}
                    aria-pressed={cor === c.name}
                    aria-label={`Ver cor ${c.name}`}
                    title={c.name}
                    className={`block w-6 h-6 rounded-full border-2 transition ${cor === c.name ? 'border-[#242322] scale-110' : 'border-white ring-1 ring-stone-300'}`}
                    style={{ backgroundColor: c.hex }}
                  />
                </li>
              ))}
            </ul>
          ) : product.colors.length === 1 ? (
            <span className="text-[11px] text-stone-600">{product.colors[0].name}</span>
          ) : null}
          {faixa && <span className="text-[11px] text-stone-600">{faixa}</span>}
        </div>

        <div className="mt-auto pt-3 flex items-center gap-2">
          <a
            href={directWhatsAppUrl}
            data-origem="card"
            data-produto={product.id}
            target="_blank"
            rel="noopener noreferrer"
            className="ga-press flex-1 bg-[#242322] hover:bg-black text-[#F7F3ED] font-semibold text-xs sm:text-sm py-2.5 px-3 rounded-full transition flex items-center justify-center gap-1.5"
            aria-label={`Consultar ${product.name} no WhatsApp (abre em nova aba)`}
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" aria-hidden="true" />
            <span>Consultar</span>
          </a>
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="ga-press shrink-0 w-10 h-10 rounded-full border border-[#D8B98A] text-[#7A5530] hover:bg-[#D8B98A]/20 transition flex items-center justify-center"
            aria-label={`Adicionar ${product.name} à sacola de interesses`}
            title="Adicionar à sacola"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};
