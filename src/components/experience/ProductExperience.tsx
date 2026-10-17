import React, { Suspense, lazy, useMemo, useState } from 'react';
import { Product } from '../../types';
import { altProduto } from '../../utils/img';
import { ProductGallery, GalleryImage } from './ProductGallery';

const Spin360 = lazy(() => import('./Spin360').then((m) => ({ default: m.Spin360 })));
const Model3D = lazy(() => import('./Model3D').then((m) => ({ default: m.Model3D })));

type Modo = 'fotos' | '360' | '3d';

interface Props {
  product: Product;
  /** Cor escolhida: a galeria vai para a foto dessa cor */
  cor?: string;
  onCorPelaFoto?: (cor: string) => void;
  priority?: boolean;
}

/** Monta a lista de fotos do produto, ligando cada foto à sua cor quando houver. */
export function fotosDoProduto(product: Product): (GalleryImage & { cor?: string })[] {
  const lista = product.gallery?.length ? product.gallery : [product.image];
  const corDe = (src: string) => Object.entries(product.colorImages ?? {}).find(([, v]) => v === src)?.[0];
  return lista.map((src) => {
    const cor = corDe(src);
    return { src, cor, alt: altProduto(product.name, cor) };
  });
}

/**
 * GA Product Experience — componente reutilizável de visualização.
 * A: galeria premium (sempre) · B: profundidade (mouse) · C: 360° real (se houver fotos) · D: 3D real (se houver modelo)
 */
export const ProductExperience: React.FC<Props> = ({ product, cor, onCorPelaFoto, priority }) => {
  const fotos = useMemo(() => fotosDoProduto(product), [product]);
  const idxCor = cor ? fotos.findIndex((f) => f.cor === cor) : -1;
  const [idx, setIdx] = useState(Math.max(0, idxCor));
  const [modo, setModo] = useState<Modo>('fotos');

  // quando a cor muda por fora (seletor), acompanha a foto da cor
  const [corAnterior, setCorAnterior] = useState(cor);
  if (cor !== corAnterior) {
    setCorAnterior(cor);
    if (idxCor >= 0) setIdx(idxCor);
  }

  const tem360 = (product.spin360?.frames.length ?? 0) >= 12;
  const tem3d = !!product.model3d?.glb;
  const modos: { id: Modo; label: string }[] = [
    { id: 'fotos', label: 'Fotos' },
    ...(tem360 ? [{ id: '360' as Modo, label: 'Giro 360°' }] : []),
    ...(tem3d ? [{ id: '3d' as Modo, label: '3D' }] : []),
  ];

  return (
    <div>
      {modos.length > 1 && (
        <div role="tablist" aria-label="Modo de visualização" className="mb-3 inline-flex rounded-full bg-[#EFE8DD] p-1">
          {modos.map((m) => (
            <button
              key={m.id}
              role="tab"
              type="button"
              aria-selected={modo === m.id}
              onClick={() => setModo(m.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${modo === m.id ? 'bg-[#242322] text-white' : 'text-[#242322]'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
      {modo === 'fotos' && (
        <ProductGallery
          images={fotos}
          index={idx}
          priority={priority}
          onIndexChange={(i) => {
            setIdx(i);
            const c = fotos[i]?.cor;
            if (c && onCorPelaFoto) onCorPelaFoto(c);
          }}
        />
      )}
      <Suspense fallback={<div className="aspect-[4/5] rounded-[28px] ga-skeleton" role="status" aria-label="Carregando" />}>
        {modo === '360' && tem360 && <Spin360 frames={product.spin360!.frames} alt={product.name} />}
        {modo === '3d' && tem3d && <Model3D {...product.model3d!} alt={product.name} />}
      </Suspense>
    </div>
  );
};
