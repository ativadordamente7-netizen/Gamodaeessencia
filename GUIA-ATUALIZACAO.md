# GA Moda & Essência — Como atualizar o site

## Onde fica cada coisa
- `src/data/produtos.json`: a lista de produtos. É o único arquivo que muda no dia a dia.
- `public/produtos/`: as fotos tratadas. Cada foto tem duas versões: `nome.webp` (grande) e `nome-480.webp` (miniatura).
- `fotos-originais/`: as fotos originais, sem tratamento (não vão para o site).
- `tools/tratar_fotos.py`: o script que trata as fotos (deixa no formato 4:5, corrige luz e nitidez e gera o WebP).

## Fluxo diário (produtos novos do grupo)
1. Os produtos novos são postados no grupo do WhatsApp.
2. O Claude lê o grupo, identifica cada produto (marca, modelo, cores, numeração e público) e trata as fotos.
3. Os produtos novos entram no `produtos.json` com o campo `"addedAt": "AAAA-MM-DD"` (a data do dia).
   - Na data em que entra, o produto aparece com o selo **Chegou hoje**.
   - Nos 7 dias seguintes, aparece com o selo **Novidade**.
   - A vitrine sempre mostra primeiro os produtos mais recentes.
4. O site é gerado de novo (`npm run build`) e a pasta `dist` é publicada no Netlify.

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

## Publicar no Netlify (arrastar e soltar)
1. Acesse app.netlify.com e clique no site da GA.
2. Clique em **Deploys**.
3. Arraste a pasta `dist` (ou o zip do site) para a área "Drag and drop your site output folder here".
4. Espere aparecer **Published** e confira o site em gamodaeessencia.com.br.
