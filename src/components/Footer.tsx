import React from 'react';
import { Instagram, MessageCircle, Heart, ArrowUp, Sparkles, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { createGeneralWhatsAppLink, formatPhoneDisplay } from '../utils/whatsapp';

import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from '../utils/instagram';

interface FooterProps {
  whatsappNumber: string;
}

export const Footer: React.FC<FooterProps> = ({ whatsappNumber }) => {
  const whatsappUrl = createGeneralWhatsAppLink(whatsappNumber);
  const instagramUrl = INSTAGRAM_URL;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#2D2D2D] text-[#FAF7F2] border-t border-white/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-stone-700/80">
          
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-4">
            <span className="block w-28 h-28 rounded-full overflow-hidden bg-black ring-1 ring-[#D4A373]/60">
              <img src="/logo-ga.webp" alt="Logo GA Moda & Essência — Serra Gaúcha" width={224} height={224} loading="lazy" className="w-full h-full object-cover scale-[1.12]" />
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-3xl font-extrabold tracking-wider text-[#D4A373]">
                GA
              </span>
              <span className="text-xs uppercase tracking-[0.25em] font-light text-stone-300 border-l border-stone-600 pl-2">
                Moda & Essência
              </span>
            </div>
            
            <p className="text-stone-300 text-xs sm:text-sm font-sans leading-relaxed max-w-sm">
              Tênis, moda e perfumaria com curadoria na Serra Gaúcha. Novidades toda semana e atendimento direto pelo WhatsApp.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-stone-800 hover:bg-pink-600 text-stone-200 hover:text-white rounded-full transition border border-stone-700"
                title="Siga no Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-stone-800 hover:bg-[#25D366] text-stone-200 hover:text-white rounded-full transition border border-stone-700"
                title="Atendimento no WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#D4A373] uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs font-medium text-stone-300">
              <li>
                <a href="#vitrine" className="hover:text-[#D4A373] transition">Vitrine de Produtos</a>
              </li>
              
              
              
              <li>
                <a href="#sobre" className="hover:text-[#D4A373] transition">Sobre a GA Moda & Essência</a>
              </li>
            </ul>
          </div>

          {/* Contact Box */}
          <div className="lg:col-span-4 space-y-3 bg-stone-800/80 p-5 sm:p-6 rounded-2xl border border-stone-700 shadow-sm">
            <h4 className="font-serif text-sm font-bold text-[#D4A373] uppercase tracking-wider flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              Atendimento Direto
            </h4>
            <p className="text-xs text-stone-300">
              Dúvidas sobre entregas, tamanhos ou pedidos personalizados? Fale com a gente:
            </p>
            <div className="text-xs space-y-1 font-mono text-stone-200">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp: {formatPhoneDisplay(whatsappNumber)}</span>
              </p>
              <p className="flex items-center gap-2">
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>Instagram: {INSTAGRAM_HANDLE}</span>
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#0F7A40] hover:bg-[#0B6334] text-white font-bold text-xs py-3 px-4 rounded-full transition flex items-center justify-center gap-2 shadow-xs mt-2"
            >
              <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
              <span>Chamar no WhatsApp</span>
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} GA Moda & Essência. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[11px] text-stone-300">
              <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" /> Compra Segura
            </span>
            <button
              onClick={scrollToTop}
              className="p-2 bg-stone-800 hover:bg-[#D4A373] hover:text-[#2D2D2D] text-stone-300 rounded-full transition border border-stone-700"
              title="Voltar ao topo"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
