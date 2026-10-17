import { useEffect } from 'react';

const SITE = 'https://gamodaeessencia.com.br';
const PADRAO = {
  title: 'GA Moda & Essência | Tênis e novidades toda semana — Serra Gaúcha',
  description:
    'GA Moda & Essência: tênis Nike, Adidas, New Balance, Vans, Puma e mais, com novidades toda semana na Serra Gaúcha. Escolha na vitrine e consulte pelo WhatsApp.',
};

function meta(selector: string, attr: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
  if (!el) return;
  el.setAttribute(attr, value);
}

/** Atualiza título, descrição, endereço canônico e dados estruturados de cada página. */
export function useSeo(opts: { title?: string; description?: string; path?: string; image?: string; jsonLd?: object }) {
  const { title, description, path, image, jsonLd } = opts;
  const jsonStr = jsonLd ? JSON.stringify(jsonLd) : '';
  useEffect(() => {
    const t = title ? `${title} | GA Moda & Essência` : PADRAO.title;
    const d = description ?? PADRAO.description;
    const url = SITE + (path ?? window.location.pathname);
    document.title = t;
    meta('meta[name="description"]', 'content', d);
    meta('meta[property="og:title"]', 'content', t);
    meta('meta[property="og:description"]', 'content', d);
    meta('meta[property="og:image"]', 'content', image ? SITE + image : `${SITE}/og-ga.jpg`);
    meta('link[rel="canonical"]', 'href', url);

    let script = document.getElementById('ga-jsonld') as HTMLScriptElement | null;
    if (jsonStr) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'ga-jsonld';
        document.head.appendChild(script);
      }
      script.textContent = jsonStr;
    } else script?.remove();
  }, [title, description, path, image, jsonStr]);
}

export const LOJA_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'ShoeStore',
  name: 'GA Moda & Essência',
  url: SITE,
  logo: `${SITE}/logo-ga-transparente.webp`,
  image: `${SITE}/og-ga.jpg`,
  areaServed: 'Serra Gaúcha, RS',
  sameAs: ['https://www.instagram.com/g.a_moda_e_essencia_reserva'],
};
