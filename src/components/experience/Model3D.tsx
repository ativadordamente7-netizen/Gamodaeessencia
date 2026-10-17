import React, { useEffect, useState } from 'react';

interface Props {
  glb: string;
  usdz?: string;
  poster?: string;
  alt: string;
}

/**
 * GA Product Experience — Modo D (modelo 3D real).
 * Só aparece quando o produto tem `model3d.glb` cadastrado.
 * A biblioteca (model-viewer) só é baixada quando este componente abre,
 * então não pesa no carregamento do catálogo.
 */
export const Model3D: React.FC<Props> = ({ glb, usdz, poster, alt }) => {
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    let vivo = true;
    import('@google/model-viewer').then(() => vivo && setPronto(true));
    return () => { vivo = false; };
  }, []);

  if (!pronto) {
    return <div className="aspect-[4/5] rounded-[28px] ga-skeleton" role="status" aria-label="Carregando modelo 3D" />;
  }
  return React.createElement('model-viewer', {
    src: glb,
    'ios-src': usdz,
    poster,
    alt,
    'camera-controls': true,
    'touch-action': 'pan-y',
    'shadow-intensity': '0.8',
    exposure: '1',
    ar: usdz ? true : undefined,
    style: { width: '100%', aspectRatio: '4 / 5', background: '#FFFFFF', borderRadius: '28px' },
  });
};
