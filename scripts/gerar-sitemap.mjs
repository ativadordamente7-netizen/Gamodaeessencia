// Gera public/sitemap.xml a partir do catálogo (roda automaticamente antes de cada build)
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://gamodaeessencia.com.br';
const produtos = JSON.parse(readFileSync(new URL('../src/data/produtos.json', import.meta.url))).filter((p) => p.inStock !== false);
const catSrc = readFileSync(new URL('../src/data/categorias.ts', import.meta.url), 'utf8');
const categorias = [...catSrc.matchAll(/id: '([^']+)', rota: '([^']+)'/g)].map((m) => ({ id: m[1], rota: m[2] }));
const hoje = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: '/', lastmod: hoje, prio: '1.0' },
  ...categorias.filter((c) => produtos.some((p) => p.category === c.id)).map((c) => ({ loc: `/${c.rota}`, lastmod: hoje, prio: '0.8' })),
  ...produtos.map((p) => ({ loc: `/produto/${p.id}`, lastmod: p.addedAt || hoje, prio: '0.7' })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.prio}</priority></url>`).join('\n')}
</urlset>
`;
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml: ${urls.length} endereços`);
