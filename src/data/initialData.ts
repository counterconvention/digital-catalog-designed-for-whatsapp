import { Product, StoreSettings, SiteNotification, Order } from '../types';

export const initialStoreSettings: StoreSettings = {
  storeName: 'Counter',
  tagline: 'Elegância contemporânea em conjuntos, vestidos e alfaiataria',
  whatsappNumber: '5511987654321',
  whatsappDisplay: '(11) 98765-4321',
  instagramUser: 'counter.oficial',
  instagramUrl: 'https://instagram.com/counter.oficial',
  instagramFollowers: '38.4k',
  instagramPostsCount: 0,
  instagramBio: 'Catálogo oficial de peças exclusivas ✨ Conjuntos, Vestidos & Alfaiataria. Enviamos para todo Brasil ✈️ Atendimento via WhatsApp:',
  email: 'atendimento@counter.com.br',
  landline: '(11) 3456-7890',
  address: 'Rua Oscar Freire, 1420 - Jardins, São Paulo - SP',
  cityState: 'São Paulo - SP, CEP 01426-001',
  googleMapsUrl: 'https://maps.google.com/?q=Rua+Oscar+Freire+1420+Jardins+Sao+Paulo',
  openingHours: 'Segunda a Sábado: 09:30 às 19:30 | Domingo: 13:00 às 18:00',
  pixKey: 'pix@counter.com.br',
  freeShippingMinimum: 500,
  bannerEnabled: true,
  bannerText: 'Frete Grátis nas compras acima de R$ 500 • 5% OFF no Pix',
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
