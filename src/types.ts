export type ProductCategory = 'Conjuntos' | 'Vestidos' | 'Saias & Shorts' | 'Camisas & Blusas';

export type LetterSize = 'PP' | 'P' | 'M' | 'G' | 'GG';
export type NumericSize = '32' | '34' | '36' | '38' | '40';
export type ProductSize = LetterSize | NumericSize | 'Único';
export type SizingType = 'letter' | 'numeric';

export const LETTER_SIZES: LetterSize[] = ['PP', 'P', 'M', 'G', 'GG'];
export const NUMERIC_SIZES: NumericSize[] = ['32', '34', '36', '38', '40'];

export interface SizeStock {
  size: ProductSize;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  salePrice: number;
  costPrice: number; // Preço de fabricação / custo
  images: string[];
  sizes: SizeStock[];
  sizeSystem?: SizingType;
  colors: string[];
  description: string;
  isFeatured?: boolean;
  isPromo?: boolean;
  promoPrice?: number;
  fabric?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  selectedSize: ProductSize;
  selectedColor: string;
  quantity: number;
}

export type OrderStatus = 'Pendente' | 'Em Separação' | 'Concluído' | 'Cancelado';

export type DeliveryMethod = 'Retirar na Loja' | 'Correios' | 'Retirada na Loja' | 'Correios/Sedex' | 'Motoboy Express';
export type PaymentMethod =
  | 'Pix (5% OFF)'
  | 'Cartão de Crédito (Até 12x)'
  | 'Débito'
  | 'Pix'
  | 'Cartão de Crédito'
  | 'Dinheiro';

export interface OrderCustomer {
  name: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  address?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  size: ProductSize;
  color: string;
  quantity: number;
  salePrice: number;
  costPrice: number;
}

export interface ClientMetadata {
  deviceType: 'Celular' | 'Tablet' | 'Computador / Desktop';
  os: string;
  browser: string;
  userAgent: string;
  screenResolution: string;
  viewportSize: string;
  pixelRatio: string;
  orientation: string;
  cpuCores?: string;
  deviceMemory?: string;
  touchSupport: string;
  platform: string;
  language: string;
  languages: string;
  timeZone: string;
  timeZoneOffset: string;
  localFormattedTime: string;
  referrer: string;
  pageUrl: string;
  connectionType?: string;
  networkSpeed?: string;
  onlineStatus: string;
  geoCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    mapsUrl?: string;
  };
}

export interface Order {
  id: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  totalCost: number;
  totalProfit: number;
  status: OrderStatus;
  createdAt: string;
  whatsappMessage: string;
  clientMetadata?: ClientMetadata;
}

export interface SiteNotification {
  id: string;
  title: string;
  message: string;
  type: 'promo' | 'order' | 'alert' | 'info';
  createdAt: string;
  isRead: boolean;
  link?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string; // Ex: 5511998765432
  whatsappDisplay: string; // Ex: (11) 99876-5432
  instagramUser: string; // Ex: aurea.boutique
  instagramUrl: string; // Ex: https://instagram.com/aurea.boutique
  instagramFollowers: string; // Ex: 24.8k
  instagramPostsCount: number; // Ex: 412
  instagramBio: string; // Bio oficial
  email: string;
  landline: string; // Número fixo
  address: string;
  cityState: string;
  googleMapsUrl: string;
  openingHours: string;
  pixKey: string;
  freeShippingMinimum: number;
  bannerEnabled: boolean;
  bannerText: string;
  lowStockThreshold: number; // Alerta de estoque baixo
  adminPin?: string; // PIN secreto para painel admin (padrão: 9000)
  // Configurações de Backup, Nuvem & Segurança
  backupWebhookUrl?: string; // URL de API externa para backup automatizado
  backupWebhookToken?: string; // Bearer token ou chave de segurança
  backupAutoFrequency?: 'manual' | 'daily' | 'weekly'; // Frequência recomendada
  lastBackupDate?: string; // Data do último backup realizado
  lastBackupType?: string; // Tipo do último backup (CSV, JSON, Cloud API)
  lastCloudSyncDate?: string; // Data da última sincronização com API de terceiros
}

export interface CompleteStoreBackup {
  version: string;
  appName: string;
  exportedAt: string;
  originHost?: string;
  settings: StoreSettings;
  notifications: SiteNotification[];
  products: Product[];
  orders: Order[];
  checksum?: string;
  isEncrypted?: boolean;
}
