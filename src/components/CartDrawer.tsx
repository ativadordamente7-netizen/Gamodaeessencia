import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';
import { createCartWhatsAppLink } from '../utils/whatsapp';
import { thumb } from '../utils/img';

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  whatsappNumber: string;
  onClose: () => void;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

/**
 * Sacola de interesses: o cliente junta os produtos e envia a lista pelo WhatsApp.
 * Não é checkout: não tem preço, pagamento nem confirmação de pedido.
 */
export const CartDrawer: React.FC<CartDrawerProps> = (props) => {
  if (!props.isOpen) return null;
  return <Sacola {...props} />;
};

const Sacola: React.FC<CartDrawerProps> = ({ cartItems, whatsappNumber, onClose, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const total = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const url = createCartWhatsAppLink(whatsappNumber, cartItems);
  const painel = useRef<HTMLDivElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);

  // Acessibilidade: foco no fechar, Esc fecha, Tab preso no painel, fundo não rola
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    fechar.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && painel.current) {
        const f = painel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm ga-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sacola-titulo"
        className="absolute inset-y-0 right-0 w-full max-w-md bg-[#F7F3ED] text-[#242322] shadow-2xl flex flex-col ga-sacola-in"
      >
        <div className="p-5 border-b border-[#E6DCCB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#7A5530]" aria-hidden="true" />
            <h2 id="sacola-titulo" className="font-serif text-xl font-bold">
              Sacola de interesses <span className="text-sm font-sans font-medium text-stone-600">({total} {total === 1 ? 'item' : 'itens'})</span>
            </h2>
          </div>
          <button ref={fechar} type="button" onClick={onClose} aria-label="Fechar sacola" className="p-2 rounded-full hover:bg-white">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <p className="px-5 py-3 text-xs text-stone-700 bg-[#EFE8DD] border-b border-[#E6DCCB]">
          Junte aqui os modelos que você gostou e envie a lista pelo WhatsApp. A gente confirma valor, disponibilidade e entrega para a sua cidade. <strong>Isso não é uma compra:</strong> nada é cobrado aqui.
        </p>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-[#D8B98A]" aria-hidden="true" />
              <p className="font-semibold">Sua sacola está vazia</p>
              <p className="text-sm text-stone-600 max-w-xs mx-auto">Toque no "+" de qualquer produto para guardar aqui.</p>
              <button type="button" onClick={onClose} className="ga-press mt-2 bg-[#242322] text-white font-semibold text-sm py-3 px-6 rounded-full">
                Ver a vitrine
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {cartItems.map((item, index) => (
                <li key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-3 p-3 bg-white rounded-2xl border border-[#E6DCCB]">
                  <img
                    src={thumb((item.selectedColor && item.product.colorImages?.[item.selectedColor]) || item.product.image)}
                    alt=""
                    width={80}
                    height={100}
                    className="w-20 h-[100px] object-cover rounded-xl"
                  />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/produto/${item.product.id}`} onClick={onClose} className="font-serif font-bold leading-snug hover:text-[#7A5530]">
                        {item.product.name}
                      </Link>
                      <button type="button" onClick={() => onRemoveItem(index)} aria-label={`Remover ${item.product.name} da sacola`} className="p-1 text-stone-500 hover:text-rose-700">
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      {item.product.colors.length > 0 && <>Cor: <strong className="text-[#242322]">{item.selectedColor}</strong></>}
                      {item.product.sizes.length > 1 && <> · Tamanho: <strong className="text-[#242322]">{item.selectedSize}</strong></>}
                    </p>
                    {(item.selectedSize === 'a definir' || item.selectedColor === 'a definir') && (
                      <p className="text-[11px] text-[#7A5530] mt-1">Você pode escolher cor e tamanho na conversa.</p>
                    )}
                    <div className="mt-auto pt-2 flex items-center gap-1" role="group" aria-label={`Quantidade de ${item.product.name}`}>
                      <button type="button" onClick={() => onUpdateQuantity(index, item.quantity - 1)} aria-label="Diminuir quantidade" className="w-8 h-8 rounded-full border border-[#E6DCCB] flex items-center justify-center">
                        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{item.quantity}</span>
                      <button type="button" onClick={() => onUpdateQuantity(index, item.quantity + 1)} aria-label="Aumentar quantidade" className="w-8 h-8 rounded-full border border-[#E6DCCB] flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-5 border-t border-[#E6DCCB] bg-white space-y-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <a href={url} target="_blank" rel="noopener noreferrer" data-origem="sacola" data-itens={total} className="ga-press ga-cta-whats w-full">
              <MessageCircle className="w-5 h-5" aria-hidden="true" /> Enviar minha lista pelo WhatsApp
            </a>
            <button type="button" onClick={onClearCart} className="w-full text-xs text-stone-600 hover:text-[#242322] py-2">
              Esvaziar sacola
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
