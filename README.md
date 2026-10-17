# GA Moda & Essência — vitrine digital

Site: https://gamodaeessencia.com.br. Feito com React, Vite e Tailwind, e publicado no Netlify a partir da branch `main`.

## Comandos
```bash
npm install          # instala as dependências
npm run dev          # roda o site no computador: http://localhost:3000
npm run build        # gera o sitemap e a versão de produção (pasta dist)
npm run preview      # abre a versão de produção no computador
npm test             # testes automáticos (na 1ª vez: npx playwright install chromium)
npm run lint         # checagem de tipos (TypeScript)
```

## Onde fica cada coisa
- `src/data/produtos.json`: catálogo. Veja o `GUIA-ATUALIZACAO.md`.
- `src/data/produtos-aguardando-foto.json`: produtos já descritos que esperam foto.
- `src/components/experience/`: GA Product Experience (galeria, profundidade, 360° e 3D).
- `public/produtos/`: fotos em 3 tamanhos (`nome.webp`, `nome-720.webp` e `nome-480.webp`).
- `tools/tratar_fotos.py`: tratamento padrão das fotos.
- `CHANGELOG-EXPERIENCE-2.0.md`: o que mudou na versão 2.0.
