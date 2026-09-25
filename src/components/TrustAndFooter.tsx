import React from 'react';
import { useStore } from '../context/StoreContext';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import {
  Truck,
  HeartHandshake,
  ShieldCheck,
  MapPin,
  Clock,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';

export const TrustAndFooter: React.FC = () => {
  const { settings, requestAdminAccess } = useStore();

  const cleanNumber = settings.whatsappNumber.replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    `Olá! Gostaria de falar com o atendimento da ${settings.storeName}.`
  )}`;

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800">
      {/* 1. Mini Landing Page: 3 Generic Trust Badges / Selos de Confiança */}
      <div className="border-b border-neutral-800/80 bg-neutral-950/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Selo 1: Entrega para Todo o Brasil */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/80 text-rose-300 border border-rose-800/40 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-white text-base">
                  Entrega para Todo o Brasil
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Envio seguro com código de rastreamento em tempo real e seguro total de mercadoria via Correios e transportadoras.
                </p>
              </div>
            </div>

            {/* Selo 2: Atendimento Humanizado */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-white text-base">
                  Atendimento Humanizado
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Consultoria de moda real e atenciosa no WhatsApp. Ajudamos a escolher o caimento e o tamanho perfeito para você.
                </p>
              </div>
            </div>

            {/* Selo 3: Troca Fácil e Compra Segura */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 text-amber-300 border border-amber-800/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-white text-base">
                  Compra Segura
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Garantia incondicional de 7 dias para troca após o recebimento. Sua satisfação com cada peça é nossa prioridade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Customer Service Columns & Physical Store Address */}
      <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Coluna 1: Loja e Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-950 text-rose-300 border border-rose-800/50 flex items-center justify-center">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="font-sans font-extrabold text-white text-lg tracking-tight">
                {settings.storeName}
              </h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {settings.tagline}
            </p>
          </div>

          {/* Coluna 2: Dados de Atendimento Digital (WhatsApp & Instagram) */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider text-neutral-200">
              Canais Digitais
            </h4>
            <div className="space-y-3 text-xs">
              {/* WhatsApp */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-neutral-300 hover:text-emerald-400 transition-colors p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/50"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-900/60 text-[#25D366] flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                </div>
                <div>
                  <span className="block font-semibold text-white">WhatsApp</span>
                  <span className="text-neutral-400">{settings.whatsappDisplay}</span>
                </div>
              </a>

              {/* Instagram */}
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-neutral-300 hover:text-pink-400 transition-colors p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/50"
              >
                <div className="w-7 h-7 rounded-lg bg-pink-900/60 text-pink-400 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div>
                  <span className="block font-semibold text-white">Instagram</span>
                  <span className="text-neutral-400">@{settings.instagramUser}</span>
                </div>
              </a>
            </div>
          </div>

          {/* Coluna 3: E-mail & Número Fixo */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider text-neutral-200">
              Contatos Diretos
            </h4>
            <div className="space-y-3 text-xs">
              {/* E-mail */}
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2.5 text-neutral-300 hover:text-white transition-colors p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/50"
              >
                <div className="w-7 h-7 rounded-lg bg-neutral-700/60 text-neutral-300 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold text-white">E-mail</span>
                  <span className="text-neutral-400">{settings.email}</span>
                </div>
              </a>

              {/* Telefone Fixo */}
              <a
                href={`tel:${settings.landline.replace(/\D/g, '')}`}
                className="flex items-center gap-2.5 text-neutral-300 hover:text-white transition-colors p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/50"
              >
                <div className="w-7 h-7 rounded-lg bg-neutral-700/60 text-neutral-300 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold text-white">Número Fixo</span>
                  <span className="text-neutral-400">{settings.landline}</span>
                </div>
              </a>
            </div>
          </div>

          {/* Coluna 4: Endereço da Loja Física com Botão Google Maps */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider text-neutral-200 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              Nossa Loja Física
            </h4>

            <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 space-y-3 text-xs">
              <p className="text-neutral-300 font-medium leading-snug">
                {settings.address}
              </p>
              <p className="text-neutral-400 text-[11px]">
                {settings.cityState}
              </p>

              <div className="flex items-start gap-1.5 text-neutral-400 text-[11px] pt-1 border-t border-neutral-700/50">
                <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neutral-500" />
                <span>{settings.openingHours}</span>
              </div>

              {/* Botão destacado redirecionando para o Google Maps */}
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-google-maps-footer"
                className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Abrir no Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar with Equal Top and Bottom Padding */}
      <div className="border-t border-neutral-800 bg-neutral-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center sm:text-left text-xs text-neutral-500">
          <button
            type="button"
            onClick={requestAdminAccess}
            className="text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer focus:outline-none"
            title="Acesso Seguro / Painel Administrativo"
          >
            © 2026 Counter. Todos os direitos reservados.
          </button>
        </div>
      </div>
    </footer>
  );
};
