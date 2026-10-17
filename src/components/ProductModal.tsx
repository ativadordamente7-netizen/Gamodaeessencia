import React, { useEffect, useRef, useState } from 'react';
import { X, Heart, MessageCircle, ShoppingBag, Check } from 'lucide-react';
import { Product, ProductSize } from '../types';
import { createProductWhatsAppLink } from '../utils/whatsapp';
import { srcSet, thumb, altProduto } from '../utils/img';
import { PUBLICO_LABEL } from '../data/catalogo';

interface ProductModalProps {
  product: Product | null;
  whatsappNumber: string;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (product: Product) => void;
  onAddToCartWithSizeAndColor: (product: Product, size: ProductSize, color: string) => void;
}

/** Casca: só monta o conteúdo quando há produto (e reinicia o estado a cada produto). */
export const ProductModal: React.FC<ProductModalProps> = (props) => {
  if (!props.product) return null;
  return <ModalConteudo key={props.product.id} {...props} product={props.product} />;
};

const ModalConteudo: React.FC<ProductModalProps & { product: Product }> = ({
  product,
  whatsappNumber,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCartWithSizeAndColor,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || '');
  const tamanhos = product.sizesByColor?.[selectedColor] ?? product.sizes;
  const [selectedSize, setSelectedSize] = useState<ProductSize>('');
  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [avisoTamanho, setAvisoTamanho] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const tamanhoUnico = tamanhos.length <= 1;
  const tamanhoFinal = tamanhoUnico ? tamanhos[0] ?? '' : selectedSize;

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  // Acessibilidade: foco no botão fechar, Esc fecha, Tab fica dentro do modal, fundo não rola
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),select,input');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
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

  const whatsAppUrl = createProductWhatsAppLink(whatsappNumber, product, tamanhoFinal || 'a confirmar', selectedColor);

  const handleAddToCart = () => {
    if (!tamanhoFinal) { setAvisoTamanho(true); return; }
    onAddToCartWithSizeAndColor(product, tamanhoFinal, selectedColor || 'Única');
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const escolherCor = (nome: string) => {
    setSelectedColor(nome);
    const img = product.colorImages?.[nome];
    if (img) setSelectedImage(img);
    const lista = product.sizesByColor?.[nome];
    if (lista && selectedSize && !lista.includes(selectedSize)) setSelectedSize('');
  };

  const publico = product.publico ? PUBLICO_LABEL[product.publico] : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        className="relative w-full max-w-4xl bg-[#FAF7F2] text-[#2D2D2D] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[94vh] flex flex-col md:flex-row"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes do produto"
          className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-sm border border-stone-200"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Galeria */}
        <div className="md:w-1/2 bg-[#F3EEE6] p-4 sm:p-6 flex flex-col overflow-y-auto">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm">
            <img
              src={selectedImage}
              srcSet={srcSet(selectedImage)}
              sizes="(min-width:768px) 440px, 100vw"
              alt={altProduto(product.name, selectedColor)}
              width={960}
              height={1200}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <ul className="flex gap-2 mt-3 overflow-x-auto pb-1" aria-label="Outras fotos">
              {images.map((img, idx) => {
                const cor = Object.entries(product.colorImages ?? {}).find(([, v]) => v === img)?.[0];
                return (
                  <li key={img}>
                    <button
                      type="button"
                      onClick={() => (cor ? escolherCor(cor) : setSelectedImage(img))}
                      aria-label={cor ? `Ver cor ${cor}` : `Ver foto ${idx + 1}`}
                      aria-current={selectedImage === img}
                      className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === img ? 'border-[#7A5C40]' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={thumb(img)} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Detalhes */}
        <div className="md:w-1/2 p-5 sm:p-8 flex flex-col overflow-y-auto">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-[#7A5C40] uppercase pr-12">
              {[product.marca, publico].filter(Boolean).join(' · ')}
            </p>
            <h2 id="modal-titulo" className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] mt-1 pr-10">
              {product.name}
            </h2>
            {product.subtitle && <p className="text-[#7A5C40] font-medium text-sm mt-1">{product.subtitle}</p>}

            <p className="text-stone-700 text-sm mt-4 leading-relaxed">{product.description}</p>

            {product.colors.length > 0 && (
              <fieldset className="mt-5">
                <legend className="text-xs font-semibold text-[#1F1F1F] mb-2">
                  Cor: <span className="text-[#7A5C40] font-bold">{selectedColor}</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => escolherCor(color.name)}
                      aria-pressed={selectedColor === color.name}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs transition ${
                        selectedColor === color.name ? 'border-[#1F1F1F] bg-white font-semibold' : 'border-stone-300 bg-white/60 hover:border-stone-500'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-stone-300" style={{ backgroundColor: color.hex }} aria-hidden="true" />
                      {color.name}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {!tamanhoUnico && (
              <fieldset className="mt-5">
                <legend className="text-xs font-semibold text-[#1F1F1F] mb-2">
                  Numeração{selectedSize ? <>: <span className="text-[#7A5C40] font-bold">{selectedSize}</span></> : ''}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {tamanhos.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => { setSelectedSize(size); setAvisoTamanho(false); }}
                      aria-pressed={selectedSize === size}
                      className={`min-w-11 h-11 px-3 rounded-xl text-sm font-semibold transition border ${
                        selectedSize === size ? 'bg-[#1F1F1F] text-[#FAF7F2] border-[#1F1F1F]' : 'bg-white text-stone-800 border-stone-300 hover:border-[#7A5C40]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {avisoTamanho && (
                  <p role="alert" className="text-xs text-rose-700 mt-2">Escolha a numeração para adicionar à lista.</p>
                )}
                <p className="text-[11px] text-stone-600 mt-2">Em dúvida sobre a numeração? Pergunte no WhatsApp antes de fechar.</p>
              </fieldset>
            )}

            {product.details && product.details.length > 0 && (
              <div className="mt-5 text-xs text-stone-700 bg-white p-4 rounded-xl border border-[#E8DFD2]">
                <p className="font-semibold text-[#1F1F1F] mb-1.5">Ficha do produto</p>
                <ul className="space-y-1 list-disc pl-4 marker:text-[#D4A373]">
                  {product.details.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8DFD2] space-y-2.5">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#1EBE5A] text-[#0B3B1F] font-bold text-sm py-3.5 px-4 rounded-full transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              Consultar valor no WhatsApp
            </a>
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full bg-[#1F1F1F] hover:bg-black text-[#FAF7F2] font-semibold text-sm py-3.5 px-4 rounded-full transition flex items-center justify-center gap-2"
            >
              {addedSuccess ? (
                <><Check className="w-4 h-4 text-emerald-400" aria-hidden="true" /><span role="status">Adicionado à lista!</span></>
              ) : (
                <><ShoppingBag className="w-4 h-4 text-[#D4A373]" aria-hidden="true" />Adicionar à lista de pedidos</>
              )}
            </button>
            <button
              type="button"
              onClick={() => onToggleWishlist(product)}
              aria-pressed={isWishlisted}
              className="w-full text-xs text-stone-700 hover:text-rose-700 py-2 flex items-center justify-center gap-1.5"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-600' : ''}`} aria-hidden="true" />
              {isWishlisted ? 'Nos seus favoritos' : 'Salvar nos favoritos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
