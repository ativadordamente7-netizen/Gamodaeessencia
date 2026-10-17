/** Versão pequena (480px) da foto, usada em miniaturas e celulares. */
export const thumb = (src: string) => src.replace(/\.webp$/, '-480.webp');

/** srcSet pronto: o navegador escolhe 480px ou 960px conforme a tela. */
export const srcSet = (src: string) => `${thumb(src)} 480w, ${src} 960w`;

/** Texto alternativo descritivo para leitores de tela. */
export const altProduto = (nome: string, cor?: string) =>
  cor ? `${nome} na cor ${cor.toLowerCase()}` : nome;
