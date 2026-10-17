import React from 'react';
import { Heart, MessageCircle, Plus } from 'lucide-react';
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
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  whatsappNumber,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  priority = false,
}) => {
  const directWhatsAppUrl = createProductWhatsAppLink(whatsappNumber, product);
  const chegouHoje = isChegouHoje(product);
  const novidade = !chegouHoje && isNovidade(product);
  const corPrincipal = product.colors[0]?.name;
  const faixa =
    product.sizes.length > 1 && product.category !== 'eletronicos'
      ? `${/^\d/.test(product.sizes[0]) ? 'Nº' : 'Tam.'} ${product.sizes[0]} ao ${product.sizes[product.sizes.length - 1]}`
      : product.sizes[0];
  const publico = product.publico ? PUBLICO_LABEL[product.publico] : product.category === 'eletronicos' ? 'Eletrônicos' : '';

  return (
    <article
      className="group relative flex flex-col h-full rounded-2xl overflow-hidden bg-white/70 border border-[#E8DFD2] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_18px_40px_-18px_rgba(140,109,79,0.45)] hover:border-[#D4A373]/60 transition-all duration-300"
      aria-labelledby={`p-${product.id}`}
    >
      {/* Foto */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F3EEE6]">
        <button
          type="button"
          onClick={() => onQuickView(product)}
          className="block w-full h-full focus-visible:outline-none"
          aria-label={`Ver detalhes de ${product.name}`}
        >
          <img
            src={product.image}
            srcSet={srcSet(product.image)}
            sizes="(min-width:1280px) 300px, (min-width:1024px) 30vw, (min-width:640px) 45vw, 50vw"
            alt={altProduto(product.name, corPrincipal)}
            width={960}
            height={1200}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="w-full h-full object-cover motion-safe:group-hover:scale-[1.04] transition-transform duration-700 ease-out"
          />
        </button>

        {/* Selos */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start pointer-events-none">
          {chegouHoje && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#1F1F1F] text-[#E9C893] shadow-sm">
              Chegou hoje
            </span>
          )}
          {novidade && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#1F1F1F] text-[#E9C893] shadow-sm">
              Novidade
            </span>
          )}
          {product.colors.length > 1 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-[#2D2D2D] shadow-sm">
              {product.colors.length} cores
            </span>
          )}
        </div>

        {/* Favoritar */}
        <button
          type="button"
          onClick={() => onToggleWishlist(product)}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
          className={`absolute top-2 right-2 p-2.5 rounded-full shadow-sm transition ${
            isWishlisted ? 'bg-rose-600 text-white' : 'bg-white/90 text-stone-700 hover:text-rose-600'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {/* Informações */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-[#7A5C40]">
          {[product.marca, publico].filter(Boolean).join(' · ')}
        </p>
        <h3 id={`p-${product.id}`} className="font-serif text-[15px] sm:text-lg font-bold text-[#1F1F1F] leading-snug mt-1">
          <button type="button" onClick={() => onQuickView(product)} className="text-left hover:text-[#7A5C40] transition-colors">
            {product.name}
          </button>
        </h3>
        {product.subtitle && (
          <p className="text-xs text-stone-600 mt-0.5 line-clamp-2 hidden sm:block">{product.subtitle}</p>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {product.colors.length > 0 && (
            <ul className="flex items-center -space-x-1" aria-label={`Cores: ${product.colors.map((c) => c.name).join(', ')}`}>
              {product.colors.slice(0, 5).map((c) => (
                <li key={c.name} className="w-4 h-4 rounded-full border-2 border-white ring-1 ring-stone-300" style={{ backgroundColor: c.hex }} title={c.name} />
              ))}
            </ul>
          )}
          {faixa && <span className="text-[11px] text-stone-600">{faixa}</span>}
        </div>

        <div className="mt-auto pt-3 flex items-center gap-2">
          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#1F1F1F] hover:bg-black text-[#FAF7F2] font-semibold text-xs sm:text-sm py-2.5 px-3 rounded-full transition flex items-center justify-center gap-1.5"
            aria-label={`Consultar ${product.name} no WhatsApp (abre em nova aba)`}
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" aria-hidden="true" />
            <span>Consultar</span>
          </a>
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="shrink-0 w-10 h-10 rounded-full border border-[#D4A373]/60 text-[#7A5C40] hover:bg-[#D4A373]/15 transition flex items-center justify-center"
            aria-label={`Adicionar ${product.name} à lista de pedidos`}
            title="Adicionar à lista"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};
