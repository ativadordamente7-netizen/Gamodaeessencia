/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Product, CartItem, ProductSize } from './types';
import { PRODUCTS_DATA } from './data/catalogo';
import { useLocation } from 'react-router-dom';
import { CategoryNav } from './components/CategoryNav';
import { DEFAULT_WHATSAPP_NUMBER } from './utils/whatsapp';
import { CATEGORIAS } from './data/categorias';
import { ProductPage } from './components/ProductPage';
import { PaginaInstitucional, PAGINAS } from './components/PaginaInstitucional';
import { Reveal } from './components/Reveal';
import { useSeo, LOJA_JSONLD } from './utils/seo';
import { registrar } from './utils/medicao';

import { Navbar } from './components/Navbar';
import { PromoMarquee } from './components/PromoMarquee';
import { Hero } from './components/Hero';
import { VitrineSection } from './components/VitrineSection';
import { AboutSection } from './components/AboutSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppFloat } from './components/WhatsAppFloat';

export default function App() {
  const whatsappNumber = DEFAULT_WHATSAPP_NUMBER;

  // Wishlist / Favorites
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ga_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Cart / Shopping Bag Items
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ga_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI States
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Páginas por categoria: /tenis, /eletronicos, /feminino, /masculino
  const { pathname } = useLocation();
  const rota = pathname.replace(/^\/|\/$/g, '');
  const isHome = rota === '';
  const isProduto = rota.startsWith('produto/');
  const isInstitucional = rota in PAGINAS;
  const visibleProducts =
    rota === 'feminino' || rota === 'masculino'
      ? PRODUCTS_DATA.filter((p) => p.publico === rota || p.publico === 'unissex')
      : CATEGORIAS.some((c) => c.rota === rota)
      ? PRODUCTS_DATA.filter((p) => p.category === CATEGORIAS.find((c) => c.rota === rota)!.id)
      : PRODUCTS_DATA;
  const TITULOS: Record<string, string> = {
    feminino: 'Feminino',
    masculino: 'Masculino',
    ...Object.fromEntries(CATEGORIAS.map((c) => [c.rota, c.label])),
  };
  const fecharModal = useCallback(() => setSelectedProductModal(null), []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [rota]);

  // Save changes to localStorage
  useEffect(() => {
    try { localStorage.setItem('ga_wishlist', JSON.stringify(wishlistIds)); } catch { /* navegador sem armazenamento */ }
  }, [wishlistIds]);

  useEffect(() => {
    try { localStorage.setItem('ga_cart', JSON.stringify(cartItems)); } catch { /* navegador sem armazenamento */ }
  }, [cartItems]);

  // Wishlist Handler
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );
  };

  // Add to Cart Handlers
  // Adição rápida (pelo card): não escolhe numeração/cor no lugar do cliente
  const handleAddToCart = (product: Product) => {
    const size: ProductSize = product.sizes.length > 1 ? 'a definir' : product.sizes[0] || 'Único';
    const color = product.colors.length > 1 ? 'a definir' : product.colors[0]?.name || 'Única';
    handleAddToCartWithSizeAndColor(product, size, color);
  };

  const handleAddToCartWithSizeAndColor = (
    product: Product,
    size: ProductSize,
    color: string
  ) => {
    registrar('sacola_adicionar', { produto: product.id });
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        return prev.map((item, i) => (i === existingIndex ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [
        ...prev,
        {
          product,
          selectedSize: size,
          selectedColor: color,
          quantity: 1,
        },
      ];
    });

    setIsCartOpen(true);
  };

  // Cart Drawer Handlers
  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCartItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: newQty } : item)));
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-[#F7F3ED] text-[#242322] font-sans selection:bg-[#D8B98A] selection:text-white relative overflow-x-hidden">
      
      <a href={isProduto ? '#conteudo' : '#vitrine'} className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-[#242322] focus:text-white focus:px-4 focus:py-2 focus:rounded-full">
        Pular para o conteúdo
      </a>

      {/* Soft Ambient Background Orbs for Frosted Glass Depth */}
      
      {/* Header Navigation */}
      <Navbar
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => {
          const vitrineEl = document.getElementById('vitrine');
          if (vitrineEl) vitrineEl.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenConfig={() => undefined}
        whatsappNumber={whatsappNumber}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <CategoryNav />

      {/* Scrolling Promo Marquee */}
      <PromoMarquee whatsappNumber={whatsappNumber} />

      <main id="conteudo">
      {isInstitucional ? (
        <PaginaInstitucional slug={rota} whatsappNumber={whatsappNumber} />
      ) : isProduto ? (
        <ProductPage
          whatsappNumber={whatsappNumber}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCartWithSizeAndColor}
          onQuickAdd={handleAddToCart}
          onQuickView={(p) => setSelectedProductModal(p)}
        />
      ) : (
      <>
      <ListagemSeo titulo={TITULOS[rota]} rota={rota} />
      {/* Hero Banner Section */}
      {isHome && <Hero whatsappNumber={whatsappNumber} />}

      {/* Main Product Showcase / Vitrine */}
      <VitrineSection
        products={visibleProducts}
        whatsappNumber={whatsappNumber}
        wishlistIds={wishlistIds}
        searchQuery={searchQuery}
        onToggleWishlist={handleToggleWishlist}
        onQuickView={(p) => setSelectedProductModal(p)}
        onAddToCart={handleAddToCart}
        onClearSearch={() => setSearchQuery('')}
        title={TITULOS[rota] ? `${TITULOS[rota]}` : undefined}
      />
      {/* About the Store */}
      {isHome && <Reveal><AboutSection whatsappNumber={whatsappNumber} /></Reveal>}

      {/* Frequently Asked Questions */}
      {isHome && <Reveal><FaqSection whatsappNumber={whatsappNumber} /></Reveal>}
      </>
      )}
      </main>

      {/* Footer */}
      <Footer whatsappNumber={whatsappNumber} />

      {/* Floating Action Button (WhatsApp) */}
      {!isProduto && <WhatsAppFloat whatsappNumber={whatsappNumber} />}

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProductModal}
        whatsappNumber={whatsappNumber}
        isWishlisted={selectedProductModal ? wishlistIds.includes(selectedProductModal.id) : false}
        onClose={fecharModal}
        onToggleWishlist={handleToggleWishlist}
        onAddToCartWithSizeAndColor={handleAddToCartWithSizeAndColor}
      />

      {/* Cart Drawer / Sacola Slide-over */}
      <CartDrawer
        isOpen={isCartOpen}
        cartItems={cartItems}
        whatsappNumber={whatsappNumber}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

    </div>
  );
}

/** Título, descrição e dados da loja para a página inicial e as páginas de categoria. */
function ListagemSeo({ titulo, rota }: { titulo?: string; rota: string }) {
  useSeo({
    title: titulo,
    description: titulo ? `${titulo} na GA Moda & Essência: curadoria, novidades toda semana e atendimento pelo WhatsApp.` : undefined,
    path: rota ? `/${rota}` : '/',
    jsonLd: rota ? undefined : LOJA_JSONLD,
  });
  return null;
}
