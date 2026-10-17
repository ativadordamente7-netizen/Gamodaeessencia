import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { createGeneralWhatsAppLink, formatPhoneDisplay } from '../utils/whatsapp';

interface WhatsAppFloatProps {
  whatsappNumber: string;
}

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({ whatsappNumber }) => {
  const [showTooltip, setShowTooltip] = useState(true);
  const whatsappUrl = createGeneralWhatsAppLink(whatsappNumber);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto">
      
      {/* Tooltip Popup Bubble */}
      {showTooltip && (
        <div className="hidden sm:flex frosted-glass text-[#242322] p-4 rounded-2xl border border-white/80 shadow-lg max-w-xs text-xs relative motion-safe:animate-bounce-subtle items-start gap-2.5">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-1.5 right-1.5 text-stone-500 hover:text-black p-1"
            title="Fechar aviso"
            aria-label="Fechar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <img src="/dono-avatar.jpg" alt="Proprietário da GA Moda & Essência" width={40} height={40} className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-[#25D366]" />
          <div>
            <p className="font-bold text-[#242322]">Fale com a gente</p>
            <p className="text-stone-600 text-[11px] mt-0.5 leading-snug">
              Dúvida de numeração ou quer ver mais fotos de um modelo? Chama no WhatsApp.
            </p>
          </div>
        </div>
      )}

      {/* Floating Button with Pulse Effect */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-full shadow-2xl shadow-emerald-950/80 transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-emerald-300/40"
        title={`Atendimento via WhatsApp (${formatPhoneDisplay(whatsappNumber)})`}
        aria-label="Falar com a GA no WhatsApp (abre em nova aba)"
      >
        {/* Pulse ring animation */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping pointer-events-none" />
        
        <MessageCircle className="w-7 h-7 fill-white text-emerald-500 group-hover:rotate-12 transition-transform relative z-10" />
      </a>

    </div>
  );
};
