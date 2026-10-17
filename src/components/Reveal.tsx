import React, { useEffect, useRef, useState } from 'react';

type Props = React.HTMLAttributes<HTMLElement> & {
  as?: keyof React.JSX.IntrinsicElements;
  /** atraso em ms, para revelar itens em sequência */
  delay?: number;
};

/**
 * Revela o conteúdo com um fade + leve subida quando entra na tela.
 * Sem biblioteca: usa IntersectionObserver. Quem prefere menos movimento vê tudo direto (ver index.css).
 */
export const Reveal: React.FC<Props> = ({ as = 'div', delay = 0, className = '', style, children, ...rest }) => {
  const ref = useRef<HTMLElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setVisivel(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisivel(true); io.disconnect(); } },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return React.createElement(
    as,
    {
      ref,
      className: `ga-reveal ${visivel ? 'is-visible' : ''} ${className}`,
      style: { ...style, transitionDelay: delay ? `${delay}ms` : undefined },
      ...rest,
    },
    children
  );
};
