import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, type Plugin} from 'vite';

/**
 * Pré-carrega a foto principal da página de produto já no HTML,
 * sem esperar o JavaScript (melhora o LCP de /produto/:id).
 */
function preloadFotoProduto(): Plugin {
  return {
    name: 'ga-preload-foto-produto',
    transformIndexHtml() {
      const produtos = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'src/data/produtos.json'), 'utf8'));
      const mapa = Object.fromEntries(
        produtos.filter((p: any) => p.inStock !== false).map((p: any) => [p.id, p.image.replace(/^\/produtos\//, '').replace(/\.webp$/, '')])
      );
      const js = `(function(){var m=${JSON.stringify(mapa)};var r=location.pathname.match(/^\\/produto\\/([^/]+)/);var f=r&&m[decodeURIComponent(r[1])];if(!f)return;var l=document.createElement('link');l.rel='preload';l.as='image';l.setAttribute('fetchpriority','high');var b='/produtos/'+f;l.setAttribute('imagesrcset',b+'-480.webp 480w, '+b+'-720.webp 720w, '+b+'.webp 960w');l.setAttribute('imagesizes','(min-width:1024px) 560px, 100vw');document.head.appendChild(l);})();`;
      return [{ tag: 'script', children: js, injectTo: 'head' }];
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), preloadFotoProduto()],
    // model-viewer (3D) é carregado só sob demanda; o aviso de tamanho não afeta o catálogo
    build: { chunkSizeWarningLimit: 1100 },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
