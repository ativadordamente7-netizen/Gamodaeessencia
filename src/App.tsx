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
    document.title = (TITULOS[rota] ? TITULOS[rota] + ' | ' : '') + 'GA Moda & Essência — Serra Gaúcha';
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
  const handleAddToCart = (product: Product) => {
    const defaultSize: ProductSize = product.sizes[0] || 'M';
    const defaultColor = product.colors[0]?.name || 'Padrão';
    handleAddToCartWithSizeAndColor(product, defaultSize, defaultColor);
  };

  const handleAddToCartWithSizeAndColor = (
    product: Product,
    size: ProductSize,
    color: string
  ) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
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
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2D2D] font-sans selection:bg-[#D4A373] selection:text-white relative overflow-x-hidden">
      
      <a href="#vitrine" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-[#1F1F1F] focus:text-white focus:px-4 focus:py-2 focus:rounded-full">
        Pular para os produtos
      </a>

      {/* Soft Ambient Background Orbs for Frosted Glass Depth */}
      <div aria-hidden="true" className="fixed top-0 left-1/4 w-96 h-96 bg-[#D4A373]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div aria-hidden="true" className="fixed top-1/3 right-10 w-[500px] h-[500px] bg-[#A5A58D]/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div aria-hidden="true" className="fixed bottom-10 left-10 w-[600px] h-[600px] bg-[#E6E2DE]/50 rounded-full blur-3xl pointer-events-none -z-10" />
      
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
      {isHome && <AboutSection whatsappNumber={whatsappNumber} />}

      {/* Frequently Asked Questions */}
      {isHome && <FaqSection whatsappNumber={whatsappNumber} />}
      </main>

      {/* Footer */}
      <Footer whatsappNumber={whatsappNumber} />

      {/* Floating Action Button (WhatsApp) */}
      <WhatsAppFloat whatsappNumber={whatsappNumber} />

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
