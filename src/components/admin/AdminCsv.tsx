import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  exportProductsToCsv,
  exportOrdersToCsv,
  exportSettingsToCsv,
  exportNotificationsToCsv,
  parseProductsCsv,
  parseSettingsCsv,
  parseNotificationsCsv
} from '../../utils/csv';
import { Product, StoreSettings, SiteNotification } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Upload,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  RefreshCw,
  Globe,
  Calendar,
  Clock,
  Database,
  Layers,
  Sliders,
  Bell,
  ShoppingBag,
  ClipboardList,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';

export const AdminCsv: React.FC = () => {
  const {
    products,
    orders,
    settings,
    notifications,
    updateSettings,
    importProductsList,
    importSettingsFromCsv,
    importNotificationsFromCsv,
    getCompleteBackupData,
    restoreCompleteBackup,
    syncBackupToCloudApi
  } = useStore();

  const [activeTab, setActiveTab] = useState<'migration' | 'csv' | 'cloud' | 'drive'>('migration');

  // Migration & Full Backup state
  const [backupPassword, setBackupPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const [restorePassword, setRestorePassword] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  // Cloud API Sync state
  const [webhookUrl, setWebhookUrl] = useState(settings.backupWebhookUrl || '');
  const [webhookToken, setWebhookToken] = useState(settings.backupWebhookToken || '');
  const [syncPassword, setSyncPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  // CSV Import state
  const [csvImportType, setCsvImportType] = useState<'products' | 'settings' | 'notifications'>('products');
  const [csvInput, setCsvInput] = useState('');
  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);
  const [previewSettings, setPreviewSettings] = useState<Partial<StoreSettings> | null>(null);
  const [previewNotifications, setPreviewNotifications] = useState<SiteNotification[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [replaceMode, setReplaceMode] = useState(false);

  // Global Feedback banner
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotificationFeedback = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 6000);
  };

  // 1. Copy complete backup string (Quick migration between hostings)
  const handleCopyCompleteBackup = async () => {
    try {
      const { dataString, checksum, isEncrypted } = await getCompleteBackupData(backupPassword);
      await navigator.clipboard.writeText(dataString);
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 3000);
      showNotificationFeedback(
        `Backup completo copiado com sucesso! ${isEncrypted ? 'Protegido com criptografia AES-256.' : ''} Checksum: ${checksum.substring(0, 8)}...`,
        'success'
      );
    } catch (err: any) {
      showNotificationFeedback('Erro ao gerar dados de backup: ' + err.message, 'error');
    }
  };

  // 2. Download JSON backup package
  const handleDownloadBackupJson = async () => {
    try {
      const { dataString, checksum, isEncrypted } = await getCompleteBackupData(backupPassword);
      const blob = new Blob([dataString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      a.href = url;
      a.download = `backup_completo_aurea_${dateStr}${isEncrypted ? '_enc' : ''}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotificationFeedback(
        `Arquivo de backup baixado com sucesso! Guarde este arquivo em segurança no Google Drive ou seu computador.`,
        'success'
      );
    } catch (err: any) {
      showNotificationFeedback('Erro ao baixar backup: ' + err.message, 'error');
    }
  };

  // 3. Restore complete backup from pasted text
  const handleRestoreFromText = async () => {
    if (!restoreText.trim()) {
      showNotificationFeedback('Por favor, cole o código do backup ou selecione o arquivo .json.', 'error');
      return;
    }

    if (!confirm('Deseja realmente restaurar este backup? Os dados desta hospedagem serão sincronizados com as informações do backup.')) {
      return;
    }

    setIsRestoring(true);
    try {
      const res = await restoreCompleteBackup(restoreText, restorePassword);
      if (res.success) {
        showNotificationFeedback(
          `Restauração concluída! ${res.stats?.productsCount || 0} produtos, ${res.stats?.ordersCount || 0} pedidos, ${res.stats?.settingsCount || 0} configurações e ${res.stats?.notificationsCount || 0} comunicados foram importados.`,
          'success'
        );
        setRestoreText('');
        setRestorePassword('');
      } else {
        showNotificationFeedback(res.message, 'error');
      }
    } catch (err: any) {
      showNotificationFeedback('Erro ao restaurar: ' + err.message, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  // Handle uploading JSON file for restore
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRestoreText(content);
      }
    };
    reader.readAsText(file);
  };

  // 4. Cloud API Sync
  const handleSyncCloudApi = async () => {
    if (!webhookUrl.trim()) {
      showNotificationFeedback('Informe a URL do endpoint de API externa ou Webhook.', 'error');
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncBackupToCloudApi(webhookUrl, webhookToken, syncPassword);
      setSyncResult(res);
      if (res.success) {
        showNotificationFeedback(res.message, 'success');
      } else {
        showNotificationFeedback(res.message, 'error');
      }
    } catch (err: any) {
      const errorResult = { success: false, message: err.message };
      setSyncResult(errorResult);
      showNotificationFeedback(err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // 5. CSV Upload & Preview handler
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvInput(content);
        handleCsvPreview(content, csvImportType);
      }
    };
    reader.readAsText(file);
  };

  const handleCsvPreview = (text: string, type: 'products' | 'settings' | 'notifications') => {
    setImportErrors([]);
    if (!text.trim()) {
      setPreviewProducts([]);
      setPreviewSettings(null);
      setPreviewNotifications([]);
      return;
    }

    if (type === 'products') {
      const { products: parsed, errors } = parseProductsCsv(text);
      setPreviewProducts(parsed);
      setImportErrors(errors);
    } else if (type === 'settings') {
      const { settings: parsed, count } = parseSettingsCsv(text);
      if (count === 0) {
        setImportErrors(['Nenhum parâmetro de configuração válido identificado no CSV.']);
        setPreviewSettings(null);
      } else {
        setPreviewSettings(parsed);
      }
    } else if (type === 'notifications') {
      const { notifications: parsed, count } = parseNotificationsCsv(text);
      if (count === 0) {
        setImportErrors(['Nenhum comunicado identificado no CSV.']);
        setPreviewNotifications([]);
      } else {
        setPreviewNotifications(parsed);
      }
    }
  };

  const handleConfirmCsvImport = () => {
    if (csvImportType === 'products' && previewProducts.length > 0) {
      importProductsList(previewProducts, replaceMode);
      showNotificationFeedback(`Sucesso! ${previewProducts.length} produtos foram importados.`, 'success');
      setCsvInput('');
      setPreviewProducts([]);
    } else if (csvImportType === 'settings' && previewSettings) {
      importSettingsFromCsv(previewSettings);
      showNotificationFeedback(`Sucesso! ${Object.keys(previewSettings).length} configurações foram atualizadas.`, 'success');
      setCsvInput('');
      setPreviewSettings(null);
    } else if (csvImportType === 'notifications' && previewNotifications.length > 0) {
      importNotificationsFromCsv(previewNotifications, replaceMode);
      showNotificationFeedback(`Sucesso! ${previewNotifications.length} comunicados foram importados.`, 'success');
      setCsvInput('');
      setPreviewNotifications([]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : feedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-neutral-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('migration')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'migration'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Migração Completa (Copiar & Colar)</span>
        </button>

        <button
          onClick={() => setActiveTab('csv')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'csv'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exportação & Importação CSV</span>
        </button>

        <button
          onClick={() => setActiveTab('cloud')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'cloud'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Sincronização em Nuvem (API)</span>
        </button>

        <button
          onClick={() => setActiveTab('drive')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'drive'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Google Drive & Backup Periódico</span>
        </button>
      </div>

      {/* TAB 1: ⚡ MIGRAÇÃO COMPLETA (COPIAR & COLAR ENTRE HOSPEDAGENS) */}
      {activeTab === 'migration' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-neutral-900 text-white shadow-xl border border-neutral-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-full border border-rose-500/30">
                  Migração Instantânea 1-Clique
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5">
                  Backup Completo de Configurações, Catálogo & Histórico
                </h3>
                <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
                  Permite exportar todas as variáveis da loja (aba <strong>Configurações</strong>, comunicados da aba <strong>Mensagens</strong>, produtos com estoque e pedidos) para copiar e colar com facilidade em qualquer outra hospedagem, servidor ou ambiente.
                </p>
              </div>

              {/* Stats badges */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 bg-neutral-800 rounded-xl border border-neutral-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-rose-400" />
                  <strong>Configurações:</strong> 100%
                </span>
                <span className="px-3 py-1.5 bg-neutral-800 rounded-xl border border-neutral-700 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <strong>{products.length}</strong> produtos
                </span>
                <span className="px-3 py-1.5 bg-neutral-800 rounded-xl border border-neutral-700 flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
                  <strong>{orders.length}</strong> pedidos
                </span>
                <span className="px-3 py-1.5 bg-neutral-800 rounded-xl border border-neutral-700 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-400" />
                  <strong>{notifications.length}</strong> avisos
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Exportar / Copiar Tudo */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                    <Copy className="w-4 h-4 text-rose-300" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-neutral-900 text-sm">
                      1. Exportar / Copiar Dados Completos
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Gera o pacote com todas as variáveis para transferir de servidor.
                    </p>
                  </div>
                </div>

                {/* Password encryption protection option */}
                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Proteger com Criptografia AES-256 (Opcional):
                    </span>
                    <span className="text-[10px] text-neutral-400">Web Crypto API</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Defina uma senha se desejar criptografar os dados..."
                      value={backupPassword}
                      onChange={(e) => setBackupPassword(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-rose-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                      title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Se preenchido, os dados e credenciais ficam blindados e só poderão ser lidos ou restaurados com esta senha.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-600">
                  <p className="font-semibold text-neutral-800">O pacote de backup contém:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-neutral-600">
                    <li>Todas as configurações da loja (nome, WhatsApp, Instagram, bio, Pix, frete grátis, etc.)</li>
                    <li>Catálogo completo com grade de tamanhos, preços de custo e fotos</li>
                    <li>Histórico de pedidos com clientes, lucro líquido e mensagens do WhatsApp</li>
                    <li>Histórico de comunicados e notificações ativas</li>
                    <li>Código de integridade SHA-256 para prevenir corrupção de dados</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCopyCompleteBackup}
                  className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
                >
                  {copiedBackup ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Backup Copiado para a Área de Transferência!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-rose-300" />
                      <span>Copiar Backup Completo (Clipboard)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadBackupJson}
                  className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-neutral-600" />
                  <span>Baixar Arquivo de Backup (.json)</span>
                </button>
              </div>
            </div>

            {/* Box 2: Restaurar / Colar Dados em Nova Hospedagem */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-neutral-900 text-sm">
                      2. Restaurar / Colar em Outra Hospedagem
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Cole o backup ou envie o arquivo .json para sincronizar este site.
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-neutral-800 block">
                      Cole o texto do Backup ou envie o arquivo:
                    </label>
                    <label className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer">
                      Enviar arquivo .json
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleJsonFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Cole aqui o texto copiado de outra hospedagem (JSON)..."
                    value={restoreText}
                    onChange={(e) => setRestoreText(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-2xl border border-neutral-300 focus:ring-2 focus:ring-rose-500/20 bg-neutral-50/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Senha de Descriptografia (apenas se foi protegido):
                  </label>
                  <input
                    type="password"
                    placeholder="Informe a senha caso o backup esteja criptografado..."
                    value={restorePassword}
                    onChange={(e) => setRestorePassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50/50"
                  />
                </div>
              </div>

              <button
                onClick={handleRestoreFromText}
                disabled={isRestoring || !restoreText.trim()}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Restaurando todos os dados...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Restaurar Todos os Dados na Hospedagem</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 📊 EXPORTAÇÃO & IMPORTAÇÃO CSV */}
      {activeTab === 'csv' && (
        <div className="space-y-6">
          {/* CSV Exports Grid */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                <Download className="w-4 h-4 text-rose-300" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-neutral-900 text-sm">
                  Exportação de Arquivos CSV Separados
                </h4>
                <p className="text-xs text-neutral-500">
                  Planilhas formatadas em UTF-8 compatíveis com Excel, Numbers e Google Sheets.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Configurações */}
              <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200/80 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <h5 className="font-bold text-neutral-900 text-xs">Configurações da Loja</h5>
                  <p className="text-[11px] text-neutral-500">
                    Todas as variáveis da aba Configurações (WhatsApp, Instagram, Pix, Frete, PIN).
                  </p>
                </div>
                <button
                  onClick={() => exportSettingsToCsv(settings)}
                  className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar CSV</span>
                </button>
              </div>

              {/* 2. Produtos */}
              <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200/80 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <h5 className="font-bold text-neutral-900 text-xs">Catálogo ({products.length} itens)</h5>
                  <p className="text-[11px] text-neutral-500">
                    Preços de venda e fabricação, grade de estoque por tamanho, cores e fotos.
                  </p>
                </div>
                <button
                  onClick={() => exportProductsToCsv(products)}
                  className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar CSV</span>
                </button>
              </div>

              {/* 3. Pedidos */}
              <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200/80 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <ClipboardList className="w-3.5 h-3.5" />
                  </div>
                  <h5 className="font-bold text-neutral-900 text-xs">Pedidos ({orders.length} vendas)</h5>
                  <p className="text-[11px] text-neutral-500">
                    Histórico de vendas com clientes, margem de lucro líquido e itens do pedido.
                  </p>
                </div>
                <button
                  onClick={() => exportOrdersToCsv(orders)}
                  className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar CSV</span>
                </button>
              </div>

              {/* 4. Notificações */}
              <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200/80 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <h5 className="font-bold text-neutral-900 text-xs">Comunicados ({notifications.length})</h5>
                  <p className="text-[11px] text-neutral-500">
                    Histórico de notificações e mensagens ativas e arquivadas.
                  </p>
                </div>
                <button
                  onClick={() => exportNotificationsToCsv(notifications)}
                  className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* CSV Import Section */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-neutral-900 text-sm">
                    Importação de Planilhas CSV
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Selecione o tipo de dado que deseja importar via CSV.
                  </p>
                </div>
              </div>

              {/* Import Type Selector */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => {
                    setCsvImportType('products');
                    handleCsvPreview(csvInput, 'products');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    csvImportType === 'products' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  Produtos
                </button>
                <button
                  onClick={() => {
                    setCsvImportType('settings');
                    handleCsvPreview(csvInput, 'settings');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    csvImportType === 'settings' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  Configurações
                </button>
                <button
                  onClick={() => {
                    setCsvImportType('notifications');
                    handleCsvPreview(csvInput, 'notifications');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    csvImportType === 'notifications' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  Comunicados
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Arquivo .CSV do seu Computador / Google Drive:
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvFileUpload}
                  className="w-full text-xs text-neutral-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-800 hover:file:bg-neutral-200 border border-neutral-300 rounded-2xl p-2 bg-neutral-50/50"
                />
              </div>

              {csvImportType === 'products' && (
                <div className="flex items-center justify-start sm:justify-end gap-3 pt-4 sm:pt-0">
                  <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={replaceMode}
                      onChange={(e) => setReplaceMode(e.target.checked)}
                      className="rounded-sm text-rose-600 focus:ring-rose-500"
                    />
                    <span>Substituir todo o catálogo existente</span>
                  </label>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Ou cole o texto da sua planilha CSV aqui:
              </label>
              <textarea
                rows={4}
                placeholder={
                  csvImportType === 'products'
                    ? `Nome;Categoria;Preço Venda;Preço Fabricação;Tamanhos;Cores\nVestido Seda;Vestidos;269.00;95.00;P:5|M:8|G:4;Esmeralda|Champagne`
                    : csvImportType === 'settings'
                    ? `Campo;Chave;Valor\nNome da Loja;storeName;Minha Boutique\nWhatsApp;whatsappNumber;5511998765432`
                    : `ID;Data;Tipo;Título;Mensagem\nnotif-1;2026-09-25;promo;Nova Coleção;Peças exclusivas disponíveis`
                }
                value={csvInput}
                onChange={(e) => {
                  setCsvInput(e.target.value);
                  handleCsvPreview(e.target.value, csvImportType);
                }}
                className="w-full px-3 py-2 text-xs font-mono rounded-2xl border border-neutral-300 focus:ring-2 focus:ring-rose-500/20 bg-neutral-50/50"
              />
            </div>

            {importErrors.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Avisos na validação do CSV:
                </span>
                {importErrors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            )}

            {/* Preview before committing */}
            {(previewProducts.length > 0 || previewSettings || previewNotifications.length > 0) && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-neutral-900 text-xs">
                    Pré-visualização da Importação
                  </h5>
                  <button
                    onClick={handleConfirmCsvImport}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Confirmar e Importar no Sistema
                  </button>
                </div>

                {previewProducts.length > 0 && (
                  <div className="border border-neutral-200 rounded-2xl overflow-hidden max-h-52 overflow-y-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                        <tr>
                          <th className="py-2 px-3">Nome</th>
                          <th className="py-2 px-3">Categoria</th>
                          <th className="py-2 px-3">Preço Venda</th>
                          <th className="py-2 px-3">Preço Custo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {previewProducts.slice(0, 10).map((p, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-semibold text-neutral-900">{p.name}</td>
                            <td className="py-2 px-3 text-neutral-600">{p.category}</td>
                            <td className="py-2 px-3 font-bold text-neutral-900">R$ {p.salePrice.toFixed(2)}</td>
                            <td className="py-2 px-3 text-neutral-500">R$ {p.costPrice.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {previewSettings && (
                  <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1">
                    <span className="font-bold text-neutral-800 block">
                      {Object.keys(previewSettings).length} parâmetros de configuração prontos para atualização:
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-neutral-600 max-h-40 overflow-y-auto">
                      {Object.entries(previewSettings).map(([k, v]) => (
                        <div key={k}>
                          <strong>{k}:</strong> {String(v)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ☁️ SINCRONIZAÇÃO EM NUVEM (API DE TERCEIROS) */}
      {activeTab === 'cloud' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-neutral-900 text-base">
                  Sincronização Segura via API / Webhook em Nuvem
                </h4>
                <p className="text-xs text-neutral-500">
                  Transmita automaticamente backups completos e criptografados para seu servidor, banco de dados ou serviço de terceiros.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  URL do Endpoint / Webhook (POST) *
                </label>
                <input
                  type="url"
                  placeholder="https://sua-api.com/api/backup ou webhook n8n / Make / Cloudflare"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Bearer Token / Chave Secreta de API (Opcional):
                </label>
                <input
                  type="password"
                  placeholder="Ex: sk_live_... ou bearer token"
                  value={webhookToken}
                  onChange={(e) => setWebhookToken(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-neutral-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Segurança & Criptografia na Transmissão:</span>
              </div>
              <p className="text-neutral-600 leading-relaxed text-[11px]">
                O payload é enviado via requisição HTTPS POST com cabeçalhos <code>X-Backup-Checksum</code> e <code>X-Backup-Version</code>. Opcionalmente, defina uma senha abaixo para criptografar todo o conteúdo com <strong>AES-256-GCM</strong> antes do envio.
              </p>
              <div className="pt-1">
                <input
                  type="password"
                  placeholder="Senha para criptografar payload antes de enviar (opcional)..."
                  value={syncPassword}
                  onChange={(e) => setSyncPassword(e.target.value)}
                  className="w-full max-w-md px-3 py-1.5 text-xs rounded-xl border border-neutral-300 bg-white"
                />
              </div>
            </div>

            {/* Sync status card */}
            {settings.lastCloudSyncDate && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                <span>
                  Última sincronização bem-sucedida em: <strong>{new Date(settings.lastCloudSyncDate).toLocaleString('pt-BR')}</strong>
                </span>
                <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded-md font-bold">Ativo</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleSyncCloudApi}
                disabled={isSyncing || !webhookUrl.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Conectando e Transmitindo...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Sincronizar Backup Agora via API</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  updateSettings({
                    backupWebhookUrl: webhookUrl,
                    backupWebhookToken: webhookToken
                  });
                  showNotificationFeedback('Configurações de Webhook salvas com sucesso!', 'success');
                }}
                className="w-full sm:w-auto px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Salvar Configurações de API
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 📁 GOOGLE DRIVE & BACKUP PERIÓDICO */}
      {activeTab === 'drive' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-neutral-900 text-base">
                    Google Drive & Backup Periódico
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Mantenha cópias de segurança salvas periodicamente no seu Google Drive com facilidade.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Google Drive Pronto
                </span>
              </div>
            </div>

            {/* Periodic Schedule Recommendation */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-600" />
                  Frequência Recomendada de Backup Periódico:
                </span>
                <select
                  value={settings.backupAutoFrequency || 'daily'}
                  onChange={(e) => updateSettings({ backupAutoFrequency: e.target.value as 'manual' | 'daily' | 'weekly' })}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-neutral-300 bg-white"
                >
                  <option value="daily">Diário (Recomendado)</option>
                  <option value="weekly">Semanal (A cada 7 dias)</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div className="text-xs text-neutral-600 space-y-1">
                {settings.lastBackupDate ? (
                  <p className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Último backup exportado em: {new Date(settings.lastBackupDate).toLocaleString('pt-BR')} ({settings.lastBackupType || 'JSON'})
                  </p>
                ) : (
                  <p className="text-amber-700 font-medium">
                    ⚠️ Ainda não foi registrado nenhum backup recente neste navegador. Recomendamos baixar agora uma cópia para o Google Drive.
                  </p>
                )}
              </div>
            </div>

            {/* How to use Google Drive Step by Step */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h5 className="font-bold text-emerald-950">Baixe o Arquivo de Backup</h5>
                <p className="text-emerald-800/90 leading-relaxed text-[11px]">
                  Clique no botão abaixo para gerar o arquivo consolidado de backup do catálogo, pedidos e configurações.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h5 className="font-bold text-emerald-950">Acesse o Google Drive</h5>
                <p className="text-emerald-800/90 leading-relaxed text-[11px]">
                  Abra sua pasta oficial de backups no Google Drive clicando no botão de acesso rápido.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h5 className="font-bold text-emerald-950">Segurança Garantida</h5>
                <p className="text-emerald-800/90 leading-relaxed text-[11px]">
                  Em caso de troca de hospedagem, basta baixar o arquivo do Drive e colar na aba de Migração para restaurar tudo!
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleDownloadBackupJson}
                className="w-full sm:w-auto px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-rose-300" />
                <span>Baixar Backup Completo para o Drive</span>
              </button>

              <button
                onClick={() => window.open('https://drive.google.com/drive/my-drive', '_blank')}
                className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Google Drive (Minha Pasta)</span>
              </button>

              <button
                onClick={() => window.open('https://sheets.new', '_blank')}
                className="w-full sm:w-auto px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Abrir Nova Planilha no Google Sheets</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
