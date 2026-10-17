import { Product } from '../types';
import produtos from './produtos.json';

/**
 * Catálogo da vitrine.
 * Para adicionar um produto novo, edite src/data/produtos.json (veja o GUIA-ATUALIZACAO.md).
 * A vitrine mostra primeiro os produtos que chegaram por último (campo addedAt).
 */
export const PRODUCTS_DATA: Product[] = (produtos as Product[]).filter((p) => p.inStock !== false).sort((a, b) =>
  (b.addedAt ?? '').localeCompare(a.addedAt ?? '')
);

const DIAS_NOVIDADE = 7;

/** true se o produto entrou no site nos últimos 7 dias */
export function isNovidade(p: Product, hoje: Date = new Date()): boolean {
  if (!p.addedAt) return false;
  const entrada = new Date(p.addedAt + 'T00:00:00');
  const dias = (hoje.getTime() - entrada.getTime()) / 86400000;
  return dias >= 0 && dias < DIAS_NOVIDADE;
}

/** true se o produto entrou hoje */
export function isChegouHoje(p: Product, hoje: Date = new Date()): boolean {
  if (!p.addedAt) return false;
  const h = hoje.toLocaleDateString('sv-SE'); // AAAA-MM-DD no fuso local
  return p.addedAt === h;
}

export const PUBLICO_LABEL: Record<string, string> = {
  feminino: 'Feminino',
  masculino: 'Masculino',
  unissex: 'Unissex',
};
