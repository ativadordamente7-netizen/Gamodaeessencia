# GA Moda & Essência — Experience 2.0

Branch: `experience-2.0`. Ela parte da `main` no commit `fb8d212`, e nenhum produto ou foto foi apagado.

## Direção visual GA Signature
- **Paleta:** pérola `#F7F3ED`, branco `#FFFFFF`, grafite `#242322`, champagne `#D8B98A` (ajustada para combinar com o ouro da logo), bronze `#A67037` (só em detalhes) e bronze para textos `#7A5530` (garante contraste).
- **Tokens de cor e de animação** em `src/index.css` (`@theme`).
- **Fontes Playfair Display e Plus Jakarta Sans no próprio site** (`public/fonts`), com pré-carregamento. Não dependem mais do Google Fonts.
- **Logo com fundo transparente** (`public/logo-ga-transparente.webp`), usada sempre sobre o grafite: no topo, no menu e no rodapé.

## Topo cinematográfico (`Hero.tsx`)
- Fundo grafite com halos de luz no tom da logo.
- A logo entra com uma revelação suave, e os textos sobem.
- Parallax discreto, com camadas que andam em velocidades diferentes.
- Destaques com link direto para a página do produto: faixa deslizável no celular e composição em camadas no computador.
- Título novo: "Estilo selecionado, toda semana.", sem prometer diferenciais que não existem.

## Cards de produto (`ProductCard.tsx`)
- Profundidade 3D discreta e zoom suave, só com mouse. No celular nada depende de hover.
- Botão "Ver rápido" (visualização rápida): aparece no hover no computador e fica sempre visível no toque.
- As bolinhas de cor trocam a foto do card.
- O nome do produto leva à página dele.
- Mostra um indicador de carregamento até a foto chegar.
- A adição rápida à lista não escolhe mais numeração nem cor no lugar do cliente: registra "a definir".

## Página própria por produto (`/produto/:id`, `ProductPage.tsx`)
- Cada produto tem um endereço próprio, que pode ser compartilhado e postado no grupo.
- Seletor de cor ligado à galeria e seletor de numeração.
- **WhatsApp com modelo, cor, numeração e o link do produto** já na mensagem.
- Barra fixa no celular com WhatsApp, lista de pedidos e compartilhar.
- Botão de compartilhar: abre o compartilhamento nativo do celular ou copia o link.
- Seção "Você também pode gostar".
- Título, descrição, endereço canônico e dados estruturados (`Product`) próprios em cada página.

## GA Product Experience (`src/components/experience/`)
- **Modo A — galeria premium (ativo):** navegação por setas, miniaturas, teclado (← →) e deslize no celular. Tem tela cheia com zoom controlado (1,8×) e fecha com Esc. O foco do teclado fica dentro da janela.
- **Modo B — profundidade (ativo):** inclinação de até 5° com reflexo de luz seguindo o cursor. Só com mouse e desligado com "reduzir movimento". Não distorce o produto.
- **Modo C — giro 360° real (pronto, desligado):** liga sozinho quando o produto tiver `spin360.frames` com 12 ou mais fotos reais. Arrastar para girar, teclado, girar/pausar e carregamento progressivo. Nunca simula ângulos.
- **Modo D — 3D real (pronto, desligado):** liga sozinho quando o produto tiver `model3d.glb`. Usa o `model-viewer`, que só é baixado quando o 3D abre (não pesa no catálogo).

## Microexperiências
- Revelação suave das seções e dos cards durante a rolagem (`Reveal.tsx`).
- Resposta visual ao tocar nos botões e transições suaves entre estados.
- Todas as animações respeitam a preferência "reduzir movimento". Não há som.

## Performance
- Fotos em 3 tamanhos (480, 720 e 960 px): o celular baixa a de 720.
- A foto principal da página do produto é pré-carregada já no HTML, antes do JavaScript (plugin no `vite.config.ts`).
- Logo otimizada: de 145 KB para 52 KB.
- Fontes locais, só com o alfabeto latino (cobre todos os acentos do português).

## SEO
- `robots.txt`.
- `sitemap.xml` gerado automaticamente a cada build (`scripts/gerar-sitemap.mjs`).
- Endereço canônico em cada página.
- Dados estruturados `ShoeStore` (a loja) e `Product` (cada produto, sem preço).

## Acessibilidade
- Hierarquia de títulos corrigida.
- Diálogos com foco preso dentro deles e fechamento por Esc.
- Textos alternativos com a cor do produto.
- Contraste verificado pelo axe.

## Correções
- A lista de pedidos somava 2 itens de uma vez em modo de desenvolvimento (o estado era alterado diretamente). Corrigido.
- O botão de WhatsApp flutuante deixou de cobrir o botão principal na página do produto.

## Testes (`npm test`)
24 testes automáticos (Playwright + axe), rodando no computador e no celular:
- Carregamento sem erros e ausência de rolagem lateral.
- Filtros.
- Mensagem de WhatsApp com modelo, cor, numeração e link.
- Galeria por cor e foto principal visível.
- Tela cheia pelo teclado e visualização rápida.
- Sitemap e robots.
- Acessibilidade sem violações graves.
