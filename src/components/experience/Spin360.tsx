import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCw } from 'lucide-react';

interface Props {
  frames: string[];
  alt: string;
}

/**
 * GA Product Experience — Modo C (giro 360° real).
 * Só é exibido quando o produto tem uma sequência real de fotos em volta dele
 * (campo `spin360.frames` no produtos.json, mínimo 12 fotos). Nunca simula ângulos.
 */
export const Spin360: React.FC<Props> = ({ frames, alt }) => {
  const [frame, setFrame] = useState(0);
  const [carregadas, setCarregadas] = useState(1);
  const [girando, setGirando] = useState(false);
  const arraste = useRef<{ x: number; f: number } | null>(null);
  const total = frames.length;

  // Carregamento progressivo: primeira foto já, demais em segundo plano
  useEffect(() => {
    let vivo = true;
    let n = 1;
    frames.slice(1).forEach((src) => {
      const img = new Image();
      img.onload = () => { if (vivo) setCarregadas(++n); };
      img.src = src;
    });
    return () => { vivo = false; };
  }, [frames]);

  // Giro automático (desligado para quem prefere menos movimento)
  useEffect(() => {
    if (!girando || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % total), 90);
    return () => clearInterval(t);
  }, [girando, total]);

  const pronto = carregadas >= total;

  return (
    <div className="space-y-3">
      <div
        role="slider"
        tabIndex={0}
        aria-label={`Girar ${alt} em 360 graus`}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={frame + 1}
        aria-valuetext={`Ângulo ${frame + 1} de ${total}`}
        className="relative aspect-[4/5] rounded-[28px] overflow-hidden bg-white cursor-grab active:cursor-grabbing touch-pan-y select-none"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          arraste.current = { x: e.clientX, f: frame };
          setGirando(false);
        }}
        onPointerMove={(e) => {
          if (!arraste.current) return;
          const passo = (e.currentTarget as HTMLElement).clientWidth / total;
          const d = Math.round((e.clientX - arraste.current.x) / passo);
          setFrame(((arraste.current.f - d) % total + total) % total);
        }}
        onPointerUp={() => (arraste.current = null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setFrame((f) => (f - 1 + total) % total);
          if (e.key === 'ArrowRight') setFrame((f) => (f + 1) % total);
        }}
      >
        <img src={frames[frame]} alt={`${alt} — ângulo ${frame + 1} de ${total}`} draggable={false} className="w-full h-full object-contain" />
        {!pronto && (
          <p className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#242322]">
            Carregando ângulos {carregadas}/{total}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-stone-600">
        <span className="inline-flex items-center gap-1.5"><RotateCw className="w-4 h-4" aria-hidden="true" /> Arraste para girar</span>
        <button
          type="button"
          onClick={() => setGirando((g) => !g)}
          disabled={!pronto}
          aria-pressed={girando}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E6DCCB] bg-white px-3 py-1.5 font-semibold text-[#242322] disabled:opacity-50"
        >
          {girando ? <Pause className="w-3.5 h-3.5" aria-hidden="true" /> : <Play className="w-3.5 h-3.5" aria-hidden="true" />}
          {girando ? 'Pausar' : 'Girar'}
        </button>
      </div>
    </div>
  );
};
