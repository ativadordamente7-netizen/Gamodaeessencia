import React from 'react';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';
import { createCartWhatsAppLink, formatPhoneDisplay } from '../utils/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  whatsappNumber: string;
  onClose: () => void;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cartItems,
  whatsappNumber,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartWhatsAppUrl = createCartWhatsAppLink(whatsappNumber, cartItems);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md frosted-glass text-[#242322] shadow-2xl flex flex-col border-l border-white/80">
          
          {/* Drawer Header */}
          <div className="p-5 bg-white/80 border-b border-stone-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D8B98A]" />
              <h2 className="font-serif text-lg font-bold text-[#242322]">
                Lista de Pedidos ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'itens'})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-black rounded-full hover:bg-white/80 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner */}
          <div className="bg-emerald-500/10 px-5 py-3 border-b border-emerald-500/20 text-xs flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
            <span>Envie sua lista com cores e tamanhos diretamente no WhatsApp da GA Moda & Essência.</span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mx-auto text-stone-400 border border-stone-200">
                  <ShoppingBag className="w-8 h-8 text-[#D8B98A]" />
                </div>
                <p className="text-[#242322] font-bold">Sua lista está vazia</p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Explore nossa vitrine unissex e selecione suas peças favoritas.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 bg-[#242322] hover:bg-black text-[#F7F3ED] font-bold text-xs py-3 px-6 rounded-full transition shadow-xs"
                >
                  Ver Vitrine
                </button>
              </div>
            ) : (
              cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-3 bg-white/80 rounded-2xl border border-white shadow-xs relative"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover object-top rounded-xl border border-stone-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-bold text-[#242322] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(index)}
                          className="text-stone-400 hover:text-red-500 transition ml-1"
                          title="Remover produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Tamanho: <span className="text-[#242322] font-bold">{item.selectedSize}</span> | Cor: <span className="text-[#242322] font-bold">{item.selectedColor}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-stone-100 rounded-lg border border-stone-200">
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          className="p-1 text-stone-600 hover:text-black"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-[#242322]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="p-1 text-stone-600 hover:text-black"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/50">
                        Pronta Entrega
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer / Checkout CTA */}
          {cartItems.length > 0 && (
            <div className="p-5 bg-white/90 border-t border-stone-200/80 space-y-3 shadow-xs">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-stone-700">Total de Peças Selecionadas:</span>
                <span className="text-lg text-[#242322]">
                  {totalItemsCount} {totalItemsCount === 1 ? 'peça' : 'peças'}
                </span>
              </div>

              <p className="text-[11px] text-stone-500 text-center">
                Atendimento direto com nossa equipe via WhatsApp ({formatPhoneDisplay(whatsappNumber)})
              </p>

              <a
                href={cartWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#0F7A40] hover:bg-[#0B6334] text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-full transition flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                <span>Enviar Lista de Pedido no WhatsApp</span>
              </a>

              <button
                onClick={onClearCart}
                className="w-full text-stone-500 hover:text-stone-800 text-xs py-1 transition text-center"
              >
                Esvaziar Lista
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

