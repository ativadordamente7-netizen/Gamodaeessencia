import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const erros = (page: import('@playwright/test').Page) => {
  const lista: string[] = [];
  page.on('pageerror', (e) => lista.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') lista.push(m.text()); });
  return lista;
};

test('página inicial carrega o topo e a vitrine sem erros', async ({ page }) => {
  const e = erros(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Estilo selecionado');
  await expect(page.locator('#vitrine article')).toHaveCount(24);
  expect(e).toEqual([]);
});

test('não há rolagem horizontal na página inicial', async ({ page }) => {
  await page.goto('/');
  const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(sobra).toBeLessThanOrEqual(0);
});

test('filtro por marca responde na hora', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('group', { name: 'Filtrar por marca' }).getByRole('button', { name: 'Vans' }).click();
  const n = await page.locator('#vitrine article').count();
  expect(n).toBeGreaterThan(0);
  expect(n).toBeLessThan(24);
});

test('página do produto: WhatsApp leva modelo, cor, numeração e link', async ({ page }) => {
  const e = erros(page);
  await page.goto('/produto/new-balance-9060');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('New Balance 9060');
  await expect(page).toHaveTitle(/New Balance 9060/);
  await page.getByRole('button', { name: 'Branco/azul', exact: true }).click();
  await page.getByRole('button', { name: '38', exact: true }).click();
  // botão principal: no computador fica ao lado da foto; no celular, na barra fixa do rodapé
  const href = await page.getByRole('link', { name: /^Consultar (este modelo )?no WhatsApp$/ }).locator('visible=true').first().getAttribute('href');
  const msg = decodeURIComponent(href!.split('text=')[1]);
  expect(msg).toContain('New Balance 9060');
  expect(msg).toContain('Branco/azul');
  expect(msg).toContain('38');
  expect(msg).toContain('/produto/new-balance-9060');
  expect(e).toEqual([]);
});

test('escolher a cor leva a galeria para a foto daquela cor', async ({ page }) => {
  await page.goto('/produto/new-balance-9060');
  await page.getByRole('button', { name: 'Preto (sola bege)', exact: true }).click();
  await expect(page.getByText('4 / 5')).toBeVisible();
  await expect(page.getByRole('img', { name: /preto \(sola bege\)/ }).first()).toBeVisible();
});

test('foto principal do produto aparece (sem ficar no carregando)', async ({ page }) => {
  await page.goto('/produto/new-balance-9060');
  await expect(page.locator('.ga-depth .ga-skeleton')).toHaveCount(0, { timeout: 8000 });
  const largura = await page.locator('.ga-depth img').evaluate((i: HTMLImageElement) => i.naturalWidth);
  expect(largura).toBeGreaterThan(0);
});

test('produto inexistente mostra aviso amigável', async ({ page }) => {
  await page.goto('/produto/nao-existe');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('não está mais na vitrine');
});

test('galeria em tela cheia abre, navega pelo teclado e fecha com Esc', async ({ page }) => {
  await page.goto('/produto/nike-dunk-low');
  await page.getByRole('button', { name: 'Tela cheia' }).click();
  const dialogo = page.getByRole('dialog', { name: 'Fotos em tela cheia' });
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByText('1 / 4')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(dialogo.getByText('2 / 4')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialogo).toBeHidden();
});

test('visualização rápida abre e fecha com Esc', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Visualização rápida de Nike Dunk Low' }).click();
  const modal = page.getByRole('dialog', { name: 'Nike Dunk Low' });
  await expect(modal).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

test('sitemap e robots estão publicados', async ({ request }) => {
  const s = await request.get('/sitemap.xml');
  expect(await s.text()).toContain('/produto/nike-dunk-low');
  const r = await request.get('/robots.txt');
  expect(await r.text()).toContain('Sitemap:');
});

for (const rota of ['/', '/produto/nike-dunk-low']) {
  test(`acessibilidade sem violações graves em ${rota}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(rota);
    await page.waitForTimeout(400);
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
  });
}
