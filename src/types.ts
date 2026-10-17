export type CategoryType = 
  | 'todos'
  | 'oversize'
  | 'alfaiataria'
  | 'moletons'
  | 'conjuntos'
  | 'essencia'
  | 'acessorios'
  | 'lancamentos'
  | 'tenis'
  | 'chinelos'
  | 'pijamas'
  | 'fitness'
  | 'camisetas'
  | 'eletronicos';

export type ProductSize = string;

export interface Product {
  id: string;
  name: string;
  /** Frase curta de destaque exibida abaixo do nome */
  subtitle?: string;
  /** Data em que o produto entrou no site (AAAA-MM-DD). Usada para o selo "Novidade" e a ordem da vitrine. */
  addedAt?: string;
  category: CategoryType;
  price?: number;
  originalPrice?: number;
  image: string;
  gallery?: string[];
  description: string;
  details?: string[];
  sizes: ProductSize[];
  colors: { name: string; hex: string }[];
  tag?: 'Lançamento' | 'Mais Vendido' | 'Exclusivo' | 'Destaque' | 'Unissex';
  inStock: boolean;
  featured?: boolean;
  marca?: string;
  publico?: 'feminino' | 'masculino' | 'unissex';
  sizesByColor?: Record<string, string[]>;
  colorImages?: Record<string, string>;
  /** Giro 360° real: sequência de fotos do mesmo produto em ângulos em volta (mín. 12, ideal 24–36). */
  spin360?: { frames: string[] };
  /** Modelo 3D real do produto (GLB para Android/web, USDZ opcional para iPhone). */
  model3d?: { glb: string; usdz?: string; poster?: string };
}

export interface CartItem {
  product: Product;
  selectedSize: ProductSize;
  selectedColor: string;
  quantity: number;
}


export interface Testimonial {
  id: string;
  name: string;
  location: string;
  comment: string;
  rating: number;
  avatar: string;
  purchasedItem?: string;
}

export interface InstagramPost {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  caption: string;
  url: string;
}
