import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Bell,
  Send,
  Trash2,
  AlertCircle,
  ShoppingBag,
  Info,
  CheckCircle2,
  Smartphone,
  Sparkles,
  Volume2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export const AdminNotifications: React.FC = () => {
  const {
    notifications,
    addNotification,
    deleteNotification,
    notificationPermission,
    requestBrowserPushPermission,
    triggerTestOrderNotification,
    testNotificationCountdown
  } = useStore();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'promo' | 'order' | 'alert' | 'info'>('promo');
  const [feedback, setFeedback] = useState('');

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    addNotification({
      title,
      message,
      type
    });

    setTitle('');
    setMessage('');
    setFeedback('Notificação publicada com sucesso para os visitantes do catálogo!');
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleRequestPush = async () => {
    const granted = await requestBrowserPushPermission();
    if (granted) {
      setFeedback('Permissão para notificações Push do navegador autorizada com sucesso!');
    } else {
      setFeedback('Notificações bloqueadas nas preferências do navegador. Clique no ícone de ajustes/cadeado na barra de endereços para liberar.');
    }
    setTimeout(() => setFeedback(''), 5000);
  };

  const handleTestCountdown = (seconds: number) => {
    triggerTestOrderNotification(seconds);
    if (seconds > 0) {
      setFeedback(`⏱️ Simulação iniciada! Alterne para outra aba ou minimize a janela agora. A notificação tocará em ${seconds} segundos!`);
      setTimeout(() => setFeedback(''), 6000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Push Permissions & Background Orders Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white shadow-lg border border-neutral-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-lg text-white">
                  Alertas Push do Navegador
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-neutral-400">Status no Navegador:</span>
                  {notificationPermission === 'granted' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      Ativado & Autorizado
                    </span>
                  )}
                  {notificationPermission === 'denied' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <ShieldAlert className="w-3 h-3" />
                      Bloqueado no Navegador
                    </span>
                  )}
                  {(notificationPermission === 'default' || notificationPermission === 'unsupported') && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Clock className="w-3 h-3" />
                      Pendente de Autorização
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed pt-1">
              Receba alertas visuais e sonoros na área de trabalho sempre que um novo pedido for finalizado, mesmo com o painel em segundo plano.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
            {notificationPermission !== 'granted' && (
              <button
                onClick={handleRequestPush}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Ativar Notificações no Navegador</span>
              </button>
            )}

            <button
              onClick={() => handleTestCountdown(5)}
              disabled={testNotificationCountdown !== null}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/20 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              title="Dispara uma notificação daqui a 5 segundos para você trocar de aba e ver funcionando"
            >
              <Clock className="w-4 h-4 text-amber-300" />
              <span>
                {testNotificationCountdown !== null
                  ? `Disparando em ${testNotificationCountdown}s...`
                  : '⏱️ Testar em 5s (Mude de aba)'}
              </span>
            </button>

            <button
              onClick={() => handleTestCountdown(0)}
              className="px-3.5 py-3 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white text-xs font-semibold rounded-2xl border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Disparar notificação imediata"
            >
              <Volume2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Teste Imediato</span>
            </button>
          </div>
        </div>

        {/* Live Countdown Banner if active */}
        {testNotificationCountdown !== null && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <p className="font-bold text-sm text-amber-100">
                  Simulação em andamento: {testNotificationCountdown} segundo{testNotificationCountdown !== 1 ? 's' : ''}!
                </p>
                <p className="text-amber-200/90 text-xs">
                  👉 <strong>Alterne para outra aba do navegador agora</strong> para conferir o banner nativo do sistema e o som tocando em segundo plano.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid: Create Notification + History List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-4 h-4 text-rose-600" />
            <h4 className="font-sans font-bold text-neutral-900 text-base">
              Disparar Novo Aviso no Catálogo
            </h4>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Título do Aviso / Notificação *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: ✨ Nova Coleção de Seda Verona Chegou!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500/20 bg-neutral-50/50"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Tipo do Comunicado
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'promo' | 'order' | 'alert' | 'info')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50/50 font-medium"
              >
                <option value="promo">Promoção / Coleção Nova</option>
                <option value="alert">Alerta de Estoque / Loja</option>
                <option value="info">Informativo Geral / Frete</option>
                <option value="order">Aviso de Pedido</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Mensagem Completa *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ex: Peças exclusivas em linho puro e alfaiataria fina disponíveis agora no catálogo..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500/20 bg-neutral-50/50 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-rose-300" />
              <span>Publicar no Catálogo</span>
            </button>
          </form>
        </div>

        {/* History of Notifications */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-neutral-700" />
              <h4 className="font-sans font-bold text-neutral-900 text-base">
                Histórico de Avisos ({notifications.length})
              </h4>
            </div>
            <span className="text-xs text-neutral-400">
              Sincronizado em tempo real
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs">
                Nenhuma notificação registrada.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-start justify-between gap-4 group hover:border-neutral-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 text-xs">
                        {notif.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                          notif.type === 'alert'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : notif.type === 'order'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : notif.type === 'promo'
                            ? 'bg-rose-100 text-rose-900 border border-rose-200'
                            : 'bg-neutral-200/80 text-neutral-700'
                        }`}
                      >
                        {notif.type === 'alert'
                          ? 'Alerta'
                          : notif.type === 'order'
                          ? 'Pedido'
                          : notif.type === 'promo'
                          ? 'Promoção'
                          : 'Informativo'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[11px] text-neutral-400 block pt-1">
                      Data:{' '}
                      {new Date(notif.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Excluir notificação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
