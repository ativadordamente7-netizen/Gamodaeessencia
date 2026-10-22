import { CategoryType } from '../types';

/** Categorias da loja: rota da página, nome no menu e título da página. */
export const CATEGORIAS: { id: CategoryType; rota: string; label: string }[] = [
  { id: 'tenis', rota: 'tenis', label: 'Tênis' },
  { id: 'chinelos', rota: 'chinelos', label: 'Chinelos e papetes' },
  { id: 'pijamas', rota: 'pijamas', label: 'Pijamas' },
  { id: 'fitness', rota: 'fitness', label: 'Fitness' },
  { id: 'camisetas', rota: 'camisetas', label: 'Camisetas e polos' },
  { id: 'calcas', rota: 'calcas', label: 'Calças' },
  { id: 'conjuntos', rota: 'conjuntos-e-bermudas', label: 'Conjuntos e bermudas' },
  { id: 'essencia', rota: 'perfumaria', label: 'Perfumaria e corpo' },
  { id: 'acessorios', rota: 'acessorios', label: 'Bonés e acessórios' },
  { id: 'eletronicos', rota: 'eletronicos', label: 'Eletrônicos' },
];
