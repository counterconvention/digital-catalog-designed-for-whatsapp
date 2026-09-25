import React from 'react';
import { useStore } from '../context/StoreContext';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

export const FloatingWhatsApp: React.FC = () => {
  const { settings, currentView } = useStore();

  // Only show floating button on catalog view so admin dashboard stays clear
  if (currentView === 'admin') return null;

  const cleanNumber = settings.whatsappNumber.replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    `Olá! Estou visitando a loja ${settings.storeName} e gostaria de atendimento sobre as peças do catálogo.`
  )}`;

  return (
    <aside
      aria-label="Atendimento via WhatsApp"
      className="fixed bottom-6 right-5 sm:right-6 z-30 flex items-center group select-none"
    >
      {/* Tooltip / Label on hover or mobile */}
      <span className="mr-3 px-3 py-1.5 rounded-xl bg-neutral-900/90 backdrop-blur-xs text-white text-xs font-semibold shadow-lg border border-neutral-800 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none hidden sm:inline-block whitespace-nowrap translate-x-2 group-hover:translate-x-0">
        Falar no WhatsApp
      </span>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="btn-floating-whatsapp"
        aria-label="Iniciar conversa no WhatsApp oficial da loja"
        title="Atendimento VIP no WhatsApp"
        className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg shadow-emerald-900/25 transition-all duration-300 hover:scale-108 active:scale-95 cursor-pointer ring-4 ring-white/30"
      >
        {/* Subtle Online Pulse Ring */}
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-emerald-800 rounded-full" />
        </span>

        {/* Crisp WhatsApp Icon */}
        <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white drop-shadow-xs" />
      </a>
    </aside>
  );
};
