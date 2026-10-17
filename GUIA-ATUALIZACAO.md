# GA Moda & Essência — Como atualizar o site

## Onde fica cada coisa
- `src/data/produtos.json`: a lista de produtos. É o único arquivo que muda no dia a dia.
- `public/produtos/`: as fotos tratadas. Cada foto tem três versões: `nome.webp` (960 px), `nome-720.webp` (celular) e `nome-480.webp` (miniatura). O script `tools/tratar_fotos.py` gera as três.
- `fotos-originais/`: as fotos originais, sem tratamento (não vão para o site).
- `tools/tratar_fotos.py`: o script que trata as fotos (deixa no formato 4:5, corrige luz e nitidez e gera o WebP).

## Fluxo diário (produtos novos do grupo)
1. Os produtos novos são postados no grupo do WhatsApp.
2. O Claude lê o grupo, identifica cada produto (marca, modelo, cores, numeração e público) e trata as fotos.
3. Os produtos novos entram no `produtos.json` com o campo `"addedAt": "AAAA-MM-DD"` (a data do dia).
   - Na data em que entra, o produto aparece com o selo **Chegou hoje**.
   - Nos 7 dias seguintes, aparece com o selo **Novidade**.
   - A vitrine sempre mostra primeiro os produtos mais recentes.
4. As mudanças vão para o GitHub e o Netlify publica sozinho (veja "Publicar").

## Modelo de produto (copie e preencha)
```json
{
  "id": "marca-modelo",
  "name": "Marca Modelo",
  "subtitle": "Frase curta de destaque",
  "description": "Duas frases elegantes sobre visual e ocasião. Sem preço.",
  "category": "tenis",
  "marca": "Marca",
  "publico": "unissex",
  "image": "/produtos/marca-modelo-cor1.webp",
  "gallery": ["/produtos/marca-modelo-cor1.webp", "/produtos/marca-modelo-cor2.webp"],
  "sizes": ["34","35","36","37","38","39","40","41","42","43"],
  "colors": [{ "name": "Preto/branco", "hex": "#1C1C1C" }],
  "colorImages": { "Preto/branco": "/produtos/marca-modelo-cor1.webp" },
  "details": ["Marca: Marca", "Modelo: Modelo", "Cores: Preto/branco", "Numeração: 34 ao 43", "Público: Unissex"],
  "inStock": true,
  "addedAt": "2026-10-17"
}
```
Para tirar um produto do site, apague o bloco dele ou mude `"inStock"` para `false`.

## Regras da vitrine
- Não mostrar preços. Todo pedido vai para o WhatsApp.
- Usar só fotos reais dos produtos. O tratamento melhora luz e enquadramento, mas não altera o produto.
- Não usar depoimentos inventados. Quando houver depoimentos reais de clientes, com autorização deles, eles podem entrar.
- Não escrever "original", "garantia" ou "frete grátis" sem confirmar antes.

## Publicar
O Netlify está ligado ao GitHub (`ativadordamente7-netizen/Gamodaeessencia`).
- Tudo o que entra na branch **`main`** vai **direto para o site oficial**.
- Para testar antes de publicar, envie as mudanças em uma **branch nova** e abra um *pull request*. O Netlify cria uma **prévia** num endereço separado, e o site oficial não muda.
- Depois de aprovar a prévia, clique em **Merge pull request** no GitHub para publicar.

## Página de cada produto
Cada produto tem um endereço próprio: `https://gamodaeessencia.com.br/produto/<id>`. Por exemplo: `/produto/nike-dunk-low`.
Use esse link nas postagens do grupo e do Instagram: o cliente cai direto no modelo.

## Padrão de fotos (para a vitrine ficar premium)
O que precisamos para trocar o fundo automaticamente, ter zoom em alta e mais ângulos:
1. Fundo liso e claro (papel ou parede branca/creme), com luz de janela ou ring light.
2. **Produto sem mão e sem pé**, apoiado sobre a superfície.
3. Celular na horizontal da câmera traseira, foto original (não print e não foto encaminhada no WhatsApp, que perde qualidade).
4. 4 ângulos por produto: lateral, frente 3/4, traseira e sola.
5. Mande pelo Google Drive ou AirDrop, para chegar em qualidade original.

Observação: nas fotos atuais (com mão, pé e caixas), a troca automática de fundo foi testada e **não ficou limpa**, por isso não foi aplicada.

## Giro 360° real (Modo C)
1. Prato giratório (há modelos a partir de ~R$ 40) + celular parado num tripé.
2. 24 a 36 fotos, uma a cada 10° a 15°, sempre com a mesma luz e o mesmo enquadramento.
3. Salve como `public/produtos/360/<id>/01.webp`, `02.webp`, e assim por diante.
4. No produto, adicione:
```json
"spin360": { "frames": ["/produtos/360/nike-dunk-low/01.webp", "/produtos/360/nike-dunk-low/02.webp"] }
```
O botão "Giro 360°" aparece sozinho quando há 12 fotos ou mais.

## Modelo 3D real (Modo D)
Só funciona com um arquivo 3D de verdade do produto (`.glb`, e `.usdz` opcional para iPhone), feito por escaneamento ou modelagem.
```json
"model3d": { "glb": "/produtos/3d/nike-dunk-low.glb", "usdz": "/produtos/3d/nike-dunk-low.usdz" }
```
O botão "3D" aparece sozinho. A biblioteca 3D só é baixada quando o cliente abre esse modo.

## Antes de publicar
Rode `npm run build` e `npm test`. Os 24 testes têm que passar.
