import React from 'react';
import { NavLink } from 'react-router-dom';
import { CATEGORIAS } from '../data/categorias';
import { PRODUCTS_DATA } from '../data/catalogo';

// O menu só mostra categorias que têm produto no site
const LINKS = [
  { to: '/', label: 'Início' },
  ...CATEGORIAS.filter((c) => PRODUCTS_DATA.some((p) => p.category === c.id)).map((c) => ({ to: '/' + c.rota, label: c.label })),
  { to: '/feminino', label: 'Feminino' },
  { to: '/masculino', label: 'Masculino' },
];

export const CategoryNav: React.FC = () => (
  <nav aria-label="Categorias" className="border-b border-[#D8B98A]/25 bg-[#F7F3ED]/90">
    <ul className="max-w-7xl mx-auto px-4 flex gap-2 sm:gap-4 overflow-x-auto py-2 text-sm font-semibold">
      {LINKS.map((l) => (
        <li key={l.to} className="shrink-0">
          <NavLink to={l.to} end className={({ isActive }) => `inline-block px-4 py-1.5 rounded-full transition ${isActive ? 'bg-[#242322] text-white' : 'text-stone-700 hover:text-[#7A5530]'}`}>
            {l.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);
