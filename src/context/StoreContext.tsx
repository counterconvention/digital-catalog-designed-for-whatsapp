import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
  SiteNotification,
  StoreSettings,
  ProductCategory,
  ProductSize,
  OrderCustomer
} from '../types';
import {
  initialProducts,
  initialStoreSettings,
  initialNotifications,
  initialOrders
} from '../data/initialData';
import { playOrderNotificationSound } from '../utils/audio';
import { getClientMetadata } from '../utils/clientMetadata';
import {
  registerServiceWorker,
  sendBrowserOrderNotification,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  disablePushAlerts,
  NotificationPermissionStatus
} from '../utils/browserNotifications';

interface StoreContextType {
  // Store Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Catalog Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  bulkAdjustStock: (productId: string, size: ProductSize, delta: number) => void;
  setProductSizeStock: (productId: string, size: ProductSize, quantity: number) => void;
  setAllSizesStock: (productId: string, quantity: number) => void;
  bulkCategoryStockAdjustment: (category: ProductCategory, delta: number) => void;
  importProductsList: (newProducts: Product[], replace: boolean) => void;

  // Shopping Cart
  cart: CartItem[];
  addToCart: (product: Product, size: ProductSize, color: string, qty?: number) => void;
  removeFromCart: (productId: string, size: ProductSize, color: string) => void;
  updateCartQuantity: (productId: string, size: ProductSize, color: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;

  // Orders & Real-time Alerts
  orders: Order[];
  createOrderFromCart: (customer: OrderCustomer) => { order: Order; waUrl: string };
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  latestNewOrder: Order | null;
  dismissLatestOrder: () => void;
  unreadOrdersCount: number;

  // Notifications
  notifications: SiteNotification[];
  unreadNotificationsCount: number;
  addNotification: (notif: Omit<SiteNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  notificationPermission: NotificationPermissionStatus;
  requestBrowserPushPermission: () => Promise<boolean>;
  disableBrowserPushAlerts: () => void;
  triggerTestOrderNotification: (delaySeconds?: number) => Promise<void>;
  testNotificationCountdown: number | null;

  // Navigation & Modals
  currentView: 'catalog' | 'admin';
  setCurrentView: (view: 'catalog' | 'admin') => void;
  isAdminAuthenticated: boolean;
  isAdminPinModalOpen: boolean;
  setIsAdminPinModalOpen: (open: boolean) => void;
  requestAdminAccess: () => void;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  selectedCategory: ProductCategory | 'Todos';
  setSelectedCategory: (cat: ProductCategory | 'Todos') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Stock Alerts
  lowStockProducts: { product: Product; totalStock: number }[];
  outOfStockProducts: Product[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'aurea_store_settings_v1',
  PRODUCTS: 'aurea_store_products_v2',
  ORDERS: 'aurea_store_orders_v1',
  NOTIFICATIONS: 'aurea_store_notifications_v1',
  CART: 'aurea_store_cart_v1',
  LAST_ORDER_EVENT: 'aurea_last_order_event_v1'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Settings state
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...initialStoreSettings, ...JSON.parse(saved) } : initialStoreSettings;
    } catch {
      return initialStoreSettings;
    }
  });

  // 2. Products state with auto-filtering of demo products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const savedV2 = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const demoIds = ['conj-01', 'conj-02', 'conj-03', 'vest-01', 'vest-02', 'vest-03', 'sai-01', 'sai-02', 'cam-01', 'cam-02', 'cam-03'];
          const real = parsed.filter((p: Product) => !demoIds.includes(p.id) && !p.id.startsWith('conj-') && !p.id.startsWith('vest-') && !p.id.startsWith('sai-') && !p.id.startsWith('cam-'));
          return real;
        }
      }
      return initialProducts;
    } catch {
      return initialProducts;
    }
  });

  // 3. Orders state (filtering out demo orders)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const realOrders = parsed.filter((o: Order) => !o.id.startsWith('PED-9'));
          return realOrders;
        }
      }
      return initialOrders;
    } catch {
      return initialOrders;
    }
  });

  // 4. Notifications state (filtering out demo notifications)
  const [notifications, setNotifications] = useState<SiteNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const realNotifs = parsed.filter((n: SiteNotification) => !n.id.startsWith('notif-'));
          return realNotifs;
        }
      }
      return initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  // 5. Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Real-time new order banner alert
  const [latestNewOrder, setLatestNewOrder] = useState<Order | null>(null);

  // UI state
  const [currentView, setCurrentView] = useState<'catalog' | 'admin'>('catalog');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('counter_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);

  const requestAdminAccess = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setIsAdminPinModalOpen(true);
    }
  };

  const loginAdmin = (pin: string): boolean => {
    const targetPin = settings.adminPin || '9000';
    if (pin.trim() === targetPin.trim()) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('counter_admin_auth', 'true');
      } catch {}
      setCurrentView('admin');
      setIsAdminPinModalOpen(false);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('counter_admin_auth');
    } catch {}
    setCurrentView('catalog');
  };

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Browser push notification status & testing countdown
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionStatus>(
    () => getNotificationPermissionStatus()
  );
  const [testNotificationCountdown, setTestNotificationCountdown] = useState<number | null>(null);

  // Register service worker and handle clicks from background notifications
  useEffect(() => {
    registerServiceWorker();

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleSwMessage = (event: MessageEvent) => {
        if (event.data?.action === 'OPEN_ADMIN_ORDERS') {
          setCurrentView('admin');
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }
  }, []);

  // Sync notification permission updates
  useEffect(() => {
    setNotificationPermission(getNotificationPermissionStatus());
    const handleFocus = () => {
      setNotificationPermission(getNotificationPermissionStatus());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Multi-tab BroadcastChannel & window storage for real-time background notification across tabs
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('aurea_orders_sync_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'NEW_ORDER' && event.data.order) {
            processIncomingOrder(event.data.order, event.data.isTest);
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel not initialized:', err);
    }

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.LAST_ORDER_EVENT && event.newValue) {
        try {
          const payload = JSON.parse(event.newValue);
          if (payload?.order) {
            processIncomingOrder(payload.order, payload.isTest);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Central processor for incoming orders (whether from checkout, another tab, or background simulation)
  const processIncomingOrder = (order: Order, isTest?: boolean) => {
    setOrders((prev) => {
      if (prev.some((o) => o.id === order.id)) return prev;
      return [order, ...prev];
    });

    setLatestNewOrder(order);

    // Send native OS notification (desktop banner/push)
    sendBrowserOrderNotification(order, {
      isTest,
      onNotificationClick: () => {
        setCurrentView('admin');
      }
    });

    addNotification({
      title: isTest ? `🔔 [TESTE] Pedido #${order.id} Recebido` : `🛍️ Pedido #${order.id} Recebido`,
      message: `${order.customer.name} concluiu pedido de R$ ${order.total.toFixed(2).replace('.', ',')} via ${order.customer.paymentMethod}!`,
      type: 'order'
    });
  };

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Settings update
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Products CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setProducts((prev) => [newProd, ...prev]);

    // Add in-site notification
    addNotification({
      title: '✨ Novo Produto no Catálogo',
      message: `${newProd.name} acaba de ser adicionado à categoria ${newProd.category}!`,
      type: 'promo'
    });
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const bulkAdjustStock = (productId: string, size: ProductSize, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newSizes = p.sizes.map((s) => {
          if (s.size === size) {
            return { ...s, quantity: Math.max(0, s.quantity + delta) };
          }
          return s;
        });
        return { ...p, sizes: newSizes };
      })
    );
  };

  const setProductSizeStock = (productId: string, size: ProductSize, quantity: number) => {
    const safeQty = Math.max(0, Math.floor(quantity) || 0);
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newSizes = p.sizes.map((s) => {
          if (s.size === size) {
            return { ...s, quantity: safeQty };
          }
          return s;
        });
        return { ...p, sizes: newSizes };
      })
    );
  };

  const setAllSizesStock = (productId: string, quantity: number) => {
    const safeQty = Math.max(0, Math.floor(quantity) || 0);
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newSizes = p.sizes.map((s) => ({
          ...s,
          quantity: safeQty
        }));
        return { ...p, sizes: newSizes };
      })
    );
  };

  const bulkCategoryStockAdjustment = (category: ProductCategory, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.category !== category) return p;
        const newSizes = p.sizes.map((s) => ({
          ...s,
          quantity: Math.max(0, s.quantity + delta)
        }));
        return { ...p, sizes: newSizes };
      })
    );
  };

  const importProductsList = (newProds: Product[], replace: boolean) => {
    if (replace) {
      setProducts(newProds);
    } else {
      setProducts((prev) => [...newProds, ...prev]);
    }
  };

  // Cart operations
  const addToCart = (product: Product, size: ProductSize, color: string, qty = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      }
      return [...prev, { product, selectedSize: size, selectedColor: color, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string, size: ProductSize, color: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
          )
      )
    );
  };

  const updateCartQuantity = (productId: string, size: ProductSize, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (
          item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedColor === color
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => {
    const price = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.salePrice;
    return acc + price * item.quantity;
  }, 0);

  // Orders creation and real-time WhatsApp generation
  const createOrderFromCart = (customer: OrderCustomer): { order: Order; waUrl: string } => {
    const orderId = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = cartTotal;
    const isPix = customer.paymentMethod.toLowerCase().includes('pix');
    const discount = isPix ? subtotal * 0.05 : 0;
    const total = subtotal - discount;

    let totalCost = 0;
    const items = cart.map((item) => {
      const price = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.salePrice;
      const cost = item.product.costPrice * item.quantity;
      totalCost += cost;

      return {
        productId: item.product.id,
        productName: item.product.name,
        category: item.product.category,
        size: item.selectedSize,
        color: item.selectedColor,
        quantity: item.quantity,
        salePrice: price,
        costPrice: item.product.costPrice
      };
    });

    const totalProfit = total - totalCost;
    const clientMetadata = getClientMetadata();

    // Build the enhanced pre-formatted WhatsApp message containing all cart details
    const formattedDate = new Date().toLocaleDateString('pt-BR');
    const formattedTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const totalPieces = cart.reduce((acc, item) => acc + item.quantity, 0);

    const lines: string[] = [];
    lines.push(`✨ *PEDIDO DE COMPRA - ${settings.storeName.toUpperCase()}* ✨`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`🔖 *CÓDIGO DO PEDIDO:* *#${orderId}*`);
    lines.push(`📅 *Data:* ${formattedDate} às ${formattedTime}`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`👤 *DADOS DA CLIENTE:*`);
    lines.push(`• *Nome Completo:* ${customer.name}`);
    lines.push(`• *WhatsApp:* ${customer.phone}`);

    if (customer.deliveryMethod === 'Retirar na Loja' || customer.deliveryMethod === 'Retirada na Loja') {
      lines.push(`• *Forma de Entrega:* Retirada no Showroom (Grátis)`);
      lines.push(`  📍 *Ponto de Retirada:* ${settings.address}, ${settings.cityState}`);
    } else {
      lines.push(`• *Forma de Entrega:* Correios / Sedex`);
      if (customer.address) {
        lines.push(`  📍 *Endereço Completo:* ${customer.address}`);
      }
    }

    const paymentLabel = customer.paymentMethod.toLowerCase().includes('pix')
      ? 'Pix (5% OFF aplicado)'
      : customer.paymentMethod.toLowerCase().includes('crédito') || customer.paymentMethod.toLowerCase().includes('credito')
      ? 'Cartão de Crédito (Até 12x)'
      : customer.paymentMethod.toLowerCase().includes('débito') || customer.paymentMethod.toLowerCase().includes('debito')
      ? 'Débito (Máquina no Showroom)'
      : customer.paymentMethod;

    lines.push(`• *Forma de Pagamento:* ${paymentLabel}`);
    if (customer.notes && customer.notes.trim()) {
      lines.push(`• *Observações:* ${customer.notes.trim()}`);
    }

    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`👗 *ITENS DO PEDIDO (${cart.length} modelo(s) • ${totalPieces} peça(s)):*`);
    lines.push(``);

    cart.forEach((item, idx) => {
      const price = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.salePrice;
      const itemTotal = price * item.quantity;
      lines.push(`${idx + 1}️⃣ *${item.quantity}x ${item.product.name}*`);
      lines.push(`   ▸ Categoria: ${item.product.category}`);
      lines.push(`   ▸ Tamanho: *${item.selectedSize}* | Cor: *${item.selectedColor}*`);
      if (item.product.fabric) {
        lines.push(`   ▸ Tecido: ${item.product.fabric}`);
      }
      lines.push(`   ▸ Valor: R$ ${itemTotal.toFixed(2).replace('.', ',')} (R$ ${price.toFixed(2).replace('.', ',')} cada)`);
      lines.push(``);
    });

    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`💰 *RESUMO FINANCEIRO:*`);
    lines.push(`• *Subtotal dos Produtos:* R$ ${subtotal.toFixed(2).replace('.', ',')}`);
    if (discount > 0) {
      lines.push(`• *Desconto Pix (5% OFF):* -R$ ${discount.toFixed(2).replace('.', ',')}`);
    }
    const isFreeShipping = subtotal >= settings.freeShippingMinimum || customer.deliveryMethod === 'Retirar na Loja' || customer.deliveryMethod === 'Retirada na Loja';
    lines.push(`• *Frete:* ${isFreeShipping ? 'GRÁTIS' : 'A calcular / combinar'}`);
    lines.push(`💎 *TOTAL A PAGAR:* *R$ ${total.toFixed(2).replace('.', ',')}*`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`Olá! Montei meu pedido no catálogo online com o código *#${orderId}*. Gostaria de confirmar a disponibilidade dos modelos para prosseguirmos. Aguardo seu retorno! ✨`);

    const waText = lines.join('\n');

    // Clean phone number (guarantee Brazilian country code 55 if not present)
    let cleanNumber = (settings.whatsappNumber || '').replace(/\D/g, '');
    if (cleanNumber.length === 10 || cleanNumber.length === 11) {
      cleanNumber = `55${cleanNumber}`;
    }
    if (!cleanNumber) {
      cleanNumber = '5511987654321';
    }
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(waText)}`;

    const newOrder: Order = {
      id: orderId,
      customer,
      items,
      subtotal,
      discount,
      total,
      totalCost,
      totalProfit,
      status: 'Pendente',
      createdAt: new Date().toISOString(),
      whatsappMessage: waText,
      clientMetadata
    };

    // Decrement stock for ordered items
    setProducts((prev) =>
      prev.map((p) => {
        const matchingCartItems = cart.filter((ci) => ci.product.id === p.id);
        if (matchingCartItems.length === 0) return p;

        const updatedSizes = p.sizes.map((s) => {
          const orderedForSize = matchingCartItems
            .filter((ci) => ci.selectedSize === s.size)
            .reduce((sum, ci) => sum + ci.quantity, 0);
          return {
            ...s,
            quantity: Math.max(0, s.quantity - orderedForSize)
          };
        });

        return { ...p, sizes: updatedSizes };
      })
    );

    // Save order
    setOrders((prev) => [newOrder, ...prev]);

    // Broadcast to other tabs & background listeners
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('aurea_orders_sync_channel');
        channel.postMessage({ type: 'NEW_ORDER', order: newOrder });
        channel.close();
      }
      localStorage.setItem(
        STORAGE_KEYS.LAST_ORDER_EVENT,
        JSON.stringify({ order: newOrder, timestamp: Date.now() })
      );
    } catch (e) {
      console.warn('Broadcast failed:', e);
    }

    // Trigger audio notification, OS native notification & real-time popup
    setLatestNewOrder(newOrder);
    sendBrowserOrderNotification(newOrder, {
      onNotificationClick: () => setCurrentView('admin')
    });

    // Add in-site notification for order
    addNotification({
      title: `🛍️ Pedido #${orderId} Realizado`,
      message: `${customer.name} concluiu o pedido de R$ ${total.toFixed(2).replace('.', ',')} via ${customer.paymentMethod}!`,
      type: 'order'
    });

    // Clear cart
    clearCart();

    return { order: newOrder, waUrl };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const dismissLatestOrder = () => setLatestNewOrder(null);

  // Notifications
  const addNotification = (notif: Omit<SiteNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: SiteNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const requestBrowserPushPermission = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(getNotificationPermissionStatus());
    if (granted) {
      addNotification({
        title: '🔔 Alertas de Pedidos Ativados!',
        message: 'Você receberá alertas no seu navegador e computador mesmo quando a aba do admin estiver em segundo plano.',
        type: 'info'
      });
    }
    return granted;
  };

  const disableBrowserPushAlerts = () => {
    disablePushAlerts();
    setNotificationPermission('default');
  };

  const triggerTestOrderNotification = async (delaySeconds = 0): Promise<void> => {
    // If permission has not been requested yet, request it
    if (getNotificationPermissionStatus() === 'default') {
      const granted = await requestBrowserPushPermission();
      if (!granted) return;
    }

    const firstProduct = products[0] || initialProducts[0];
    const unitPrice = firstProduct.isPromo && firstProduct.promoPrice
      ? firstProduct.promoPrice
      : firstProduct.salePrice;

    const testOrder: Order = {
      id: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: {
        name: 'Camila Albuquerque',
        phone: '11998877665',
        deliveryMethod: 'Retirada na Loja',
        paymentMethod: 'Pix',
        notes: 'Pedido de teste para validação de notificações em segundo plano!'
      },
      items: [
        {
          productId: firstProduct.id,
          productName: firstProduct.name,
          category: firstProduct.category,
          size: 'M',
          color: firstProduct.colors[0] || 'Off-white',
          quantity: 1,
          salePrice: unitPrice,
          costPrice: firstProduct.costPrice
        }
      ],
      subtotal: unitPrice,
      discount: unitPrice * 0.05,
      total: unitPrice * 0.95,
      totalCost: firstProduct.costPrice,
      totalProfit: unitPrice * 0.95 - firstProduct.costPrice,
      status: 'Pendente',
      whatsappMessage: `✨ *PEDIDO DE COMPRA - ${settings.storeName.toUpperCase()}* ✨\n🔖 *CÓDIGO:* #TESTE\n📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n👤 *Cliente:* Camila Albuquerque\n👗 *Itens:* 1x ${firstProduct.name} (Tam: M)\n💰 *Total:* R$ ${(unitPrice * 0.95).toFixed(2).replace('.', ',')}`,
      createdAt: new Date().toISOString(),
      clientMetadata: getClientMetadata()
    };

    if (delaySeconds <= 0) {
      processIncomingOrder(testOrder, true);
      return;
    }

    setTestNotificationCountdown(delaySeconds);
    let remaining = delaySeconds;

    const timer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(timer);
        setTestNotificationCountdown(null);
        processIncomingOrder(testOrder, true);
      } else {
        setTestNotificationCountdown(remaining);
      }
    }, 1000);
  };

  // Automated Stock Alert to Message Inbox (SiteNotification)
  // Ensures that whenever an item reaches or drops below minimum stock (or hits 0), an alert is logged in the message box.
  const prevStockLevelsRef = useRef<Map<string, number>>(new Map());
  const initialStockScannedRef = useRef(false);

  useEffect(() => {
    // Populate baseline on first mount without generating historic duplicate alerts
    if (!initialStockScannedRef.current) {
      products.forEach((p) => {
        const total = p.sizes.reduce((sum, s) => sum + s.quantity, 0);
        prevStockLevelsRef.current.set(p.id, total);
      });
      initialStockScannedRef.current = true;
      return;
    }

    products.forEach((p) => {
      const currentTotal = p.sizes.reduce((sum, s) => sum + s.quantity, 0);
      const prevTotal = prevStockLevelsRef.current.get(p.id);

      // Trigger notification if stock dropped and reached or crossed into minimum threshold
      if (
        prevTotal !== undefined &&
        currentTotal < prevTotal &&
        currentTotal <= settings.lowStockThreshold
      ) {
        const isOutOfStock = currentTotal === 0;
        addNotification({
          title: isOutOfStock ? `🚨 Estoque Esgotado: ${p.name}` : `⚠️ Estoque Mínimo Atingido: ${p.name}`,
          message: isOutOfStock
            ? `O item "${p.name}" esgotou completamente (0 unidades em estoque). Necessário reposição urgente.`
            : `O item "${p.name}" atingiu o nível crítico com ${currentTotal} unidade(s) restante(s) (limite configurado: ${settings.lowStockThreshold} un).`,
          type: 'alert'
        });
      }

      prevStockLevelsRef.current.set(p.id, currentTotal);
    });
  }, [products, settings.lowStockThreshold]);

  // Stock alert computations
  const lowStockProducts = products
    .map((p) => ({
      product: p,
      totalStock: p.sizes.reduce((acc, s) => acc + s.quantity, 0)
    }))
    .filter((item) => item.totalStock > 0 && item.totalStock <= settings.lowStockThreshold);

  const outOfStockProducts = products.filter(
    (p) => p.sizes.reduce((acc, s) => acc + s.quantity, 0) === 0
  );

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const unreadOrdersCount = orders.filter((o) => o.status === 'Pendente').length;

  return (
    <StoreContext.Provider
      value={{
        settings,
        updateSettings,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        bulkAdjustStock,
        setProductSizeStock,
        setAllSizesStock,
        bulkCategoryStockAdjustment,
        importProductsList,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartTotal,
        orders,
        createOrderFromCart,
        updateOrderStatus,
        deleteOrder,
        latestNewOrder,
        dismissLatestOrder,
        unreadOrdersCount,
        notifications,
        unreadNotificationsCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        notificationPermission,
        requestBrowserPushPermission,
        disableBrowserPushAlerts,
        triggerTestOrderNotification,
        testNotificationCountdown,
        currentView,
        setCurrentView,
        isAdminAuthenticated,
        isAdminPinModalOpen,
        setIsAdminPinModalOpen,
        requestAdminAccess,
        loginAdmin,
        logoutAdmin,
        isCartOpen,
        setIsCartOpen,
        selectedProduct,
        setSelectedProduct,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        lowStockProducts,
        outOfStockProducts
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
