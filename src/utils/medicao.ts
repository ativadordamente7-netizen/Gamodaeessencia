import { UMAMI_SCRIPT, UMAMI_WEBSITE_ID } from '../config/medicao';

type Dados = Record<string, string | number | undefined>;
declare global {
  interface Window { umami?: { track: (evento: string, dados?: Dados) => void } }
}

/** Carrega o Umami só depois que a página terminou de carregar (não atrapalha a velocidade). */
export function iniciarMedicao() {
  if (!UMAMI_WEBSITE_ID || typeof document === 'undefined') return;
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
  const carregar = () => {
    const s = document.createElement('script');
    s.src = UMAMI_SCRIPT;
    s.defer = true;
    s.dataset.websiteId = UMAMI_WEBSITE_ID;
    document.head.appendChild(s);
  };
  if (document.readyState === 'complete') setTimeout(carregar, 1500);
  else window.addEventListener('load', () => setTimeout(carregar, 1500), { once: true });

  // Todo clique em link do WhatsApp vira o evento "whatsapp_click", com a origem (card, produto, sacola…) e o produto
  document.addEventListener(
    'click',
    (e) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href^="https://wa.me"]') as HTMLAnchorElement | null;
      if (!a) return;
      registrar('whatsapp_click', {
        origem: a.dataset.origem || 'geral',
        produto: a.dataset.produto,
        itens: a.dataset.itens ? Number(a.dataset.itens) : undefined,
        pagina: location.pathname,
      });
    },
    true
  );
}

/** Registra um evento (não faz nada se a medição estiver desligada). */
export function registrar(evento: string, dados?: Dados) {
  try {
    window.umami?.track(evento, dados);
  } catch {
    /* medição nunca pode quebrar o site */
  }
}
