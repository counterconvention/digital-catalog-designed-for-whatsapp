import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';
import { AdminUserHandleSync } from './AdminUserHandleSync';
import {
  Settings,
  Save,
  CheckCircle2,
  Phone,
  Instagram,
  MapPin,
  Clock,
  Mail,
  Bell,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Keep form data in sync when settings are updated via @ handle sync or thresholds
  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1-Click @ Handle Integration */}
      <AdminUserHandleSync />

      {savedFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Configurações salvas com sucesso! Todas as páginas, botões do WhatsApp, Instagram e links foram sincronizados em tempo real.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Identidade da Loja */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <Sparkles className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-sans font-bold text-neutral-900 text-base">
                Identidade & Marca da Loja
              </h3>
              <p className="text-xs text-neutral-500">
                Nome da loja e slogan exibidos no cabeçalho e rodapé.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Nome da Loja *
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500/20 bg-neutral-50/50 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Slogan / Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>
          </div>
        </div>

        {/* 2. Integração WhatsApp wa.me & Instagram */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <Phone className="w-5 h-5 text-emerald-600" />
            <h3 className="font-sans font-bold text-neutral-900 text-base">
              Canais de Vendas (WhatsApp & Instagram)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* WhatsApp Number (Internacional) */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Número do WhatsApp (com DDI e DDD, ex: 5511999998888) *
              </label>
              <input
                type="text"
                required
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="5511999998888"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-500/20 bg-neutral-50/50 font-mono text-xs"
              />
              <span className="text-[11px] text-neutral-400 mt-0.5 block">
                Usado para montar o link direto wa.me/55...
              </span>
            </div>

            {/* WhatsApp Display */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                WhatsApp Formatado (exibição visual)
              </label>
              <input
                type="text"
                value={formData.whatsappDisplay}
                onChange={(e) => setFormData({ ...formData, whatsappDisplay: e.target.value })}
                placeholder="(11) 99999-8888"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
              <span className="text-[11px] text-neutral-400 mt-0.5 block">
                Exibido no rodapé e atendimento
              </span>
            </div>

            {/* Instagram Profile URL */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Link do Perfil do Instagram *
              </label>
              <input
                type="url"
                required
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/seuperfil"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs font-mono"
              />
            </div>

            {/* Instagram Handle */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Nome de Usuário (@handle do Instagram)
              </label>
              <input
                type="text"
                value={formData.instagramUser}
                onChange={(e) => setFormData({ ...formData, instagramUser: e.target.value })}
                placeholder="auroraboutique.oficial"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>

            {/* Instagram Followers */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Seguidores no Perfil (Exibição)
              </label>
              <input
                type="text"
                value={formData.instagramFollowers}
                onChange={(e) => setFormData({ ...formData, instagramFollowers: e.target.value })}
                placeholder="38.4k"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>

            {/* Instagram Posts Count */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Publicações do Instagram (Exibição)
              </label>
              <input
                type="number"
                value={formData.instagramPostsCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instagramPostsCount: parseInt(e.target.value, 10) || 0
                  })
                }
                placeholder="524"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>
          </div>
        </div>

        {/* 3. Contatos Diretos & Loja Física (com Google Maps) */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <MapPin className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-sans font-bold text-neutral-900 text-base">
                Contatos & Loja Física (Google Maps)
              </h3>
              <p className="text-xs text-neutral-500">
                Informações de atendimento no rodapé e endereço físico com botão para o Google Maps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* E-mail */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                E-mail de Atendimento
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>

            {/* Telefone Fixo */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Telefone Fixo
              </label>
              <input
                type="text"
                value={formData.landline}
                onChange={(e) => setFormData({ ...formData, landline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>

            {/* Endereço */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Endereço da Loja Física
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>

            {/* Cidade e Estado */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Bairro, Cidade e Estado
              </label>
              <input
                type="text"
                value={formData.cityState}
                onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>

            {/* Link do Google Maps */}
            <div className="sm:col-span-2">
              <label className="font-semibold text-neutral-700 block mb-1">
                URL do Google Maps (Redirecionamento ao clicar no botão do rodapé) *
              </label>
              <input
                type="url"
                required
                value={formData.googleMapsUrl}
                onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 font-mono text-xs"
              />
            </div>

            {/* Horário de Funcionamento */}
            <div className="sm:col-span-2">
              <label className="font-semibold text-neutral-700 block mb-1">
                Horário de Funcionamento
              </label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
              />
            </div>
          </div>
        </div>

        {/* 4. Barra de Avisos do Topo & Limiares */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100">
            <Bell className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-sans font-bold text-neutral-900 text-base">
                Barra de Avisos do Topo & Regras de Negócio
              </h3>
              <p className="text-xs text-neutral-500">
                Banner promocional dinâmico e limites para alertas de estoque.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="check-announcement"
                checked={formData.bannerEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, bannerEnabled: e.target.checked })
                }
                className="rounded-sm text-rose-600 focus:ring-rose-500"
              />
              <label htmlFor="check-announcement" className="font-bold text-neutral-800 cursor-pointer">
                Exibir Barra de Avisos no topo do site
              </label>
            </div>

            {formData.bannerEnabled && (
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Texto da Barra de Avisos
                </label>
                <input
                  type="text"
                  value={formData.bannerText}
                  onChange={(e) => setFormData({ ...formData, bannerText: e.target.value })}
                  placeholder="Ex: ✨ NOVA COLEÇÃO FLORENÇA NO AR | FRETE GRÁTIS ACIMA DE R$ 299"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Alerta de Estoque Baixo (unidades)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lowStockThreshold: parseInt(e.target.value, 10) || 3
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Chave Pix da Loja
                </label>
                <input
                  type="text"
                  value={formData.pixKey}
                  onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Frete Grátis acima de (R$)
                </label>
                <input
                  type="number"
                  value={formData.freeShippingMinimum}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      freeShippingMinimum: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50/50 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            id="btn-save-settings"
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-bold text-xs shadow-md flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Save className="w-4 h-4 text-rose-300" />
            <span>Salvar Todas as Configurações da Loja</span>
          </button>
        </div>
      </form>
    </div>
  );
};
