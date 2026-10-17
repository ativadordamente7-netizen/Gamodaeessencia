import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X, ZoomIn, ZoomOut } from 'lucide-react';
import { srcSet, thumb } from '../../utils/img';

export interface GalleryImage {
  src: string;
  alt: string;
}

interface Props {
  images: GalleryImage[];
  index: number;
  onIndexChange: (i: number) => void;
  /** Modo B: profundidade discreta que acompanha o cursor (apenas mouse/trackpad). */
  depth?: boolean;
  priority?: boolean;
}

const prefereMenosMovimento = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const temMouse = () => typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

/** Detecta deslize horizontal (toque ou mouse arrastado) sem bibliotecas. */
function useSwipe(onPrev: () => void, onNext: () => void) {
  const inicio = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      inicio.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (!inicio.current) return;
      const dx = e.clientX - inicio.current.x;
      const dy = e.clientY - inicio.current.y;
      inicio.current = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) (dx < 0 ? onNext : onPrev)();
    },
    onPointerCancel: () => (inicio.current = null),
  };
}

/** GA Product Experience — Modo A (galeria premium) + Modo B (profundidade). */
export const ProductGallery: React.FC<Props> = ({ images, index, onIndexChange, depth = true, priority = false }) => {
  const total = images.length;
  const atual = images[Math.min(index, total - 1)] ?? images[0];
  const prev = useCallback(() => onIndexChange((index - 1 + total) % total), [index, total, onIndexChange]);
  const next = useCallback(() => onIndexChange((index + 1) % total), [index, total, onIndexChange]);
  const swipe = useSwipe(prev, next);
  const [telaCheia, setTelaCheia] = useState(false);
  const [carregada, setCarregada] = useState(false);
  const palco = useRef<HTMLDivElement>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  // se a foto já veio do cache/pré-carregamento, o evento onLoad pode não disparar: confere direto
  useEffect(() => {
    const el = imgRef.current;
    setCarregada(!!el && el.complete && el.naturalWidth > 0);
  }, [atual?.src]);

  // Modo B — inclinação suave (máx. 5°) com sombra que acompanha o cursor
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!depth || e.pointerType !== 'mouse' || !temMouse() || prefereMenosMovimento()) return;
    const el = palco.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-py * 5).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(px * 5).toFixed(2)}deg`);
    el.style.setProperty('--gx', `${50 + px * 40}%`);
    el.style.setProperty('--gy', `${50 + py * 40}%`);
  };
  const onLeave = () => {
    const el = palco.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  if (!atual) return null;

  return (
    <div className="space-y-3">
      <div
        className="relative [perspective:1200px]"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        {...swipe}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') prev();
          if (e.key === 'ArrowRight') next();
        }}
      >
        <div
          ref={palco}
          className="ga-depth relative aspect-[4/5] rounded-[28px] overflow-hidden bg-[#EFE8DD] shadow-[0_30px_60px_-30px_rgba(36,35,34,0.45)]"
        >
          {!carregada && <div className="absolute inset-0 ga-skeleton" aria-hidden="true" />}
          <img
            key={atual.src}
            ref={imgRef}
            src={atual.src}
            srcSet={srcSet(atual.src)}
            sizes="(min-width:1024px) 560px, 100vw"
            alt={atual.alt}
            width={960}
            height={1200}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            onLoad={() => setCarregada(true)}
            draggable={false}
            className={`relative w-full h-full object-cover select-none transition-opacity duration-500 ${carregada || priority ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* reflexo de luz do Modo B */}
          <span className="ga-depth-glare pointer-events-none absolute inset-0" aria-hidden="true" />

          <button
            type="button"
            onClick={() => setTelaCheia(true)}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-[#242322] shadow-sm hover:bg-white"
          >
            <Expand className="w-4 h-4" aria-hidden="true" /> Tela cheia
          </button>
          {total > 1 && (
            <>
              <button type="button" onClick={prev} aria-label="Foto anterior" className="ga-nav left-3">
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={next} aria-label="Próxima foto" className="ga-nav right-3">
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
              <p className="absolute top-3 left-3 rounded-full bg-[#242322]/80 px-2.5 py-1 text-[11px] font-semibold text-white" aria-live="polite">
                {index + 1} / {total}
              </p>
            </>
          )}
        </div>
      </div>

      {total > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Fotos do produto">
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <button
                type="button"
                onClick={() => onIndexChange(i)}
                aria-label={`Ver foto ${i + 1}: ${img.alt}`}
                aria-current={i === index}
                className={`block w-16 h-20 rounded-xl overflow-hidden border-2 transition ${
                  i === index ? 'border-[#242322]' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={thumb(img.src)} alt="" width={64} height={80} loading="lazy" className="w-full h-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {telaCheia && (
        <TelaCheia images={images} index={index} onIndexChange={onIndexChange} onClose={() => setTelaCheia(false)} />
      )}
    </div>
  );
};

/** Visualização em tela cheia com zoom controlado e gestos. */
const TelaCheia: React.FC<{
  images: GalleryImage[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}> = ({ images, index, onIndexChange, onClose }) => {
  const total = images.length;
  const [zoom, setZoom] = useState(false);
  const [origem, setOrigem] = useState('50% 50%');
  const fecharRef = useRef<HTMLButtonElement>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const prev = () => { setZoom(false); onIndexChange((index - 1 + total) % total); };
  const next = () => { setZoom(false); onIndexChange((index + 1) % total); };
  const swipe = useSwipe(prev, next);
  const atual = images[index];

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    fecharRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Tab' && caixa.current) {
        const f = caixa.current.querySelectorAll<HTMLElement>('button');
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const mover = (e: React.PointerEvent) => {
    if (!zoom) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setOrigem(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div
      ref={caixa}
      role="dialog"
      aria-modal="true"
      aria-label="Fotos em tela cheia"
      className="fixed inset-0 z-[70] bg-[#141312] flex flex-col ga-fade-in"
    >
      <div className="flex items-center justify-between p-3 sm:p-4 text-white">
        <p className="text-sm text-white/80" aria-live="polite">{index + 1} / {total}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => !z)}
            aria-pressed={zoom}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-semibold"
          >
            {zoom ? <ZoomOut className="w-4 h-4" aria-hidden="true" /> : <ZoomIn className="w-4 h-4" aria-hidden="true" />}
            {zoom ? 'Afastar' : 'Aproximar'}
          </button>
          <button ref={fecharRef} type="button" onClick={onClose} aria-label="Fechar tela cheia" className="rounded-full bg-white/10 hover:bg-white/20 p-2.5">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="relative flex-1 flex items-center justify-center overflow-hidden px-2 pb-4" {...swipe}>
        <img
          src={atual.src}
          alt={atual.alt}
          onClick={() => setZoom((z) => !z)}
          onPointerMove={mover}
          draggable={false}
          style={{ transformOrigin: origem }}
          className={`max-h-full max-w-full rounded-2xl object-contain select-none transition-transform duration-300 ease-out ${
            zoom ? 'scale-[1.8] cursor-zoom-out' : 'cursor-zoom-in'
          }`}
        />
        {total > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="Foto anterior" className="ga-nav ga-nav-dark left-3">
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={next} aria-label="Próxima foto" className="ga-nav ga-nav-dark right-3">
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
