import React from 'react';
import { Truck, Sparkles, Flame, MessageCircle, Star, ShoppingBag, ShieldCheck } from 'lucide-react';
import { createGeneralWhatsAppLink, formatPhoneDisplay } from '../utils/whatsapp';

interface PromoMarqueeProps {
  whatsappNumber: string;
}

export const PromoMarquee: React.FC<PromoMarqueeProps> = ({ whatsappNumber }) => {
  const whatsappUrl = createGeneralWhatsAppLink(whatsappNumber);

  const marqueeItems = [
    {
      icon: Sparkles,
      highlight: 'MODELOS & CORES',
      text: 'Veja as cores e numerações de cada modelo',
      href: '#vitrine',
      badgeColor: 'bg-[#D8B98A]/15 text-[#7A5530] border-[#D8B98A]/30',
    },
    {
      icon: MessageCircle,
      highlight: 'PEDIDO DIRETO',
      text: `Atendimento via WhatsApp: ${formatPhoneDisplay(whatsappNumber)}`,
      href: whatsappUrl,
      isExternal: true,
      badgeColor: 'bg-[#25D366]/10 text-emerald-800 border-[#25D366]/20',
    },
    {
      icon: Star,
      highlight: 'ELETRÔNICOS',
      text: 'Smart TVs e novidades de tecnologia',
      href: '/eletronicos',
      badgeColor: 'bg-stone-200 text-stone-800 border-stone-300',
    },
  ];

  // Duplicate items for a seamless continuous scrolling loop
  const displayItems = [...marqueeItems, ...marqueeItems];

  return (
    <div
      id="promo-marquee"
      className="relative w-full overflow-hidden bg-gradient-to-r from-[#F7F3ED] via-white/80 to-[#F7F3ED] border-b border-[#D8B98A]/25 py-2.5 shadow-2xs backdrop-blur-sm z-30 select-none group"
      aria-label="Avisos da loja"
    >
      {/* Left and right gradient fade masks for smooth transition */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#F7F3ED] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#F7F3ED] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="animate-marquee flex items-center whitespace-nowrap">
        {displayItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={`marquee-item-${index}`}
              aria-hidden={index >= marqueeItems.length ? true : undefined}
              tabIndex={index >= marqueeItems.length ? -1 : undefined}
              href={item.href}
              target={item.isExternal ? '_blank' : undefined}
              rel={item.isExternal ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-2.5 mx-5 px-3 py-1 rounded-full hover:bg-white/90 hover:shadow-xs transition duration-200 group/item text-xs font-sans text-stone-700"
            >
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border ${item.badgeColor}`}>
                <Icon className="w-3 h-3 shrink-0" />
                {item.highlight}
              </span>
              <span className="font-medium group-hover/item:text-[#242322] transition-colors">
                {item.text}
              </span>
              <span className="text-stone-300 text-xs ml-2 font-serif">•</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};
