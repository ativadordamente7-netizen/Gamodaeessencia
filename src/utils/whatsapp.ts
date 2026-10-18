import { Product, CartItem } from '../types';

export const DEFAULT_WHATSAPP_NUMBER = '5554991091455'; // Contato direto GA: +55 (54) 99109-1455 (confirmar)

export function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 13) {
    // 55 54 99438 5335 (9 dígitos com DDI)
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
  }
  if (cleaned.length === 12) {
    // 55 54 9109 1455 (8 dígitos com DDI)
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
  }
  if (cleaned.length === 11) {
    // 54 99438 5335 (9 dígitos com DDD)
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    // 54 9109 1455 (8 dígitos com DDD)
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function createGeneralWhatsAppLink(phoneNumber: string): string {
  const text = `Olá! Gostaria de falar com o atendimento da GA Moda & Essência para tirar dúvidas sobre a coleção unissex e fazer um pedido! ✨`;
  return buildWhatsAppUrl(phoneNumber, text);
}

/** Endereço da página do produto (funciona também nas prévias do Netlify). */
export function productUrl(product: Product): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gamodaeessencia.com.br';
  return `${origin}/produto/${product.id}`;
}

export function createProductWhatsAppLink(
  phoneNumber: string,
  product: Product,
  selectedSize?: string,
  selectedColor?: string
): string {
  const linhas = ['Olá! Gostei deste produto da GA Moda & Essência:', '', `Produto: ${product.name}`];
  if (product.colors.length) linhas.push(`Cor: ${selectedColor || 'a definir'}`);
  if (product.sizes.length > 1) linhas.push(`Tamanho: ${selectedSize || 'a definir'}`);
  linhas.push(`Link: ${productUrl(product)}`, '', 'Gostaria de confirmar o valor, a disponibilidade e as condições de entrega.');
  return buildWhatsAppUrl(phoneNumber, linhas.join('\n'));
}

/** Mensagem da sacola de interesses: lista clara para o vendedor (não é um pedido fechado). */
export function createCartWhatsAppLink(phoneNumber: string, cartItems: CartItem[]): string {
  const itens = cartItems.map((item, i) => {
    const l = [`${i + 1}. ${item.product.name}`];
    if (item.product.colors.length) l.push(`   Cor: ${item.selectedColor}`);
    if (item.product.sizes.length > 1) l.push(`   Tamanho: ${item.selectedSize}`);
    if (item.quantity > 1) l.push(`   Quantidade: ${item.quantity}`);
    l.push(`   Link: ${productUrl(item.product)}`);
    return l.join('\n');
  });
  const text = [
    'Olá! Separei estes produtos na GA Moda & Essência:',
    '',
    ...itens,
    '',
    'Gostaria de confirmar valores, disponibilidade e as condições de entrega para a minha cidade.',
  ].join('\n');
  return buildWhatsAppUrl(phoneNumber, text);
}
