import React, { useState, useMemo } from 'react';
import { CategoryType, Product } from '../types';
import { ProductCard } from './ProductCard';
import { Heart, Search, X } from 'lucide-react';
import { CATEGORIAS } from '../data/categorias';
import { Reveal } from './Reveal';

interface VitrineSectionProps {
  products: Product[];
  whatsappNumber: string;
  wishlistIds: string[];
  searchQuery: string;
  title?: string;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onClearSearch?: () => void;
}

// Remove acentos para a busca funcionar com "tenis" ou "tênis"
const normalizeStr = (str: string) =>
  str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const categorySynonyms: Partial<Record<CategoryType, string[]>> = {
  tenis: ['tenis', 'sapatenis', 'sneaker', 'calcado'],
  eletronicos: ['eletronico', 'tv', 'smart tv', 'televisao', 'tecnologia'],
  essencia: ['perfume', 'fragrancia', 'essencia'],
};

const chip = (ativo: boolean) =>
  `px-4 py-2 rounded-full text-xs font-semibold transition whitespace-nowrap border ${
    ativo
      ? 'bg-[#242322] text-[#F7F3ED] border-[#242322]'
      : 'bg-white/80 text-stone-700 border-[#E6DCCB] hover:border-[#D8B98A] hover:text-[#242322]'
  }`;

export const VitrineSection: React.FC<VitrineSectionProps> = ({
  products,
  whatsappNumber,
  wishlistIds,
  searchQuery,
  title,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onClearSearch,
}) => {
  const [categoria, setCategoria] = useState<CategoryType>('todos');
  const [marca, setMarca] = useState<string>('todas');
  const [sortBy, setSortBy] = useState<'novidades' | 'nome-az'>('novidades');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const categorias = useMemo(() => {
    const base: { id: CategoryType; label: string }[] = [{ id: 'todos', label: 'Tudo' }, ...CATEGORIAS];
    return base.filter((c) => c.id === 'todos' || products.some((p) => p.category === c.id));
  }, [products]);

  const marcas = useMemo(
    () => Array.from(new Set(products.map((p) => p.marca).filter(Boolean) as string[])).sort(),
    [products]
  );

  const filtered = useMemo(() => {
    const q = normalizeStr(searchQuery);
    const list = products.filter((p) => {
      if (q) {
        const hay = normalizeStr(
          [p.name, p.subtitle, p.description, p.marca, p.category, p.publico, ...(p.details ?? []), ...p.colors.map((c) => c.name)]
            .filter(Boolean)
            .join(' ')
        );
        const syn = (categorySynonyms[p.category] ?? []).some((s) => s.includes(q) || q.includes(s));
        if (!hay.includes(q) && !syn) return false;
      }
      if (categoria !== 'todos' && p.category !== categoria) return false;
      if (marca !== 'todas' && p.marca !== marca) return false;
      if (onlyFavorites && !wishlistIds.includes(p.id)) return false;
      return true;
    });
    if (sortBy === 'nome-az') return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    return list; // já vem ordenado por novidade
  }, [products, searchQuery, categoria, marca, onlyFavorites, wishlistIds, sortBy]);

  const limparTudo = () => {
    onClearSearch?.();
    setCategoria('todos');
    setMarca('todas');
    setOnlyFavorites(false);
  };

  return (
    <section id="vitrine" aria-labelledby="vitrine-titulo" className="py-12 sm:py-20 text-[#242322] scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#7A5530]">Vitrine GA</p>
          <h2 id="vitrine-titulo" className="font-serif text-3xl sm:text-5xl font-extrabold text-[#242322] tracking-tight">
            {title ?? 'Novidades toda semana'}
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Escolha o modelo, a cor e a numeração. A gente confirma valor e disponibilidade direto no WhatsApp, com atendimento de gente de verdade.
          </p>
        </div>

        {searchQuery.trim() && (
          <div className="mt-8 max-w-xl mx-auto bg-white border border-[#D8B98A]/50 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <p className="flex items-center gap-2.5 text-xs text-stone-700">
              <Search className="w-4 h-4 text-[#7A5530] shrink-0" aria-hidden="true" />
              <span>
                Busca: <strong className="text-[#242322]">"{searchQuery}"</strong>
              </span>
            </p>
            {onClearSearch && (
              <button
                type="button"
                onClick={onClearSearch}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-full transition"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                Limpar busca
              </button>
            )}
          </div>
        )}

        {/* Filtros */}
        <div className="mt-8 space-y-3">
          {categorias.length > 2 && (
            <div role="group" aria-label="Filtrar por categoria" className="flex gap-2 overflow-x-auto pb-1 justify-start sm:justify-center">
              {categorias.map((c) => (
                <button key={c.id} type="button" aria-pressed={categoria === c.id} onClick={() => setCategoria(c.id)} className={chip(categoria === c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          )}
          {marcas.length > 1 && (
            <div role="group" aria-label="Filtrar por marca" className="flex gap-2 overflow-x-auto pb-1 justify-start sm:justify-center">
              <button type="button" aria-pressed={marca === 'todas'} onClick={() => setMarca('todas')} className={chip(marca === 'todas')}>
                Todas as marcas
              </button>
              {marcas.map((m) => (
                <button key={m} type="button" aria-pressed={marca === m} onClick={() => setMarca(m)} className={chip(marca === m)}>
                  {m}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E6DCCB]">
            <p className="text-xs text-stone-600" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? 'modelo' : 'modelos'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-pressed={onlyFavorites}
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs transition ${
                  onlyFavorites ? 'bg-rose-50 text-rose-700 border-rose-300 font-semibold' : 'bg-white/80 text-stone-700 border-[#E6DCCB]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} aria-hidden="true" />
                Favoritos ({wishlistIds.length})
              </button>
              <label className="sr-only" htmlFor="ordenar">Ordenar produtos</label>
              <select
                id="ordenar"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'novidades' | 'nome-az')}
                className="bg-white/80 text-[#242322] border border-[#E6DCCB] rounded-full px-3 py-2 text-xs cursor-pointer"
              >
                <option value="novidades">Mais recentes</option>
                <option value="nome-az">Nome (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grade */}
        <div className="mt-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white/70 rounded-3xl border border-[#E6DCCB] space-y-3">
              <p className="text-[#242322] font-serif text-lg font-bold">Nenhum produto encontrado</p>
              <p className="text-stone-600 text-sm max-w-sm mx-auto">
                Tente outro termo ou limpe os filtros. Se procura um modelo específico, pergunte no WhatsApp: chegam novidades toda semana.
              </p>
              <button type="button" onClick={limparTudo} className="bg-[#242322] text-[#F7F3ED] text-xs font-semibold py-2.5 px-5 rounded-full">
                Limpar busca e filtros
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filtered.map((product, i) => (
                <Reveal as="li" key={product.id} delay={(i % 4) * 70}>
                  <ProductCard
                    product={product}
                    priority={i < 4}
                    whatsappNumber={whatsappNumber}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onToggleWishlist={onToggleWishlist}
                    onQuickView={onQuickView}
                    onAddToCart={onAddToCart}
                  />
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};
