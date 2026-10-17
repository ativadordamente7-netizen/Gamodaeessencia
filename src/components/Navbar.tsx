import React, { useState, useRef } from 'react';
import { ShoppingBag, Heart, Search, Menu, X, Settings, MessageCircle, Instagram, Sparkles } from 'lucide-react';
import { createGeneralWhatsAppLink, formatPhoneDisplay } from '../utils/whatsapp';
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from '../utils/instagram';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenConfig: () => void;
  whatsappNumber: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenConfig,
  whatsappNumber,
  searchQuery,
  setSearchQuery,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const generalWhatsAppUrl = createGeneralWhatsAppLink(whatsappNumber);

  const scrollToVitrine = () => {
    const vitrineEl = document.getElementById('vitrine');
    if (vitrineEl) {
      vitrineEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length > 0) {
      // Optional smooth auto-scroll to vitrine if user is far up
      const vitrineEl = document.getElementById('vitrine');
      if (vitrineEl && window.scrollY < 200) {
        vitrineEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const quickSearchTags = [
    { label: 'Nike', value: 'nike' },
    { label: 'Adidas', value: 'adidas' },
    { label: 'New Balance', value: 'new balance' },
    { label: 'Vans', value: 'vans' },
    { label: 'Puma', value: 'puma' },
    { label: 'Smart TV', value: 'tv' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md text-[#242322] shadow-sm border-b border-white/80 transition-all duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-[#242322] text-[#F7F3ED] py-1.5 px-4 text-xs font-medium text-center flex items-center justify-center gap-2 tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-[#D8B98A]" aria-hidden="true" />
        <span>Atendimento pelo WhatsApp: <strong>{formatPhoneDisplay(whatsappNumber)}</strong></span>
        <span className="hidden md:inline text-white/70">• Novidades toda semana</span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#242322] hover:bg-white/80 transition"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <a href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="GA Moda & Essência — início">
            <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 bg-[#242322] ring-1 ring-[#D8B98A]/50 shadow-sm">
              <img src="/logo-ga-transparente.webp" alt="" width={96} height={96} className="w-full h-full object-cover scale-[1.08]" />
            </span>
            <span className="flex flex-col items-start sm:items-center text-center">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-wider text-[#242322] group-hover:text-[#D8B98A] transition-colors">
                GA
              </span>
              <span className="hidden sm:inline text-[11px] sm:text-xs uppercase tracking-[0.25em] font-medium text-[#7A5530] border-l border-[#D8B98A]/40 pl-2">
                Moda & Essência
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-stone-500 -mt-1 font-sans hidden sm:block">
              Tênis · Moda · Perfumaria
            </span>
            </span>
          </a>

          {/* Desktop Search Bar (Real-Time Filter) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <div className={`w-full flex items-center bg-stone-100/80 hover:bg-stone-100 border transition-all duration-200 rounded-full px-3.5 py-2 text-xs sm:text-sm shadow-xs ${
              isSearchFocused ? 'border-[#D8B98A] ring-2 ring-[#D8B98A]/20 bg-white' : 'border-stone-200/80'
            }`}>
              <Search className={`w-4 h-4 mr-2.5 shrink-0 transition-colors ${
                searchQuery ? 'text-[#D8B98A]' : 'text-stone-400'
              }`} />
              <input
                ref={searchInputRef}
                type="search"
                id="navbar-search-input"
                aria-label="Buscar produtos"
                placeholder="Buscar tênis, marca, cor..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    scrollToVitrine();
                  }
                }}
                className="bg-transparent text-[#242322] placeholder-stone-400 focus:outline-none w-full text-xs sm:text-sm font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="text-stone-400 hover:text-stone-700 p-0.5 rounded-full hover:bg-stone-200 transition"
                  title="Limpar busca"
                  aria-label="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick search tags suggestions popover on focus */}
            {isSearchFocused && !searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-stone-200 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Sugestões de busca rápida:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickSearchTags.map((tag) => (
                    <button
                      key={tag.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSearchChange(tag.value);
                        scrollToVitrine();
                      }}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-[#D8B98A]/15 hover:text-[#242322] text-stone-600 rounded-full transition text-xs font-medium"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons & WhatsApp Button */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            
            {/* Instagram Profile */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#242322] hover:text-pink-600 hover:bg-white/80 rounded-full transition"
              title={`Siga no Instagram ${INSTAGRAM_HANDLE}`}
              aria-label={`Instagram ${INSTAGRAM_HANDLE} (abre em nova aba)`}
            >
              <Instagram className="w-5 h-5" />
            </a>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-[#242322] hover:text-rose-600 hover:bg-white/80 rounded-full transition"
              title="Favoritos"
              aria-label={`Favoritos (${wishlistCount})`}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Bag Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-[#242322] hover:text-[#D8B98A] hover:bg-white/80 rounded-full transition"
              title="Lista de Pedidos"
              aria-label={`Lista de pedidos (${cartCount} itens)`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D8B98A] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* WhatsApp Header CTA Button */}
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-2 bg-[#0F7A40] hover:bg-[#0B6334] text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-sm hover:shadow-md transition duration-200 group shrink-0"
            >
              <MessageCircle className="w-4 h-4 fill-white text-[#25D366] group-hover:scale-110 transition-transform" />
              <span>Chama no WhatsApp</span>
            </a>

            
          </div>
        </div>

        {/* Mobile Search Bar (Always visible on mobile) */}
        <div className="pb-3 md:hidden">
          <div className={`flex items-center bg-stone-100/90 border transition-all rounded-full px-3.5 py-1.5 text-xs shadow-2xs ${
            searchQuery ? 'border-[#D8B98A] bg-white' : 'border-stone-200'
          }`}>
            <Search className={`w-3.5 h-3.5 mr-2 shrink-0 ${searchQuery ? 'text-[#D8B98A]' : 'text-stone-400'}`} />
            <input
              type="search"
              id="navbar-search-mobile"
              aria-label="Buscar produtos"
              placeholder="Buscar tênis, marca, cor..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-transparent text-[#242322] placeholder-stone-400 focus:outline-none w-full text-xs font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-stone-400 hover:text-stone-700 p-0.5 rounded-full"
                title="Limpar busca"
                  aria-label="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-stone-200 px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3 font-medium text-sm">
            <a
              href="#vitrine"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#242322] hover:text-[#D8B98A] py-1"
            >
              Vitrine de Produtos
            </a>
            
            
            
            <a
              href="#sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#242322] hover:text-[#D8B98A] py-1"
            >
              Sobre a GA Moda & Essência
            </a>
          </nav>

          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#0F7A40] hover:bg-[#0B6334] text-white font-medium text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
              <span>Atendimento via WhatsApp</span>
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-stone-100 hover:bg-stone-200 text-[#242322] font-medium text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-2"
            >
              <Instagram className="w-4 h-4 text-pink-600" />
              <span>Siga {INSTAGRAM_HANDLE} no Instagram</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
