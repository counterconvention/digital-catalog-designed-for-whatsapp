import { Product, StoreSettings, SiteNotification, Order } from '../types';

export const initialStoreSettings: StoreSettings = {
  storeName: 'Áurea Moda Feminina',
  tagline: 'Elegância contemporânea em conjuntos, vestidos e alfaiataria',
  whatsappNumber: '5511987654321',
  whatsappDisplay: '(11) 98765-4321',
  instagramUser: 'aurea.boutiquefem',
  instagramUrl: 'https://instagram.com',
  instagramFollowers: '38.4k',
  instagramPostsCount: 0,
  instagramBio: 'Catálogo oficial de peças exclusivas ✨ Conjuntos, Vestidos & Alfaiataria. Enviamos para todo Brasil ✈️ Atendimento via WhatsApp:',
  email: 'atendimento@aureamoda.com.br',
  landline: '(11) 3456-7890',
  address: 'Rua Oscar Freire, 1420 - Jardins, São Paulo - SP',
  cityState: 'São Paulo - SP, CEP 01426-001',
  googleMapsUrl: 'https://maps.google.com/?q=Rua+Oscar+Freire+1420+Jardins+Sao+Paulo',
  openingHours: 'Segunda a Sábado: 09:30 às 19:30 | Domingo: 13:00 às 18:00',
  pixKey: 'pix@aureamoda.com.br',
  freeShippingMinimum: 299,
  bannerEnabled: true,
  bannerText: '✨ Seja bem-vindo(a) à nossa loja! Frete Grátis nas compras acima de R$ 299 • 5% OFF no Pix',
  lowStockThreshold: 3,
  adminPin: '9000'
};

export const initialProducts: Product[] = [];

export const initialNotifications: SiteNotification[] = [];

export const initialOrders: Order[] = [];

export const instagramFeedPosts: {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  productId?: string;
}[] = [];
