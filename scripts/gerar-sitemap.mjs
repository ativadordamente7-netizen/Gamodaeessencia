// Gera, a partir do catálogo (roda automaticamente antes de cada build):
//  - public/sitemap.xml
//  - public/ga-preload.js (pré-carrega a foto principal na página do produto, antes do React)
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://gamodaeessencia.com.br';
const produtos = JSON.parse(readFileSync(new URL('../src/data/produtos.json', import.meta.url))).filter((p) => p.inStock !== false);
const catSrc = readFileSync(new URL('../src/data/categorias.ts', import.meta.url), 'utf8');
const categorias = [...catSrc.matchAll(/id: '([^']+)', rota: '([^']+)'/g)].map((m) => ({ id: m[1], rota: m[2] }));
const hoje = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: '/', lastmod: hoje, prio: '1.0' },
  ...categorias.filter((c) => produtos.some((p) => p.category === c.id)).map((c) => ({ loc: `/${c.rota}`, lastmod: hoje, prio: '0.8' })),
  ...['/trocas-e-devolucoes', '/entregas', '/privacidade'].map((loc) => ({ loc, lastmod: hoje, prio: '0.4' })),
  ...produtos.map((p) => ({ loc: `/produto/${p.id}`, lastmod: p.addedAt || hoje, prio: '0.7' })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.prio}</priority></url>`).join('\n')}
</urlset>
`;
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml: ${urls.length} endereços`);

// Pré-carregamento da foto principal do produto (arquivo externo, compatível com a política de segurança CSP)
const mapa = Object.fromEntries(produtos.map((p) => [p.id, p.image.replace(/^\/produtos\//, '').replace(/\.webp$/, '')]));
const js = `(function(){var m=${JSON.stringify(mapa)};var r=location.pathname.match(/^\\/produto\\/([^/]+)/);var f=r&&m[decodeURIComponent(r[1])];if(!f)return;var l=document.createElement('link');l.rel='preload';l.as='image';l.setAttribute('fetchpriority','high');var b='/produtos/'+f;l.setAttribute('imagesrcset',b+'-480.webp 480w, '+b+'-720.webp 720w, '+b+'.webp 960w');l.setAttribute('imagesizes','(min-width:1024px) 560px, 100vw');document.head.appendChild(l);})();\n`;
writeFileSync(new URL('../public/ga-preload.js', import.meta.url), js);
console.log(`ga-preload.js: ${Object.keys(mapa).length} produtos`);
