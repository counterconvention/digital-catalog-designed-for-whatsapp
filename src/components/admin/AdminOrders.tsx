import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus, Order } from '../../types';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  ExternalLink,
  Phone,
  Trash2,
  Filter,
  DollarSign,
  TrendingUp,
  MapPin,
  Bell,
  ShieldCheck
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    settings,
    notificationPermission,
    requestBrowserPushPermission,
    triggerTestOrderNotification,
    testNotificationCountdown
  } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  const statuses: OrderStatus[] = ['Pendente', 'Em Separação', 'Concluído', 'Cancelado'];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'Todos' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Concluído':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Em Separação':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelado':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Concluído':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Em Separação':
        return <Package className="w-3.5 h-3.5 text-blue-600" />;
      case 'Cancelado':
        return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  const handleContactCustomer = (order: Order) => {
    const cleanPhone = order.customer.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = `Olá ${order.customer.name}! Aqui é da loja ${settings.storeName}. ` +
      `Estamos atualizando sobre o seu pedido *#${order.id}* (Status: *${order.status}*). ` +
      `Como podemos te ajudar hoje? ✨`;

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por cliente, pedido # ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
            />
          </div>
        </div>

        {/* Status Pills Filter */}
        <div className="flex flex-wrap items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold gap-1">
          <button
            onClick={() => setStatusFilter('Todos')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'Todos' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
            }`}
          >
            Todos ({orders.length})
          </button>
          {statuses.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === st ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
                }`}
              >
                {getStatusIcon(st)}
                <span>{st}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200 text-neutral-400 text-xs">
            Nenhum pedido encontrado com os filtros atuais.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-3xl bg-white border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              {/* Order ID & Customer */}
              <div className="space-y-1.5 min-w-[260px]">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-neutral-900 text-sm">
                    #{order.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border flex items-center gap-1 ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>

                <h4 className="font-sans font-bold text-neutral-900 text-base">
                  {order.customer.name}
                </h4>

                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1 font-medium text-neutral-700">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    {order.customer.phone}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {order.customer.deliveryMethod && (
                  <div className="text-[11px] text-neutral-600 flex items-center gap-1 pt-0.5">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    <span>
                      {order.customer.deliveryMethod}
                      {order.customer.address ? ` (${order.customer.address})` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Items preview */}
              <div className="flex-1 max-w-md bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80 text-xs">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Itens do Pedido ({order.items.length})
                </span>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-neutral-700">
                      <span className="line-clamp-1">
                        <strong>{item.quantity}x</strong> {item.productName}{' '}
                        <span className="text-neutral-400">({item.size}/{item.color})</span>
                      </span>
                      <span className="font-semibold shrink-0 ml-2">
                        R$ {(item.salePrice * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial values & Profit margin */}
              <div className="min-w-[170px] text-left lg:text-right space-y-1">
                <div className="text-lg font-extrabold text-neutral-900 font-sans">
                  R$ {order.total.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-xs text-emerald-700 font-bold flex items-center lg:justify-end gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Lucro: R$ {order.totalProfit.toFixed(2).replace('.', ',')}</span>
                </div>
                <span className="text-[10px] text-neutral-400 block">
                  Pagamento: {order.customer.paymentMethod}
                </span>
              </div>

              {/* Status Selector & Actions */}
              <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                  className="px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white font-bold text-neutral-800 cursor-pointer shadow-2xs"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      Mudar para: {st}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleContactCustomer(order)}
                  title="Conversar com a cliente no WhatsApp"
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Deseja excluir o registro do pedido #${order.id}?`)) {
                      deleteOrder(order.id);
                    }
                  }}
                  title="Excluir Pedido"
                  className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
