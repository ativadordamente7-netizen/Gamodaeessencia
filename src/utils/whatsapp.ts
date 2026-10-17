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

export function createProductWhatsAppLink(
  phoneNumber: string,
  product: Product,
  selectedSize?: string,
  selectedColor?: string
): string {
  const sizeText = selectedSize ? selectedSize : (product.sizes[0] || 'Tamanho Único');
  const colorText = selectedColor ? selectedColor : (product.colors[0]?.name || 'Padrão');

  const text = `Olá! Vi no site da GA Moda & Essência e tenho interesse na peça:

🛍️ *${product.name}*
📏 Numeração/tamanho: ${sizeText}${product.colors.length ? `\n🎨 Cor: ${colorText}` : ''}

Poderia me informar o valor, a disponibilidade e as opções de envio? ✨`;

  return buildWhatsAppUrl(phoneNumber, text);
}

export function createCartWhatsAppLink(
  phoneNumber: string,
  cartItems: CartItem[]
): string {
  const itemsFormatted = cartItems.map((item, index) => {
    return `${index + 1}. *${item.product.name}*
   - Numeração/tamanho: ${item.selectedSize}${item.product.colors.length ? ` | Cor: ${item.selectedColor}` : ''}
   - Quantidade: ${item.quantity}`;
  }).join('\n\n');

  const text = `Olá! Selecionei as seguintes peças na GA Moda & Essência e gostaria de consultar valores e finalizar meu pedido:

${itemsFormatted}

Poderiam me passar o orçamento total com frete e as formas de pagamento disponíveis? 🛍️✨`;

  return buildWhatsAppUrl(phoneNumber, text);
}

